import { Types } from 'mongoose';
import { User } from '../../utils/types';

export interface IMessage {
  text: string;
  type: 'text' | 'link' | 'file' | 'img';
  chatroomId: Types.ObjectId;
  sender: User;
  quote?: IMessage;
}

export interface ITextMessage extends IMessage {
  type: 'text';
}

export interface IImgMessage extends IMessage {
  type: 'img';
  img: string;
}

export interface IFileMessage extends IMessage {
  type: 'file';
  fileInfo: { filename: string; filesize: number };
  file: string;
}

export interface ILinkMessage extends IMessage {
  type: 'link';
  link: string;
  preview?: {
    description?: string;
    favicon?: string;
    image?: string;
    site_name?: string;
    title?: string;
    type?: string;
    url?: string;
  };
}
