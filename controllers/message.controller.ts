import { Chatroom, GroupChatroom } from '../models/chatroom/chatroom';
import { Message } from '../models/message/message';
import catchAsync from '../utils/catchAsync';
import { AppError } from '../utils/error';

export const isAdmin = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { groupId } = req.params;

  const chatroom = await GroupChatroom.findById(groupId);
  if (!chatroom) return next(new AppError('Group not found', 404));

  if (
    !chatroom.admins.find(id => id.toString() === user._id.toString()) &&
    chatroom.owner.toString() !== user._id.toString()
  ) {
    return next(new AppError('You are not administrator of the group'));
  }

  next();
});

export const readMessage = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message) return next(new AppError('Message not found', 404));

  // check if user is in the chatroom
  const userId = req.user._id;
  const chatroom = await Chatroom.findById(message.chatroomId).populate(
    'users',
    'name email'
  );

  if (!chatroom) {
    return next(new AppError('bad message'));
  }

  if (!chatroom.users.find(u => u._id.toString() === userId.toString())) {
    return next(new AppError('not your message'));
  }

  message.read = true;

  await message.save();

  res.status(200).json({
    status: 'success',
    message: 'message read',
  });
});
