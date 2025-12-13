import React, { useState } from 'react';
import './App.css';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const [token, setToken] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Helper function to show messages
  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    // Auto-dismiss after 5 seconds
    setTimeout(() => setMessage(''), 5000);
  };
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: ''
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});

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

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // At least 6 characters and at least one number
    const hasMinLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    return { isValid: hasMinLength && hasNumber, hasMinLength, hasNumber };
  };

  const validateUsername = (username) => {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  };

  // Handle signup submission
  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage('');
    setValidationErrors({});

    // Validate all fields
    const errors = {};
    
    if (!validateUsername(signupData.username)) {
      errors.username = 'Username must be at least 3 characters (letters, numbers, underscore only)';
    }
    
    if (!validateEmail(signupData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    const passwordValidation = validatePassword(signupData.password);
    if (!passwordValidation.isValid) {
      if (!passwordValidation.hasMinLength) {
        errors.password = 'Password must be at least 6 characters';
      } else if (!passwordValidation.hasNumber) {
        errors.password = 'Password must contain at least one number';
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...signupData,
          is_admin: false  // Users can only create regular accounts
        })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Account created successfully! Please login.', 'success');
        // Clear form
        setSignupData({
          username: '',
          email: '',
          password: ''
        });
        setValidationErrors({});
        // Switch to login tab
        setTimeout(() => setActiveTab('login'), 2000);
      } else {
        showMessage(data.detail || 'Signup failed', 'error');
      }
    } catch (error) {
      showMessage(`Network Error: ${error.message}`, 'error');
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
        showMessage(`Welcome back, ${data.user.username}!`, 'success');
        setToken(data.access_token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        // Clear form
        setLoginData({
          username: '',
          password: ''
        });
      } else {
        showMessage(data.detail || 'Login failed', 'error');
      }
    } catch (error) {
      showMessage(`Network Error: ${error.message}`, 'error');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setToken('');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setMessage('');
    setLoginData({ username: '', password: '' });
  };

  // If authenticated, show appropriate dashboard
  if (isAuthenticated && currentUser) {
    if (currentUser.is_admin) {
      return <AdminDashboard user={currentUser} token={token} onLogout={handleLogout} />;
    } else {
      return <UserDashboard user={currentUser} token={token} onLogout={handleLogout} />;
    }
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1><i className="bi bi-shop"></i> Sweet Shop Management</h1>
          <p>Welcome! Please login or create an account</p>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setMessage('');
            }}
          >
            Login
          </button>
          <button 
            className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('signup');
              setMessage('');
            }}
          >
            Sign Up
          </button>
        </div>

        {message && (
          <div className={`toast-message ${messageType}`}>
            <div className="toast-icon">
              {messageType === 'success' && <i className="bi bi-check-circle-fill"></i>}
              {messageType === 'error' && <i className="bi bi-exclamation-circle-fill"></i>}
              {messageType === 'info' && <i className="bi bi-info-circle-fill"></i>}
            </div>
            <span className="toast-text">{message}</span>
            <button onClick={() => setMessage('')} className="toast-close">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {activeTab === 'login' ? (
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
        ) : (
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
                placeholder="At least 3 characters"
                className={validationErrors.username ? 'input-error' : ''}
              />
              {validationErrors.username && <span className="error-text">{validationErrors.username}</span>}
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
                placeholder="your@email.com"
                className={validationErrors.email ? 'input-error' : ''}
              />
              {validationErrors.email && <span className="error-text">{validationErrors.email}</span>}
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
                placeholder="Min 6 chars with a number"
                className={validationErrors.password ? 'input-error' : ''}
              />
              {validationErrors.password && <span className="error-text">{validationErrors.password}</span>}
            </div>

            <button type="submit" className="submit-btn">
              Create Account
            </button>
          </form>
        )}

        <div className="info-box">
          <h3><i className="bi bi-stars"></i> Why Choose Our Sweet Shop?</h3>
          <div className="features-grid">
            <div className="feature">
              <i className="bi bi-gift"></i>
              <span>Premium Quality Sweets</span>
            </div>
            <div className="feature">
              <i className="bi bi-truck"></i>
              <span>Fast & Fresh Delivery</span>
            </div>
            <div className="feature">
              <i className="bi bi-heart"></i>
              <span>Made with Love</span>
            </div>
            <div className="feature">
              <i className="bi bi-shield-check"></i>
              <span>100% Secure Payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
