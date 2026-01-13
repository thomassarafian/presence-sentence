import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Quote from '../models/Quote.js';

// JWT Helper Functions
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
    issuer: 'quote-app',
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
    issuer: 'quote-app',
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
    issuer: 'quote-app',
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
    issuer: 'quote-app',
  });
};

// Email Verification Token Generator (hashed for security)
const generateEmailVerificationToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return { token, hashedToken, expiry };
};

// Hash a token for comparison
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Register a new user
 */
export const registerUser = async ({ email, pseudo, password }) => {
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

  // Generate email verification token (store hashed, return plain)
  const { token: verificationToken, hashedToken, expiry } = generateEmailVerificationToken();

  const user = await User.create({
    email,
    pseudo,
    password,
    emailVerificationToken: hashedToken,
    verificationTokenExpiry: expiry,
    emailVerified: false,
  });

  const tokenPayload = { userId: user._id, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

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
    refreshToken,
    verificationToken,
  };
};

/**
 * Login user
 */
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Email ou mot de passe incorrect');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new Error('Email ou mot de passe incorrect');
  }

  const tokenPayload = { userId: user._id, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  user.lastLogin = new Date();
  await user.save();

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
    refreshToken,
  };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  const tokenPayload = { userId: user._id, role: user.role };
  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Verify email with token
 */
export const verifyUserEmail = async (token) => {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
  }).select('+emailVerificationToken +verificationTokenExpiry');

  if (!user) {
    throw new Error('Token de vérification invalide');
  }

  if (user.verificationTokenExpiry < new Date()) {
    throw new Error('Le token de vérification a expiré');
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

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
 * Logout user
 */
export const logoutUser = async () => {
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
