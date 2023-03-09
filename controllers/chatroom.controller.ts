import { Chatroom, SingleChatroom } from '../models/chatroom/chatroom';
import User from '../models/user/user';
import catchAsync from '../utils/catchAsync';
import { AppError } from '../utils/error';
import { Request } from '../utils/types';
import { GetChatroomDto } from './dtos/chatroom.dto';

// Protected
export const getSingleChatroom = catchAsync(
  async (req: Request<GetChatroomDto>, res, next) => {
    const { user } = req;
    const { friendId } = req.params;
    //  Check if user is valid
    const userDB = await User.findById(user._id);
    if (!userDB) {
      return next(new AppError('Invalid user'));
    }

    // check if chatroom exists
    let chatroom = await SingleChatroom.findOne({
      users: { $size: 2, $all: [user._id, friendId] },
    });

    // if not, create a new one
    if (!chatroom) {
      chatroom = await SingleChatroom.create({
        users: [user._id, friendId],
      });
      await chatroom.populate('users', 'name email avatar about');
    }

    res.status(200).json({
      status: 'success',
      message: 'get succeed',
      chatroom,
    });
  }
);

export const getChatroomById = catchAsync(
  async (req: Request<GetChatroomDto>, res, next) => {
    const { user } = req;
    const { chatroomId } = req.params;
    //  Check if user is valid
    const userDB = await User.findById(user._id);
    if (!userDB) {
      return next(new AppError('Invalid user'));
    }

    // check if chatroom exists
    let chatroom = await Chatroom.findById(chatroomId);

    // if not, create a new one
    if (!chatroom) {
      return next(new AppError('Invalid chatroomId'));
    }

    res.status(200).json({
      status: 'success',
      message: 'get succeed',
      chatroom,
    });
  }
);
