import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [userState, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function for persistent logging
  const persistentLog = useCallback((message, data = null) => {
    const logEntry = `[${new Date().toLocaleTimeString()}] ${message}`;
    console.log(logEntry, data);

    // Store in sessionStorage for debugging
    const logs = JSON.parse(sessionStorage.getItem('authLogs') || '[]');
    logs.push({ time: new Date().toLocaleTimeString(), message, data });
    sessionStorage.setItem('authLogs', JSON.stringify(logs.slice(-20))); // Keep last 20 logs
  }, []);

  // Wrapper for setUser with logging
  const setUser = useCallback((newUser) => {
    const fromUser = userState;
    const toUser = newUser;

    // Special alert for when user goes from authenticated to null
    if (fromUser && !toUser) {
      persistentLog('🚨 USER CLEARED - Authentication lost!', {
        from: `${fromUser.userType} (${fromUser.name})`,
        to: 'null',
        fromActive: fromUser.isActive,
        stackTrace: new Error().stack.split('\n').slice(1, 6).join('\n'),
        localStorage: {
          hasToken: !!localStorage.getItem('accessToken'),
          hasUserData: !!localStorage.getItem('userData')
        }
      });
    } else {
      persistentLog('setUser called', {
        from: fromUser ? `${fromUser.userType} (${fromUser.name})` : 'null',
        to: toUser ? `${toUser.userType} (${toUser.name})` : 'null',
        fromActive: fromUser ? fromUser.isActive : 'N/A',
        toActive: toUser ? toUser.isActive : 'N/A'
      });
    }

    setUserState(newUser);
  }, [userState, persistentLog]);

  const user = userState;

  // Removed custom localStorage logging overrides to prevent log spam

  useEffect(() => {
    const initializeAuth = () => {
      try {
        persistentLog('Initializing auth - checking localStorage');
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('userData');

        persistentLog('localStorage check', {
          hasToken: !!token,
          hasUserData: !!userData,
          tokenLength: token ? token.length : 0
        });

        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            persistentLog('Restoring user from localStorage', parsedUser);
            setUser(parsedUser);
            apiService.setToken(token);
          } catch (parseError) {
            persistentLog('Error parsing userData - clearing corrupted data', parseError);
            localStorage.removeItem('userData');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        } else {
          persistentLog('No valid token/userData found in localStorage');
        }
      } catch (error) {
        persistentLog('Error initializing auth', error);
        console.error('Error initializing auth:', error);
        // Only clear if it's a serious error, not just parsing issues
        if (error.name !== 'SyntaxError') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userData');
          localStorage.removeItem('refreshToken');
        }
      } finally {
        persistentLog('Auth initialization completed', { loading: false });
        setLoading(false);
      }
    };

    initializeAuth();

    // Monitor authentication state every 2 seconds for debugging
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('accessToken');
      const currentUserData = localStorage.getItem('userData');

      if (user && (!currentToken || !currentUserData)) {
        persistentLog('🚨 AUTHENTICATION STATE MISMATCH DETECTED', {
          userInContext: user ? `${user.userType} (${user.name})` : 'null',
          hasTokenInStorage: !!currentToken,
          hasUserDataInStorage: !!currentUserData,
          timestamp: new Date().toISOString()
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [user, persistentLog, setUser]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      persistentLog('Login attempt started', { email });

      const response = await apiService.login(email, password);
      persistentLog('Login response received', {
        hasResponse: !!response,
        responseType: typeof response,
        responseKeys: response ? Object.keys(response) : null
      });

      // Handle different possible response structures
      if (!response) {
        persistentLog('ERROR: No response received from server');
        throw new Error('No response received from server');
      }

      // Check if response has user data
      if (response.user) {
        persistentLog('User data found in response.user', response.user);

        // Validate user data before storing
        if (response.user.email && response.user.userType) {
          persistentLog('Setting user in context...', response.user);
          setUser(response.user);
          const userDataString = JSON.stringify(response.user);
          localStorage.setItem('userData', userDataString);
          persistentLog('User set in context and localStorage', {
            userType: response.user.userType,
            email: response.user.email,
            dataLength: userDataString.length,
            userSetInContext: true
          });
        } else {
          persistentLog('ERROR: Invalid user data structure', response.user);
          throw new Error('Invalid user data received from server');
        }

        // Verify localStorage was actually set
        setTimeout(() => {
          const storedData = localStorage.getItem('userData');
          const storedToken = localStorage.getItem('accessToken');
          persistentLog('Verification check after 1 second', {
            hasStoredData: !!storedData,
            hasStoredToken: !!storedToken,
            storedUserType: storedData ? JSON.parse(storedData).userType : null
          });
        }, 1000);

        return response;
      }

      // Check if response itself is the user data (alternative structure)
      if (response.id && response.email) {
        persistentLog('Response appears to be user data directly', response);
        setUser(response);
        localStorage.setItem('userData', JSON.stringify(response));
        persistentLog('User set in context and localStorage (direct)');
        return { user: response };
      }

      // If we get here, the response structure is unexpected
      persistentLog('ERROR: Unexpected response structure', response);
      throw new Error(`Login failed: Unexpected response format. Received: ${JSON.stringify(response)}`);

    } catch (error) {
      persistentLog('Login error occurred', {
        message: error.message,
        name: error.name
      });
      const errorMessage = error.message || 'Login failed due to unknown error';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      persistentLog('Login attempt finished', { loading: false });
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
      persistentLog('🚨 LOGOUT CALLED - starting logout process', {
        currentUser: user ? `${user.userType} (${user.name})` : 'null',
        stackTrace: new Error().stack.split('\n').slice(1, 6).join('\n')
      });
      setLoading(true);
      await apiService.logout();
    } catch (error) {
      persistentLog('Logout error occurred', error);
      console.error('Logout error:', error);
    } finally {
      persistentLog('Logout completed - clearing user state');
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
    const result = user?.userType === 'ORPHANAGE';
    persistentLog('isOrphanage check', {
      hasUser: !!user,
      userType: user?.userType,
      result: result
    });
    return result;
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
