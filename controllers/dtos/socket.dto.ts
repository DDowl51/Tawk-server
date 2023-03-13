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
  type: 'text' | 'img' | 'file' | 'link';
}

export interface HandleCreateGroupDto {
  members: string[];
  name: string;
}

export interface HandleStartVideoDto {
  userId: string;
  signalData: any;
}

export interface HandleAnswerCallDto {
  to: string;
  accepted: boolean;
  signal: any;
}

export interface HandleOfferDto {
  sdp: RTCSessionDescriptionInit;
  to: string;
}

export interface HandleAnswerDto {
  sdp: RTCSessionDescriptionInit;
  to: string;
}

export interface HandleCandidateDto {
  candidate: RTCIceCandidate;
  to: string;
}

export interface HandleRejectDto {
  to: string;
  reason: string;
}
