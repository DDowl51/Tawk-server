import { Message, User } from '../../utils/types';

export interface IChatroom {
  name: string;
  messages: Message[];
  users: User[];
  lastMessage: Message;
}
