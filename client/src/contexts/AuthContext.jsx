import { createContext, useState, useContext, useEffect } from 'react';
import {
  getCurrentUser,
  login as loginService,
  register as registerService,
  logout as logoutService,
} from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const result = await getCurrentUser();

      if (result.success && result.data.user) {
        setUser(result.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const result = await loginService(credentials);

      if (result.success) {
        setUser(result.data.user);
        setIsAuthenticated(true);
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
