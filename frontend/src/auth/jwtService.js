// JWT and Authentication utilities
export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_USER_KEY = 'auth_user';

/**
 * Save authentication token to localStorage
 */
export const saveAuthToken = (token) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Save user data to localStorage
 */
export const saveUser = (user) => {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

/**
 * Get user data from localStorage
 */
export const getUser = () => {
  const user = localStorage.getItem(AUTH_USER_KEY);
  return user ? JSON.parse(user) : null;
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Get Authorization header for API requests
 */
export const getAuthHeader = () => {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};
