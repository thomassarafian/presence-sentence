import express from 'express';
import { optionalAuth } from '../middlewares/auth.middleware.js';
import {
  getMeditation,
  generateMeditationForQuote,
  getLimits,
} from '../controllers/meditationController.js';

const router = express.Router();

// IMPORTANT: /user/limits must come BEFORE /:quoteId to avoid "user" being parsed as quoteId
router.get('/user/limits', optionalAuth, getLimits);

// Get existing meditation for a quote (if any)
router.get('/:quoteId', optionalAuth, getMeditation);

// Generate meditation for a quote
router.post('/:quoteId/generate', optionalAuth, generateMeditationForQuote);

export default router;
