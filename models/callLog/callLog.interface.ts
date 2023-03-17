import { Types } from 'mongoose';

export interface ICallLog {
  type: 'video' | 'audio';
  duration: number; // seconds
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  missed: boolean;
}
