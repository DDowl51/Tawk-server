// socket.on(...)
export const ServerEvents = {
  Connection: 'connection',
  Disconnect: 'disconnect',
  CreateFriendRequest: 'create_friend_request',
  HandleFriendRequest: 'handle_friend_request',
  SendMessage: 'send_message',
} as const;

// socket.emit(...)
export const ClientEvents = {
  // Error
  Error: 'error',
  // FriendRequest
  ReceiveFriendRequest: 'receive_friend_request',
  HandleFriendRequest: 'handle_friend_request',
  NewMessage: 'new_message',
} as const;
