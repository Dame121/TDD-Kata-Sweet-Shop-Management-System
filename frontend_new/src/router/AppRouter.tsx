import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '@pages/auth';
import { AdminDashboard, UserDashboard } from '@pages/Dashboard';
import type { User } from '@auth/jwtService';

interface ProtectedRouteProps {
  element: React.ReactNode;
  isAuthenticated: boolean;
  userRole?: 'user' | 'admin';
  requiredRole?: 'user' | 'admin';
}

/**
 * ProtectedRoute component to guard routes based on authentication and role
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  isAuthenticated,
  userRole,
  requiredRole
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{element}</>;
};

interface AppRouterProps {
  isAuthenticated: boolean;
  currentUser: User | null;
  token: string;
  onLogout: () => void;
  onAuthSuccess: (token: string, user: User) => void;
}

/**
 * Main router component with all application routes
 */
export const AppRouter: React.FC<AppRouterProps> = ({
  isAuthenticated,
  currentUser,
  token,
  onLogout,
  onAuthSuccess
}) => {
  return (
    <Routes>
      {/* Public route - Authentication */}
      <Route
        path="/auth"
        element={
          isAuthenticated ? (
            <Navigate to={currentUser?.role === 'admin' ? '/admin' : '/dashboard'} replace />
          ) : (
            <AuthPage onAuthSuccess={onAuthSuccess} />
          )
        }
      />

      {/* Admin dashboard - Only for admin users */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute
            element={
              currentUser && token ? (
                <AdminDashboard user={currentUser} token={token} onLogout={onLogout} />
              ) : null
            }
            isAuthenticated={isAuthenticated}
            userRole={currentUser?.role}
            requiredRole="admin"
          />
        }
      />

      {/* User dashboard - For authenticated users */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            element={
              currentUser && token ? (
                <UserDashboard user={currentUser} token={token} onLogout={onLogout} />
              ) : null
            }
            isAuthenticated={isAuthenticated}
            userRole={currentUser?.role}
          />
        }
      />

      {/* Root route - Redirect based on auth status */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate
              to={currentUser?.role === 'admin' ? '/admin' : '/dashboard'}
              replace
            />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />

      {/* Unauthorized access */}
      <Route
        path="/unauthorized"
        element={
          <div className="auth-error">
            <h1>Access Denied</h1>
            <p>You do not have permission to access this page.</p>
            <button onClick={onLogout}>Logout</button>
          </div>
        }
      />

      {/* 404 - Not Found */}
      <Route
        path="*"
        element={
          <div className="auth-error">
            <h1>Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <a href="/">Go Home</a>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRouter;
