import React from 'react';

interface FooterProps {
  copyrightText?: string;
  links?: { label: string; url: string }[];
  className?: string;
}

/**
 * Footer component
 */
export const Footer: React.FC<FooterProps> = ({
  copyrightText = '© 2024 Sweet Shop Management System. All rights reserved.',
  links = [],
  className = '',
}) => {
  return (
    <footer className={`bg-gray-800 text-gray-300 py-6 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">{copyrightText}</p>
          {links.length > 0 && (
            <div className="flex gap-6">
              {links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
