import User from '../models/user/user';
import catchAsync from '../utils/catchAsync';
import { Request } from '../utils/RequestType';
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
  }).select('email name avatar online');

  res.status(200).json({
    status: 'success',
    message: 'search success',
    users,
  });
});
