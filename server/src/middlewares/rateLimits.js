/**
 * ⏱️ Rate Limiters Spécifiques
 * Différents limiters pour différents endpoints
 */
import rateLimit from 'express-rate-limit';
import {
  globalRateLimitOptions,
  authRateLimitOptions,
  createRateLimitOptions,
} from '../config/security.js';

/**
 * Rate limiter global
 * Appliqué à toutes les routes API
 */
export const globalLimiter = rateLimit(globalRateLimitOptions);

/**
 * Rate limiter strict pour authentification
 * Limite drastiquement les tentatives de login/register
 */
export const authLimiter = rateLimit(authRateLimitOptions);

/**
 * Rate limiter pour création de contenu
 * Évite le spam de nouvelles citations
 */
export const createLimiter = rateLimit(createRateLimitOptions);

/**
 * Rate limiter pour opérations sensibles
 * Ex: changement de mot de passe, suppression de compte
 */
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 tentatives seulement
  message: {
    success: false,
    message: 'Opération sensible : trop de tentatives. Réessayez dans 1 heure.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
