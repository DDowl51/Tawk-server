import { model, Schema } from 'mongoose';
import {
  IFileMessage,
  IImgMessage,
  ILinkMessage,
  IMessage,
  ITextMessage,
} from './message.interface';

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
  { timestamps: true, discriminatorKey: 'type' }
);

const textMessageSchema = new Schema<ITextMessage>({});

const imgMessageSchema = new Schema<IImgMessage>({
  img: { type: String, required: true },
});

const fileMessageSchema = new Schema<IFileMessage>({
  fileInfo: {
    type: {
      filename: { type: String, required: true },
      filesize: { type: Number, required: true },
    },
  },
  file: { type: String, required: true },
});

const linkMessageSchema = new Schema<ILinkMessage>({
  link: { type: String, required: true },
  preview: {
    type: {
      description: String,
      favicon: String,
      image: String,
      site_name: String,
      title: String,
      url: String,
    },
  },
});

messageSchema.pre(/^find/, function (next) {
  this.populate('sender', 'name email avatar about');
  next();
});

const Message = model<IMessage>('Message', messageSchema);

const TextMessage = Message.discriminator('text', textMessageSchema);
const ImgMessage = Message.discriminator('img', imgMessageSchema);
const FileMessage = Message.discriminator('file', fileMessageSchema);
const LinkMessage = Message.discriminator('link', linkMessageSchema);

export { Message, TextMessage, ImgMessage, FileMessage, LinkMessage };
