import React, { useState } from 'react';
import { testProductCreationWorkflow, testAPIConnectivity, testAuthentication } from '../utils/testProductCreation';

const ProductCreationTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result) => {
    setTestResults(prev => [...prev, { ...result, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runConnectivityTest = async () => {
    setIsRunning(true);
    const result = await testAPIConnectivity();
    addResult({ test: 'API Connectivity', ...result });
    setIsRunning(false);
  };

  const runProductCreationTest = async () => {
    setIsRunning(true);
    const result = await testProductCreationWorkflow();
    addResult({ test: 'Product Creation Workflow', ...result });
    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();
    
    // Test 1: API Connectivity
    const connectivityResult = await testAPIConnectivity();
    addResult({ test: 'API Connectivity', ...connectivityResult });
    
    if (connectivityResult.success) {
      // Test 2: Product Creation (only if connectivity works)
      const productResult = await testProductCreationWorkflow();
      addResult({ test: 'Product Creation Workflow', ...productResult });
    }
    
    setIsRunning(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Creation Test Suite</h2>
        <p className="text-gray-600">
          This tool helps diagnose issues with product listing functionality in production.
        </p>
      </div>

      {/* Test Controls */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={runConnectivityTest}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test API Connectivity
          </button>
          
          <button
            onClick={runProductCreationTest}
            disabled={isRunning}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test Product Creation
          </button>
          
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Run All Tests
          </button>
          
          <button
            onClick={clearResults}
            disabled={isRunning}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Clear Results
          </button>
        </div>
        
        {isRunning && (
          <div className="flex items-center text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Running tests...
          </div>
        )}
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
        
        {testResults.length === 0 ? (
          <div className="text-gray-500 italic">No tests run yet. Click a test button above to start.</div>
        ) : (
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  result.success 
                    ? 'bg-green-50 border-green-400' 
                    : 'bg-red-50 border-red-400'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{result.test}</h4>
                  <span className="text-sm text-gray-500">{result.timestamp}</span>
                </div>
                
                <div className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {result.success ? '✅ ' : '❌ '}{result.message}
                </div>
                
                {result.error && (
                  <div className="mt-2 text-sm text-red-600 bg-red-100 p-2 rounded">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
                
                {result.productId && (
                  <div className="mt-2 text-sm text-green-600">
                    <strong>Product ID:</strong> {result.productId}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug Information */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Debug Information</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div><strong>API Base URL:</strong> {window.apiService?.baseURL || 'Not available'}</div>
          <div><strong>Environment:</strong> {import.meta.env.MODE}</div>
          <div><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL || 'Not set'}</div>
          <div><strong>User Authenticated:</strong> {localStorage.getItem('accessToken') ? 'Yes' : 'No'}</div>
          <div><strong>User Data:</strong> {localStorage.getItem('userData') ? 'Available' : 'Not available'}</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Make sure you're logged in before running the product creation test</li>
          <li>2. The connectivity test checks if the backend API is reachable</li>
          <li>3. The product creation test runs through the complete workflow</li>
          <li>4. Check the browser console for detailed logs during testing</li>
          <li>5. If tests fail, the error messages will help identify the issue</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductCreationTest;
