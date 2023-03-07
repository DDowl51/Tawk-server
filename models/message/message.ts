import { model, Schema } from 'mongoose';
import User from '../user/user';
import { IMessage } from './message.interface';

const messageSchema = new Schema<IMessage>(
  {
    text: { type: String },
    type: {
      required: true,
      type: String,
      enum: ['text', 'link', 'file', 'img'],
    },
    chatroomId: { type: Schema.Types.ObjectId, ref: 'Chatroom' },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

messageSchema.pre(/^find/, function (next) {
  this.populate('sender', 'name email avatar about');
  next();
});

const Message = model<IMessage>('Message', messageSchema);

export default Message;
