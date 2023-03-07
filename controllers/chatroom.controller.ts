import Chatroom from '../models/chatroom/chatroom';
import catchAsync from '../utils/catchAsync';
import { Request } from '../utils/types';
import { GetChatroomDto } from './dtos/chatroom.dto';

// Protected
export const getChatroom = catchAsync(
  async (req: Request<GetChatroomDto>, res, next) => {
    const { user } = req;
    const { friendId } = req.params;
    // check if chatroom exists
    let chatroom = await Chatroom.findOne({
      users: { $size: 2, $all: [user._id, friendId] },
    });

    // if not, create a new one
    if (!chatroom) {
      chatroom = await Chatroom.create({
        name: 'Single Chat',
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
