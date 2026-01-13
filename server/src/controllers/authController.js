import {
  registerUser,
  loginUser,
  verifyUserEmail,
  logoutUser,
  getUserProfile,
} from '../services/auth.service.js';
import { sendVerificationEmail } from '../services/email.service.js';

// Helper: Set HTTP-only cookie
const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    domain: process.env.COOKIE_DOMAIN || undefined,
  });
};

// Helper: Clear auth cookie
const clearAuthCookie = (res) => {
  res.cookie('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 0,
    domain: process.env.COOKIE_DOMAIN || undefined,
  });
};

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { email, pseudo, password } = req.body;

    const result = await registerUser({ email, pseudo, password });

    // Set HTTP-only cookie
    setAuthCookie(res, result.accessToken);

    // Send verification email
    try {
      await sendVerificationEmail(email, pseudo, result.verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        message: 'Inscription réussie. Vérifiez votre email pour activer votre compte.',
      },
      error: null,
    });
  } catch (error) {
    console.error('Register error:', error);

    // Handle specific errors
    if (error.message.includes('déjà utilisé')) {
      return res.status(400).json({
        success: false,
        data: null,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      data: null,
      error: "Erreur lors de l'inscription",
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

    // Set HTTP-only cookie
    setAuthCookie(res, result.accessToken);

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        message: 'Connexion réussie',
      },
      error: null,
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error.message.includes('incorrect')) {
      return res.status(401).json({
        success: false,
        data: null,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      data: null,
      error: 'Erreur lors de la connexion',
    });
  }
};

/**
 * Refresh token (V1: Not implemented, using single long-lived token)
 * POST /api/auth/refresh
 */
export const refreshToken = async (req, res) => {
  res.status(501).json({
    success: false,
    data: null,
    error: 'Refresh token not implemented in V1',
  });
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    await logoutUser();

    // Clear cookie
    clearAuthCookie(res);

    res.status(200).json({
      success: true,
      data: {
        message: 'Déconnexion réussie',
      },
      error: null,
    });
  } catch (error) {
    console.error('Logout error:', error);

    // Clear cookie even if error
    clearAuthCookie(res);

    res.status(500).json({
      success: false,
      data: null,
      error: 'Erreur lors de la déconnexion',
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 * Returns user data if authenticated, or user: null if not (no 401 error)
 */
export const me = async (req, res) => {
  try {
    // If no user in request (not authenticated), return null without error
    if (!req.user) {
      return res.status(200).json({
        success: true,
        data: { user: null },
        error: null,
      });
    }

    const userId = req.user.userId;
    const user = await getUserProfile(userId);

    res.status(200).json({
      success: true,
      data: { user },
      error: null,
    });
  } catch (error) {
    console.error('Get profile error:', error);

    res.status(500).json({
      success: false,
      data: null,
      error: 'Erreur lors de la récupération du profil',
    });
  }
};

/**
 * Verify email with token
 * GET /api/auth/verify-email/:token
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const result = await verifyUserEmail(token);

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        message:
          'Email vérifié avec succès ! Vos citations sont maintenant publiques.',
      },
      error: null,
    });
  } catch (error) {
    console.error('Email verification error:', error);

    if (
      error.message.includes('invalide') ||
      error.message.includes('expiré')
    ) {
      return res.status(400).json({
        success: false,
        data: null,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      data: null,
      error: "Erreur lors de la vérification de l'email",
    });
  }
};
