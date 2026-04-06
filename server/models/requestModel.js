import mongoose from 'mongoose';

const requestSchema = mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    itemType: {
      type: String,
      enum: ['Land', 'Equipment'],
      required: true,
    },
    // We use dynamic references based on itemType
    land: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Land',
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
    },
    duration: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Request', requestSchema);