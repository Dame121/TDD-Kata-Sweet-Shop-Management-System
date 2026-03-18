import { useState, useEffect } from 'react';
import { getAuthToken, saveAuthToken, saveUser, clearAuth, User } from '@auth/jwtService';

export interface UseAuthReturn {
  token: string;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [token, setToken] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
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

  const logout = (): void => {
    clearAuth();
    setToken('');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return {
    token,
    currentUser,
    isAuthenticated,
    isLoading,
    logout,
  };
};
