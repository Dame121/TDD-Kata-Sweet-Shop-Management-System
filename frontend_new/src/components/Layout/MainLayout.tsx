import React, { useState } from 'react';
import { Header, HeaderProps } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

interface MainLayoutProps {
  children: React.ReactNode;
  navItems?: NavItem[];
  headerProps?: Partial<HeaderProps>;
  className?: string;
}

/**
 * Main layout component wrapping Header, Sidebar, Footer
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  navItems = [],
  headerProps = {},
  className = '',
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header {...headerProps} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {navItems.length > 0 && (
          <Sidebar
            navItems={navItems}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 overflow-auto bg-gray-50 ${className}`}>
          <div className="container mx-auto px-4 py-6">{children}</div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
