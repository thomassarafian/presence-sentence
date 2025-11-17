import { API_BASE_URL } from '../config/api.js';

export const createQuote = async (newQuote, newAuthor) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quotes`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ quote: newQuote, author: newAuthor }),
    });
    const data = await res.json();

    if (res.ok && data.success) {
      return {
        success: true,
        data: data.data,
        error: null,
        status: res.status,
      };
    } else {
      return {
        success: false,
        data: null,
        error: data.error || 'Erreur lors de la création de la citation',
        status: res.status,
      };
    }
  } catch (err) {
    console.error('Erreur fetching POST quote', err);
    return {
      success: false,
      data: null,
      error: 'Erreur de connexion. Vérifiez votre connexion internet',
      status: null,
    };
  }
};

export const getQuote = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quotes`);
    const data = await res.json();

    if (res.ok && data.success) {
      return {
        success: true,
        data: data.data,
        error: null,
        status: res.status,
      };
    } else {
      return {
        success: false,
        data: null,
        error: data.error || 'Erreur lors de la récupération de la citation',
        status: res.status,
      };
    }
  } catch (err) {
    console.error('Error fetching quote:', err);
    return {
      success: false,
      data: null,
      error: 'Erreur de connexion. Vérifiez votre connexion internet.',
      status: null,
    };
  }
};
