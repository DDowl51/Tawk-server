// socket.on(...)
export const ServerEvents = {
  Connection: 'connection',
  Disconnect: 'disconnect',
  CreateFriendRequest: 'create_friend_request',
} as const;

// socket.emit(...)
export const ClientEvents = {
  // Error
  Error: 'error',
  // FriendRequest
  ReceiveFriendRequest: 'receive_friend_request',
  SentFriendRequest: 'sent_friend_request',
} as const;
