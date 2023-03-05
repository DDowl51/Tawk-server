import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

import { IUser } from './user.interface';

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    avatar: { type: String },
    about: { type: String },

    password: { type: String, required: true },
    passwordConfirm: { type: String },
    passwordChangedAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetTokenExpires: { type: Date },

    verified: { type: Boolean, defualt: false },
    otp: { type: String },
    otpExpireTime: { type: Date },

    friends: { type: [Schema.Types.ObjectId], ref: 'User' },
    online: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

userSchema.methods.correctPassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};

const User = model('User', userSchema);

export default User;
