import { verifyAccessToken } from '../services/auth.service.js';

/**
 * Optional auth middleware - doesn't fail if no token present
 * Used for endpoints like /me where we want to check auth status without error
 * Returns req.user = null if not authenticated
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyAccessToken(token);
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (error) {
    // Token invalid or expired - treat as not authenticated
    req.user = null;
    next();
  }
};

/**
 * Middleware to verify JWT access token from HTTP-only cookie
 * Attaches user data to req.user if valid
 */
export const verifyAuth = async (req, res, next) => {
  try {
    // Get token from HTTP-only cookie
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Authentification requise',
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user data to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Token expiré, veuillez vous reconnecter',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Token invalide',
      });
    }

    return res.status(401).json({
      success: false,
      data: null,
      error: "Erreur d'authentification",
    });
  }
};
