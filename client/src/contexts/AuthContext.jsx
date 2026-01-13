import { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import {
  getCurrentUser,
  login as loginService,
  register as registerService,
  logout as logoutService,
  refreshToken as refreshTokenService,
} from '../services/authService';

const AuthContext = createContext(null);

// Refresh token 1 minute before expiry (access token = 15 min)
const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshIntervalRef = useRef(null);

  const clearRefreshInterval = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  const startRefreshInterval = useCallback(() => {
    clearRefreshInterval();
    refreshIntervalRef.current = setInterval(async () => {
      const result = await refreshTokenService();
      if (!result.success) {
        // Refresh failed, logout user
        setUser(null);
        setIsAuthenticated(false);
        clearRefreshInterval();
      }
    }, REFRESH_INTERVAL);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getCurrentUser();

      if (result.success && result.data.user) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        startRefreshInterval();
      } else {
        setUser(null);
        setIsAuthenticated(false);
        clearRefreshInterval();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      clearRefreshInterval();
    } finally {
      setLoading(false);
    }
  }, [startRefreshInterval]);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
    return () => clearRefreshInterval();
  }, [checkAuth]);

  const login = async (credentials) => {
    try {
      const result = await loginService(credentials);

      if (result.success) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        startRefreshInterval();
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  const register = async (userData) => {
    try {
      const result = await registerService(userData);

      if (result.success) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        startRefreshInterval();
        return { success: true, message: result.data.message };
      }

      return { success: false, error: result.error, errors: result.errors };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: "Erreur d'inscription" };
    }
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      clearRefreshInterval();
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
