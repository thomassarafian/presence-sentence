import {
  registerUser,
  loginUser,
  verifyUserEmail,
  logoutUser,
  getUserProfile,
  refreshAccessToken,
} from '../services/auth.service.js';
import { sendVerificationEmail } from '../services/email.service.js';

// Cookie configuration
const getCookieOptions = (maxAge) => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge,
    domain: process.env.COOKIE_DOMAIN || undefined,
  };
};

// Helper: Set auth cookies (access + refresh)
const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000)); // 15 minutes
  res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days
};

// Helper: Clear auth cookies
const clearAuthCookies = (res) => {
  const clearOptions = getCookieOptions(0);
  res.cookie('accessToken', '', clearOptions);
  res.cookie('refreshToken', '', clearOptions);
};

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { email, pseudo, password } = req.body;

    const result = await registerUser({ email, pseudo, password });

    // Set HTTP-only cookies
    setAuthCookies(res, result.accessToken, result.refreshToken);

    // Send verification email
    try {
      await sendVerificationEmail(email, pseudo, result.verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
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

    // Set HTTP-only cookies
    setAuthCookies(res, result.accessToken, result.refreshToken);

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
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Refresh token manquant',
      });
    }

    const result = await refreshAccessToken(token);

    // Set new cookies
    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(200).json({
      success: true,
      data: { message: 'Token rafraîchi avec succès' },
      error: null,
    });
  } catch (error) {
    console.error('Refresh token error:', error);

    // Clear cookies on refresh failure
    clearAuthCookies(res);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Session expirée, veuillez vous reconnecter',
      });
    }

    res.status(401).json({
      success: false,
      data: null,
      error: 'Token invalide',
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    await logoutUser();

    // Clear cookies
    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      data: { message: 'Déconnexion réussie' },
      error: null,
    });
  } catch (error) {
    console.error('Logout error:', error);

    // Clear cookies even if error
    clearAuthCookies(res);

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
 */
export const me = async (req, res) => {
  try {
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
        message: 'Email vérifié avec succès ! Vos citations sont maintenant publiques.',
      },
      error: null,
    });
  } catch (error) {
    console.error('Email verification error:', error);

    if (error.message.includes('invalide') || error.message.includes('expiré')) {
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
