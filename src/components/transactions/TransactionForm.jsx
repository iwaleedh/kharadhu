import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { useTransactionStore } from '../../store/transactionStore';
import { getAccounts } from '../../lib/database';
import { getCurrentUserId } from '../../lib/currentUser';

export const TransactionForm = ({ transaction, onSuccess, onCancel, preselectedType }) => {
  const { categories } = useTransactionStore();
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState(transaction || {
    date: new Date().toISOString().split('T')[0],
    type: preselectedType || 'debit',
    amount: '',
    category: '',
    merchant: '',
    accountId: '',
    bank: 'BML',
    accountNumber: '',
    description: '',
  });

  // Load accounts
  useEffect(() => {
    const loadAccounts = async () => {
      const userId = getCurrentUserId();
      if (userId) {
        const userAccounts = await getAccounts(Number(userId));
        setAccounts(userAccounts);
        
        // Auto-select primary account if no account selected
        if (!formData.accountId && userAccounts.length > 0) {
          const primaryAccount = userAccounts.find(acc => acc.isPrimary) || userAccounts[0];
          setFormData(prev => ({
            ...prev,
            accountId: primaryAccount.id,
            bank: primaryAccount.bankName,
            accountNumber: primaryAccount.accountNumber
          }));
        }
      }
    };
    loadAccounts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If account selection changes, update bank and accountNumber too
    if (name === 'accountId') {
      const selectedAccount = accounts.find(acc => acc.id === Number(value));
      if (selectedAccount) {
        setFormData(prev => ({
          ...prev,
          accountId: Number(value),
          bank: selectedAccount.bankName,
          accountNumber: selectedAccount.accountNumber
        }));
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
    };
    
    onSuccess(transactionData);
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');
  const availableCategories = formData.type === 'credit' ? incomeCategories : expenseCategories;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={[
            { value: 'debit', label: 'Expense' },
            { value: 'credit', label: 'Income' },
          ]}
          className="text-sm"
        />
        
        <Input
          label="Amount (MVR)"
          name="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={handleChange}
          required
          className="text-sm"
        />
      </div>

      <Input
        label="Date"
        name="date"
        type="date"
        value={formData.date}
        onChange={handleChange}
        required
        className="text-sm"
      />

      <Select
        label="Category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        required
        className="text-sm dhivehi"
      >
        <option value="">Select a category</option>
        {availableCategories.map(cat => (
          <option key={cat.id} value={cat.name}>
            {cat.icon} {cat.nameDv || cat.name} ({cat.name})
          </option>
        ))}
      </Select>

      <Input
        label="Merchant/Description"
        name="merchant"
        value={formData.merchant}
        onChange={handleChange}
        placeholder="e.g., FOODCO, Dhiraagu"
        className="text-sm"
      />

      {/* Account Selection */}
      <div>
        <label className="text-sm font-semibold text-gray-300 mb-2 block">
          Account
        </label>
        {accounts.length === 0 ? (
          <div className="text-sm text-yellow-400 bg-yellow-950/30 border border-yellow-900/50 p-3 rounded-lg">
            No accounts found. Please add an account first.
          </div>
        ) : (
          <select
            name="accountId"
            value={formData.accountId}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
            required
          >
            <option value="">Select an account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.icon} {account.nickname} ({account.bankName} {account.accountNumber})
                {account.isPrimary && ' - Primary'}
              </option>
            ))}
          </select>
        )}
      </div>

      <Input
        label="Notes (Optional)"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Additional notes..."
        className="text-sm"
      />

      <div className="flex space-x-2 pt-3">
        <Button type="submit" variant="primary" className="flex-1 text-sm">
          {transaction ? 'Update' : 'Add'} Transaction
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="text-sm">
          Cancel
        </Button>
      </div>
    </form>
  );
};
