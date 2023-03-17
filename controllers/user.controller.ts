import User from '../models/user/user';
import catchAsync from '../utils/catchAsync';
import { AppError } from '../utils/error';
import { Request } from '../utils/types';
import { CreateUserDto, SearchUserDto } from './dtos/user.dto';

export const createUser = catchAsync(
  async (req: Request<CreateUserDto>, res, next) => {
    const { name, email, password } = req.body;

    const newUser = await User.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      status: 'success',
      message: 'Created',
      data: newUser,
    });
  }
);

export const searchUser = catchAsync(async (req, res, next) => {
  const { pattern } = req.params;
  const reg = new RegExp(pattern);

  const users = await User.find({
    $or: [
      { name: { $regex: reg, $options: 'i' } },
      { email: { $regex: reg, $options: 'i' } },
    ],
  }).select('name email avatar about online');

  res.status(200).json({
    status: 'success',
    message: 'search success',
    users,
  });
});

// Protected
export const getFriends = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('Invalid user!'));
  }

  res.status(200).json({
    status: 'success',
    message: 'get friends success',
    friends: user.friends,
  });
});

// Protected
export const getUserById = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select(
    'name email avatar about online'
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    user,
  });
});
