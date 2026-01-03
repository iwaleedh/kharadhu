import { useTheme } from '../../contexts/useTheme';

export const ThemePreference = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setTheme('system')}
          className={`p-3 rounded-lg border transition-all duration-300 ${theme === 'system' ? 'border-blue-600 bg-blue-50 text-white' : 'border-gray-300 text-gray-800 hover:border-gray-600'}`}
        >
          <div className="font-semibold">System</div>
          <div className="text-xs text-gray-700">Auto</div>
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`p-3 rounded-lg border transition-all duration-300 ${resolvedTheme === 'dark' && theme !== 'light' ? 'border-blue-600 bg-blue-50 text-white' : 'border-gray-300 text-gray-800 hover:border-gray-600'}`}
        >
          <div className="font-semibold">Dark</div>
          <div className="text-xs text-gray-700">Dark</div>
        </button>
        <button
          onClick={() => setTheme('light')}
          className={`p-3 rounded-lg border transition-all duration-300 ${resolvedTheme === 'light' && theme !== 'dark' ? 'border-blue-600 bg-red-50/10 text-white theme-light:text-gray-900' : 'border-gray-300 text-gray-800 hover:border-gray-600 theme-light:text-gray-800'}`}
        >
          <div className="font-semibold">Light</div>
          <div className="text-xs text-gray-700">Light</div>
        </button>
      </div>
      <p className="text-sm text-gray-700">
        Current: <span className="font-semibold">{theme === 'system' ? `System (${resolvedTheme})` : theme}</span>
      </p>
    </div>
  );
};
