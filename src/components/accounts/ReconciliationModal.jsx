import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { calculateReconciliation } from '../../lib/balanceUtils';
import { calculateAccountBalance, addTransaction } from '../../lib/database';
import { getCurrentUserId } from '../../lib/currentUser';

export const ReconciliationModal = ({ isOpen, account, onClose, onAdjusted }) => {
  const [actualBalance, setActualBalance] = useState('');
  const [calculated, setCalculated] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBalance = async () => {
      setError(null);
      try {
        const userId = getCurrentUserId();
        if (!userId || !account?.id) return;
        const calc = await calculateAccountBalance(Number(userId), account.id);
        setCalculated(calc || 0);
      } catch (e) {
        setError(e?.message || 'Failed to calculate balance');
      }
    };
    if (isOpen && account?.id) {
      loadBalance();
    }
  }, [isOpen, account]);

  const recon = useMemo(() => {
    const actualNum = Number(actualBalance);
    if (!Number.isFinite(actualNum)) {
      return { difference: 0, needsAdjustment: false, adjustmentAmount: 0 };
    }
    return calculateReconciliation(calculated, actualNum);
  }, [actualBalance, calculated]);

  const handleAdjust = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = getCurrentUserId();
      if (!userId || !account?.id) throw new Error('Not signed in');
      if (!recon.needsAdjustment) {
        onClose && onClose();
        return;
      }
      const tx = {
        date: new Date().toISOString(),
        type: recon.adjustmentType,
        amount: recon.adjustmentAmount,
        category: 'Balance Adjustment',
        merchant: 'Reconciliation',
        description: `Balance reconciliation adjustment`,
        accountId: account.id,
        bank: account.bankName,
        accountNumber: account.accountNumber,
        isReconciliation: true,
      };
      await addTransaction(Number(userId), tx);
      onAdjusted && onAdjusted();
      onClose && onClose();
    } catch (e) {
      setError(e?.message || 'Failed to create adjustment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={account ? `Reconcile ${account.nickname}` : 'Reconcile Balance'}>
      <div className="space-y-3">
        {error && (
          <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 p-3 rounded-lg">{error}</div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-400">Calculated</p>
            <p className="text-lg font-bold text-white">MVR {calculated.toFixed(2)}</p>
          </div>
          <div>
            <Input
              label="Actual (from bank)"
              type="number"
              inputMode="decimal"
              step="0.01"
              value={actualBalance}
              onChange={(e) => setActualBalance(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
          <p className="text-sm text-gray-300">Difference: <span className={recon.difference > 0 ? 'text-green-400' : recon.difference < 0 ? 'text-red-400' : 'text-gray-400'}>{recon.difference.toFixed(2)}</span></p>
          {recon.needsAdjustment ? (
            <p className="text-xs text-gray-500 mt-1">This will create a {recon.adjustmentType === 'credit' ? 'credit (income)' : 'debit (expense)'} adjustment of MVR {recon.adjustmentAmount.toFixed(2)}.</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">No adjustment needed.</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleAdjust} disabled={loading || !recon.needsAdjustment}>{loading ? 'Adjusting...' : 'Create Adjustment'}</Button>
        </div>
      </div>
    </Modal>
  );
};