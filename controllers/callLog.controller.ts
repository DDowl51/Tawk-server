import CallLog from '../models/callLog/callLog';
import User from '../models/user/user';
import catchAsync from '../utils/catchAsync';
import { AppError } from '../utils/error';

// protected
export const getCallLogById = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { callLogId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError('User not found'));
  }

  const callLog = await CallLog.findById(callLogId);

  if (!callLog) {
    return next(new AppError('Call log not found', 404));
  }

  // 这个calllog和用户无关
  if (
    ![callLog.sender.toString(), callLog.recipient.toString()].includes(
      userId.toString()
    )
  ) {
    return next(new AppError('Not your bussiness!'));
  }

  res.status(200).json({
    status: 'success',
    callLog,
  });
});
