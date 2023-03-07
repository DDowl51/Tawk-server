import { Types } from 'mongoose';
import { User } from '../../utils/types';

export interface IMessage {
  text: string;
  type: 'text' | 'link' | 'file' | 'img';
  chatroomId: Types.ObjectId;
  sender: User;
}
