import {
  Chatroom,
  GroupChatroom,
  SingleChatroom,
} from '../models/chatroom/chatroom';
import User from '../models/user/user';
import catchAsync from '../utils/catchAsync';
import { AppError } from '../utils/error';
import { Request, User as UserType } from '../utils/types';
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

// protected
export const getUserChatrooms = catchAsync(async (req, res, next) => {
  const { user } = req;

  const now = new Date();
  const monthAgo = new Date().setMonth(now.getMonth() - 1);

  const chatrooms = await Chatroom.find({
    users: { $all: [user._id] },
    updatedAt: { $gt: monthAgo }, // 最近一个月之内活跃的聊天
  });

  res.status(200).json({
    status: 'success',
    message: 'success',
    chatrooms,
  });
});

// protected
export const getCommonGroups = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { friendId } = req.params;

  const friend = await User.findById(friendId);
  if (!friend) return next(new AppError('friend not found'));

  const chatrooms = await GroupChatroom.find({
    users: { $all: [user._id, friendId] },
  });

  res.status(200).json({
    status: 'success',
    message: 'success',
    chatrooms,
  });
});

export const getGroupUsers = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;

  const chatroom = await GroupChatroom.findById(groupId).populate(
    'admins users',
    'name email avatar online about'
  );

  if (!chatroom) return next(new AppError('Group not found', 404));

  res.status(200).json({
    status: 'success',
    admins: chatroom.admins,
    users: chatroom.users,
  });
});

export const setGroupAdmins = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const { admins } = req.body;

  const adminUsers = await Promise.all<UserType>(
    admins.map((uId: string) => User.findById(uId))
  );

  const chatroom = await GroupChatroom.findById(groupId);
  if (!chatroom) return next(new AppError('Group not found', 404));

  chatroom.admins = adminUsers.map(u => u._id);

  const newChatroom = await chatroom.save();

  res.status(200).json({
    status: 'success',
    message: 'set admins success',
    chatroom: newChatroom,
  });
});
