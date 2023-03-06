import { model, Schema } from 'mongoose';
import { IFriendRequest } from './friendRequest.interface';

const friendRequestSchema = new Schema<IFriendRequest>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  accepted: {
    type: Boolean,
    default: false,
  },
});

const FriendRequest = model<IFriendRequest>(
  'FriendRequest',
  friendRequestSchema
);

export default FriendRequest;
