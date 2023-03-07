import { Message } from '../../utils/types';

export interface CreateFriendRequestDto {
  senderId: string;
  recipientId: string;
}

export interface HandleFriendRequestDto {
  requestId: string;
  accepted: boolean;
}

export interface HandleMessageDto {
  from: string;
  text: string;
  chatroomId: string;
}
