import { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Wallet, AlertCircle } from 'lucide-react';

export const StartingBalanceModal = ({ isOpen, onSubmit, loading, error }) => {
  const [balance, setBalance] = useState('');

  const canSubmit = useMemo(() => {
    const num = parseFloat(balance);
    return !isNaN(num) && num >= 0;
  }, [balance]);

  const handleSubmit = async () => {
    const num = parseFloat(balance);
    if (!isNaN(num) && num >= 0) {
      await onSubmit(num);
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
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-red-950/30 to-red-900/20 border border-red-900/50 rounded-lg">
          <div className="bg-red-600 p-3 rounded-full">
            <Wallet size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Welcome to Kharadhu!</h3>
            <p className="text-sm text-gray-300 dhivehi">ޚަރަދު ބަރަދު ބެލެހެއްޓުން</p>
          </div>
        </div>

        <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">Important:</p>
              <p>Enter your current account balance. This will be your <strong>starting point</strong> for tracking all transactions.</p>
              <p className="mt-2 text-yellow-400 font-semibold">⚠️ This can only be set once and cannot be changed later.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">
            <span className="dhivehi block">ފެށުމުގެ ބޭލަންސް</span>
            <span className="text-xs text-gray-400">Starting Balance (MVR)</span>
          </label>
          <Input
            type="number"
            inputMode="decimal"
            placeholder="e.g., 10000.00"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="text-lg font-semibold"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-2">
            Enter 0 if you want to start fresh, or enter your current bank balance.
          </p>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Examples:</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Starting fresh: <span className="text-white font-mono">0</span></li>
            <li>• Bank balance: <span className="text-white font-mono">15000</span></li>
            <li>• With decimals: <span className="text-white font-mono">15000.50</span></li>
          </ul>
        </div>

        <Button
          className="w-full"
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
        >
          {loading ? 'Setting Balance...' : 'Set Starting Balance'}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          All future balance calculations will be based on this starting balance.
        </p>
      </div>
    </Modal>
  );
};
