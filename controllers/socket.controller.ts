import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user/user';
import { AppError } from '../utils/error';
import { CreateFriendRequestDto } from './dtos/socket.dto';
import { ClientEvents, ServerEvents } from '../models/socket.event';
import FriendRequest from '../models/friendRequest/friendRequest';

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
    callback: () => void
  ) {
    const { senderId, recipientId } = data;
    console.log(data);
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

    // 3) Create the friend request in the database
    const request = await FriendRequest.create({ sender, recipient });

    // 4) Notify both sender and recipient the request has been sent and created
    this.emitTo(sender.socketId, ClientEvents.SentFriendRequest, request);
    this.socket.emit(ClientEvents.ReceiveFriendRequest, request); // I'm the recipient!
    callback();

    // ! just for debug
    console.log(`${sender.name} sent a friendRequest to ${recipient.name}`);
  }

  private emitError(reason: string) {
    this.socket.emit(ClientEvents.Error, reason);
  }

  private emitTo(socketId: string | undefined, evName: string, data?: any) {
    if (socketId) {
      this.socket.to(socketId).emit(evName, data);
    }
  }
}
