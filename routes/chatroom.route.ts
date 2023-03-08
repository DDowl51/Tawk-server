import { Router } from 'express';
import { protect } from '../controllers/auth.controller';
import { getSingleChatroom } from '../controllers/chatroom.controller';

const router = Router();

router.get('/:friendId', protect, getSingleChatroom);

export default router;
