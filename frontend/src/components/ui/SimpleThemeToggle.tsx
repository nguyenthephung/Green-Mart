import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const SimpleThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [documentClasses, setDocumentClasses] = useState('');
  
  useEffect(() => {
    const updateClasses = () => {
      setDocumentClasses(document.documentElement.className);
    };
    
    updateClasses();
    const observer = new MutationObserver(updateClasses);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);
  
  const handleToggle = () => {
    console.log('Simple toggle clicked, current theme:', theme);
    toggleTheme();
    
    // Force check classes after toggle
    setTimeout(() => {
      const html = document.documentElement;
      console.log('After toggle - HTML classes:', html.className);
      console.log('After toggle - has dark class:', html.classList.contains('dark'));
      console.log('After toggle - has light class:', html.classList.contains('light'));
      setDocumentClasses(html.className);
    }, 100);
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col space-y-4">
        {/* Theme Toggle Button */}
        <button
          onClick={handleToggle}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>

        {/* Debug Info */}
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <div>Current Theme: <span className="font-bold">{theme}</span></div>
          <div>Document Classes: <span className="font-mono text-xs">{documentClasses}</span></div>
        </div>

        {/* Visual Test Panel */}
        <div className="border border-gray-300 dark:border-gray-600 p-3 rounded">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Visual Tests:</div>
          
          {/* Tailwind dark mode test */}
          <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-2 mb-2 rounded">
            Tailwind: {theme === 'light' ? 'Light BG' : 'Should be Dark BG'}
          </div>
          
          {/* Custom CSS test */}
          <div className="theme-test p-2 mb-2 rounded">
            Custom CSS: {theme === 'light' ? 'Light BG' : 'Should be Dark BG'}
          </div>
          
          {/* Direct style test */}
          <div 
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
              color: theme === 'dark' ? '#ffffff' : '#000000'
            }}
            className="p-2 rounded"
          >
            Direct Style: Working as expected
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleThemeToggle;
