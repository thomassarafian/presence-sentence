import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import mongoSanitize from './middlewares/mongoSanitize.middleware.js';
import quoteRoutes from './routes/quoteRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? ['https://citation-presence.com', 'https://www.citation-presence.com']
      : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionsSuccessStatus: 200,
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Trop de requêtes, réessayez dans 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors(corsOptions));
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", 'api.citation-presence.com'],
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(mongoSanitize);

app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quotes', quoteRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Une erreur est survenue'
      : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

export default app;
