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
    <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-white/98 border-t border-orange-100 shadow-lg z-40 safe-area-bottom">
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
                  <div className="bg-gradient-to-br from-orange-600 to-red-700 p-3 rounded-full shadow-2xl shadow-orange-500/50 hover:shadow-blue-600/60 active:scale-95 transition-all duration-300">
                    <Icon size={22} className="text-gray-900" />
                  </div>
                  <span className="text-xs text-gray-700 mt-1 font-medium">{tab.label}</span>
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
                    isActive ? 'bg-orange-50' : ''
                  )}
                >
                  <Icon size={24} className={cn(
                    'transition-all duration-300',
                    isActive ? 'text-orange-900' : 'text-gray-700'
                  )} />
                  <span className={cn(
                    'text-xs mt-1 font-medium transition-all duration-300',
                    isActive ? 'text-orange-900' : 'text-gray-800'
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
                  isActive 
                    ? 'bg-orange-50' 
                    : ''
                )}
              >
                <Icon size={24} className={cn(
                  'transition-all duration-300',
                  isActive ? 'text-orange-900' : 'text-gray-700'
                )} />
                <span className={cn(
                  'text-xs mt-1 font-medium transition-all duration-300',
                  isActive ? 'text-orange-900' : 'text-gray-800'
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
