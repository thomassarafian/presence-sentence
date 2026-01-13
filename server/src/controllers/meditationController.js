import Meditation from '../models/Meditation.js';
import MeditationLimit from '../models/MeditationLimit.js';
import Quote from '../models/Quote.js';
import { generateMeditation } from '../services/ai.service.js';

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const getClientIp = (req) => {
  return req.ip || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
};

const checkAndUpdateLimit = async (req) => {
  const today = getTodayDate();
  const userId = req.user?.userId;
  const isAuthenticated = !!userId;

  const identifier = isAuthenticated ? userId.toString() : getClientIp(req);
  const type = isAuthenticated ? 'user' : 'ip';
  const maxLimit = isAuthenticated ? 3 : 1;

  let limitRecord = await MeditationLimit.findOne({
    identifier,
    type,
    date: today,
  });

  if (!limitRecord) {
    limitRecord = new MeditationLimit({
      identifier,
      type,
      date: today,
      count: 0,
    });
  }

  const remaining = maxLimit - limitRecord.count;

  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      limit: maxLimit,
      message: isAuthenticated
        ? 'Vous avez atteint la limite de 3 méditations par jour'
        : "Limite atteinte. Connectez-vous pour générer jusqu'à 3 méditations par jour",
    };
  }

  limitRecord.count += 1;
  await limitRecord.save();

  return {
    allowed: true,
    remaining: remaining - 1,
    limit: maxLimit,
  };
};

const getRemainingGenerations = async (req) => {
  const today = getTodayDate();
  const userId = req.user?.userId;
  const isAuthenticated = !!userId;

  const identifier = isAuthenticated ? userId.toString() : getClientIp(req);
  const type = isAuthenticated ? 'user' : 'ip';
  const maxLimit = isAuthenticated ? 3 : 1;

  const limitRecord = await MeditationLimit.findOne({
    identifier,
    type,
    date: today,
  });

  const count = limitRecord?.count || 0;

  return {
    remaining: Math.max(0, maxLimit - count),
    limit: maxLimit,
    isAuthenticated,
  };
};

export const getMeditation = async (req, res) => {
  try {
    const { quoteId } = req.params;

    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Citation non trouvée',
      });
    }

    const existingMeditation = await Meditation.findOne({ quote: quoteId });

    if (existingMeditation) {
      const limits = await getRemainingGenerations(req);
      return res.json({
        success: true,
        data: {
          meditation: existingMeditation.content,
          language: existingMeditation.language,
          cached: true,
          ...limits,
        },
      });
    }

    return res.json({
      success: true,
      data: {
        meditation: null,
        cached: false,
        ...(await getRemainingGenerations(req)),
      },
    });
  } catch (error) {
    console.error('Get meditation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la méditation',
    });
  }
};

export const generateMeditationForQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;

    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Citation non trouvée',
      });
    }

    const existingMeditation = await Meditation.findOne({ quote: quoteId });
    if (existingMeditation) {
      const limits = await getRemainingGenerations(req);
      return res.json({
        success: true,
        data: {
          meditation: existingMeditation.content,
          language: existingMeditation.language,
          cached: true,
          ...limits,
        },
      });
    }

    const limitCheck = await checkAndUpdateLimit(req);
    if (!limitCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: limitCheck.message,
        data: {
          remaining: limitCheck.remaining,
          limit: limitCheck.limit,
        },
      });
    }

    const result = await generateMeditation(quote.quote, quote.author);

    const meditation = new Meditation({
      quote: quoteId,
      content: result.meditation,
      language: result.language,
    });
    await meditation.save();

    return res.json({
      success: true,
      data: {
        meditation: result.meditation,
        language: result.language,
        cached: false,
        remaining: limitCheck.remaining,
        limit: limitCheck.limit,
      },
    });
  } catch (error) {
    console.error('Generate meditation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération de la méditation',
    });
  }
};

export const getLimits = async (req, res) => {
  try {
    const limits = await getRemainingGenerations(req);
    return res.json({
      success: true,
      data: limits,
    });
  } catch (error) {
    console.error('Get limits error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des limites',
    });
  }
};
