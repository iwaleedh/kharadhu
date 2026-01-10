import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Modal } from './components/ui/Modal';
import { SMSImport } from './components/transactions/SMSImport';
import { TransactionForm } from './components/transactions/TransactionForm';
import { ReceiptScan } from './components/transactions/ReceiptScan';
import { SMSBatchImport } from './components/transactions/SMSBatchImport';
import { AutoImportPopup } from './components/AutoImportPopup';
import { useTransactionStore } from './store/transactionStore';
import { useAutoImport } from './hooks/useAutoImport';
import { FileText, MessageSquare, Camera, Shield } from 'lucide-react';
import { Button } from './components/ui/Button';

import { ThemeProvider } from './contexts/ThemeContext';
import { FirebaseAuth } from './pages/FirebaseAuth';
import { useFirebaseAuthStore } from './store/firebaseAuthStore';
import { QuickAddWidget } from './components/widgets/QuickAddWidget';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMethod, setAddMethod] = useState(null); // 'sms' | 'sms-batch' | 'manual' | 'receipt'
  const [preselectedType, setPreselectedType] = useState(null); // 'credit' or 'debit'
  const [initialSmsText, setInitialSmsText] = useState('');
  const [batchSmsText, setBatchSmsText] = useState('');
  const { init, addTransaction } = useTransactionStore();
  const {
    user,
    isAdmin,
    loading: authLoading,
    initialized,
    init: initAuth,
    signOut,
    getCurrentUserId,
    getDisplayName
  } = useFirebaseAuthStore();

  // Auto-import hook
  const {
    showImportPopup,
    pendingTransaction,
    importTransaction,
    declineImport,
  } = useAutoImport();

  // Initialize Firebase auth listener
  useEffect(() => {
    const unsubscribe = initAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initAuth]);

  useEffect(() => {
    // Re-load user-scoped data when account changes.
    if (user) {
      init();
    }
  }, [init, user]);

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
      case 'admin':
        return <Admin />;
      default:
        return <Dashboard />;
    }
  };

  // Show loading state
  if (!initialized || authLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0F172A' }}>
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Show auth if not logged in
  if (!user) {
    return (
      <ThemeProvider>
        <FirebaseAuth />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <Header
          showAdmin={isAdmin}
          onAdminClick={() => setActiveTab('admin')}
          onSignOut={signOut}
          displayName={getDisplayName()}
        />

        <main className="px-3 py-3 pt-[72px] pb-20">
          {renderContent()}
        </main>

        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddClick={handleAddClick}
          onProfileClick={() => setActiveTab('profile')}
          isAdmin={isAdmin}
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
              <p className="text-slate-400 mb-4">Choose how you'd like to add your transaction:</p>

              <button
                onClick={() => setAddMethod('sms')}
                className="w-full p-6 bg-gradient-to-br from-blue-900/50 to-blue-800/50 hover:from-blue-800/50 hover:to-blue-700/50 border-2 border-blue-500/30 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-500 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <MessageSquare size={24} className="text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white text-base">Import from SMS</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Paste your bank transaction SMS
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleImportFromClipboard}
                className="w-full p-6 bg-gradient-to-br from-green-900/50 to-green-800/50 hover:from-green-800/50 hover:to-green-700/50 border-2 border-green-500/30 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-green-500 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <MessageSquare size={24} className="text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white text-base">Import from Clipboard</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Copy an SMS, then tap to auto-parse
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAddMethod('receipt')}
                className="w-full p-6 bg-gradient-to-br from-purple-900/50 to-purple-800/50 hover:from-purple-800/50 hover:to-purple-700/50 border-2 border-purple-500/30 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-500 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <Camera size={24} className="text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white text-base">Scan Receipt</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      AI-powered or offline OCR
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAddMethod('manual')}
                className="w-full p-6 bg-gradient-to-br from-slate-800/50 to-slate-700/50 hover:from-slate-700/50 hover:to-slate-600/50 border-2 border-slate-500/30 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-slate-500 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <FileText size={24} className="text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white text-base">Manual Entry</h3>
                    <p className="text-xs text-slate-400 mt-1">
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
