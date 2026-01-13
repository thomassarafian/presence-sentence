import mongoose from 'mongoose';

const meditationSchema = new mongoose.Schema(
  {
    quote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quote',
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: ['fr', 'en'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

meditationSchema.index({ quote: 1 });

const Meditation = mongoose.model('Meditation', meditationSchema);

export default Meditation;
