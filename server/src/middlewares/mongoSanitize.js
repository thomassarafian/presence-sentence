/**
 * Middleware de protection contre les injections NoSQL
 * Supprime les opérateurs MongoDB ($gt, $ne, etc.) et les points dans les clés
 */
const mongoSanitize = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    // Gérer les arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => sanitize(item));
    }

    // Gérer les objets
    const sanitized = {};

    for (const [key, value] of Object.entries(obj)) {
      // Bloquer les clés dangereuses
      if (key.startsWith('$') || key.includes('.')) {
        console.warn(`🛡️  Injection NoSQL bloquée - clé: "${key}"`);
        continue; // On ignore cette clé
      }

      // Nettoyer récursivement la valeur
      sanitized[key] =
        typeof value === 'object' && value !== null ? sanitize(value) : value;
    }

    return sanitized;
  };

  // Nettoyer body, query et params
  if (req.body) {
    sanitize(req.body);
  }

  if (req.query) {
    sanitize(req.query);
  }

  if (req.params) {
    sanitize(req.params);
  }

  next();
};

export default mongoSanitize;
