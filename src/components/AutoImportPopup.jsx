import { CheckCircle2, X, Calendar, DollarSign, MapPin, Hash, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { Button } from './ui/Button';

export const AutoImportPopup = ({ transaction, onImport, onDecline, show }) => {
  if (!show || !transaction) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onDecline}
      />
      
      {/* Popup */}
      <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-t-2xl sm:rounded-2xl shadow-2xl border border-red-900/50 w-full max-w-md mx-2 overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 to-red-900/50 p-4 border-b border-red-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-full shadow-lg shadow-red-600/50">
                <CheckCircle2 size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg dhivehi leading-tight">
                  ހަރަދު ފެނުނީ!
                </h3>
                <p className="text-gray-400 text-xs leading-tight">
                  New Transaction Detected
                </p>
              </div>
            </div>
            <button
              onClick={onDecline}
              className="p-2 hover:bg-red-950/50 active:bg-red-900/50 rounded-lg transition-all duration-300"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Bank */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
            <span className="text-sm text-gray-400">🏦 Bank</span>
            <span className="font-bold text-gray-200">{transaction.bank}</span>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-950/60 to-red-900/40 border border-red-900/50 rounded-xl shadow-lg shadow-red-900/30">
            <div className="flex items-center space-x-2">
              <DollarSign size={20} className="text-red-400" />
              <div>
                <span className="text-xs text-red-300 block dhivehi leading-tight">އަދަދު</span>
                <span className="text-xs text-red-400/70 leading-tight">Amount</span>
              </div>
            </div>
            <span className="text-2xl font-bold text-red-400">
              {formatCurrency(transaction.amount)}
            </span>
          </div>

          {/* Merchant */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPin size={18} className="text-gray-500" />
              <span className="text-sm text-gray-400">Merchant</span>
            </div>
            <span className="font-semibold text-gray-200 text-right truncate max-w-[60%]">
              {transaction.merchant || 'N/A'}
            </span>
          </div>

          {/* Category */}
          <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
            <span className="text-sm text-gray-400">📁 Category</span>
            <span className="font-semibold text-gray-200 dhivehi">
              {transaction.category}
            </span>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
              <div className="flex items-center space-x-1 mb-1">
                <Calendar size={14} className="text-gray-500" />
                <span className="text-xs text-gray-400">Date</span>
              </div>
              <span className="font-semibold text-gray-200 text-sm">
                {formatDate(transaction.date, 'dd MMM yy')}
              </span>
            </div>
            
            {transaction.time && (
              <div className="flex flex-col p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center space-x-1 mb-1">
                  <Clock size={14} className="text-gray-500" />
                  <span className="text-xs text-gray-400">Time</span>
                </div>
                <span className="font-semibold text-gray-200 text-sm">
                  {transaction.time}
                </span>
              </div>
            )}
          </div>

          {/* Reference Number */}
          {transaction.referenceNumber && (
            <div className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <Hash size={18} className="text-gray-500" />
                <span className="text-sm text-gray-400">Reference</span>
              </div>
              <span className="font-mono text-sm text-gray-200">
                {transaction.referenceNumber}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 bg-gradient-to-b from-gray-900 to-black border-t border-red-900/30">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={onDecline}
              className="w-full"
            >
              <span className="dhivehi block leading-tight">ނުކުރާ</span>
              <span className="text-xs leading-tight">Cancel</span>
            </Button>
            <Button
              variant="success"
              onClick={onImport}
              className="w-full"
            >
              <span className="dhivehi block leading-tight">އިތުރުކުރުން</span>
              <span className="text-xs leading-tight">Import</span>
            </Button>
          </div>
          <p className="text-xs text-gray-600 text-center mt-3">
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
