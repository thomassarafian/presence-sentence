import express from 'express';
import {
  getRandomQuote,
  getQuotesByAuthor,
  createQuote,
  getUserQuotes,
  updateQuote,
  deleteQuote,
} from '../controllers/quoteController.js';
import { validateQuote } from '../validators/quoteValidator.js';
import { verifyAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/random', getRandomQuote);
router.get('/author/:pseudo', getQuotesByAuthor);

// Protected routes (require authentication)
router.post('/', verifyAuth, validateQuote, createQuote);
router.get('/my-quotes', verifyAuth, getUserQuotes);
router.put('/:id', verifyAuth, validateQuote, updateQuote);
router.delete('/:id', verifyAuth, deleteQuote);

export default router;
