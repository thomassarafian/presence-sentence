import { body, validationResult } from 'express-validator';

// Password strength regex: min 8 chars, 1 uppercase, 1 lowercase, 1 number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const validateRegister = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage("L'email est requis")
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("L'email est trop long"),

  body('pseudo')
    .trim()
    .notEmpty()
    .withMessage('Le pseudo est requis')
    .isLength({ min: 3, max: 20 })
    .withMessage('Le pseudo doit contenir entre 3 et 20 caractères')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      'Le pseudo ne peut contenir que des lettres, chiffres, tirets et underscores'
    )
    .escape(),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Le mot de passe est requis')
    .isLength({ min: 8, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
    .matches(PASSWORD_REGEX)
    .withMessage(
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),

  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('La confirmation du mot de passe est requise')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Les mots de passe ne correspondent pas'),

  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage("L'email est requis")
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),

  body('password').trim().notEmpty().withMessage('Le mot de passe est requis'),

  handleValidationErrors,
];

// Middleware to handle validation errors
function handleValidationErrors(req, res, next) {
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
}
