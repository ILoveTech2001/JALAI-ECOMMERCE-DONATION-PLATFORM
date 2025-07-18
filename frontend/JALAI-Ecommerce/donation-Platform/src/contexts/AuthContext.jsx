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
      console.log('AuthContext login response:', response); // Debug log
      console.log('Response type:', typeof response); // Debug log
      console.log('Response keys:', response ? Object.keys(response) : 'null'); // Debug log

      // Handle different possible response structures
      if (!response) {
        throw new Error('No response received from server');
      }

      // Check if response has user data
      if (response.user) {
        console.log('User data found:', response.user); // Debug log
        setUser(response.user);
        return response;
      }

      // Check if response itself is the user data (alternative structure)
      if (response.id && response.email) {
        console.log('Response appears to be user data directly:', response); // Debug log
        setUser(response);
        return { user: response };
      }

      // If we get here, the response structure is unexpected
      console.error('Unexpected response structure:', response);
      console.error('Expected: { user: {...} } or user object directly');
      throw new Error(`Login failed: Unexpected response format. Received: ${JSON.stringify(response)}`);

    } catch (error) {
      console.error('AuthContext login error:', error);
      const errorMessage = error.message || 'Login failed due to unknown error';
      setError(errorMessage);

      // Don't auto-clear error - let it persist until user takes action
      setTimeout(() => {
        console.log('Error persisting for debugging:', errorMessage);
      }, 100);

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData, userType = 'client') => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting registration with:', { ...userData, password: '***' }); // Debug log
      const response = await apiService.register(userData, userType);
      console.log('AuthContext register response:', response); // Debug log
      console.log('Response type:', typeof response); // Debug log
      console.log('Response keys:', response ? Object.keys(response) : 'null'); // Debug log

      // Handle different possible response structures
      if (!response) {
        throw new Error('No response received from server');
      }

      // Check if response has user data
      if (response.user) {
        console.log('User data found in register response:', response.user); // Debug log
        setUser(response.user);
        return response;
      }

      // Check if response itself is the user data (alternative structure)
      if (response.id && response.email) {
        console.log('Register response appears to be user data directly:', response); // Debug log
        setUser(response);
        return { user: response };
      }

      // If we get here, the response structure is unexpected
      console.error('Unexpected register response structure:', response);
      console.error('Expected: { user: {...} } or user object directly');
      throw new Error(`Registration failed: Unexpected response format. Received: ${JSON.stringify(response)}`);

    } catch (error) {
      console.error('AuthContext register error:', error);
      const errorMessage = error.message || 'Registration failed due to unknown error';
      setError(errorMessage);

      // Don't auto-clear error - let it persist until user takes action
      setTimeout(() => {
        console.log('Registration error persisting for debugging:', errorMessage);
      }, 100);

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
    console.log('isAdmin check - user:', user);
    console.log('isAdmin check - userType:', user?.userType);
    const result = user?.userType === 'ADMIN';
    console.log('isAdmin result:', result);
    return result;
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
