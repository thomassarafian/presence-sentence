import Quote from '../models/Quote.js';
import User from '../models/User.js';

/**
 * Get public quotes by author pseudo
 * GET /api/quotes/author/:pseudo
 */
export const getQuotesByAuthor = async (req, res) => {
  try {
    const { pseudo } = req.params;

    // Find user by pseudo
    const user = await User.findOne({ pseudo });

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Auteur non trouvé',
      });
    }

    // Get only public quotes from this author
    const quotes = await Quote.find({
      createdBy: user._id,
      isPublic: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        author: {
          pseudo: user.pseudo,
          createdAt: user.createdAt,
        },
        quotes,
        count: quotes.length,
      },
      error: null,
    });
  } catch (error) {
    console.error('Error fetching author quotes:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: 'Erreur lors de la récupération des citations',
    });
  }
};

/**
 * Get random public quote (only from verified users)
 * GET /api/quotes/random
 */
export const getRandomQuote = async (req, res) => {
  try {
    // Get public quotes (from verified users) OR old quotes without createdBy (legacy)
    const randomQuote = await Quote.aggregate([
      {
        $match: {
          $or: [
            { isPublic: true },
            { createdBy: { $exists: false } }, // Legacy quotes without auth
          ],
        },
      },
      { $sample: { size: 1 } },
    ]);

    if (randomQuote.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Aucune citation publique disponible',
      });
    }

    res.status(200).json({
      success: true,
      data: randomQuote[0],
      error: null,
    });
  } catch (error) {
    console.error('Error fetching random quote:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: 'Erreur lors de la récupération de la citation',
    });
  }
};

/**
 * Create new quote (requires authentication)
 * POST /api/quotes
 */
export const createQuote = async (req, res) => {
  try {
    const { quote } = req.body;
    const userId = req.user.userId;

    // Get user to check email verification status
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Utilisateur non trouvé',
      });
    }

    // Create quote with user's pseudo as author
    const newQuote = await Quote.create({
      quote,
      author: user.pseudo, // Always use user's pseudo as author
      createdBy: userId,
      isPublic: user.emailVerified, // Public only if email verified
    });

    // Populate creator info
    await newQuote.populate('createdBy', 'pseudo emailVerified');

    res.status(201).json({
      success: true,
      data: {
        quote: newQuote,
        message: user.emailVerified
          ? 'Citation créée et publiée avec succès'
          : 'Citation créée. Vérifiez votre email pour la rendre publique.',
      },
      error: null,
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: 'Erreur lors de la création de la citation',
    });
  }
};

/**
 * Get all quotes for current user
 * GET /api/quotes/my-quotes
 */
export const getUserQuotes = async (req, res) => {
  try {
    const userId = req.user.userId;

    const quotes = await Quote.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'pseudo emailVerified');

    res.status(200).json({
      success: true,
      data: {
        quotes,
        count: quotes.length,
      },
      error: null,
    });
  } catch (error) {
    console.error('Error fetching user quotes:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: 'Erreur lors de la récupération de vos citations',
    });
  }
};

/**
 * Update quote (only owner)
 * PUT /api/quotes/:id
 */
export const updateQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { quote } = req.body;
    const userId = req.user.userId;

    // Find quote and verify ownership
    const existingQuote = await Quote.findById(id);

    if (!existingQuote) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Citation non trouvée',
      });
    }

    if (existingQuote.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        data: null,
        error: "Vous n'êtes pas autorisé à modifier cette citation",
      });
    }

    // Update quote (author stays the same - user's pseudo)
    existingQuote.quote = quote || existingQuote.quote;
    await existingQuote.save();

    await existingQuote.populate('createdBy', 'pseudo emailVerified');

    res.status(200).json({
      success: true,
      data: {
        quote: existingQuote,
        message: 'Citation mise à jour avec succès',
      },
      error: null,
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: 'Erreur lors de la mise à jour de la citation',
    });
  }
};

/**
 * Delete quote (only owner)
 * DELETE /api/quotes/:id
 */
export const deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Find quote and verify ownership
    const quote = await Quote.findById(id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Citation non trouvée',
      });
    }

    if (quote.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        data: null,
        error: "Vous n'êtes pas autorisé à supprimer cette citation",
      });
    }

    await Quote.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: {
        message: 'Citation supprimée avec succès',
      },
      error: null,
    });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: 'Erreur lors de la suppression de la citation',
    });
  }
};
