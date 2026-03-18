import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { UserDashboard, AdminDashboard } from './components/Pages';
import { API_BASE_URL } from './configs';
import { getAuthToken, saveAuthToken, saveUser, clearAuth, User } from './auth';
import { validateEmail, validatePasswordStrength, validateUsername } from './utility';

interface SignupData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface LoginResponse {
  access_token: string;
  user: User;
}

type MessageType = 'success' | 'error' | 'info' | '';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('');
  const [token, setToken] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const savedToken = getAuthToken();
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      try {
        const user: User = JSON.parse(savedUser);
        setToken(savedToken);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to load saved auth:', error);
        clearAuth();
      }
    }
    setIsLoading(false);
  }, []);
  
  const showMessage = (text: string, type: MessageType = 'info'): void => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };
  
  const [signupData, setSignupData] = useState<SignupData>({
    username: '',
    email: '',
    password: ''
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const [loginData, setLoginData] = useState<LoginData>({
    username: '',
    password: ''
  });

  const handleSignupChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setMessage('');
    setValidationErrors({});

    const errors: ValidationErrors = {};
    
    if (!validateUsername(signupData.username)) {
      errors.username = 'Username must be at least 3 characters (letters, numbers, underscore only)';
    }
    
    if (!validateEmail(signupData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    const passwordValidation = validatePasswordStrength(signupData.password);
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
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...signupData,
          is_admin: false
        })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Account created successfully! Please login.', 'success');
        setSignupData({ username: '', email: '', password: '' });
        setValidationErrors({});
        setTimeout(() => setActiveTab('login'), 2000);
      } else {
        showMessage(data.detail || 'Signup failed', 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showMessage(`Network Error: ${errorMessage}`, 'error');
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setMessage('');
    setToken('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok) {
        const loginData: LoginResponse = data;
        showMessage(`Welcome back, ${loginData.user.username}!`, 'success');
        setToken(loginData.access_token);
        setCurrentUser(loginData.user);
        setIsAuthenticated(true);
        saveAuthToken(loginData.access_token);
        saveUser(loginData.user);
        setLoginData({ username: '', password: '' });
      } else {
        const errorData = data as any;
        showMessage(errorData.detail || 'Login failed', 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showMessage(`Network Error: ${errorMessage}`, 'error');
    }
  };

  const handleLogout = (): void => {
    setToken('');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setMessage('');
    setLoginData({ username: '', password: '' });
    clearAuth();
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50"><p className="text-lg text-gray-600">Loading...</p></div>;
  }
  
  if (isAuthenticated && currentUser) {
    if (currentUser.is_admin) {
      return <AdminDashboard user={currentUser} token={token} onLogout={handleLogout} />;
    } else {
      return <UserDashboard user={currentUser} token={token} onLogout={handleLogout} />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="bg-white shadow-sm border-b border-amber-100">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-amber-900 flex items-center gap-3 mb-2">
            <i className="bi bi-shop text-amber-600 text-3xl"></i> Sweet Shop Management
          </h1>
          <p className="text-gray-600 text-lg">Welcome! Please login or create an account</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-8 border-b border-amber-200">
          <button 
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'login' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => {
              setActiveTab('login');
              setMessage('');
            }}
          >
            <i className="bi bi-box-arrow-in-right mr-2"></i>Login
          </button>
          <button 
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'signup' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => {
              setActiveTab('signup');
              setMessage('');
            }}
          >
            <i className="bi bi-person-plus mr-2"></i>Sign Up
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            messageType === 'success' ? 'bg-green-50 border border-green-200' :
            messageType === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className={`flex-shrink-0 ${
              messageType === 'success' ? 'text-green-600' :
              messageType === 'error' ? 'text-red-600' :
              'text-blue-600'
            }`}>
              {messageType === 'success' && <i className="bi bi-check-circle-fill text-xl"></i>}
              {messageType === 'error' && <i className="bi bi-exclamation-circle-fill text-xl"></i>}
              {messageType === 'info' && <i className="bi bi-info-circle-fill text-xl"></i>}
            </div>
            <span className={`flex-1 ${
              messageType === 'success' ? 'text-green-800' :
              messageType === 'error' ? 'text-red-800' :
              'text-blue-800'
            }`}>{message}</span>
            <button onClick={() => setMessage('')} className="text-gray-400 hover:text-gray-600">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md border border-amber-100 p-8 mb-8">
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-6">Welcome Back</h2>
              
              <div className="space-y-2">
                <label htmlFor="login-username" className="block text-sm font-semibold text-gray-700">
                  <i className="bi bi-person mr-2 text-amber-600"></i>Username
                </label>
                <input
                  type="text"
                  id="login-username"
                  name="username"
                  value={loginData.username}
                  onChange={handleLoginChange}
                  required
                  placeholder="Enter your username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700">
                  <i className="bi bi-lock mr-2 text-amber-600"></i>Password
                </label>
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg">
                <i className="bi bi-box-arrow-in-right mr-2"></i>Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-6">Create Account</h2>
              
              <div className="space-y-2">
                <label htmlFor="signup-username" className="block text-sm font-semibold text-gray-700">
                  <i className="bi bi-person mr-2 text-amber-600"></i>Username
                </label>
                <input
                  type="text"
                  id="signup-username"
                  name="username"
                  value={signupData.username}
                  onChange={handleSignupChange}
                  required
                  placeholder="Choose a username"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    validationErrors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'
                  }`}
                />
                {validationErrors.username && <p className="text-red-600 text-sm">{validationErrors.username}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-email" className="block text-sm font-semibold text-gray-700">
                  <i className="bi bi-envelope mr-2 text-amber-600"></i>Email
                </label>
                <input
                  type="email"
                  id="signup-email"
                  name="email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  required
                  placeholder="Enter your email"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    validationErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'
                  }`}
                />
                {validationErrors.email && <p className="text-red-600 text-sm">{validationErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-password" className="block text-sm font-semibold text-gray-700">
                  <i className="bi bi-lock mr-2 text-amber-600"></i>Password
                </label>
                <input
                  type="password"
                  id="signup-password"
                  name="password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  required
                  placeholder="Create a strong password"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    validationErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'
                  }`}
                />
                {validationErrors.password && <p className="text-red-600 text-sm">{validationErrors.password}</p>}
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg">
                <i className="bi bi-person-plus mr-2"></i>Sign Up
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
