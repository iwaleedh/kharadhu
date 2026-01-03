import { CheckCircle2, X, Calendar, DollarSign, MapPin, Hash, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { Button } from './ui/Button';

export const AutoImportPopup = ({ transaction, onImport, onDecline, show }) => {
  if (!show || !transaction) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-white bg-opacity-50 backdrop-blur-sm"
        onClick={onDecline}
      />
      
      {/* Popup */}
      <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-t-2xl sm:rounded-2xl shadow-2xl border border-red-200/50 w-full max-w-md mx-2 overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-red-100/50 p-4 border-b border-red-200/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-full shadow-lg shadow-red-600/50">
                <CheckCircle2 size={24} className="text-gray-900" />
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-lg">Transaction Detected</h3>
                <p className="text-gray-700 text-xs">Auto-parsed from clipboard</p>
              </div>
            </div>
            <button
              onClick={onDecline}
              className="p-2 hover:bg-red-950/50 active:bg-red-900/50 rounded-lg transition-all duration-300"
            >
              <X size={20} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Bank */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-300 rounded-lg">
            <span className="text-sm text-gray-700">🏦 Bank</span>
            <span className="font-bold text-gray-700">{transaction.bank}</span>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50/60 to-red-100/40 border border-red-200/50 rounded-xl shadow-lg shadow-red-900/30">
            <div className="flex items-center space-x-2">
              <DollarSign size={20} className="text-red-900" />
              <span className="text-sm text-red-300">Amount</span>
            </div>
            <span className="text-2xl font-bold text-red-900">
              {formatCurrency(transaction.amount)}
            </span>
          </div>

          {/* Merchant */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-300 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPin size={18} className="text-gray-700" />
              <span className="text-sm text-gray-700">Merchant</span>
            </div>
            <span className="font-semibold text-gray-700 text-right truncate max-w-[60%]">
              {transaction.merchant || 'N/A'}
            </span>
          </div>

          {/* Category */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-300 rounded-lg">
            <span className="text-sm text-gray-700">📁 Category</span>
            <span className="font-semibold text-gray-700">
              {transaction.category}
            </span>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col p-3 bg-gray-800/50 border border-gray-300 rounded-lg">
              <div className="flex items-center space-x-1 mb-1">
                <Calendar size={14} className="text-gray-700" />
                <span className="text-xs text-gray-700">Date</span>
              </div>
              <span className="font-semibold text-gray-700 text-sm">
                {formatDate(transaction.date, 'dd MMM yy')}
              </span>
            </div>
            
            {transaction.time && (
              <div className="flex flex-col p-3 bg-gray-800/50 border border-gray-300 rounded-lg">
                <div className="flex items-center space-x-1 mb-1">
                  <Clock size={14} className="text-gray-700" />
                  <span className="text-xs text-gray-700">Time</span>
                </div>
                <span className="font-semibold text-gray-700 text-sm">
                  {transaction.time}
                </span>
              </div>
            )}
          </div>

          {/* Reference Number */}
          {transaction.referenceNumber && (
            <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-300 rounded-lg">
              <div className="flex items-center space-x-2">
                <Hash size={18} className="text-gray-700" />
                <span className="text-sm text-gray-700">Reference</span>
              </div>
              <span className="font-mono text-sm text-gray-700">
                {transaction.referenceNumber}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 bg-gradient-to-b from-gray-900 to-black border-t border-red-200/30">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={onDecline}
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={onImport}
              className="w-full"
            >
              Import
            </Button>
          </div>
          <p className="text-xs text-gray-800 text-center mt-3">
            Copy bank SMS to auto-detect transactions
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            transform: translateY(100%);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
