import { Router } from 'express';
import { protect } from '../controllers/auth.controller';
import { getCallLogById } from '../controllers/callLog.controller';

const router = Router();

router.get('/:callLogId', protect, getCallLogById);

export default router;
