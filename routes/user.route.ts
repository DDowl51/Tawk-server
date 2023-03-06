import { Router } from 'express';
import { createUser, searchUser } from '../controllers/user.controller';

const router = Router();

router.post('/', createUser);
router.get('/:pattern', searchUser);

export default router;
