// socket.on(...)
export const ServerEvents = {
  Connection: 'connection',
  Disconnect: 'disconnect',
  CreateFriendRequest: 'create_friend_request',
  HandleFriendRequest: 'handle_friend_request',
  SendMessage: 'send_message',
  CreateGroup: 'create_group',
  StartVideo: 'start_video',
  AnswerCall: 'answer_call',
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
  CallUser: 'call_user',
  AcceptCall: 'accept_call',
  RejectCall: 'reject_call',
} as const;

// webrtc events, both on(...) and emit(...)
export const WebRTCEvents = {
  Offer: 'webrtc:offer',
  Answer: 'webrtc:answer',
  Candidate: 'webrtc:candidate',
  Reject: 'webrtc:reject',
  Error: 'webrtc:error',
  Microphone: 'webrtc:microphone',
  Speaker: 'webrtc:speaker',
} as const;
