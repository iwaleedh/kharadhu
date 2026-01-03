import { useEffect, useMemo, useState } from 'react';
import { getCurrentUserId, storageKey } from './themeStorage';
import { ThemeContext } from './themeContextState';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Initialize from storage synchronously (avoids setState-in-effect).
    const userId = getCurrentUserId();
    const saved = localStorage.getItem(storageKey(userId));
    return saved || 'system';
  }); // 'dark' | 'light' | 'system'

  const [resolvedTheme, setResolvedTheme] = useState('dark');

  const media = useMemo(() => window.matchMedia('(prefers-color-scheme: dark)'), []);

  // Listen to system changes when on system mode
  useEffect(() => {
    const update = () => {
      const prefersDark = media.matches;
      const finalTheme = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
      setResolvedTheme(finalTheme);

      const root = document.documentElement;
      root.classList.remove('theme-dark', 'theme-light');
      root.classList.add(finalTheme === 'dark' ? 'theme-dark' : 'theme-light');
    };

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [media, theme]);

  // Persist theme per user
  useEffect(() => {
    const userId = getCurrentUserId();
    localStorage.setItem(storageKey(userId), theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

