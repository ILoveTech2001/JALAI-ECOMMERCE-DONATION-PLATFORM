import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          apiService.setToken(token);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.login(email, password);
      
      if (response.user) {
        setUser(response.user);
        return response;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData, userType = 'client') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.register(userData, userType);
      
      if (response.user) {
        setUser(response.user);
        return response;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
  };

  const clearError = () => {
    setError(null);
  };

  const isAdmin = () => {
    return user?.userType === 'ADMIN';
  };

  const isClient = () => {
    return user?.userType === 'CLIENT';
  };

  const isOrphanage = () => {
    return user?.userType === 'ORPHANAGE';
  };

  const value = {
    user,
    login,
    logout,
    register,
    updateUser,
    loading,
    error,
    clearError,
    isAuthenticated: !!user,
    isAdmin,
    isClient,
    isOrphanage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
