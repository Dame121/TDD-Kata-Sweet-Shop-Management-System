import React, { useState, useEffect } from 'react';
import { AppRouter } from './router/AppRouter';
import type { User } from '@auth/jwtService';

/**
 * Main App component - Handles authentication state and renders App Router
 */
const App: React.FC = () => {
  const [token, setToken] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      try {
        const user: User = JSON.parse(savedUser);
        setToken(savedToken);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to load saved auth:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = (newToken: string, user: User): void => {
    setToken(newToken);
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  /**
   * Handle user logout
   */
  const handleLogout = (): void => {
    setToken('');
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  // Show loading state while initializing auth
  if (isLoading) {
    return (
      <div className="auth-loading">
        <p>Loading...</p>
      </div>
    );
  }

  // Render router with auth context
  return (
    <AppRouter
      isAuthenticated={isAuthenticated}
      currentUser={currentUser}
      token={token}
      onLogout={handleLogout}
      onAuthSuccess={handleAuthSuccess}
    />
  );
};

export default App;


