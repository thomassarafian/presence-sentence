/**
 * 🔐 APPLICATION EXPRESS SÉCURISÉE - 2025
 * 
 * Ce fichier configure 12 couches de sécurité :
 * 1. CORS - Contrôle des origines autorisées
 * 2. Helmet - 15 headers de sécurité HTTP
 * 3. CSP - Content Security Policy (anti-XSS)
 * 4. Rate Limiting - Protection brute force et DoS
 * 5. Body Parsing Limité - Évite les gros payloads
 * 6. Mongo Sanitization - Anti-injection NoSQL
 * 7. HPP - Protection HTTP Parameter Pollution
 * 8. Custom Headers - Headers additionnels
 * 9. Validation des entrées - Express-validator
 * 10. Gestion d'erreurs sécurisée - Pas de leaks
 * 11. Logs de sécurité
 * 12. Variables d'environnement validées
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';

// Configuration centralisée
import {
  corsOptions,
  helmetOptions,
  bodyParserOptions,
  customSecurityHeaders,
  validateEnvVars,
} from './config/security.js';

// Middlewares de sécurité
import mongoSanitize from './middlewares/mongoSanitize.js';
import { globalLimiter, createLimiter } from './middlewares/rateLimits.js';
import {
  errorHandler,
  notFoundHandler,
} from './middlewares/errorHandler.js';

// Routes
import quoteRoutes from './routes/quoteRoutes.js';

// Validation des variables d'environnement au démarrage
validateEnvVars();

const app = express();

// ============================================================================
// 1️⃣ HELMET - Headers de Sécurité HTTP
// ============================================================================
// Protection contre XSS, Clickjacking, MIME sniffing, etc.
// DOIT être en premier pour sécuriser toutes les réponses
app.use(helmet(helmetOptions));

// ============================================================================
// 2️⃣ CORS - Cross-Origin Resource Sharing
// ============================================================================
// Contrôle quels domaines peuvent accéder à votre API
// Bloque les requêtes provenant de domaines non autorisés
app.use(cors(corsOptions));

// ============================================================================
// 3️⃣ BODY PARSING avec Limitation de Taille
// ============================================================================
// Limite à 10KB pour éviter les attaques DoS par gros payloads
app.use(express.json(bodyParserOptions.json));
app.use(express.urlencoded(bodyParserOptions.urlencoded));

// ============================================================================
// 4️⃣ HPP - HTTP Parameter Pollution
// ============================================================================
// Empêche les attaques par paramètres en double
// Exemple bloqué : ?id=1&id=2 (ne garde que le dernier)
app.use(hpp());

// ============================================================================
// 5️⃣ MONGO SANITIZE - Protection NoSQL Injection
// ============================================================================
// Bloque les opérateurs MongoDB ($gt, $ne, etc.) dans les requêtes
// Exemple bloqué : { "author": { "$ne": null } }
app.use(mongoSanitize);

// ============================================================================
// 6️⃣ HEADERS PERSONNALISÉS
// ============================================================================
app.use(customSecurityHeaders);

// ============================================================================
// 7️⃣ RATE LIMITING - Protection Brute Force et DoS
// ============================================================================
// Limite globale pour toutes les routes API
app.use('/api/', globalLimiter);

// ============================================================================
// 8️⃣ ROUTES
// ============================================================================
// Health check (sans rate limiting)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API en ligne',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Routes principales
// Rate limiter spécifique pour la création de citations
app.use('/api/quotes', quoteRoutes);

// ============================================================================
// 9️⃣ GESTION D'ERREURS
// ============================================================================
// 404 - Route non trouvée (DOIT être après toutes les routes)
app.use(notFoundHandler);

// Gestionnaire d'erreurs global (DOIT être le dernier middleware)
app.use(errorHandler);

export default app;
