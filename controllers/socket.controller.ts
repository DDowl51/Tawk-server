import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user/user';
import { AppError } from '../utils/error';
import {
  HandleFriendRequestDto,
  CreateFriendRequestDto,
  HandleMessageDto,
  HandleCreateGroupDto,
  HandleStartVideoDto,
  HandleAnswerCallDto,
  HandleOfferDto,
  HandleAnswerDto,
  HandleCandidateDto,
  HandleRejectDto,
} from './dtos/socket.dto';
import { ClientEvents, WebRTCEvents } from '../models/socket.event';
import FriendRequest from '../models/friendRequest/friendRequest';
import {
  Message,
  Message as MessageType,
  User as UserType,
} from '../utils/types';
import { Chatroom, GroupChatroom } from '../models/chatroom/chatroom';
import { LinkMessage, TextMessage } from '../models/message/message';
import axios from 'axios';

type SocketHander = (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => void;

export const protect: SocketHander = async (socket, next) => {
  const { token } = socket.handshake.auth;
  if (!token) return next(new AppError('Please provide token'));

  // 2) Verification of the token
  const decoded = jwt.verify(token, process.env.JWT_TOKEN!) as JwtPayload;

  // 3) if user is still exists
  const user = await User.findById(decoded.userId);
  if (!user) {
    return next(new AppError('Invalid token', 400));
  }

  // 4) check if user has changed password after token was issued
  if (user.changedPasswordAfter(decoded.iat!)) {
    return next(new AppError('Password changed', 400));
  }

  socket.data.userId = user._id;
  next();
};

export class UserSocket {
  constructor(private socket: Socket, private userId: string) {}

  async createFriendRequest(
    data: CreateFriendRequestDto,
    callback: (request: any) => void
  ) {
    const { senderId, recipientId } = data;
    // 0) Check if provided senderId and recipientId
    if (!senderId || !recipientId) {
      return this.emitError('Please provide both senderId and recipientId');
    }

    // 1) This would be ridiculous!!
    if (senderId === recipientId) {
      return this.emitError('Are you trying to send a request to yourself?');
    }

    // 2) check if both sender and recipient exists
    const [sender, recipient] = await Promise.all([
      User.findById(senderId),
      User.findById(recipientId),
    ]);
    if (!sender || !recipient) {
      return this.emitError('User not found');
    }

    // 3) Check if ther are already friends
    if (
      sender.friends.find(fid => fid.toString() === recipient._id.toString())
    ) {
      return this.emitError('You are already friends!');
    }

    // 3) If request has already exists, update it, else create a new one
    let request = await FriendRequest.findOne({
      sender,
      recipient,
      handled: false,
    });
    if (request) {
      request.requestTimes++;
      await request.save();
    } else {
      request = await FriendRequest.create({ sender, recipient });
    }

    // 4) Notify both sender and recipient the request has been sent and created
    this.emitTo(recipient.socketId, ClientEvents.ReceiveFriendRequest, request);
    callback(request);

    // ! just for debug
    console.log(`${sender.email} sent a friendRequest to ${recipient.email}`);
  }

  async handleFriendRequest(
    data: HandleFriendRequestDto,
    callback: (request: any) => void
  ) {
    const { requestId, accepted } = data;

    //- 1) Check if requestId and accepted exists
    if (!requestId) {
      return this.emitError('Please provide requestId');
    }

    //- 2) Check if request corresponding to requestId exists
    const request = await FriendRequest.findOne({
      _id: requestId,
      handled: false,
    });
    if (!request) {
      return this.emitError('Invalid requestId');
    }

    //- 3) Check if the sender still exists
    const [sender, recipient] = await Promise.all([
      User.findById(request.sender._id),
      User.findById(request.recipient._id),
    ]);

    if (!sender || !recipient) {
      return this.emitError('Invalid request');
    }

    //- 3) Check if the handler is the recipient
    if (recipient._id.toString() !== this.userId) {
      return this.emitError('This is not your request');
    }

    //- 4) Handle the request
    request.accepted = accepted;
    request.handled = true;
    if (accepted) {
      recipient.friends.push(sender._id);
      sender.friends.push(recipient._id);
      await Promise.all([recipient.save(), sender.save()]);
    }
    await request.save();

    //- 5) Nofity both the sender(emitting event) and the recipient(using callback)
    callback(request);
    this.emitTo(sender.socketId, ClientEvents.HandleFriendRequest, request);
  }

  async handleMessage(
    data: HandleMessageDto,
    callback: (message: MessageType) => void
  ) {
    const { from, text, chatroomId, type } = data;
    //- 0) Create message
    const sender = await User.findById(from);
    let message: MessageType;
    switch (type) {
      default:
      case 'text': {
        message = await TextMessage.create({
          sender,
          text,
          chatroomId,
        });
        break;
      }
      case 'link': {
        // Get preview of the website
        let data;
        try {
          data = (
            await axios.get(
              `https://opengraph.io/api/1.1/site/${encodeURIComponent(
                text
              )}?app_id=${process.env.OPENGRAPH_APPID}`,
              { timeout: 5000 }
            )
          ).data;
        } catch (error) {}
        console.log(data?.hybridGraph);
        message = await LinkMessage.create({
          link: text,
          sender,
          text,
          chatroomId,
          preview: data?.hybridGraph,
        });
        break;
      }
    }

    //- 1) get all users in the chatroom of the message
    const chatroom = await Chatroom.findById(chatroomId);
    if (!chatroom) {
      return this.emitError('Invalid chatroomId');
    }
    await chatroom.populate('users', 'socketId email');
    chatroom.lastMessage = message;
    chatroom.messages.push(message);
    await chatroom.save();
    //- 2) get the socketIds of the users
    const socketIds = chatroom.users.map(u => u.socketId);

    //- 3) forward the message to the users except the sender
    this.emitTo(socketIds, ClientEvents.NewMessage, message);
    console.log(chatroom.users);
    //- 4) callback(message)
    callback(message);
  }

  async friendOnline() {
    const user = await User.findById(this.userId).populate(
      'friends',
      'socketId'
    )!;
    if (!user) {
      return this.emitError('Invalid user');
    }
    const fSids = (user.friends as unknown as UserType[]).map(u => u.socketId);
    this.emitTo(fSids, ClientEvents.FriendOnline, user._id);
  }

  async friendOffline() {
    const user = await User.findById(this.userId).populate(
      'friends',
      'socketId'
    )!;
    if (!user) {
      return this.emitError('Invalid user');
    }
    const fSids = (user.friends as unknown as UserType[]).map(u => u.socketId);
    this.emitTo(fSids, ClientEvents.FriendOffline, user._id);
  }

  async handleCreateGroup(
    data: HandleCreateGroupDto,
    callback: (chatroom: any) => void
  ) {
    const { members, name } = data;
    // DON'T FORGET TO ADD YOURSELF
    members.push(this.userId);
    // 1) Check if members are all valid
    const users = await Promise.all(members.map(mId => User.findById(mId)));

    const invalidMembers = users.filter(u => u === null);
    if (invalidMembers.length !== 0) {
      // Don't return
      this.emitError('Some invalid users have been filtered out');
    }

    // 2) Create Group, I'm the owner!!
    const groupChatroom = await GroupChatroom.create({
      name,
      users,
      owner: this.userId,
    });

    // 3) Emit to all group members(using socket.emit) and myself(using callback)
    this.emitTo(
      users.map(u => u?.socketId),
      ClientEvents.JoinGroup,
      groupChatroom
    );
    callback(groupChatroom);
  }

  async handleOffer(data: HandleOfferDto) {
    const { sdp, to } = data;
    console.log(`handle offer from user ${this.userId} to ${to}`);
    const toUser = await User.findById(to);
    const meUser = await User.findById(this.userId);
    if (!toUser || !toUser.socketId) {
      return this.socket.emit(WebRTCEvents.Error, 'User not online');
    }

    this.emitTo(toUser.socketId, WebRTCEvents.Offer, {
      remoteSDP: sdp,
      from: meUser,
    });
  }

  async handleAnswer(data: HandleAnswerDto, callback: () => void) {
    const { sdp, to } = data;
    console.log(`handle answer from user ${this.userId} to ${to}`);
    const toUser = await User.findById(to);
    if (!toUser || !toUser.socketId) {
      return this.socket.emit(WebRTCEvents.Error, 'User not online');
    }

    this.emitTo(toUser.socketId, WebRTCEvents.Answer, sdp);
    callback();
  }

  async handleCandidate(data: HandleCandidateDto, callback?: () => void) {
    const { candidate, to } = data;
    console.log(`handle candidate from user ${this.userId} to ${to}`);
    const toUser = await User.findById(to);
    if (!toUser || !toUser.socketId) {
      return this.socket.emit(WebRTCEvents.Error, 'User not online');
    }

    this.emitTo(toUser.socketId, WebRTCEvents.Candidate, candidate);
    if (callback) {
      callback();
    }
  }

  async handleReject(data: HandleRejectDto, callback?: () => void) {
    const { reason, to } = data;

    console.log(`${this.userId} ended the call to ${to}`);
    const toUser = await User.findById(to);
    if (!toUser || !toUser.socketId) {
      return this.socket.emit(WebRTCEvents.Error, 'User not online');
    }
    this.emitTo(toUser.socketId, WebRTCEvents.Reject, reason);

    if (callback) {
      callback();
    }
  }

  private emitError(reason: string) {
    this.socket.emit(ClientEvents.Error, reason);
  }

  private emitTo(
    socketId: string | (string | undefined)[] | undefined,
    evName: string,
    data?: any
  ) {
    if (Array.isArray(socketId)) {
      socketId.forEach(sid => {
        if (sid) {
          this.socket.to(sid).emit(evName, data);
        }
      });
    } else if (socketId) {
      this.socket.to(socketId).emit(evName, data);
    }
  }
}
