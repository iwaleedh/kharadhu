import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/useTheme';

export const ThemeToggle = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const next = () => {
    // Cycle: system -> dark -> light -> system
    if (theme === 'system') setTheme('dark');
    else if (theme === 'dark') setTheme('light');
    else setTheme('system');
  };

  const label = theme === 'system' ? 'System' : isDark ? 'Dark' : 'Light';

  return (
    <button
      aria-label="Toggle theme"
      onClick={next}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95 border 
      border-red-200/30 bg-white text-gray-800 hover:bg-blue-50 theme-light:border-gray-200 theme-light:bg-white/70 theme-light:text-gray-800"
    >
      {isDark ? <Moon size={18} className="text-gray-800" /> : <Sun size={18} className="text-yellow-500" />}
      <span className="text-sm">{label}</span>
    </button>
  );
};
