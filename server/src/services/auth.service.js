import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import Quote from '../models/Quote.js';

// JWT Helper Functions
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '7d', // V1: Single token avec long expiry
    issuer: 'quote-app',
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
    issuer: 'quote-app',
  });
};

// Email Verification Token Generator
const generateEmailVerificationToken = () => {
  const token = uuidv4();
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return { token, expiry };
};

/**
 * Register a new user
 */
export const registerUser = async ({ email, pseudo, password }) => {
  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { pseudo }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error('Cet email est déjà utilisé');
    }
    if (existingUser.pseudo === pseudo) {
      throw new Error('Ce pseudo est déjà utilisé');
    }
  }

  // Generate email verification token
  const { token: verificationToken, expiry } = generateEmailVerificationToken();

  // Create user (password will be hashed by pre-save hook)
  const user = await User.create({
    email,
    pseudo,
    password,
    emailVerificationToken: verificationToken,
    verificationTokenExpiry: expiry,
    emailVerified: false,
  });

  // Generate JWT token
  const accessToken = generateAccessToken({ userId: user._id, role: user.role });

  // Return user without sensitive data
  const userResponse = {
    id: user._id,
    email: user.email,
    pseudo: user.pseudo,
    emailVerified: user.emailVerified,
    role: user.role,
    createdAt: user.createdAt,
  };

  return {
    user: userResponse,
    accessToken,
    verificationToken,
  };
};

/**
 * Login user
 */
export const loginUser = async ({ email, password }) => {
  // Find user with password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // Generate JWT token
  const accessToken = generateAccessToken({ userId: user._id, role: user.role });

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Return user without sensitive data
  const userResponse = {
    id: user._id,
    email: user.email,
    pseudo: user.pseudo,
    emailVerified: user.emailVerified,
    role: user.role,
    lastLogin: user.lastLogin,
  };

  return {
    user: userResponse,
    accessToken,
  };
};

/**
 * Verify email with token
 */
export const verifyUserEmail = async (token) => {
  const user = await User.findOne({
    emailVerificationToken: token,
  }).select('+emailVerificationToken +verificationTokenExpiry');

  if (!user) {
    throw new Error('Token de vérification invalide');
  }

  // Check if token is expired
  if (user.verificationTokenExpiry < new Date()) {
    throw new Error('Le token de vérification a expiré');
  }

  // Mark email as verified
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

  // Update all user's quotes to be public
  await Quote.updateMany({ createdBy: user._id }, { isPublic: true });

  const userResponse = {
    id: user._id,
    email: user.email,
    pseudo: user.pseudo,
    emailVerified: user.emailVerified,
  };

  return { user: userResponse };
};

/**
 * Logout user (V1: simple, cookie cleared client-side)
 */
export const logoutUser = async () => {
  // V1: No server-side action needed, cookie will be cleared client-side
  return { success: true };
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  return {
    id: user._id,
    email: user.email,
    pseudo: user.pseudo,
    emailVerified: user.emailVerified,
    role: user.role,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
};
