import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { addAccount } from '../../lib/database';
import { getCurrentUserId } from '../../lib/currentUser';

const BANK_OPTIONS = [
  { value: 'BML', label: 'Bank of Maldives (BML)', icon: '🔵', color: '#0066CC' },
  { value: 'MIB', label: 'Maldives Islamic Bank (MIB)', icon: '🟢', color: '#10B981' },
  { value: 'SBI', label: 'State Bank of India', icon: '🔴', color: '#EF4444' },
  { value: 'HSBC', label: 'HSBC Maldives', icon: '🔴', color: '#DC2626' },
  { value: 'Other', label: 'Other Bank', icon: '💳', color: '#6B7280' },
];

export const AddAccountModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    nickname: '',
    startingBalance: '',
    isPrimary: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedBank = BANK_OPTIONS.find(b => b.value === formData.bankName);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userId = getCurrentUserId();
      if (!userId) throw new Error('Not signed in');

      if (!formData.bankName) throw new Error('Please select a bank');
      if (!formData.accountNumber) throw new Error('Please enter account number');
      if (!formData.nickname) throw new Error('Please enter a nickname');

      const startingBalance = parseFloat(formData.startingBalance);
      if (isNaN(startingBalance)) throw new Error('Invalid starting balance');

      await addAccount(Number(userId), {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        nickname: formData.nickname,
        startingBalance,
        isPrimary: formData.isPrimary,
        icon: selectedBank?.icon || '💳',
        color: selectedBank?.color || '#6B7280'
      });

      // Reset form
      setFormData({
        bankName: '',
        accountNumber: '',
        nickname: '',
        startingBalance: '',
        isPrimary: false
      });

      onSuccess && onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Bank Selection */}
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">
            Bank
          </label>
          <select
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            required
          >
            <option value="">Select a bank</option>
            {BANK_OPTIONS.map((bank) => (
              <option key={bank.value} value={bank.value}>
                {bank.icon} {bank.label}
              </option>
            ))}
          </select>
        </div>

        {/* Account Number */}
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">
            Account Number (Last 4 digits)
          </label>
          <Input
            type="text"
            placeholder="e.g., 1234"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            maxLength={4}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            For privacy, only enter last 4 digits (e.g., ****1234)
          </p>
        </div>

        {/* Nickname */}
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">
            Account Nickname
          </label>
          <Input
            type="text"
            placeholder="e.g., Main Card, Savings Account"
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            required
          />
        </div>

        {/* Starting Balance */}
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">
            Current Balance (MVR)
          </label>
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="e.g., 5000.00"
            value={formData.startingBalance}
            onChange={(e) => setFormData({ ...formData, startingBalance: e.target.value })}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the current balance of this account
          </p>
        </div>

        {/* Primary Account */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPrimary"
            checked={formData.isPrimary}
            onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
            className="w-4 h-4 bg-gray-900 border-gray-700 rounded focus:ring-2 focus:ring-red-500"
          />
          <label htmlFor="isPrimary" className="text-sm text-gray-300">
            Set as primary account
          </label>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
