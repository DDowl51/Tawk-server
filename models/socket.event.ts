// socket.on(...)
export const ServerEvents = {
  Connection: 'connection',
  Disconnect: 'disconnect',
  CreateFriendRequest: 'create_friend_request',
  HandleFriendRequest: 'handle_friend_request',
  SendMessage: 'send_message',
  CreateGroup: 'create_group',
} as const;

// socket.emit(...)
export const ClientEvents = {
  // Error
  Error: 'error',
  // FriendRequest
  ReceiveFriendRequest: 'receive_friend_request',
  HandleFriendRequest: 'handle_friend_request',
  NewMessage: 'new_message',
  FriendOnline: 'friend_online',
  FriendOffline: 'friend_offline',
  JoinGroup: 'join_group',
} as const;
