import { Home, Receipt, PieChart, Settings, Plus, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export const BottomNav = ({ activeTab, onTabChange, onAddClick, onProfileClick }) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'add', label: 'Add', icon: Plus, isSpecial: true },
    { id: 'reports', label: 'Reports', icon: PieChart },
    { id: 'profile', label: 'Profile', icon: User, isProfile: true },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t shadow-lg z-40 safe-area-bottom"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155'
      }}
    >
      <div className="px-2">
        <div className="flex items-center justify-around py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (tab.isSpecial) {
              return (
                <button
                  key={tab.id}
                  onClick={onAddClick}
                  className="flex flex-col items-center justify-center -mt-6"
                >
                  <div
                    className="p-3 rounded-full shadow-2xl active:scale-95 transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                      boxShadow: '0 8px 24px rgba(59, 130, 246, 0.5)'
                    }}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="text-xs text-slate-300 mt-1 font-medium">{tab.label}</span>
                </button>
              );
            }

            if (tab.isProfile) {
              return (
                <button
                  key={tab.id}
                  onClick={onProfileClick}
                  className={cn(
                    'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 active:scale-95',
                    isActive ? 'bg-blue-500/10' : ''
                  )}
                >
                  <Icon size={24} className={cn(
                    'transition-all duration-300',
                    isActive ? 'text-blue-400' : 'text-slate-400'
                  )} />
                  <span className={cn(
                    'text-xs mt-1 font-medium transition-all duration-300',
                    isActive ? 'text-blue-400' : 'text-slate-400'
                  )}>
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 active:scale-95',
                  isActive ? 'bg-blue-500/10' : ''
                )}
              >
                <Icon size={24} className={cn(
                  'transition-all duration-300',
                  isActive ? 'text-blue-400' : 'text-slate-400'
                )} />
                <span className={cn(
                  'text-xs mt-1 font-medium transition-all duration-300',
                  isActive ? 'text-blue-400' : 'text-slate-400'
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
