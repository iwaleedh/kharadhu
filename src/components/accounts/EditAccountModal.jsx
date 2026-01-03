import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { updateAccount } from '../../lib/database';
import { getCurrentUserId } from '../../lib/currentUser';

const BANK_OPTIONS = [
  { value: 'BML', label: 'Bank of Maldives (BML)', icon: '🔵', color: '#0066CC' },
  { value: 'MIB', label: 'Maldives Islamic Bank (MIB)', icon: '🟢', color: '#10B981' },
  { value: 'SBI', label: 'State Bank of India', icon: '🔴', color: '#EF4444' },
  { value: 'HSBC', label: 'HSBC Maldives', icon: '🔴', color: '#DC2626' },
  { value: 'Other', label: 'Other Bank', icon: '💳', color: '#6B7280' },
];

export const EditAccountModal = ({ isOpen, onClose, account, onSuccess }) => {
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    nickname: '',
    isPrimary: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (account) {
      setFormData({
        bankName: account.bankName || '',
        accountNumber: account.accountNumber || '',
        nickname: account.nickname || '',
        isPrimary: account.isPrimary || false
      });
    }
  }, [account]);

  const selectedBank = BANK_OPTIONS.find(b => b.value === formData.bankName);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userId = getCurrentUserId();
      if (!userId) throw new Error('Not signed in');
      if (!account?.id) throw new Error('Invalid account');

      if (!formData.bankName) throw new Error('Please select a bank');
      if (!formData.accountNumber) throw new Error('Please enter account number');
      if (!formData.nickname) throw new Error('Please enter a nickname');

      await updateAccount(Number(userId), account.id, {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        nickname: formData.nickname,
        isPrimary: formData.isPrimary,
        icon: selectedBank?.icon || account.icon || '💳',
        color: selectedBank?.color || account.color || '#6B7280'
      });

      onSuccess && onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-900 bg-red-950/30 border border-red-200/50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Bank Selection */}
        <div>
          <label className="text-sm font-semibold text-gray-800 mb-2 block">
            Bank
          </label>
          <select
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
          <label className="text-sm font-semibold text-gray-800 mb-2 block">
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
        </div>

        {/* Nickname */}
        <div>
          <label className="text-sm font-semibold text-gray-800 mb-2 block">
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

        {/* Primary Account */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPrimary"
            checked={formData.isPrimary}
            onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
            className="w-4 h-4 bg-white border-gray-300 rounded focus:ring-2 focus:ring-red-500"
          />
          <label htmlFor="isPrimary" className="text-sm text-gray-800">
            Set as primary account
          </label>
        </div>

        {/* Balance Info (read-only) */}
        <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-3">
          <p className="text-xs text-gray-700 mb-1">Current Balance:</p>
          <p className="text-lg font-bold text-gray-900">
            MVR {(account?.currentBalance || 0).toFixed(2)}
          </p>
          <p className="text-xs text-gray-700 mt-1">
            Balance is calculated from transactions and cannot be edited directly
          </p>
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
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
