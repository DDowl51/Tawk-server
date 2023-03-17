import { model, Schema } from 'mongoose';
import { Message } from '../message/message';
import {
  IChatroom,
  IGroupChatroom,
  ISingleChatroom,
} from './chatroom.interface';

const chatroomSchema = new Schema<IChatroom>(
  {
    messages: {
      type: [Schema.Types.ObjectId],
      ref: Message,
      default: [],
    },
    users: {
      required: true,
      type: [Schema.Types.ObjectId],
      ref: 'User',
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: Message,
    },
  },
  { timestamps: true, discriminatorKey: 'type' }
);

const singleChatroomSchema = new Schema<ISingleChatroom>({});
const groupChatroomSchema = new Schema<IGroupChatroom>({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  admins: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
});

chatroomSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'messages',
    populate: { path: 'sender', select: 'name email avatar about' },
  }).populate({
    path: 'lastMessage',
    populate: { path: 'sender', select: 'name email avatar about' },
  });
  next();
});

export const Chatroom = model<IChatroom>('Chatroom', chatroomSchema);
export const SingleChatroom = Chatroom.discriminator(
  'single',
  singleChatroomSchema
);
export const GroupChatroom = Chatroom.discriminator(
  'group',
  groupChatroomSchema
);
