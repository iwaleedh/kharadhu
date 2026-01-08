import { useState, useEffect, useMemo } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { TransactionList } from '../components/transactions/TransactionList';
import { addRunningBalances } from '../lib/balanceUtils';
import { getAccounts } from '../lib/database';
import { useAuthStore } from '../store/authStore';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { Button } from '../components/ui/Button';
import { Download, Search, Filter, X, FileText } from 'lucide-react';
import { downloadCSV } from '../lib/utils';
import { generatePDFReport } from '../lib/pdfExport';

export const Transactions = () => {
  const { transactions, categories, addTransaction, updateTransaction, deleteTransaction } = useTransactionStore();
  const { currentUser } = useAuthStore();
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    type: '',
    minAmount: '',
    maxAmount: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { getCurrentUserId } = await import('../lib/currentUser');
        const userId = getCurrentUserId();
        if (userId) {
          const accs = await getAccounts(Number(userId));
          setAccounts(accs || []);
        } else {
          setAccounts([]);
        }
      } catch {
        setAccounts([]);
      }
    };
    load();
  }, [currentUser]);

  const startingTotal = useMemo(() => {
    if (accounts && accounts.length > 0) {
      return accounts.reduce((sum, a) => sum + (a.startingBalance || 0), 0);
    }
    return currentUser?.startingBalance || 0;
  }, [accounts, currentUser]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let result = [...(transactions || [])];

    // Search query - search in merchant, description, category
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        (t.merchant?.toLowerCase().includes(query)) ||
        (t.description?.toLowerCase().includes(query)) ||
        (t.category?.toLowerCase().includes(query))
      );
    }

    // Date range filter
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter(t => new Date(t.date) >= start);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(t => new Date(t.date) <= end);
    }

    // Category filter
    if (filters.category) {
      result = result.filter(t => t.category === filters.category);
    }

    // Type filter
    if (filters.type) {
      result = result.filter(t => t.type === filters.type);
    }

    // Amount range filter
    if (filters.minAmount) {
      result = result.filter(t => t.amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      result = result.filter(t => t.amount <= parseFloat(filters.maxAmount));
    }

    return result;
  }, [transactions, searchQuery, filters]);

  const transactionsWithBalance = useMemo(() => {
    const uniqueAccountIds = Array.from(new Set((filteredTransactions || []).map(t => t.accountId).filter(Boolean)));
    let seed = startingTotal;
    if (uniqueAccountIds.length === 1) {
      const acc = accounts.find(a => a.id === uniqueAccountIds[0]);
      if (acc) {
        seed = acc.startingBalance || 0;
      }
    }
    return addRunningBalances(filteredTransactions, seed);
  }, [filteredTransactions, startingTotal, accounts]);

  const hasActiveFilters = searchQuery || Object.values(filters).some(v => v);

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      startDate: '',
      endDate: '',
      category: '',
      type: '',
      minAmount: '',
      maxAmount: '',
    });
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setConfirmDeleteId(id);
  };

  const handleFormSuccess = async (transactionData) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, transactionData);
    } else {
      await addTransaction(transactionData);
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleExportCSV = () => {
    downloadCSV(filteredTransactions, `transactions-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportPDF = () => {
    generatePDFReport(filteredTransactions, categories, currentUser);
  };

  return (
    <div className="space-y-3 pb-4">
      <ConfirmDialog
        isOpen={confirmDeleteId != null}
        onClose={() => setConfirmDeleteId(null)}
        title="Delete transaction?"
        message="Are you sure you want to delete this transaction?"
        confirmText="Delete"
        destructive
        requireText="DELETE"
        requireTextLabel="Type"
        onConfirm={async () => {
          if (confirmDeleteId == null) return;
          await deleteTransaction(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />

      {/* Header with export buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Transactions</h2>
          <p className="text-xs text-gray-800">
            {filteredTransactions.length}{hasActiveFilters ? ` of ${transactions.length}` : ''} total
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center space-x-1 text-xs px-2 py-1.5"
          >
            <Download size={14} />
            <span>CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="flex items-center space-x-1 text-xs px-2 py-1.5"
          >
            <FileText size={14} />
            <span>PDF</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search merchant, description..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <Button
          variant={showFilters ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-1 px-3 py-2"
        >
          <Filter size={14} />
          <span className="text-xs">Filters</span>
        </Button>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center space-x-1 px-2 py-2"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-3 bg-white border border-gray-200 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-900"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-900"
              >
                <option value="">All Types</option>
                <option value="debit">Expense</option>
                <option value="credit">Income</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Min Amount</label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                placeholder="0"
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Max Amount</label>
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                placeholder="∞"
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-900"
              />
            </div>
          </div>
        </div>
      )}

      <TransactionList
        transactions={transactionsWithBalance}
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchQuery={searchQuery}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      >
        <TransactionForm
          transaction={editingTransaction}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingTransaction(null);
          }}
        />
      </Modal>
    </div>
  );
};

