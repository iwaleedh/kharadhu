import { useState, useEffect, useCallback } from 'react';
import { createClipboardMonitor } from '../lib/clipboardMonitor';
import { useTransactionStore } from '../store/transactionStore';

export const useAutoImport = () => {
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [rawSMS, setRawSMS] = useState('');
  const { addTransaction } = useTransactionStore();

  // Handle SMS detection
  const handleSMSDetected = useCallback((transaction, smsText) => {
    console.log('Bank SMS detected:', transaction);
    setPendingTransaction(transaction);
    setRawSMS(smsText);
    setShowImportPopup(true);
  }, []);

  // Start clipboard monitoring
  useEffect(() => {
    const monitor = createClipboardMonitor(handleSMSDetected);
    
    // Start monitoring
    monitor.start();

    // Cleanup on unmount
    return () => {
      monitor.stop();
    };
  }, [handleSMSDetected]);

  // Import transaction
  const importTransaction = useCallback(async () => {
    if (!pendingTransaction) return;

    try {
      await addTransaction(pendingTransaction);
      setShowImportPopup(false);
      setPendingTransaction(null);
      setRawSMS('');
      return true;
    } catch (error) {
      console.error('Failed to import transaction:', error);
      return false;
    }
  }, [pendingTransaction, addTransaction]);

  // Decline import
  const declineImport = useCallback(() => {
    setShowImportPopup(false);
    setPendingTransaction(null);
    setRawSMS('');
  }, []);

  return {
    showImportPopup,
    pendingTransaction,
    rawSMS,
    importTransaction,
    declineImport,
  };
};
