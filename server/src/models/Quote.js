import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema(
  {
    quote: {
      type: String,
      required: [true, 'La citation est requise'],
      trim: true,
      minlength: [5, 'La citation doit contenir au moins 5 caractères'],
      maxlength: [500, 'La citation ne peut pas dépasser 500 caractères'],
    },
    author: {
      type: String,
      default: 'Anonymous',
      trim: true,
      maxlength: [100, "L'auteur ne peut pas dépasser 100 caractères"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional for backward compatibility with old quotes
    },
    isPublic: {
      type: Boolean,
      default: false, // Set to true when user email is verified
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
quoteSchema.index({ createdBy: 1 });
quoteSchema.index({ isPublic: 1, createdAt: -1 });

// Virtual populate for user data
quoteSchema.virtual('creator', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true,
});

const Quote = mongoose.model('Quote', quoteSchema);

export default Quote;
