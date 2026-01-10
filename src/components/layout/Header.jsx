import { Waves, Shield, LogOut } from 'lucide-react';

export const Header = ({ showAdmin, onAdminClick, onSignOut, displayName }) => {
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
                Aamdhanee
              </h1>
              <p className="text-xs text-slate-400">{displayName || 'Finance Tracker'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {showAdmin && (
              <button
                onClick={onAdminClick}
                className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
                title="Admin Dashboard"
              >
                <Shield size={20} />
              </button>
            )}
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
