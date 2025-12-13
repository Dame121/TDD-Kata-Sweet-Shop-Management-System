import React, { useState } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('signup');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    is_admin: false
  });

  // Login form state
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  // Handle signup form changes
  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value
    });
  };

  // Handle login form changes
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  // Handle signup submission
  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Success: ${data.message || 'User registered successfully!'}`);
        // Clear form
        setSignupData({
          username: '',
          email: '',
          password: '',
          is_admin: false
        });
      } else {
        setMessage(`❌ Error: ${data.error || 'Signup failed'}`);
      }
    } catch (error) {
      setMessage(`❌ Network Error: ${error.message}`);
    }
  };

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setToken('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Success: Welcome back, ${data.user.username}!`);
        setToken(data.access_token);
        // Clear form
        setLoginData({
          username: '',
          password: ''
        });
      } else {
        setMessage(`❌ Error: ${data.error || 'Login failed'}`);
      }
    } catch (error) {
      setMessage(`❌ Network Error: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>🍬 Sweet Shop Management</h1>
          <p>Authentication Testing Interface</p>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('signup');
              setMessage('');
              setToken('');
            }}
          >
            Sign Up
          </button>
          <button 
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setMessage('');
              setToken('');
            }}
          >
            Login
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {token && (
          <div className="token-display">
            <h3>Access Token:</h3>
            <div className="token-text">{token}</div>
            <button 
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(token);
                alert('Token copied to clipboard!');
              }}
            >
              📋 Copy Token
            </button>
          </div>
        )}

        {activeTab === 'signup' ? (
          <form onSubmit={handleSignup} className="form">
            <div className="form-group">
              <label htmlFor="signup-username">Username:</label>
              <input
                type="text"
                id="signup-username"
                name="username"
                value={signupData.username}
                onChange={handleSignupChange}
                required
                placeholder="Enter username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Email:</label>
              <input
                type="email"
                id="signup-email"
                name="email"
                value={signupData.email}
                onChange={handleSignupChange}
                required
                placeholder="Enter email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Password:</label>
              <input
                type="password"
                id="signup-password"
                name="password"
                value={signupData.password}
                onChange={handleSignupChange}
                required
                placeholder="Enter password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-is-admin">Account Type:</label>
              <select
                id="signup-is-admin"
                name="is_admin"
                value={signupData.is_admin}
                onChange={(e) => setSignupData({...signupData, is_admin: e.target.value === 'true'})}
              >
                <option value="false">Regular User</option>
                <option value="true">Admin</option>
              </select>
            </div>

            <button type="submit" className="submit-btn">
              Create Account
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="form">
            <div className="form-group">
              <label htmlFor="login-username">Username:</label>
              <input
                type="text"
                id="login-username"
                name="username"
                value={loginData.username}
                onChange={handleLoginChange}
                required
                placeholder="Enter username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password:</label>
              <input
                type="password"
                id="login-password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
                placeholder="Enter password"
              />
            </div>

            <button type="submit" className="submit-btn">
              Login
            </button>
          </form>
        )}

        <div className="info-box">
          <h3>ℹ️ API Information</h3>
          <p><strong>Base URL:</strong> {API_BASE_URL}</p>
          <p><strong>Signup Endpoint:</strong> /api/auth/register</p>
          <p><strong>Login Endpoint:</strong> /api/auth/login</p>
        </div>
      </div>
    </div>
  );
}

export default App;
