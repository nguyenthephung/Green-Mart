import React, { createContext, useContext, useEffect, useState, memo } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = memo(({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Đọc theme từ localStorage ngay lập tức để tránh layout shift
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('greenmart-theme') as Theme;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        return savedTheme;
      }

      // Kiểm tra system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }

    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');

    // Add new theme class to both html and body
    root.classList.add(theme);
    body.classList.add(theme);

    // Save to localStorage
    localStorage.setItem('greenmart-theme', theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1f2937' : '#ffffff');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      return newTheme;
    });
  };

  const handleTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const value = {
    theme,
    toggleTheme,
    setTheme: handleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
});

ThemeProvider.displayName = 'ThemeProvider';
