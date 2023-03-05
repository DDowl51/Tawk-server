import { Types } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  avatar?: string;
  about?: string;

  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpires?: Date;

  verified: boolean;
  otp: string;
  otpExpireTime: Date;

  friends: Types.ObjectId[];
  online: boolean;

  correctPassword: (password: string) => Promise<boolean>;
}
