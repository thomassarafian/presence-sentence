import { body, validationResult } from 'express-validator';

export const validateQuote = [
  body('quote')
    .trim()
    .notEmpty()
    .withMessage('La citation ne peut pas être vide')
    .isLength({ min: 10, max: 500 })
    .withMessage('La citation doit contenir entre 10 et 500 caractères')
    .escape(),
  body('author')
    .trim()
    .notEmpty()
    .withMessage("L'auteur ne peut pas être vide")
    .isLength({ min: 1, max: 100 })
    .withMessage("L'auteur doit contenir entre 10 et 100 caractères")
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        sucess: false,
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
