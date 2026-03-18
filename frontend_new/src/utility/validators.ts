// Validation functions

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username format (at least 3 characters, letters/numbers/underscore only)
 */
export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
  return usernameRegex.test(username);
};

/**
 * Validate password strength
 */
export interface PasswordStrengthResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasNumber: boolean;
}

export const validatePasswordStrength = (password: string): PasswordStrengthResult => {
  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);
  
  return {
    isValid: hasMinLength && hasNumber,
    hasMinLength,
    hasNumber
  };
};

/**
 * Validate password
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};
