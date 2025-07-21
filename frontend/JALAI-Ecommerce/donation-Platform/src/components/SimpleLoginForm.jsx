import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SimpleLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🟢 SIMPLE FORM: Starting login...');
      const response = await login(email, password);
      console.log('🟢 SIMPLE FORM: Login successful!', response);

      // Get user type
      const userType = response?.user?.userType;
      console.log('🟢 SIMPLE FORM: User type:', userType);

      // Clear form
      setEmail('');
      setPassword('');

      // Navigate based on user type
      if (userType === 'ADMIN') {
        console.log('🟢 SIMPLE FORM: Redirecting to admin...');
        navigate('/admin');
      } else if (userType === 'ORPHANAGE') {
        console.log('🟢 SIMPLE FORM: Redirecting to orphanage dashboard...');
        navigate('/orphanage-dashboard');
      } else {
        console.log('🟢 SIMPLE FORM: Redirecting to user dashboard...');
        navigate('/user-dashboard');
      }

    } catch (err) {
      console.error('🔴 SIMPLE FORM: Login failed:', err);
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f9ff',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: '#16a34a',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          🌟 SIMPLE LOGIN
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#374151'
            }}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #d1d5db',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email"
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#374151'
            }}>
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #d1d5db',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: loading ? '#9ca3af' : '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? '🔄 Signing In...' : '🚀 Sign In'}
          </button>
        </form>

        <div style={{ 
          marginTop: '30px', 
          padding: '15px',
          backgroundColor: '#f3f4f6',
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#374151' }}>Test Credentials:</h4>
          <div style={{ marginBottom: '8px' }}>
            <strong>Admin:</strong> admin@jalai.com / Admin123!
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Client:</strong> john@example.com / Client123!
          </div>
          <div>
            <strong>Orphanage:</strong> hope@orphanage.com / Orphan123!
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoginForm;
