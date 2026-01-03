import { Waves } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AccountSwitcher } from './AccountSwitcher';

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/80 border-b border-red-900/30 shadow-2xl shadow-red-900/20">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 slide-up">
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg shadow-lg shadow-red-600/50">
              <Waves size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">Kharadhu</h1>
              <p className="text-sm text-gray-400 dhivehi">ޚަރަދު ބަރަދު ބެލެހެއްޓުން</p>
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
