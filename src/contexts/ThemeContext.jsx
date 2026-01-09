import { useEffect, useState } from 'react';
import { ThemeContext } from './themeContextState';

export const ThemeProvider = ({ children }) => {
  // Always dark theme - no more light/system options
  const [theme] = useState('dark');
  const [resolvedTheme] = useState('dark');

  // Apply dark theme on mount
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light');
    root.classList.add('theme-dark');
  }, []);

  // No-op setTheme since we're always dark
  const setTheme = () => { };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
