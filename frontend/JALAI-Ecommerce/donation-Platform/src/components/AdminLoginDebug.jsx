import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminLoginDebug = () => {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [debugInfo, setDebugInfo] = useState({});
  const [testEmail, setTestEmail] = useState('admin@jalai.com');
  const [testPassword, setTestPassword] = useState('admin123');

  useEffect(() => {
    const updateDebugInfo = () => {
      const info = {
        timestamp: new Date().toLocaleTimeString(),
        authContextUser: user,
        authContextLoading: loading,
        localStorageToken: localStorage.getItem('accessToken'),
        localStorageUserData: localStorage.getItem('userData'),
        parsedUserData: null
      };

      try {
        if (info.localStorageUserData) {
          info.parsedUserData = JSON.parse(info.localStorageUserData);
        }
      } catch (e) {
        info.parseError = e.message;
      }

      setDebugInfo(info);
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, [user, loading]);

  const handleTestLogin = async () => {
    try {
      console.log('🧪 Starting test admin login...');
      const response = await login(testEmail, testPassword);
      console.log('🧪 Login response:', response);
      
      setTimeout(() => {
        console.log('🧪 Checking state after 2 seconds...');
        console.log('🧪 User in context:', user);
        console.log('🧪 LocalStorage userData:', localStorage.getItem('userData'));
        console.log('🧪 LocalStorage token:', localStorage.getItem('accessToken'));
      }, 2000);
    } catch (error) {
      console.error('🧪 Test login failed:', error);
    }
  };

  const handleNavigateToAdmin = () => {
    navigate('/admin');
  };

  const clearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Admin Login Debug Tool</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Test Credentials</h3>
          <div className="space-y-2 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2">Actions</h3>
          <div className="space-y-2">
            <button
              onClick={handleTestLogin}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Login ({testEmail})
            </button>
            <button
              onClick={handleNavigateToAdmin}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Navigate to Admin Dashboard
            </button>
            <button
              onClick={clearStorage}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Storage & Reload
            </button>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Try These Passwords:</h4>
            <div className="space-y-1">
              {['admin123', 'password123', 'admin', 'password'].map(pwd => (
                <button
                  key={pwd}
                  onClick={() => setTestPassword(pwd)}
                  className="block w-full text-left px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  {pwd}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Debug Info</h3>
          <div className="bg-gray-100 p-4 rounded text-sm">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Current Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded ${user ? 'bg-green-100' : 'bg-red-100'}`}>
            <strong>Auth Context User:</strong> {user ? '✅ Loaded' : '❌ Not Loaded'}
            {user && (
              <div className="mt-1 text-sm">
                <div>Type: {user.userType}</div>
                <div>Name: {user.name}</div>
                <div>Email: {user.email}</div>
              </div>
            )}
          </div>
          <div className={`p-3 rounded ${localStorage.getItem('accessToken') ? 'bg-green-100' : 'bg-red-100'}`}>
            <strong>LocalStorage Token:</strong> {localStorage.getItem('accessToken') ? '✅ Present' : '❌ Missing'}
            <div className="mt-1 text-sm">
              Length: {localStorage.getItem('accessToken')?.length || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginDebug;
