import React from 'react';
import { Link } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

interface SidebarProps {
  navItems: NavItem[];
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * Sidebar navigation component
 */
export const Sidebar: React.FC<SidebarProps> = ({
  navItems,
  isOpen = true,
  onClose,
  className = '',
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {!isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static top-0 left-0 h-screen w-64 bg-gray-900 text-white
          transform transition-transform duration-300 z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${className}
        `}
      >
        <nav className="p-6 space-y-2 overflow-y-auto h-full">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg
                hover:bg-gray-800 transition-colors duration-200
              `}
            >
              {item.icon && <span className="text-xl">{item.icon}</span>}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
