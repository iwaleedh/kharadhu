import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Modal } from './components/ui/Modal';
import { SMSImport } from './components/transactions/SMSImport';
import { TransactionForm } from './components/transactions/TransactionForm';
import { ReceiptScan } from './components/transactions/ReceiptScan';
import { SMSBatchImport } from './components/transactions/SMSBatchImport';
import { AutoImportPopup } from './components/AutoImportPopup';
import { useTransactionStore } from './store/transactionStore';
import { useAutoImport } from './hooks/useAutoImport';
import { FileText, MessageSquare, Camera } from 'lucide-react';
import { Button } from './components/ui/Button';

import { ThemeProvider } from './contexts/ThemeContext';
import { Auth } from './pages/Auth';
import { useAuthStore } from './store/authStore';
import { StartingBalanceModal } from './components/auth/StartingBalanceModal';
import { getSecuritySettings } from './lib/securitySettings';
import { QuickAddWidget } from './components/widgets/QuickAddWidget';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMethod, setAddMethod] = useState(null); // 'sms' | 'sms-batch' | 'manual' | 'receipt'
  const [preselectedType, setPreselectedType] = useState(null); // 'credit' or 'debit'
  const [initialSmsText, setInitialSmsText] = useState('');
  const [batchSmsText, setBatchSmsText] = useState('');
  const { init, addTransaction } = useTransactionStore();
  const { currentUserId, currentUser, setStartingBalance, signOut, loading: authLoading, error: authError, init: initAuth } = useAuthStore();
  // Inactivity lock (auto sign-out)
  useEffect(() => {
    const { idleTimeoutMinutes } = getSecuritySettings();
    if (!currentUserId || !idleTimeoutMinutes || idleTimeoutMinutes <= 0) return;

    let timerId;
    const resetTimer = () => {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => {
        signOut();
      }, idleTimeoutMinutes * 60 * 1000);
    };

    const activityEvents = ['mousemove', 'keydown', 'touchstart'];
    activityEvents.forEach((ev) => window.addEventListener(ev, resetTimer));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') resetTimer();
    });

    resetTimer();

    return () => {
      if (timerId) clearTimeout(timerId);
      activityEvents.forEach((ev) => window.removeEventListener(ev, resetTimer));
      document.removeEventListener('visibilitychange', resetTimer);
    };
  }, [currentUserId, signOut]);

  // Auto-import hook
  const {
    showImportPopup,
    pendingTransaction,
    importTransaction,
    declineImport,
  } = useAutoImport();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    // Re-load user-scoped data when account changes.
    init();
  }, [init, currentUserId]);

  const handleAddClick = () => {
    setShowAddModal(true);
    setAddMethod(null);
    setPreselectedType(null);
    setInitialSmsText('');
  };

  const handleAddIncome = () => {
    setShowAddModal(true);
    setAddMethod('manual');
    setPreselectedType('credit');
    setInitialSmsText('');
  };

  const handleAddExpense = () => {
    setShowAddModal(true);
    setAddMethod('manual');
    setPreselectedType('debit');
    setInitialSmsText('');
  };

  const handleSMSImport = async (transactionData) => {
    await addTransaction(transactionData);
    setShowAddModal(false);
    setAddMethod(null);
    setInitialSmsText('');
  };

  const handleImportFromClipboard = async () => {
    try {
      if (!navigator.clipboard?.readText) {
        alert('Clipboard not supported in this browser. Please paste into SMS box instead.');
        setAddMethod('sms');
        return;
      }
      const text = await navigator.clipboard.readText();
      if (!text?.trim()) {
        alert('Clipboard is empty. Copy an SMS and try again.');
        return;
      }
      // If clipboard contains multiple messages, open batch import
      const multi = text.trim().split(/\n\s*\n|\n-{3,}\n|\r\n\r\n/).filter(Boolean);
      if (multi.length > 1) {
        setBatchSmsText(text);
        setAddMethod('sms-batch');
        return;
      }

      setInitialSmsText(text);
      setAddMethod('sms');
    } catch (e) {
      console.error(e);
      alert('Clipboard access blocked. Please paste into the SMS box instead.');
      setAddMethod('sms');
    }
  };

  const handleManualAdd = async (transactionData) => {
    await addTransaction(transactionData);
    setShowAddModal(false);
    setAddMethod(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard
          onViewTransactions={() => setActiveTab('transactions')}
          onAddIncome={handleAddIncome}
          onAddExpense={handleAddExpense}
        />;
      case 'transactions':
        return <Transactions />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  if (!currentUserId) {
    return (
      <ThemeProvider>
        <Auth />
      </ThemeProvider>
    );
  }

  const handleSetStartingBalance = async (balance, accountNumber) => {
    await setStartingBalance({ userId: currentUserId, balance, accountNumber });
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <Header />

        {/* Starting Balance Modal - Shows only once per user */}
        <StartingBalanceModal
          isOpen={!!currentUser && (currentUser.startingBalance === null || currentUser.startingBalance === undefined)}
          onSubmit={handleSetStartingBalance}
          loading={authLoading}
          error={authError}
        />

        <main className="px-3 py-3 pt-[72px] pb-20">
          {renderContent()}
        </main>

        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddClick={handleAddClick}
          onProfileClick={() => setActiveTab('profile')}
        />

        {/* Quick Add Floating Widget */}
        <QuickAddWidget />

        {/* Auto-Import Popup */}
        <AutoImportPopup
          transaction={pendingTransaction}
          show={showImportPopup}
          onImport={async () => {
            const success = await importTransaction();
            if (success) {
              // Could show success notification here
              console.log('Transaction imported successfully!');
            }
          }}
          onDecline={declineImport}
        />

        {/* Add Transaction Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setAddMethod(null);
          }}
          title={addMethod ? (addMethod === 'sms' ? 'Import from SMS' : addMethod === 'sms-batch' ? 'Batch Import SMS' : addMethod === 'receipt' ? 'Scan Receipt' : 'Add Transaction') : 'Add Transaction'}
          size="md"
        >
          {!addMethod ? (
            <div className="space-y-3">
              <p className="text-gray-800 mb-4">Choose how you'd like to add your transaction:</p>

              <button
                onClick={() => setAddMethod('sms')}
                className="w-full p-6 bg-gradient-to-br from-ocean-50 to-ocean-100 hover:from-ocean-100 hover:to-ocean-200 border-2 border-orange-200 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <MessageSquare size={24} className="text-gray-900" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-orange-900 text-base">Import from SMS</h3>
                    <p className="text-xs text-orange-900 mt-1">
                      Paste your BML or MIB transaction SMS
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleImportFromClipboard}
                className="w-full p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-green-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <MessageSquare size={24} className="text-gray-900" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-emerald-500 text-base">Import from Clipboard</h3>
                    <p className="text-xs text-emerald-500 mt-1">
                      Copy an SMS, then tap to auto-parse
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAddMethod('receipt')}
                className="w-full p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <Camera size={24} className="text-gray-900" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-purple-900 text-base">Scan Receipt</h3>
                    <p className="text-xs text-purple-700 mt-1">
                      Offline OCR from a photo
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAddMethod('manual')}
                className="w-full p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-2 border-gray-200 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <FileText size={24} className="text-gray-900" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900 text-base">Manual Entry</h3>
                    <p className="text-xs text-gray-700 mt-1">
                      Enter transaction details manually
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ) : addMethod === 'sms' ? (
            <SMSImport
              onImport={handleSMSImport}
              onCancel={() => {
                setAddMethod(null);
                setInitialSmsText('');
                setBatchSmsText('');
              }}
              initialText={initialSmsText}
              autoParse={!!initialSmsText}
            />
          ) : addMethod === 'sms-batch' ? (
            <SMSBatchImport
              text={batchSmsText}
              onCancel={() => {
                setAddMethod(null);
                setBatchSmsText('');
              }}
              onImportMany={async (parsedList) => {
                // Import sequentially to reuse existing addTransaction flow
                for (const t of parsedList) {
                  await addTransaction(t);
                }
                setShowAddModal(false);
                setAddMethod(null);
                setBatchSmsText('');
              }}
            />
          ) : addMethod === 'receipt' ? (
            <ReceiptScan
              onImport={async (tx) => {
                await addTransaction(tx);
                setShowAddModal(false);
                setAddMethod(null);
              }}
              onCancel={() => setAddMethod(null)}
            />
          ) : (
            <TransactionForm
              onSuccess={handleManualAdd}
              onCancel={() => {
                setAddMethod(null);
                setPreselectedType(null);
              }}
              preselectedType={preselectedType}
            />
          )}
        </Modal>
      </div>
    </ThemeProvider>
  );
}

export default App;
