import { API_BASE_URL } from '../config/api.js';

export const createQuote = async (newQuote) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quotes`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      method: 'POST',
      body: JSON.stringify({ quote: newQuote }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        data: data.data,
        message: data.data.message,
        error: null,
        errors: null,
        status: res.status,
      };
    } else {
      return {
        success: false,
        data: null,
        error: data.error || 'Erreur lors de la création de la citation',
        errors: data.errors || null,
        status: res.status,
      };
    }
  } catch (err) {
    console.error('Erreur fetching POST quote', err);
    return {
      success: false,
      data: null,
      error: 'Erreur de connexion. Vérifiez votre connexion internet',
      errors: null,
      status: null,
    };
  }
};

export const getQuote = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quotes/random`);
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

export const getUserQuotes = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quotes/my-quotes`, {
      credentials: 'include',
    });
    const data = await res.json();

    if (res.ok && data.success) {
      return {
        success: true,
        data: data.data,
        error: null,
      };
    }

    return {
      success: false,
      data: null,
      error: data.error || 'Erreur lors de la récupération des citations',
    };
  } catch (error) {
    console.error('Get user quotes failed:', error);
    return {
      success: false,
      data: null,
      error: 'Erreur de connexion',
    };
  }
};

export const updateQuote = async (id, quoteData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quotes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(quoteData),
    });
    const data = await res.json();

    if (res.ok && data.success) {
      return {
        success: true,
        data: data.data,
        error: null,
      };
    }

    return {
      success: false,
      data: null,
      error: data.error || 'Erreur lors de la mise à jour',
      errors: data.errors || null,
    };
  } catch (error) {
    console.error('Update quote failed:', error);
    return {
      success: false,
      data: null,
      error: 'Erreur de connexion',
    };
  }
};

export const deleteQuote = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quotes/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json();

    if (res.ok && data.success) {
      return {
        success: true,
        data: data.data,
        error: null,
      };
    }

    return {
      success: false,
      data: null,
      error: data.error || 'Erreur lors de la suppression',
    };
  } catch (error) {
    console.error('Delete quote failed:', error);
    return {
      success: false,
      data: null,
      error: 'Erreur de connexion',
    };
  }
};

export const getQuotesByAuthor = async (pseudo) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/quotes/author/${encodeURIComponent(pseudo)}`
    );
    const data = await res.json();

    if (res.ok && data.success) {
      return {
        success: true,
        data: data.data,
        error: null,
      };
    }

    return {
      success: false,
      data: null,
      error: data.error || 'Auteur non trouvé',
    };
  } catch (error) {
    console.error('Get author quotes failed:', error);
    return {
      success: false,
      data: null,
      error: 'Erreur de connexion',
    };
  }
};
