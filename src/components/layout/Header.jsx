import { Waves } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AccountSwitcher } from './AccountSwitcher';

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/95 border-b border-orange-100 shadow-lg">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 slide-up">
            <div className="bg-gradient-to-br from-orange-600 to-red-700 p-2 rounded-lg shadow-lg shadow-orange-500/30">
              <Waves size={24} className="text-gray-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-700 bg-clip-text text-transparent">Kharadhu</h1>
              <p className="text-sm text-gray-800">Expense Tracker</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <AccountSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
