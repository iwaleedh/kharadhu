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
import { Download } from 'lucide-react';
import { downloadCSV } from '../lib/utils';

export const Transactions = () => {
  const { transactions, categories, addTransaction, updateTransaction, deleteTransaction } = useTransactionStore();
  const { currentUser } = useAuthStore();
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    const load = async () => {
      // Load accounts for starting balance derivation
      try {
        const { getCurrentUserId } = await import('../lib/currentUser');
        const userId = getCurrentUserId();
        if (userId) {
          const accs = await getAccounts(Number(userId));
          setAccounts(accs || []);
        } else {
          setAccounts([]);
        }
      } catch (e) {
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

  const transactionsWithBalance = useMemo(() => {
    // If the view effectively shows a single account, seed running balance from that account's starting balance
    const uniqueAccountIds = Array.from(new Set((transactions || []).map(t => t.accountId).filter(Boolean)));
    let seed = startingTotal;
    if (uniqueAccountIds.length === 1) {
      const acc = accounts.find(a => a.id === uniqueAccountIds[0]);
      if (acc) {
        seed = acc.startingBalance || 0;
      }
    }
    return addRunningBalances(transactions, seed);
  }, [transactions, startingTotal, accounts]);

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

  const handleExport = () => {
    downloadCSV(transactions, `transactions-${new Date().toISOString().split('T')[0]}.csv`);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Transactions</h2>
          <p className="text-xs text-gray-800">{transactions.length} total</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="flex items-center space-x-1 text-xs px-3 py-1.5"
        >
          <Download size={14} />
          <span>Export</span>
        </Button>
      </div>

      <TransactionList
        transactions={transactionsWithBalance}
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
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
