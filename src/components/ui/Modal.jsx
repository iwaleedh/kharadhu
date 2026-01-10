import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Modal = ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    full: 'max-w-full mx-2',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 fade-in">
      {/* Backdrop - Dark */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={showCloseButton ? onClose : undefined}
      />

      {/* Modal - Dark blue theme */}
      <div
        className={cn(
          'relative rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden slide-up',
          sizes[size]
        )}
        style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
      >
        {/* Header - Dark blue gradient */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            borderColor: '#334155'
          }}
        >
          <h2 className="text-lg font-bold text-white">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 active:bg-slate-600 rounded-lg transition-all duration-200"
            >
              <X size={20} className="text-slate-300" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};
