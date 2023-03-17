import { Router } from 'express';

import userRouter from './user.route';
import authRouter from './auth.route';
import chatroomRouter from './chatroom.route';
import callLogRouter from './callLog.route';

const router = Router();

router.use('/user', userRouter);
router.use('/auth', authRouter);
router.use('/chatroom', chatroomRouter);
router.use('/callLog', callLogRouter);

export default router;
