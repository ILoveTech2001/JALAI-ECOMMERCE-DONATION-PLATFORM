import React, { useState, useEffect } from 'react';

const DebugControls = () => {
  const [debugAuth, setDebugAuth] = useState(false);
  const [authLogs, setAuthLogs] = useState([]);

  useEffect(() => {
    // Check current debug state
    setDebugAuth(localStorage.getItem('debugAuth') === 'true');
    
    // Load existing logs
    const logs = JSON.parse(sessionStorage.getItem('authLogs') || '[]');
    setAuthLogs(logs);
  }, []);

  const toggleDebugAuth = () => {
    const newState = !debugAuth;
    setDebugAuth(newState);
    
    if (newState) {
      localStorage.setItem('debugAuth', 'true');
      console.log('🔧 Auth debugging enabled. Refresh page to see detailed logs.');
    } else {
      localStorage.removeItem('debugAuth');
      console.log('🔧 Auth debugging disabled.');
    }
  };

  const clearLogs = () => {
    sessionStorage.removeItem('authLogs');
    setAuthLogs([]);
    console.clear();
    console.log('🧹 Logs cleared');
  };

  const clearConsole = () => {
    console.clear();
    console.log('🧹 Console cleared');
  };

  const refreshLogs = () => {
    const logs = JSON.parse(sessionStorage.getItem('authLogs') || '[]');
    setAuthLogs(logs);
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border p-4 max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Debug Controls</h3>
          <button
            onClick={refreshLogs}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-2 mb-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={debugAuth}
              onChange={toggleDebugAuth}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enable Auth Debug Logs</span>
          </label>
        </div>

        <div className="flex space-x-2 mb-3">
          <button
            onClick={clearLogs}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
          >
            Clear Logs
          </button>
          <button
            onClick={clearConsole}
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
          >
            Clear Console
          </button>
        </div>

        {authLogs.length > 0 && (
          <div className="border-t pt-3">
            <h4 className="text-xs font-medium text-gray-900 mb-2">Recent Auth Logs:</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {authLogs.slice(-5).map((log, index) => (
                <div key={index} className={`text-xs p-2 rounded ${getLogColor(log.level)}`}>
                  <div className="font-medium">[{log.time}] {log.message}</div>
                  {log.data && (
                    <div className="mt-1 opacity-75">
                      {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 pt-2 border-t text-xs text-gray-500">
          <div>Environment: {import.meta.env.MODE}</div>
          <div>Debug Mode: {debugAuth ? 'ON' : 'OFF'}</div>
          <div>Logs: {authLogs.length} entries</div>
        </div>
      </div>
    </div>
  );
};

export default DebugControls;
