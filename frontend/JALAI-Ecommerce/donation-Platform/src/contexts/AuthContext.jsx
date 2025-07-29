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
  const [userState, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wrapper for setUser with logging
  const setUser = (newUser) => {
    const fromUser = userState;
    const toUser = newUser;

    // Only log in debug mode
    if (localStorage.getItem('debugAuth') === 'true') {
      console.log('🔄 AuthContext: setUser called', {
        from: fromUser ? `${fromUser.userType} (${fromUser.name})` : 'null',
        to: toUser ? `${toUser.userType} (${toUser.name})` : 'null',
        timestamp: new Date().toISOString()
      });
    }

    // Special alert for when user goes from authenticated to null
    if (fromUser && !toUser) {
      console.error('🚨 AuthContext: USER CLEARED - Authentication lost!', {
        from: `${fromUser.userType} (${fromUser.name})`,
        to: 'null',
        fromActive: fromUser.isActive,
        localStorage: {
          hasToken: !!localStorage.getItem('accessToken'),
          hasUserData: !!localStorage.getItem('userData')
        },
        stackTrace: new Error().stack
      });
      persistentLog('🚨 USER CLEARED - Authentication lost!', {
        from: `${fromUser.userType} (${fromUser.name})`,
        to: 'null',
        fromActive: fromUser.isActive,
        localStorage: {
          hasToken: !!localStorage.getItem('accessToken'),
          hasUserData: !!localStorage.getItem('userData')
        }
      }, 'error');
    } else if (localStorage.getItem('debugAuth') === 'true') {
      persistentLog('setUser called', {
        from: fromUser ? `${fromUser.userType} (${fromUser.name})` : 'null',
        to: toUser ? `${toUser.userType} (${toUser.name})` : 'null',
        fromActive: fromUser ? fromUser.isActive : 'N/A',
        toActive: toUser ? toUser.isActive : 'N/A'
      });
    }

    setUserState(newUser);
  };

  const user = userState;

  // Helper function for controlled logging (only in development)
  const persistentLog = (message, data = null, level = 'info') => {
    // Only log in development mode or when explicitly enabled
    const isDev = import.meta.env.DEV;
    const debugAuth = localStorage.getItem('debugAuth') === 'true';

    if (!isDev && !debugAuth) return;

    const logEntry = `[AUTH ${new Date().toLocaleTimeString()}] ${message}`;

    // Use appropriate console method based on level
    switch (level) {
      case 'error':
        console.error(logEntry, data);
        break;
      case 'warn':
        console.warn(logEntry, data);
        break;
      default:
        console.log(logEntry, data);
    }

    // Store in sessionStorage for debugging (only keep last 10 entries)
    if (debugAuth) {
      const logs = JSON.parse(sessionStorage.getItem('authLogs') || '[]');
      logs.push({ time: new Date().toLocaleTimeString(), message, data, level });
      sessionStorage.setItem('authLogs', JSON.stringify(logs.slice(-10)));
    }
  };

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
            // Only log in debug mode
            if (localStorage.getItem('debugAuth') === 'true') {
              console.log('🔄 AuthContext: Restoring user from localStorage:', {
                userType: parsedUser.userType,
                name: parsedUser.name,
                email: parsedUser.email
              });
            }
            persistentLog('Restoring user from localStorage', parsedUser);
            setUser(parsedUser);
            apiService.setToken(token);
          } catch (parseError) {
            console.error('❌ AuthContext: Error parsing userData:', parseError);
            persistentLog('Error parsing userData - clearing corrupted data', parseError);
            localStorage.removeItem('userData');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        } else {
          console.log('⚠️ AuthContext: No valid token/userData found in localStorage');
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
        console.log('🏁 AuthContext: Auth initialization completed');
        persistentLog('Auth initialization completed', { loading: false });
        setLoading(false);
      }
    };

    console.log('🚀 AuthContext: Starting initialization...');
    initializeAuth();

    // Only monitor authentication state in debug mode
    const debugAuth = localStorage.getItem('debugAuth') === 'true';
    if (debugAuth) {
      const interval = setInterval(() => {
        const currentToken = localStorage.getItem('accessToken');
        const currentUserData = localStorage.getItem('userData');

        if (user && (!currentToken || !currentUserData)) {
          persistentLog('🚨 AUTHENTICATION STATE MISMATCH DETECTED', {
            userInContext: user ? `${user.userType} (${user.name})` : 'null',
            hasTokenInStorage: !!currentToken,
            hasUserDataInStorage: !!currentUserData,
            timestamp: new Date().toISOString()
          }, 'warn');
        }
      }, 10000); // Reduced frequency to 10 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      persistentLog('Login attempt started', { email });

      const response = await apiService.login(email, password);

      // Only log in debug mode
      if (localStorage.getItem('debugAuth') === 'true') {
        console.log('🔧 AuthContext: Raw login response:', response);
        console.log('🔧 AuthContext: Response type:', typeof response);
        console.log('🔧 AuthContext: Response keys:', response ? Object.keys(response) : null);
      }

      if (localStorage.getItem('debugAuth') === 'true') {
        persistentLog('Login response received', {
          hasResponse: !!response,
          responseType: typeof response,
          responseKeys: response ? Object.keys(response) : null
        });
      }

      // Handle different possible response structures
      if (!response) {
        console.error('❌ AuthContext: No response received from server');
        persistentLog('ERROR: No response received from server');
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      }

      // Check if response has user data
      if (response.user) {
        persistentLog('User data found in response.user', response.user);

        // Validate user data before storing
        if (response.user.email && response.user.userType) {
          console.log('🔄 AuthContext: Setting user data after login:', {
            userType: response.user.userType,
            name: response.user.name,
            email: response.user.email
          });
          setUser(response.user);
          const userDataString = JSON.stringify(response.user);
          localStorage.setItem('userData', userDataString);
          console.log('✅ AuthContext: User data stored in localStorage');
          persistentLog('User set in context and localStorage', {
            userType: response.user.userType,
            email: response.user.email,
            dataLength: userDataString.length
          });
        } else {
          console.error('❌ AuthContext: Invalid user data structure:', response.user);
          persistentLog('ERROR: Invalid user data structure', response.user);
          throw new Error('Invalid user data received from server');
        }

        // Verify localStorage was actually set
        setTimeout(() => {
          const storedData = localStorage.getItem('userData');
          const storedToken = localStorage.getItem('accessToken');
          console.log('🔍 AuthContext: Verification check after 1 second:', {
            hasStoredData: !!storedData,
            hasStoredToken: !!storedToken,
            storedUserType: storedData ? JSON.parse(storedData).userType : null,
            currentUserInContext: userState
          });
          persistentLog('Verification check after 1 second', {
            hasStoredData: !!storedData,
            hasStoredToken: !!storedToken,
            storedUserType: storedData ? JSON.parse(storedData).userType : null
          });
        }, 1000);

        console.log('✅ AuthContext: Login successful, returning response');
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
        name: error.name,
        status: error.response?.status
      });

      let errorMessage = 'Login failed due to unknown error';

      // Handle different types of errors with user-friendly messages
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 401:
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            break;
          case 403:
            errorMessage = 'Your account has been disabled. Please contact support.';
            break;
          case 404:
            errorMessage = 'Account not found. Please check your email or register for a new account.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later or contact support.';
            break;
          default:
            errorMessage = data?.message || `Login failed (Error ${status}). Please try again.`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
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

      let errorMessage = 'Registration failed due to unknown error';

      // Handle different types of errors with user-friendly messages
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 400:
            if (data?.message?.includes('email')) {
              errorMessage = 'This email is already registered. Please use a different email or try logging in.';
            } else if (data?.message?.includes('phone')) {
              errorMessage = 'Invalid phone number format. Please use format: +237 XXX XXX XXX';
            } else if (data?.message?.includes('validation')) {
              errorMessage = 'Please check your information and ensure all fields are filled correctly.';
            } else {
              errorMessage = data?.message || 'Invalid registration data. Please check your information.';
            }
            break;
          case 409:
            errorMessage = 'An account with this email already exists. Please try logging in instead.';
            break;
          case 500:
            errorMessage = 'Server error during registration. Please try again later.';
            break;
          default:
            errorMessage = data?.message || `Registration failed (Error ${status}). Please try again.`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      persistentLog('Logout initiated', {
        currentUser: user ? `${user.userType} (${user.name})` : 'null'
      });
      setLoading(true);
      await apiService.logout();
    } catch (error) {
      persistentLog('Logout error occurred', error, 'error');
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
