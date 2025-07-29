import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = false,
  size = 'md'
}) => {
  const { theme, toggleTheme } = useTheme();
  


  const sizeClasses = {
    sm: 'w-8 h-8 p-1',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-3'
  };

  const iconClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6', 
    lg: 'w-7 h-7'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {theme === 'light' ? 'Light' : 'Dark'}
        </span>
      )}
      
      <button
        onClick={() => {
 
          toggleTheme();

        }}
        className={`
          ${sizeClasses[size]}
          bg-gray-100 dark:bg-gray-800 
          hover:bg-gray-200 dark:hover:bg-gray-700 
          rounded-lg
          flex items-center justify-center
          border border-gray-200 dark:border-gray-700
          shadow-sm hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
          dark:focus:ring-offset-gray-800
          group
        `}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <div className="relative">
          {/* Light mode icon */}
          <SunIcon 
            className={`
              ${iconClasses[size]}
              text-yellow-500 absolute inset-0
              ${theme === 'light' 
                ? 'opacity-100' 
                : 'opacity-0'
              }
            `}
          />
          
          {/* Dark mode icon */}
          <MoonIcon 
            className={`
              ${iconClasses[size]}
              text-blue-400 absolute inset-0
              ${theme === 'dark' 
                ? 'opacity-100' 
                : 'opacity-0'
              }
            `}
          />
          
          {/* Invisible spacer to maintain button size */}
          <div className="opacity-0">
            <SunIcon className={iconClasses[size]} />
          </div>
        </div>
      </button>
    </div>
  );
};

export default ThemeToggle;
