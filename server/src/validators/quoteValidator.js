/**
 * 🔐 Validateurs de Sécurité pour Citations
 * Protection contre XSS, injection, et données invalides
 */
import { body, param, validationResult } from 'express-validator';

/**
 * Validation pour la création/modification de citation
 * Protection multi-couches :
 * 1. trim() - Enlève les espaces
 * 2. isLength() - Limite la longueur
 * 3. matches() - Vérifie les caractères autorisés
 * 4. escape() - Échappe les caractères HTML dangereux
 */
export const validateQuote = [
  body('quote')
    .trim()
    .notEmpty()
    .withMessage('La citation ne peut pas être vide')
    .isLength({ min: 10, max: 500 })
    .withMessage('La citation doit contenir entre 10 et 500 caractères')
    // Autorise uniquement : lettres, chiffres, espaces, ponctuation de base, accents
    .matches(/^[a-zA-Z0-9\s.,!?'"àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ\-\n]*$/)
    .withMessage(
      'La citation contient des caractères non autorisés. Seuls les lettres, chiffres et ponctuation basique sont acceptés.'
    )
    // Bloque les balises HTML explicitement
    .custom((value) => {
      if (/<[^>]*>/g.test(value)) {
        throw new Error('Les balises HTML ne sont pas autorisées');
      }
      return true;
    })
    .escape(), // Échappe &, <, >, ", '

  body('author')
    .trim()
    .notEmpty()
    .withMessage("L'auteur ne peut pas être vide")
    .isLength({ min: 1, max: 100 })
    .withMessage("L'auteur doit contenir entre 1 et 100 caractères")
    // Autorise lettres, espaces, tirets, points (pour "M. Dupont")
    .matches(/^[a-zA-Z\s.\-àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ]+$/)
    .withMessage(
      "L'auteur contient des caractères non autorisés. Seuls les lettres, espaces, points et tirets sont acceptés."
    )
    .escape(),

  // Middleware de vérification des erreurs
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false, // Correction de la typo "sucess"
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

/**
 * Validation pour les paramètres d'ID MongoDB
 * Vérifie que l'ID est un ObjectId valide
 */
export const validateMongoId = [
  param('id')
    .trim()
    .isMongoId()
    .withMessage('ID invalide'),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'ID de citation invalide',
      });
    }
    next();
  },
];

/**
 * Validation pour les query parameters de recherche
 * Limite ce qui peut être recherché
 */
export const validateQuoteSearch = [
  body('search')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La recherche est trop longue (max 200 caractères)')
    .matches(/^[a-zA-Z0-9\s.\-àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ]*$/)
    .withMessage('Caractères non autorisés dans la recherche')
    .escape(),

  body('author')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Le nom d'auteur est trop long")
    .matches(/^[a-zA-Z\s.\-àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ]*$/)
    .withMessage('Caractères non autorisés dans le nom d\'auteur')
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  },
];
