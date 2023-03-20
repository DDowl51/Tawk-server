import { Router } from 'express';
import { protect } from '../controllers/auth.controller';
import {
  getChatroomById,
  getCommonGroups,
  getGroupUsers,
  getSingleChatroom,
  getUserChatrooms,
  setGroupAdmins,
} from '../controllers/chatroom.controller';
import { isAdmin } from '../controllers/message.controller';

const router = Router();

router.get('/:groupId/users', getGroupUsers);
router.patch('/:groupId/admins', protect, isAdmin, setGroupAdmins);

router
  .use(protect)
  .get('/userId/:friendId', getSingleChatroom)
  .get('/common/:friendId', getCommonGroups)
  .get('/user', getUserChatrooms)
  .get('/:chatroomId', getChatroomById);

export default router;
