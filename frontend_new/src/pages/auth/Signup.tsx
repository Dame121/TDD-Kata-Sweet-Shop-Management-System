import React, { useState, ChangeEvent, FormEvent } from 'react';
import { authService } from '@features/auth/services';
import { saveAuthToken, saveUser } from '@auth/jwtService';
import { validateEmail, validatePasswordStrength, validateUsername } from '@utility/validators';

interface SignupData {
  username: string;
  email: string;
  password: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface SignupProps {
  onSuccess: (token: string, user: any) => void;
  onError: (message: string) => void;
  onMessage: (message: string, type: 'success' | 'error' | 'info') => void;
}

const Signup: React.FC<SignupProps> = ({ onSuccess, onError, onMessage }) => {
  const [signupData, setSignupData] = useState<SignupData>({
    username: '',
    email: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSignupChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field when user starts typing
    if (validationErrors[e.target.name]) {
      const errors = { ...validationErrors };
      delete errors[e.target.name];
      setValidationErrors(errors);
    }
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setValidationErrors({});
    setIsLoading(true);

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
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await authService.signup({
        ...signupData,
      });
      onMessage('Account created successfully! Logging you in...', 'success');
      saveAuthToken(response.access_token);
      saveUser(response.user);
      onSuccess(response.access_token, response.user);
      setSignupData({ username: '', email: '', password: '' });
      setValidationErrors({});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      onError(errorMessage);
      onMessage(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="auth-form">
      <h2>Create Account</h2>
      
      <div className="form-group">
        <label htmlFor="signup-username">
          <i className="bi bi-person"></i>Username
        </label>
        <input
          type="text"
          id="signup-username"
          name="username"
          value={signupData.username}
          onChange={handleSignupChange}
          required
          placeholder="Choose a username"
          className={validationErrors.username ? 'form-error-input' : ''}
          disabled={isLoading}
        />
        {validationErrors.username && <p className="form-error">{validationErrors.username}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="signup-email">
          <i className="bi bi-envelope"></i>Email
        </label>
        <input
          type="email"
          id="signup-email"
          name="email"
          value={signupData.email}
          onChange={handleSignupChange}
          required
          placeholder="Enter your email"
          className={validationErrors.email ? 'form-error-input' : ''}
          disabled={isLoading}
        />
        {validationErrors.email && <p className="form-error">{validationErrors.email}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="signup-password">
          <i className="bi bi-lock"></i>Password
        </label>
        <input
          type="password"
          id="signup-password"
          name="password"
          value={signupData.password}
          onChange={handleSignupChange}
          required
          placeholder="Create a strong password"
          className={validationErrors.password ? 'form-error-input' : ''}
          disabled={isLoading}
        />
        {validationErrors.password && <p className="form-error">{validationErrors.password}</p>}
        <small style={{ color: 'var(--text-light)', marginTop: '0.25rem', display: 'block' }}>
          Must be at least 6 characters with at least one number
        </small>
      </div>

      <button 
        type="submit" 
        className="auth-btn btn-submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <i className="bi bi-hourglass-split"></i> Creating Account...
          </>
        ) : (
          <>
            <i className="bi bi-person-plus"></i>Sign Up
          </>
        )}
      </button>
    </form>
  );
};

export default Signup;
