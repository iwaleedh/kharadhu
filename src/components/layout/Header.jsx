import { Waves } from 'lucide-react';
import { AccountSwitcher } from './AccountSwitcher';

export const Header = () => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b shadow-lg"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155'
      }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 slide-up">
            <div
              className="p-2 rounded-lg shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)'
              }}
            >
              <Waves size={24} className="text-white" />
            </div>
            <div>
              <h1
                className="text-xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Kharadhu
              </h1>
              <p className="text-sm text-slate-400">Expense Tracker</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <AccountSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};
