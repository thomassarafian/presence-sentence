import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  me,
  verifyEmail,
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
} from '../validators/authValidator.js';
import { verifyAuth, optionalAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken); // V1: Not implemented
router.get('/verify-email/:token', verifyEmail);

// Auth check route (returns user or null, never 401)
router.get('/me', optionalAuth, me);

// Protected routes (require authentication)
router.post('/logout', verifyAuth, logout);

export default router;
