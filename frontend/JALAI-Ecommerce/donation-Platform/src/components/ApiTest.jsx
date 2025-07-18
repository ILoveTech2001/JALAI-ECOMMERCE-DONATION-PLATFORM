import React, { useState } from 'react';

const ApiTest = () => {
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);

  const testHealth = async () => {
    setLoading(true);
    setResults('Testing health endpoint...');
    try {
      const response = await fetch('http://localhost:8080/api/actuator/health');
      const data = await response.text();
      setResults(`Health Response (${response.status}):\n${data}`);
    } catch (error) {
      setResults(`Health Error: ${error.message}`);
    }
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    setResults('Testing login endpoint...');
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
      const data = await response.json();
      setResults(`Login Response (${response.status}):\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResults(`Login Error: ${error.message}`);
    }
    setLoading(false);
  };

  const testRegister = async () => {
    setLoading(true);
    setResults('Testing register endpoint...');
    try {
      const response = await fetch('http://localhost:8080/api/auth/register/client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: `testuser${Date.now()}@example.com`,
          password: 'password123',
          phone: '+1234567890',
          location: 'Test City'
        })
      });
      const data = await response.json();
      setResults(`Register Response (${response.status}):\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResults(`Register Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>API Connection Test</h2>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testHealth} 
          disabled={loading}
          style={{ margin: '5px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Test Health
        </button>
        <button 
          onClick={testLogin} 
          disabled={loading}
          style={{ margin: '5px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Test Login
        </button>
        <button 
          onClick={testRegister} 
          disabled={loading}
          style={{ margin: '5px', padding: '10px 20px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Test Register
        </button>
      </div>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #dee2e6', 
        borderRadius: '5px', 
        padding: '15px',
        minHeight: '200px',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace'
      }}>
        {loading ? 'Loading...' : results || 'Click a button to test the API'}
      </div>
    </div>
  );
};

export default ApiTest;
