import express from 'express';
import { optionalAuth } from '../middlewares/auth.middleware.js';
import {
  getMeditation,
  generateMeditationForQuote,
  getLimits,
} from '../controllers/meditationController.js';

const router = express.Router();

// Get existing meditation for a quote (if any)
router.get('/:quoteId', optionalAuth, getMeditation);

// Generate meditation for a quote
router.post('/:quoteId/generate', optionalAuth, generateMeditationForQuote);

// Get current user's remaining generations
router.get('/user/limits', optionalAuth, getLimits);

export default router;
