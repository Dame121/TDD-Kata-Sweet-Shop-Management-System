import React, { useState } from 'react';
import './App.css';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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
        setMessage(`✅ Success: User registered successfully!`);
        // Clear form
        setSignupData({
          username: '',
          email: '',
          password: '',
          is_admin: false
        });
        // Switch to login tab
        setTimeout(() => setActiveTab('login'), 2000);
      } else {
        setMessage(`❌ Error: ${data.detail || 'Signup failed'}`);
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
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        // Clear form
        setLoginData({
          username: '',
          password: ''
        });
      } else {
        setMessage(`❌ Error: ${data.detail || 'Login failed'}`);
      }
    } catch (error) {
      setMessage(`❌ Network Error: ${error.message}`);
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
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
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
        )}

        <div className="info-box">
          <h3><i className="bi bi-info-circle"></i> Quick Info</h3>
          <p><i className="bi bi-person"></i> <strong>User Account:</strong> Browse and purchase sweets</p>
          <p><i className="bi bi-shield-check"></i> <strong>Admin Account:</strong> Manage inventory, view users, and analytics</p>
          <p><i className="bi bi-lock"></i> All communications are secured with JWT tokens</p>
        </div>
      </div>
    </div>
  );
}

export default App;
