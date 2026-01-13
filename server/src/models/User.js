import mongoose from 'mongoose';
import argon2 from 'argon2';

const userSchema = new mongoose.Schema(
  {
    pseudo: {
      type: String,
      required: [true, 'Le pseudo est requis'],
      trim: true,
      minlength: [3, 'Le pseudo doit contenir au moins 3 caractères'],
      maxlength: [20, 'Le pseudo ne peut pas dépasser 20 caractères'],
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      select: false,
      minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpiry: {
      type: Date,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ pseudo: 1 }, { unique: true });
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return argon2.verify(this.password, candidatePassword);
};

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await argon2.hash(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

export default User;
