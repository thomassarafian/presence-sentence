/**
 * 🛡️ Gestionnaire d'Erreurs Sécurisé
 * JAMAIS exposer les détails techniques en production !
 */

/**
 * Middleware 404 - Route non trouvée
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route non trouvée : ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

/**
 * Middleware de gestion d'erreurs global
 * DOIT être le dernier middleware !
 */
export const errorHandler = (err, req, res, next) => {
  // Log l'erreur complète en développement
  if (process.env.NODE_ENV === 'development') {
    console.error('🔥 Erreur détectée :');
    console.error(err);
  }

  // Log sécurisé en production (sans détails sensibles)
  if (process.env.NODE_ENV === 'production') {
    console.error(`[${new Date().toISOString()}] ${err.message}`);
  }

  // Statut HTTP
  const status = err.status || err.statusCode || 500;

  // Message d'erreur
  let message = err.message || 'Erreur serveur';

  // En production, ne JAMAIS exposer les détails techniques !
  if (process.env.NODE_ENV === 'production' && status === 500) {
    message = 'Une erreur est survenue. Veuillez réessayer plus tard.';
  }

  // Erreurs de validation (express-validator, mongoose)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Erreurs MongoDB
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    if (err.code === 11000) {
      // Erreur de duplicata
      return res.status(409).json({
        success: false,
        message: 'Cette ressource existe déjà',
      });
    }
  }

  // Erreurs de cast MongoDB (ID invalide)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID invalide',
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expiré',
    });
  }

  // Réponse par défaut
  res.status(status).json({
    success: false,
    message,
    // Stack trace UNIQUEMENT en développement
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Wrapper async pour éviter try/catch partout
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
