import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { getAccountBalances } from '../../lib/database';
import { getCurrentUserId } from '../../lib/currentUser';
import { formatCurrency } from '../../lib/utils';
import { AddAccountModal } from './AddAccountModal';
import { ReconciliationModal } from './ReconciliationModal';
import { EditAccountModal } from './EditAccountModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { cn } from '../../lib/utils';

export const AccountManager = ({ selectedAccountId }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(null);
  const [reconAccount, setReconAccount] = useState(null);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const userId = getCurrentUserId();
      if (userId) {
        const accountBalances = await getAccountBalances(Number(userId));
        setAccounts(accountBalances);
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-700">
          Loading accounts...
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Accounts</CardTitle>
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1"
            >
              <Plus size={16} />
              <span>Add</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Total Balance */}
          <div className="mb-4 p-4 bg-gradient-to-br from-red-50/30 to-red-100/20 border border-red-200/50 rounded-lg">
            <div className="text-sm text-gray-700 mb-1">Total Balance</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalBalance)}
            </div>
            <div className="text-xs text-gray-700 mt-1">
              Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Account List */}
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-700 mb-4">No accounts yet</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus size={16} className="mr-2" />
                Add Your First Account
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={cn(
                    'w-full p-3 rounded-lg border transition-all duration-300',
                    selectedAccountId === account.id
                      ? 'bg-red-950/50 border-red-200/50'
                      : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {/* Account Icon */}
                      <div
                        className="p-2 rounded-full text-xl"
                        style={{ backgroundColor: `${account.color}20` }}
                      >
                        {account.icon}
                      </div>

                      {/* Account Details */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-900">{account.nickname}</p>
                          {account.isPrimary && (
                            <span className="text-xs bg-red-600 px-2 py-0.5 rounded-full text-gray-900">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">
                          {account.bankName} {account.accountNumber}
                        </p>
                      </div>

                      {/* Balance */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(account.currentBalance || 0)}
                        </p>
                        <p className="text-xs text-gray-700">Balance</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-3">
                      <button
                       onClick={(e) => {
                         e.stopPropagation();
                         setReconAccount(account);
                       }}
                       className="p-1.5 hover:bg-blue-900/40 rounded transition-colors"
                     >
                       <CheckCircle size={16} className="text-blue-400" />
                     </button>
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         setEditingAccount(account);
                       }}
                       className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                     >
                       <Edit2 size={16} className="text-gray-700" />
                     </button>
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         setDeletingAccount(account);
                       }}
                       className="p-1.5 hover:bg-red-900/50 rounded transition-colors"
                     >
                       <Trash2 size={16} className="text-red-900" />
                     </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Account Modal */}
      <AddAccountModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          loadAccounts();
        }}
      />

      {/* Edit Account Modal */}
     {editingAccount && (
       <EditAccountModal
         isOpen={!!editingAccount}
         account={editingAccount}
         onClose={() => setEditingAccount(null)}
         onSuccess={() => {
           setEditingAccount(null);
           loadAccounts();
         }}
       />
     )}

     {/* Reconciliation Modal */}
     {reconAccount && (
       <ReconciliationModal
         isOpen={!!reconAccount}
         account={reconAccount}
         onClose={() => setReconAccount(null)}
         onAdjusted={() => {
           setReconAccount(null);
           loadAccounts();
         }}
       />
     )}

     {/* Delete Confirmation */}
      {deletingAccount && (
        <ConfirmDialog
          isOpen={!!deletingAccount}
          onClose={() => setDeletingAccount(null)}
          title="Delete Account?"
          message={`Are you sure you want to delete "${deletingAccount.nickname}"?`}
          confirmText="Delete"
          destructive
          onConfirm={async () => {
            try {
              const userId = getCurrentUserId();
              const { deleteAccount } = await import('../../lib/database');
              await deleteAccount(Number(userId), deletingAccount.id);
              setDeletingAccount(null);
              loadAccounts();
            } catch (error) {
              alert(error.message);
            }
          }}
        />
      )}
    </>
  );
};
