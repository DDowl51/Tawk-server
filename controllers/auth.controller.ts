import jwt, { JwtPayload } from 'jsonwebtoken';
import otpGenerator from 'otp-generator';

import catchAsync from '../utils/catchAsync';
import { AppError } from '../utils/error';
import User from '../models/user/user';
import { Request, WithUser } from '../utils/types';
import { LoginDto, RegisterDto, VerifyOTPDto } from './dtos/auth.dto';
import filter from '../utils/filterObj';

const signToken = (userId: string) => {
  const secret = process.env.JWT_TOKEN!;
  return jwt.sign({ userId }, secret);
};

export const protect = catchAsync(
  async (req: Request & Partial<WithUser>, res, next) => {
    // 1) Get the jwt token
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    } else {
      return next(
        new AppError('You are not logged in, please login to proceed', 400)
      );
    }

    // 2) Verification of the token
    const decoded = jwt.verify(token, process.env.JWT_TOKEN!) as JwtPayload;

    // 3) if user is still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new AppError('Invalid token, please login again', 400));
    }

    // 4) check if user has changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat!)) {
      return next(new AppError('Password changed, please login again', 400));
    }

    req.user = user;

    next();
  }
);

export const register = catchAsync(
  async (req: Request<RegisterDto>, res, next) => {
    const filterProps = ['name', 'email', 'password'] as const;
    const filteredBody = filter(req.body, ...filterProps);
    // Check if user is already existed
    const userExists = await User.findOne({ email: filteredBody.email });

    if (userExists && userExists.verified) {
      return next(new AppError('Email is already in use, please login', 400));
    } else if (userExists && !userExists.verified) {
      // Exists but not verified, Update user infomation
      for (const key of filterProps) {
        userExists[key] = filteredBody[key]!;
      }

      const updatedUser = await userExists.save();

      req.userId = updatedUser._id;
      // send otp
      return next();
    }

    // New user
    const newUser = await User.create(filteredBody);
    await newUser.save();

    req.userId = newUser._id;
    // Send otp
    next();
  }
);

export const sendOTP = catchAsync(async (req, res, next) => {
  const { userId } = req;
  // 6位数验证码
  const newOtp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const otpExpireTime = Date.now() + 10 * 60 * 1000; // 10mins
  const user = await User.findById(userId);

  if (!user) return next(new AppError('User not exists.', 400));

  user.otp = newOtp;
  user.otpExpireTime = new Date(otpExpireTime);
  await user.save();

  // TODO: Send OTP to user;
  console.log(`${user.email}'s OTP: ${newOtp}`);

  res.status(200).json({
    status: 'success',
    message: 'OTP sent successfully',
  });
});

export const verifyOTP = catchAsync(
  async (req: Request<VerifyOTPDto>, res, next) => {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      otpExpireTime: { $gt: Date.now() }, // not expire yet
    }).populate('friends', 'name email avatar about online');
    if (!user) return next(new AppError('Invalid Email or OTP expired'));

    if (!(await user.correctOtp(otp))) {
      return next(new AppError('Incorrect OTP'));
    }

    // Verified successfully
    user.verified = true;
    user.otp = undefined;
    user.otpExpireTime = undefined;

    await user.save();

    const token = signToken(user._id.toString());
    user.password = '';
    res.status(200).json({
      status: 'success',
      message: 'OTP verified successfully',
      token,
      user,
    });
  }
);

export const login = catchAsync(async (req: Request<LoginDto>, res, next) => {
  const { email, password } = req.body;
  console.log(`${email} tried to login`);
  const user = await User.findOne({ email });

  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Incorrect email or password, please try again.'));
  }

  const token = signToken(user._id.toString());

  user.password = '';
  res.status(200).json({
    status: 'success',
    message: 'Login successfully',
    token,
    user,
  });
});
