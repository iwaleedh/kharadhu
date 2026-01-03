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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={showCloseButton ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className={cn('relative bg-gradient-to-br from-gray-900 to-black rounded-t-2xl sm:rounded-2xl shadow-2xl w-full border border-gray-800', sizes[size], 'max-h-[90vh] overflow-hidden slide-up')}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-red-900/30 bg-gradient-to-r from-red-950/20 to-transparent">
          <h2 className="text-lg font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-950/50 active:bg-red-900/50 rounded-lg transition-all duration-300"
            >
              <X size={20} className="text-gray-400" />
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
