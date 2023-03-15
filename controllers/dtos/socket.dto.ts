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
  type: 'audio' | 'video';
  sdp: RTCSessionDescriptionInit;
  to: string;
}

export interface HandleAnswerDto {
  type: 'audio' | 'video';
  sdp: RTCSessionDescriptionInit;
  to: string;
}

export interface HandleCandidateDto {
  type: 'audio' | 'video';
  candidate: RTCIceCandidate;
  to: string;
}

export interface HandleRejectDto {
  type: 'audio' | 'video';
  to: string;
  reason: string;
}

export interface HandleMicrophoneDto {
  type: 'audio' | 'video';
  to: string;
  enabled: boolean;
}

export interface HandleSpeakerDto {
  type: 'audio' | 'video';
  to: string;
  enabled: boolean;
}
