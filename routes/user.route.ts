import { Router } from 'express';
import { protect } from '../controllers/auth.controller';
import {
  createUser,
  getFriends,
  getUserById,
  searchUser,
} from '../controllers/user.controller';

const router = Router();

router.post('/', createUser);
router.get('/search/:pattern', searchUser);
router.get('/friends', protect, getFriends);
router.get('/:userId', protect, getUserById);

export default router;
