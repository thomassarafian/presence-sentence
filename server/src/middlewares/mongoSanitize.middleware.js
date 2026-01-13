/**
 * Middleware de protection contre les injections NoSQL
 * Supprime les opérateurs MongoDB ($gt, $ne, etc.) et les points dans les clés
 */
const mongoSanitize = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => sanitize(item));
    }

    const sanitized = {};

    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        console.warn(`🛡️  Injection NoSQL bloquée - clé: "${key}"`);
        continue; // On ignore cette clé
      }

      sanitized[key] =
        typeof value === 'object' && value !== null ? sanitize(value) : value;
    }

    return sanitized;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    const sanitizedQuery = sanitize(req.query);
    for (const key of Object.keys(req.query)) {
      delete req.query[key];
    }
    Object.assign(req.query, sanitizedQuery);
  }

  if (req.params && typeof req.params === 'object') {
    const sanitizedParams = sanitize(req.params);
    for (const key of Object.keys(req.params)) {
      delete req.params[key];
    }
    Object.assign(req.params, sanitizedParams);
  }

  next();
};

export default mongoSanitize;
