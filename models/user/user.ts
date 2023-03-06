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
    socketId: { type: String },
  },
  { timestamps: true }
);

// Hash password after save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Hash otp after save
userSchema.pre('save', async function (next) {
  if (!this.isModified('otp')) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  if (this.otp) {
    this.otp = await bcrypt.hash(this.otp, salt);
  }

  next();
});

userSchema.methods.correctPassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};
userSchema.methods.correctOtp = function (otp: string) {
  return bcrypt.compare(otp, this.otp);
};

userSchema.methods.changedPasswordAfter = function (timestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000
    );

    return timestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

const User = model<IUser>('User', userSchema);

export default User;
