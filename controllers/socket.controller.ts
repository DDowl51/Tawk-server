import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user/user';
import { AppError } from '../utils/error';
import {
  HandleFriendRequestDto,
  CreateFriendRequestDto,
  HandleMessageDto,
} from './dtos/socket.dto';
import { ClientEvents } from '../models/socket.event';
import FriendRequest from '../models/friendRequest/friendRequest';
import { Message as MessageType } from '../utils/types';
import Chatroom from '../models/chatroom/chatroom';
import Message from '../models/message/message';

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
    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);
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
    const sender = await User.findById(request.sender._id);
    const recipient = await User.findById(request.recipient._id);
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
      await recipient.save();
      await sender.save();
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
    const { from, text, chatroomId } = data;
    //- 0) Create message
    console.log(data);
    const sender = await User.findById(from);
    const message = await Message.create({
      sender,
      text,
      chatroomId,
      type: 'text',
    });
    //- 1) get all users in the chatroom of the message
    const chatroom = await Chatroom.findById(chatroomId).populate(
      'users',
      'socketId'
    );
    if (!chatroom) {
      return this.emitError('Invalid chatroomId');
    }
    chatroom.lastMessage = message;
    chatroom.messages.push(message);
    await chatroom.save();

    //- 2) get the socketIds of the users
    const socketIds = chatroom.users.map(u => u.socketId);

    //- 3) forward the message to the users except the sender
    this.emitTo(socketIds, ClientEvents.NewMessage, message);

    //- 4) callback(message)
    callback(message);
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
      const ids = socketId.filter(id => !!id) as string[];
      this.socket.to(ids).emit(evName, data);
    } else if (socketId) {
      this.socket.to(socketId).emit(evName, data);
    }
  }
}
