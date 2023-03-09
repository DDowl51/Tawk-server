import { Router } from 'express';
import { protect } from '../controllers/auth.controller';
import {
  getChatroomById,
  getSingleChatroom,
} from '../controllers/chatroom.controller';

const router = Router();

router.get('/userId/:friendId', protect, getSingleChatroom);
router.get('/:chatroomId', protect, getChatroomById);

export default router;
