import Quote from '../models/Quote.js';

// Controller
// Découpé avec Service (call repo, API externe) et Repository (Call en DB) pour Architecture Clean

export const getRandomQuote = async (req, res) => {
  try {
    const randomQuote = await Quote.aggregate([{ $sample: { size: 1 } }]);
    res.status(200).json({
      success: true,
      data: randomQuote,
      error: null,
    });
  } catch (error) {
    console.error('Error fetching random quote: ', error.message);

    res.status(500).json({
      success: false,
      data: null,
      error: 'Failed to fetch random quote',
    });
  }
};

export const createQuote = async (req, res) => {
  try {
    const newQuote = await Quote.create({
      quote: req.body.quote,
      author: req.body.author,
    });

    res.status(201).json({
      success: true,
      data: newQuote,
      error: null,
    });
  } catch (error) {
    console.error('Error creating a new quote: ', error.message);
    res.status(500).json({
      success: false,
      data: null,
      error: 'Fail to create a new quote',
    });
  }
};
