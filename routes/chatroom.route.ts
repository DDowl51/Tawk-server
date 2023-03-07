import { Router } from 'express';
import { protect } from '../controllers/auth.controller';
import { getChatroom } from '../controllers/chatroom.controller';

const router = Router();

router.get('/:friendId', protect, getChatroom);

export default router;
