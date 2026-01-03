import { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Wallet, AlertCircle } from 'lucide-react';

export const StartingBalanceModal = ({ isOpen, onSubmit, loading, error }) => {
  const [balance, setBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const canSubmit = useMemo(() => {
    const num = parseFloat(balance);
    const cleanAccount = accountNumber.trim();
    return !isNaN(num) && num >= 0 && cleanAccount.length >= 4;
  }, [balance, accountNumber]);

  const handleSubmit = async () => {
    const num = parseFloat(balance);
    const cleanAccount = accountNumber.trim();
    if (!isNaN(num) && num >= 0 && cleanAccount.length >= 4) {
      await onSubmit(num, cleanAccount);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {}} // Cannot close - must enter balance
      title="Set Starting Balance" 
      size="md"
      showCloseButton={false}
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-red-50/30 to-red-100/20 border border-red-200/50 rounded-lg">
          <div className="bg-red-600 p-3 rounded-full">
            <Wallet size={24} className="text-gray-900" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Welcome to Kharadhu!</h3>
            <p className="text-sm text-gray-800">Expense Tracker</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-800">
              <p className="font-semibold text-blue-900 mb-1">Important:</p>
              <p className="text-gray-900">Enter your current account balance. This will be your <strong>starting point</strong> for tracking all transactions.</p>
              <p className="mt-2 text-orange-700 font-semibold">⚠️ This can only be set once and cannot be changed later.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-900 bg-red-50 border border-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-semibold text-gray-800 mb-2 block">
            Account Number (Last 4 digits)
          </label>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="e.g., 1234"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="text-lg font-semibold"
            maxLength={4}
            autoFocus
          />
          <p className="text-xs text-gray-700 mt-2">
            Enter the last 4 digits of your bank account number.
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-800 mb-2 block">
            Starting Balance (MVR)
          </label>
          <Input
            type="number"
            inputMode="decimal"
            placeholder="e.g., 10000.00"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="text-lg font-semibold"
          />
          <p className="text-xs text-gray-700 mt-2">
            Enter 0 if you want to start fresh, or enter your current bank balance.
          </p>
        </div>

        <div className="bg-white/50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Examples:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Starting fresh: <span className="text-gray-900 font-mono">0</span></li>
            <li>• Bank balance: <span className="text-gray-900 font-mono">15000</span></li>
            <li>• With decimals: <span className="text-gray-900 font-mono">15000.50</span></li>
          </ul>
        </div>

        <Button
          className="w-full"
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
        >
          {loading ? 'Setting Balance...' : 'Set Starting Balance'}
        </Button>

        <p className="text-xs text-gray-700 text-center">
          All future balance calculations will be based on this starting balance.
        </p>
      </div>
    </Modal>
  );
};
