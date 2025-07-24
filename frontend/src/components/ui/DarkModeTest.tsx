import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const DarkModeTest: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed top-20 left-4 z-50 max-w-sm">
      {/* Main test card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          Dark Mode Test
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Current theme: <span className="font-semibold">{theme}</span>
        </p>

        <button
          onClick={toggleTheme}
          className="w-full bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors mb-4"
        >
          Toggle Theme
        </button>

        {/* Visual test elements */}
        <div className="space-y-2 text-sm">
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
            <span className="text-gray-800 dark:text-gray-200">Background test</span>
          </div>
          
          <div className="bg-red-100 dark:bg-red-900 p-2 rounded">
            <span className="text-red-800 dark:text-red-200">Red background</span>
          </div>
          
          <div className="bg-green-100 dark:bg-green-900 p-2 rounded">
            <span className="text-green-800 dark:text-green-200">Green background</span>
          </div>
          
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
            <span className="text-blue-800 dark:text-blue-200">Blue background</span>
          </div>
        </div>

        {/* DOM class check */}
        <div className="mt-4 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-xs">
          <div className="text-yellow-800 dark:text-yellow-200">
            HTML classes: {document.documentElement.className}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkModeTest;
