import { Server, Socket } from 'socket.io';
import { UserSocket } from '../controllers/socket.controller';
import { ServerEvents } from '../models/socket.event';
import User from '../models/user/user';

// Protected
const socketHandler = async (socket: Socket) => {
  // Mark user as online and save the socket id in the database
  const user = await User.findById(socket.data.userId);
  if (!user) return socket.disconnect();
  user.socketId = socket.id;
  user.online = true;
  await user.save();

  // Create a UserSocket instance
  const userSocket = new UserSocket(socket, user._id.toString());

  console.log(`${user.email} connected`);

  socket.on(ServerEvents.Disconnect, () => {
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
};

export default socketHandler;
