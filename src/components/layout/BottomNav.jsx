import { Home, Receipt, PieChart, Settings, Plus, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export const BottomNav = ({ activeTab, onTabChange, onAddClick, onProfileClick }) => {
  const tabs = [
    { id: 'dashboard', label: 'ފުރަތަމަ', labelEn: 'Home', icon: Home },
    { id: 'transactions', label: 'ހަރަދު', labelEn: 'Transactions', icon: Receipt },
    { id: 'add', label: 'އާ', labelEn: 'Add', icon: Plus, isSpecial: true },
    { id: 'reports', label: 'ރިޕޯޓް', labelEn: 'Reports', icon: PieChart },
    { id: 'profile', label: 'ޕްރޮފައިލް', labelEn: 'Profile', icon: User, isProfile: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-black/80 border-t border-red-900/30 shadow-2xl shadow-red-900/20 z-40 safe-area-bottom">
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
                  <div className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-full shadow-2xl shadow-red-600/50 hover:shadow-red-500/60 active:scale-95 transition-all duration-300">
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-300 dhivehi leading-tight">{tab.label}</span>
                    <span className="text-[10px] text-gray-500 leading-tight">{tab.labelEn}</span>
                  </div>
                </button>
              );
            }
            
            if (tab.isProfile) {
              return (
                <button
                  key={tab.id}
                  onClick={onProfileClick}
                  className={cn(
                    'flex flex-col items-center justify-center py-1.5 px-2 rounded-lg transition-all duration-300 active:scale-95',
                    isActive ? 'bg-red-950/50' : ''
                  )}
                >
                  <Icon size={24} className={cn(
                    'transition-all duration-300',
                    isActive ? 'text-red-500' : 'text-gray-500'
                  )} />
                  <div className="flex flex-col items-center">
                    <span className={cn(
                      'text-sm font-semibold dhivehi leading-tight transition-all duration-300',
                      isActive ? 'text-red-500' : 'text-gray-400'
                    )}>
                      {tab.label}
                    </span>
                    <span className={cn(
                      'text-xs leading-tight transition-all duration-300',
                      isActive ? 'text-red-400' : 'text-gray-600'
                    )}>
                      {tab.labelEn}
                    </span>
                  </div>
                </button>
              );
            }
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex flex-col items-center justify-center py-1.5 px-2 rounded-lg transition-all duration-300 active:scale-95',
                  isActive 
                    ? 'bg-red-950/50' 
                    : ''
                )}
              >
                <Icon size={24} className={cn(
                  'transition-all duration-300',
                  isActive ? 'text-red-500' : 'text-gray-500'
                )} />
                <div className="flex flex-col items-center">
                  <span className={cn(
                    'text-sm font-semibold dhivehi leading-tight transition-all duration-300',
                    isActive ? 'text-red-500' : 'text-gray-400'
                  )}>
                    {tab.label}
                  </span>
                  <span className={cn(
                    'text-xs leading-tight transition-all duration-300',
                    isActive ? 'text-red-400' : 'text-gray-600'
                  )}>
                    {tab.labelEn}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
