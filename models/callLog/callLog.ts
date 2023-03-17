import { model, Schema } from 'mongoose';
import { ICallLog } from './callLog.interface';

const callLogSchema = new Schema<ICallLog>(
  {
    type: {
      type: String,
      enum: ['video', 'audio'],
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    sender: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    recipient: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    missed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const CallLog = model('CallLog', callLogSchema);

export default CallLog;
