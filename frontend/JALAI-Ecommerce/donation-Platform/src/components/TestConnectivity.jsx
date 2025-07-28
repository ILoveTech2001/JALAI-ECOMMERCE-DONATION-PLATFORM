import React, { useState } from 'react';
import apiService from '../services/apiService';

const TestConnectivity = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, status, message) => {
    setResults(prev => [...prev, { test, status, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    // Test 1: Basic API connectivity
    try {
      addResult('API Base URL', 'INFO', `Testing connection to: ${apiService.baseURL}`);
      
      // Test public endpoint
      const response = await fetch(`${apiService.baseURL}/products/approved?page=0&size=1`);
      if (response.ok) {
        addResult('Public API Access', 'SUCCESS', 'Successfully connected to public endpoints');
      } else {
        addResult('Public API Access', 'ERROR', `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      addResult('Public API Access', 'ERROR', `Connection failed: ${error.message}`);
    }

    // Test 2: Authentication endpoint
    try {
      const authResponse = await fetch(`${apiService.baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'test' })
      });
      
      if (authResponse.status === 401 || authResponse.status === 400) {
        addResult('Auth Endpoint', 'SUCCESS', 'Auth endpoint is accessible (expected auth failure)');
      } else {
        addResult('Auth Endpoint', 'WARNING', `Unexpected response: ${authResponse.status}`);
      }
    } catch (error) {
      addResult('Auth Endpoint', 'ERROR', `Auth endpoint failed: ${error.message}`);
    }

    // Test 3: Categories endpoint
    try {
      const categoriesResponse = await apiService.getCategories();
      if (categoriesResponse && Array.isArray(categoriesResponse)) {
        addResult('Categories API', 'SUCCESS', `Retrieved ${categoriesResponse.length} categories`);
      } else {
        addResult('Categories API', 'WARNING', 'Categories endpoint returned unexpected data');
      }
    } catch (error) {
      addResult('Categories API', 'ERROR', `Categories failed: ${error.message}`);
    }

    // Test 4: Products endpoint
    try {
      const productsResponse = await apiService.getProducts(0, 5);
      if (productsResponse && productsResponse.content) {
        addResult('Products API', 'SUCCESS', `Retrieved ${productsResponse.content.length} products`);
      } else {
        addResult('Products API', 'WARNING', 'Products endpoint returned unexpected data');
      }
    } catch (error) {
      addResult('Products API', 'ERROR', `Products failed: ${error.message}`);
    }

    // Test 5: Payment endpoints (requires auth, so we'll just test if they exist)
    try {
      const paymentResponse = await fetch(`${apiService.baseURL}/payments`, {
        headers: { 'Authorization': 'Bearer fake-token' }
      });
      
      if (paymentResponse.status === 401 || paymentResponse.status === 403) {
        addResult('Payment Endpoints', 'SUCCESS', 'Payment endpoints are accessible (auth required)');
      } else {
        addResult('Payment Endpoints', 'WARNING', `Unexpected payment response: ${paymentResponse.status}`);
      }
    } catch (error) {
      addResult('Payment Endpoints', 'ERROR', `Payment endpoints failed: ${error.message}`);
    }

    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return 'text-green-600 bg-green-50';
      case 'ERROR': return 'text-red-600 bg-red-50';
      case 'WARNING': return 'text-yellow-600 bg-yellow-50';
      case 'INFO': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">JALAI Connectivity Test</h2>
          <p className="text-gray-600 mt-2">Test frontend-backend connectivity and API endpoints</p>
        </div>

        <div className="p-6">
          <button
            onClick={runTests}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium"
          >
            {loading ? 'Running Tests...' : 'Run Connectivity Tests'}
          </button>

          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Test Results:</h3>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{result.test}</div>
                        <div className="text-sm mt-1">{result.message}</div>
                      </div>
                      <div className="text-xs opacity-75">{result.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Configuration Info:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>API Base URL:</strong> {apiService.baseURL}</div>
              <div><strong>Environment:</strong> {import.meta.env.MODE}</div>
              <div><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL || 'Not set'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestConnectivity;
