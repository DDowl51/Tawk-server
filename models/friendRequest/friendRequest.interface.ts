import { User } from '../../utils/types';

export interface IFriendRequest {
  sender: User;
  recipient: User;
  accepted: boolean;
  handled: boolean;
  requestTimes: number;
}
