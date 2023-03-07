import { model, Schema } from 'mongoose';
import Message from '../message/message';
import { IChatroom } from './chatroom.interface';

const chatroomSchema = new Schema<IChatroom>(
  {
    name: { type: String, required: true },
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
  { timestamps: true }
);

chatroomSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'messages',
    populate: { path: 'sender', select: 'name email avatar about' },
  })
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name email avatar about' },
    })
    .populate('users', 'name email avatar about');
  next();
});

const Chatroom = model<IChatroom>('Chatroom', chatroomSchema);

export default Chatroom;
