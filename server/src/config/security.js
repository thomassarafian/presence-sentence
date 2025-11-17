/**
 * 🔐 Configuration Centralisée de Sécurité - 2025
 * Toutes les configurations de sécurité en un seul endroit
 */

/**
 * Configuration CORS
 * Contrôle qui peut accéder à votre API
 */
export const corsOptions = {
  // Origines autorisées (JAMAIS '*' en production !)
  origin:
    process.env.NODE_ENV === 'production'
      ? process.env.ALLOWED_ORIGINS?.split(',') || [
          'https://citation-presence.com',
          'https://www.citation-presence.com',
        ]
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],

  // Permet l'envoi de cookies/credentials
  credentials: true,

  // Headers autorisés
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],

  // Méthodes HTTP autorisées
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],

  // Pour les vieux navigateurs
  optionsSuccessStatus: 200,

  // Expose ces headers au client
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
};

/**
 * Configuration Helmet (Sécurité Headers HTTP)
 * Protection contre XSS, Clickjacking, MIME sniffing, etc.
 */
export const helmetOptions = {
  // Content Security Policy - LA protection anti-XSS
  contentSecurityPolicy: {
    directives: {
      // Par défaut : uniquement les ressources de votre domaine
      defaultSrc: ["'self'"],

      // Scripts JavaScript
      // ⚠️ Pas de 'unsafe-inline' ni 'unsafe-eval' !
      scriptSrc: ["'self'"],

      // Styles CSS
      // 'unsafe-inline' nécessaire pour React/Vue (styles inline)
      styleSrc: ["'self'", "'unsafe-inline'"],

      // Images
      imgSrc: ["'self'", 'data:', 'https:'],

      // Polices
      fontSrc: ["'self'", 'https:', 'data:'],

      // Connexions AJAX/Fetch/WebSocket
      connectSrc:
        process.env.NODE_ENV === 'production'
          ? ["'self'", 'https://api.citation-presence.com']
          : ["'self'", 'http://localhost:4000', 'ws://localhost:4000'],

      // Frames/iframes (YouTube, etc.)
      frameSrc: ["'none'"],

      // Objets/Plugins Flash/Java
      objectSrc: ["'none'"],

      // Media (video/audio)
      mediaSrc: ["'self'"],

      // Base URI pour URLs relatives
      baseUri: ["'self'"],

      // Où les formulaires peuvent envoyer
      formAction: ["'self'"],

      // Qui peut inclure votre page en iframe
      frameAncestors: ["'none'"],

      // Force HTTPS pour toutes les ressources
      upgradeInsecureRequests: [],
    },
  },

  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Peut casser certaines ressources externes

  // Cross-Origin Opener Policy (protège contre Spectre)
  crossOriginOpenerPolicy: { policy: 'same-origin' },

  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: 'same-origin' },

  // Désactive le DNS prefetching (privacy)
  dnsPrefetchControl: { allow: false },

  // X-Frame-Options (protège contre Clickjacking)
  frameguard: { action: 'deny' },

  // Cache le header "X-Powered-By: Express"
  hidePoweredBy: true,

  // HTTP Strict Transport Security (Force HTTPS)
  hsts: {
    maxAge: 31536000, // 1 an
    includeSubDomains: true,
    preload: true, // Pour être dans la liste HSTS preload des navigateurs
  },

  // Ancienne protection IE (téléchargements)
  ieNoOpen: true,

  // X-Content-Type-Options: nosniff
  // Empêche le navigateur de "deviner" le type MIME
  noSniff: true,

  // Origin-Agent-Cluster header
  originAgentCluster: true,

  // Contrôle des politiques cross-domain (Flash, PDF)
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },

  // Referrer-Policy (ne pas divulguer l'URL complète)
  referrerPolicy: { policy: 'no-referrer' },

  // X-XSS-Protection (pour vieux navigateurs)
  xssFilter: true,
};

/**
 * Configuration Rate Limiting Global
 * Protection contre brute force et DoS
 */
export const globalRateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: {
    success: false,
    message: 'Trop de requêtes, réessayez dans 15 minutes',
  },
  standardHeaders: true, // Envoie RateLimit-* headers
  legacyHeaders: false, // Désactive X-RateLimit-* headers
  // Skip rate limiting pour certaines IPs (optionnel)
  // skip: (req) => req.ip === '127.0.0.1',
};

/**
 * Rate Limiting Strict pour Login/Register
 * Limite drastiquement les tentatives de connexion
 */
export const authRateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives seulement
  skipSuccessfulRequests: true, // Ne compte que les échecs
  message: {
    success: false,
    message:
      "Trop de tentatives de connexion. Compte temporairement bloqué pendant 15 minutes pour des raisons de sécurité.",
  },
  standardHeaders: true,
  legacyHeaders: false,
};

/**
 * Rate Limiting pour création de contenu
 * Évite le spam de création
 */
export const createRateLimitOptions = {
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // 20 créations par heure
  message: {
    success: false,
    message: 'Trop de créations, réessayez dans 1 heure',
  },
  standardHeaders: true,
  legacyHeaders: false,
};

/**
 * Configuration Express JSON/URLencoded
 * Limite la taille des payloads (protection DoS)
 */
export const bodyParserOptions = {
  json: {
    limit: '10kb', // Maximum 10KB par requête JSON
    strict: true, // N'accepte que des objets et tableaux
  },
  urlencoded: {
    extended: true,
    limit: '10kb',
    parameterLimit: 50, // Maximum 50 paramètres
  },
};

/**
 * Headers de sécurité supplémentaires personnalisés
 */
export const customSecurityHeaders = (req, res, next) => {
  // Désactive le cache pour les routes API sensibles
  if (req.path.startsWith('/api/auth')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  // Header personnalisé (optionnel)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  next();
};

/**
 * Validation des variables d'environnement requises
 * Empêche l'app de démarrer si config manquante
 */
export const validateEnvVars = () => {
  const requiredVars = {
    NODE_ENV: 'environnement (development/production)',
    MONGO_URI: 'URI de connexion MongoDB',
    PORT: 'Port du serveur',
  };

  const missingVars = [];

  for (const [varName, description] of Object.entries(requiredVars)) {
    if (!process.env[varName]) {
      missingVars.push(`${varName} (${description})`);
    }
  }

  if (missingVars.length > 0) {
    console.error('\n❌ Variables d\'environnement manquantes :\n');
    missingVars.forEach((varInfo) => console.error(`   - ${varInfo}`));
    console.error(
      '\n💡 Créez un fichier .env avec ces variables.\n'
    );
    process.exit(1);
  }

  // Avertissements
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.ALLOWED_ORIGINS) {
      console.warn(
        '⚠️  ALLOWED_ORIGINS non défini en production. Utilisation des valeurs par défaut.'
      );
    }
  }

  console.log('✅ Variables d\'environnement validées');
};
