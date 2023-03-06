import { Types } from 'mongoose';

export interface IFriendRequest {
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  accepted: boolean;
}
