import mongoose from 'mongoose';

const meditationLimitSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['ip', 'user'],
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

meditationLimitSchema.index({ identifier: 1, type: 1, date: 1 }, { unique: true });

const MeditationLimit = mongoose.model('MeditationLimit', meditationLimitSchema);

export default MeditationLimit;
