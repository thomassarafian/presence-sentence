import { API_BASE_URL } from '../config/api.js';

export const getMeditation = async (quoteId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/meditations/${quoteId}`, {
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
      error: data.error || 'Erreur lors de la récupération de la méditation',
    };
  } catch (error) {
    console.error('Get meditation failed:', error);
    return {
      success: false,
      data: null,
      error: 'Erreur de connexion',
    };
  }
};

export const generateMeditation = async (quoteId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/meditations/${quoteId}/generate`, {
      method: 'POST',
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
      data: data.data || null,
      error: data.error || 'Erreur lors de la génération de la méditation',
      status: res.status,
    };
  } catch (error) {
    console.error('Generate meditation failed:', error);
    return {
      success: false,
      data: null,
      error: 'Erreur de connexion',
    };
  }
};

export const getMeditationLimits = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/meditations/user/limits`, {
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
      error: data.error || 'Erreur',
    };
  } catch (error) {
    console.error('Get limits failed:', error);
    return {
      success: false,
      data: null,
      error: 'Erreur de connexion',
    };
  }
};
