import User from '../models/user/user';
import catchAsync from '../utils/catchAsync';
import { Request } from '../utils/RequestType';
import { CreateUserDto } from './dtos/user.dto';

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
