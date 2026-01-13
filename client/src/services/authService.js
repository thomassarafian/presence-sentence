import { API_BASE_URL } from '../config/api.js';

/**
 * Register new user
 */
export const register = async ({
  email,
  pseudo,
  password,
  confirmPassword,
}) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Send cookies
      body: JSON.stringify({ email, pseudo, password, confirmPassword }),
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
      error: data.error || "Erreur lors de l'inscription",
      errors: data.errors || null,
    };
  } catch (error) {
    console.error('Register request failed:', error);
    return {
      success: false,
      data: null,
      error: 'Erreur de connexion',
      errors: null,
    };
  }
};

/**
 * Login user
 */
export const login = async ({ email, password }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
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
      error: data.error || 'Erreur lors de la connexion',
    };
  } catch (error) {
    console.error('Login request failed:', error);
    return {
      success: false,
      data: null,
      error: 'Erreur de connexion',
    };
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await res.json();
    return {
      success: res.ok && data.success,
      data: data.data || null,
    };
  } catch (error) {
    console.error('Logout request failed:', error);
    return {
      success: false,
      data: null,
    };
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
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
      error: data.error,
    };
  } catch (error) {
    console.error('Get current user failed:', error);
    return {
      success: false,
      data: null,
      error: 'Erreur de connexion',
    };
  }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (token) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/verify-email/${token}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await res.json();

    if (res.ok && data.success) {
      return {
        success: true,
        data: data.data,
        message: data.data.message,
      };
    }

    return {
      success: false,
      data: null,
      error: data.error || 'Token invalide',
    };
  } catch (error) {
    console.error('Email verification failed:', error);
    return {
      success: false,
      data: null,
      error: 'Erreur de connexion',
    };
  }
};
