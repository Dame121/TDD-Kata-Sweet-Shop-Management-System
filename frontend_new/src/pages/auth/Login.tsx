import React, { useState, ChangeEvent, FormEvent } from 'react';
import { authService } from '@features/auth/services';
import { saveAuthToken, saveUser } from '@auth/jwtService';

interface LoginData {
  username: string;
  password: string;
}

interface LoginProps {
  onSuccess: (token: string, user: any) => void;
  onError: (message: string) => void;
  onMessage: (message: string, type: 'success' | 'error' | 'info') => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onError, onMessage }) => {
  const [loginData, setLoginData] = useState<LoginData>({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login(loginData);
      onMessage(`Welcome back, ${response.user.username}!`, 'success');
      saveAuthToken(response.access_token);
      saveUser(response.user);
      onSuccess(response.access_token, response.user);
      setLoginData({ username: '', password: '' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      onError(errorMessage);
      onMessage(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="auth-form">
      <h2>Welcome Back</h2>
      
      <div className="form-group">
        <label htmlFor="login-username">
          <i className="bi bi-person"></i>Username
        </label>
        <input
          type="text"
          id="login-username"
          name="username"
          value={loginData.username}
          onChange={handleLoginChange}
          required
          placeholder="Enter your username"
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="login-password">
          <i className="bi bi-lock"></i>Password
        </label>
        <input
          type="password"
          id="login-password"
          name="password"
          value={loginData.password}
          onChange={handleLoginChange}
          required
          placeholder="Enter your password"
          disabled={isLoading}
        />
      </div>

      <button 
        type="submit" 
        className="auth-btn btn-submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <i className="bi bi-hourglass-split"></i> Logging in...
          </>
        ) : (
          <>
            <i className="bi bi-box-arrow-in-right"></i>Login
          </>
        )}
      </button>
    </form>
  );
};

export default Login;
