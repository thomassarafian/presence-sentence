import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from './middlewares/mongoSanitize.middleware.js';
import quoteRoutes from './routes/quoteRoutes.js';
import { connect } from 'http2';

const app = express();

const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? ['https://citation-presence.com', 'https://www.citation-presence.com']
      : ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes, réessayez dans 15 minutes',
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

app.use(mongoSanitize);

app.use('/api/', limiter);

app.use('/api/quotes', quoteRoutes);

export default app;
