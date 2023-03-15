import { Server, Socket } from 'socket.io';
import { UserSocket } from '../controllers/socket.controller';
import {
  ClientEvents,
  ServerEvents,
  WebRTCEvents,
} from '../models/socket.event';
import User from '../models/user/user';
import { User as UserType } from '../utils/types';

// Protected
const socketHandler = async (socket: Socket) => {
  // Mark user as online and save the socket id in the database
  const user = await User.findById(socket.data.userId).populate(
    'friends',
    'name email avatart about'
  );
  if (!user) return socket.disconnect();
  user.socketId = socket.id;
  user.online = true;
  await user.save();

  // Create a UserSocket instance
  const userSocket = new UserSocket(socket, user._id.toString());
  // 通知所有好友: 哥们已经上线
  await userSocket.friendOnline();

  console.log(`${user.email} connected`);

  socket.on(ServerEvents.Disconnect, async () => {
    user.socketId = undefined;
    user.online = false;
    await user.save();
    // 通知所有好友: 哥们溜了
    await userSocket.friendOffline();

    console.log(`${user.name} disconnected`);
  });

  socket.on(
    ServerEvents.CreateFriendRequest,
    userSocket.createFriendRequest.bind(userSocket)
  );
  socket.on(
    ServerEvents.HandleFriendRequest,
    userSocket.handleFriendRequest.bind(userSocket)
  );
  socket.on(
    ServerEvents.SendMessage,
    userSocket.handleMessage.bind(userSocket)
  );
  socket.on(
    ServerEvents.CreateGroup,
    userSocket.handleCreateGroup.bind(userSocket)
  );

  socket.on(WebRTCEvents.Offer, userSocket.handleOffer.bind(userSocket));
  socket.on(WebRTCEvents.Answer, userSocket.handleAnswer.bind(userSocket));
  socket.on(
    WebRTCEvents.Candidate,
    userSocket.handleCandidate.bind(userSocket)
  );
  socket.on(WebRTCEvents.Reject, userSocket.handleReject.bind(userSocket));
  socket.on(
    WebRTCEvents.Microphone,
    userSocket.handleMicrophone.bind(userSocket)
  );
  socket.on(WebRTCEvents.Speaker, userSocket.handleSpeaker.bind(userSocket));
};

export default socketHandler;
