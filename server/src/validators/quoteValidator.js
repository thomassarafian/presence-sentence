import { body, validationResult } from 'express-validator';

export const validateQuote = [
  body('quote')
    .trim()
    .notEmpty()
    .withMessage('La citation ne peut pas être vide')
    .isLength({ min: 5, max: 500 })
    .withMessage('La citation doit contenir entre 5 et 500 caractères'),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data: null,
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  },
];
