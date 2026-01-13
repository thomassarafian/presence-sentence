/**
 * MongoDB Sanitization Middleware (Express 5 compatible)
 * Removes MongoDB operators ($gt, $ne, etc.) and dots in keys
 * to prevent NoSQL injection attacks
 */

const sanitize = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item));
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    // Block dangerous keys (MongoDB operators and dot notation)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }

    sanitized[key] =
      typeof value === 'object' && value !== null ? sanitize(value) : value;
  }

  return sanitized;
};

const sanitizeInPlace = (target) => {
  if (!target || typeof target !== 'object') return;

  const sanitized = sanitize(target);

  // Clear existing keys
  for (const key of Object.keys(target)) {
    delete target[key];
  }

  // Copy sanitized values back
  Object.assign(target, sanitized);
};

const mongoSanitize = (req, res, next) => {
  // Sanitize body (can be reassigned)
  if (req.body) {
    req.body = sanitize(req.body);
  }

  // req.query and req.params are getters in Express 5
  // Must modify in place instead of reassigning
  if (req.query && typeof req.query === 'object') {
    sanitizeInPlace(req.query);
  }

  if (req.params && typeof req.params === 'object') {
    sanitizeInPlace(req.params);
  }

  next();
};

export default mongoSanitize;
