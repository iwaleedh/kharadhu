import { create } from 'zustand';
import { 
  getTransactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction,
  getCategories,
  getAccounts,
  initDatabase
} from '../lib/database';
import { getCurrentUserId } from '../lib/currentUser';

export const useTransactionStore = create((set, get) => ({
  // State
  transactions: [],
  categories: [],
  accounts: [],
  loading: false,
  error: null,
  filters: {
    startDate: null,
    endDate: null,
    type: null,
    category: null,
    bank: null,
  },

  // Initialize
  init: async () => {
    set({ loading: true });
    try {
      const userId = Number(getCurrentUserId());
      
      if (!Number.isFinite(userId)) {
        set({ transactions: [], categories: [], accounts: [], loading: false });
        return;
      }

      await initDatabase(userId);
      const [transactions, categories, accounts] = await Promise.all([
        getTransactions(userId),
        getCategories(userId),
        getAccounts(userId),
      ]);
      
      set({ transactions, categories, accounts, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Transactions
  fetchTransactions: async (filters = {}) => {
    set({ loading: true });
    try {
      const userId = Number(getCurrentUserId());
      const transactions = Number.isFinite(userId) ? await getTransactions(userId, filters) : [];
      set({ transactions, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addTransaction: async (transaction) => {
    set({ loading: true });
    try {
      const userId = Number(getCurrentUserId());
      if (!Number.isFinite(userId)) throw new Error('Not signed in');

      await addTransaction(userId, transaction);
      const transactions = await getTransactions(userId, get().filters);
      set({ transactions, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateTransaction: async (id, updates) => {
    set({ loading: true });
    try {
      const userId = Number(getCurrentUserId());
      if (!Number.isFinite(userId)) throw new Error('Not signed in');

      await updateTransaction(userId, id, updates);
      const transactions = await getTransactions(userId, get().filters);
      set({ transactions, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ loading: true });
    try {
      const userId = Number(getCurrentUserId());
      if (!Number.isFinite(userId)) throw new Error('Not signed in');

      await deleteTransaction(userId, id);
      const transactions = await getTransactions(userId, get().filters);
      set({ transactions, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Filters
  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
    get().fetchTransactions(get().filters);
  },

  clearFilters: () => {
    set({ 
      filters: {
        startDate: null,
        endDate: null,
        type: null,
        category: null,
        bank: null,
      }
    });
    get().fetchTransactions();
  },
}));
