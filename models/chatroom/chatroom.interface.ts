import { Types } from 'mongoose';
import { Message, User } from '../../utils/types';

export interface IChatroom {
  type: 'single' | 'group';
  messages: Message[];
  users: User[];
  lastMessage: Message;
}

export interface ISingleChatroom extends IChatroom {}

export interface IGroupChatroom extends IChatroom {
  name: string;
  owner: Types.ObjectId;
  admins: Types.ObjectId[];
}
