import express from 'express';
import { getRandomQuote, createQuote } from '../controllers/quoteController.js';

import { validateQuote } from '../validators/quoteValidator.js';

const router = express.Router();

router.get('/', getRandomQuote);
router.post('/', validateQuote, createQuote);

export default router;
