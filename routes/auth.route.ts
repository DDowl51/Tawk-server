import { Router } from 'express';
import {
  login,
  register,
  sendOTP,
  verifyOTP,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', register, sendOTP);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);

export default router;
