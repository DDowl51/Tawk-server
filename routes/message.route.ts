import { Router } from 'express';
import { protect } from '../controllers/auth.controller';
import { readMessage } from '../controllers/message.controller';

const router = Router();

router.patch('/:messageId', protect, readMessage);

export default router;
