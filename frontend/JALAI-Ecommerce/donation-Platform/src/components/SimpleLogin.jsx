import React, { useState } from 'react';

const SimpleLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('Attempting login...');

    try {
      console.log('Making direct API call to login...');
      
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        setResult(`Login failed (${response.status}): ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('Login successful:', data);
      
      setResult(`Login successful! Token: ${data.accessToken ? 'Present' : 'Missing'}\nUser: ${JSON.stringify(data.user || 'No user data', null, 2)}`);
      
      // Store the token
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('userData', JSON.stringify(data.user));
      }

    } catch (error) {
      console.error('Login error:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setResult('Attempting registration...');

    try {
      const testUser = {
        name: 'Test User',
        email: `testuser${Date.now()}@example.com`,
        password: 'password123',
        phone: '+1234567890',
        location: 'Test City'
      };

      console.log('Making direct API call to register:', testUser);

      const response = await fetch('http://localhost:8080/api/auth/register/client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser),
      });

      console.log('Register response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        setResult(`Registration failed (${response.status}): ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('Registration successful:', data);

      setResult(`Registration successful!\nEmail: ${testUser.email}\nPassword: ${testUser.password}\nResponse: ${JSON.stringify(data, null, 2)}`);

    } catch (error) {
      console.error('Registration error:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAdminLogin = async () => {
    setLoading(true);
    setResult('Testing admin login...');

    try {
      console.log('Making direct API call to login as admin...');

      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@jalai.com',
          password: 'admin123'
        }),
      });

      console.log('Admin login response status:', response.status);
      console.log('Admin login response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        setResult(`Admin login failed (${response.status}): ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('Admin login successful:', data);

      setResult(`Admin login successful!\nUser Type: ${data.user?.userType || 'Unknown'}\nToken: ${data.accessToken ? 'Present' : 'Missing'}\nResponse: ${JSON.stringify(data, null, 2)}`);

      // Store the token
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('userData', JSON.stringify(data.user));
      }

    } catch (error) {
      console.error('Admin login error:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSampleClientLogin = async () => {
    setLoading(true);
    setResult('Testing sample client login...');

    try {
      console.log('Making direct API call to login as sample client...');

      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'john.doe@email.com',
          password: 'Client123!'
        }),
      });

      console.log('Sample client login response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        setResult(`Sample client login failed (${response.status}): ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('Sample client login successful:', data);

      setResult(`Sample client login successful!\nUser Type: ${data.user?.userType || 'Unknown'}\nToken: ${data.accessToken ? 'Present' : 'Missing'}\nResponse: ${JSON.stringify(data, null, 2)}`);

      // Store the token
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('userData', JSON.stringify(data.user));
      }

    } catch (error) {
      console.error('Sample client login error:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createAndTestUser = async () => {
    setLoading(true);
    setResult('Creating and testing new user...');

    try {
      // First, create a new user
      console.log('Creating new user...');

      const registerResponse = await fetch('http://localhost:8080/api/auth/register/client', {
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
        }),
      });

      if (!registerResponse.ok) {
        const errorText = await registerResponse.text();
        setResult(`Registration failed (${registerResponse.status}): ${errorText}`);
        return;
      }

      const registerData = await registerResponse.json();
      console.log('Registration successful:', registerData);

      setResult(`User created and logged in successfully!\nUser Type: ${registerData.user?.userType || 'Unknown'}\nToken: ${registerData.accessToken ? 'Present' : 'Missing'}\nEmail: ${registerData.user?.email}\nResponse: ${JSON.stringify(registerData, null, 2)}`);

      // Store the token
      if (registerData.accessToken) {
        localStorage.setItem('accessToken', registerData.accessToken);
        localStorage.setItem('userData', JSON.stringify(registerData.user));
      }

    } catch (error) {
      console.error('Create user error:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createAdminUser = async () => {
    setLoading(true);
    setResult('Creating admin user...');

    try {
      console.log('Creating admin user via API...');

      const response = await fetch('http://localhost:8080/api/auth/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Create admin response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        setResult(`Admin creation failed (${response.status}): ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('Admin creation successful:', data);

      setResult(`Admin user created successfully!\nEmail: admin@jalai.com\nPassword: admin123\nResponse: ${JSON.stringify(data, null, 2)}`);

    } catch (error) {
      console.error('Create admin error:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>Simple Login Test</h2>
      
      <form onSubmit={handleLogin} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            marginRight: '10px'
          }}
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
        
        <button
          type="button"
          onClick={handleRegister}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginRight: '10px'
          }}
        >
          Create Test Account
        </button>

        <button
          type="button"
          onClick={testAdminLogin}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginRight: '10px'
          }}
        >
          Test Admin Login
        </button>

        <button
          type="button"
          onClick={testSampleClientLogin}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginRight: '10px'
          }}
        >
          Test Sample Client
        </button>

        <button
          type="button"
          onClick={createAndTestUser}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginRight: '10px'
          }}
        >
          Create & Test New User
        </button>

        <button
          type="button"
          onClick={createAdminUser}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Create Admin User
        </button>
      </form>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #dee2e6', 
        borderRadius: '5px', 
        padding: '15px',
        minHeight: '100px',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace'
      }}>
        {result || 'Enter credentials and click Login, or create a test account first.'}
      </div>
    </div>
  );
};

export default SimpleLogin;
