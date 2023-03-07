import { Router } from 'express';

import userRouter from './user.route';
import authRouter from './auth.route';
import chatroomRouter from './chatroom.route';

const router = Router();

router.use('/user', userRouter);
router.use('/auth', authRouter);
router.use('/chatroom', chatroomRouter);

export default router;
