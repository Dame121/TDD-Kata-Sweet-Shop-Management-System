import React from 'react';

export interface HeaderProps {
  title?: string;
  onLogout?: () => void;
  userName?: string;
  className?: string;
}

/**
 * Header component for top navigation
 */
export const Header: React.FC<HeaderProps> = ({
  title = 'Sweet Shop Management',
  onLogout,
  userName,
  className = '',
}) => {
  return (
    <header
      className={`
        bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg
        ${className}
      `}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {userName && (
            <span className="text-sm">
              Welcome, <strong>{userName}</strong>
            </span>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
