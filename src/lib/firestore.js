/**
 * Firestore Database Service
 * Handles all cloud database operations for users, transactions, accounts, etc.
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names
const COLLECTIONS = {
    USERS: 'users',
    TRANSACTIONS: 'transactions',
    ACCOUNTS: 'accounts',
    CATEGORIES: 'categories',
    BUDGETS: 'budgets',
    REMINDERS: 'reminders',
};

// ============ USER OPERATIONS ============

/**
 * Create or update user profile
 */
export const createUserProfile = async (userId, userData) => {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    }, { merge: true });
    return userId;
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
};

/**
 * Check if user is admin
 */
export const isUserAdmin = async (userId) => {
    const user = await getUserProfile(userId);
    return user?.isAdmin === true;
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async () => {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ============ TRANSACTION OPERATIONS ============

/**
 * Add transaction
 */
export const addTransaction = async (userId, transaction) => {
    const transactionsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.TRANSACTIONS);
    const docRef = await addDoc(transactionsRef, {
        ...transaction,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
};

/**
 * Get all transactions for a user
 */
export const getTransactions = async (userId) => {
    const transactionsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.TRANSACTIONS);
    const q = query(transactionsRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Update transaction
 */
export const updateTransaction = async (userId, transactionId, updates) => {
    const transactionRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.TRANSACTIONS, transactionId);
    await updateDoc(transactionRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
};

/**
 * Delete transaction
 */
export const deleteTransaction = async (userId, transactionId) => {
    const transactionRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.TRANSACTIONS, transactionId);
    await deleteDoc(transactionRef);
};

// ============ ACCOUNT OPERATIONS ============

/**
 * Add account
 */
export const addAccount = async (userId, account) => {
    const accountsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.ACCOUNTS);
    const docRef = await addDoc(accountsRef, {
        ...account,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
};

/**
 * Get all accounts for a user
 */
export const getAccountsFirestore = async (userId) => {
    const accountsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.ACCOUNTS);
    const snapshot = await getDocs(accountsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Update account
 */
export const updateAccount = async (userId, accountId, updates) => {
    const accountRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.ACCOUNTS, accountId);
    await updateDoc(accountRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
};

/**
 * Delete account
 */
export const deleteAccount = async (userId, accountId) => {
    const accountRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.ACCOUNTS, accountId);
    await deleteDoc(accountRef);
};

// ============ CATEGORY OPERATIONS ============

/**
 * Add category
 */
export const addCategory = async (userId, category) => {
    const categoriesRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.CATEGORIES);
    const docRef = await addDoc(categoriesRef, {
        ...category,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

/**
 * Get all categories for a user
 */
export const getCategoriesFirestore = async (userId) => {
    const categoriesRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.CATEGORIES);
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Update category
 */
export const updateCategory = async (userId, categoryId, updates) => {
    const categoryRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.CATEGORIES, categoryId);
    await updateDoc(categoryRef, updates);
};

/**
 * Delete category
 */
export const deleteCategory = async (userId, categoryId) => {
    const categoryRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.CATEGORIES, categoryId);
    await deleteDoc(categoryRef);
};

// ============ BUDGET OPERATIONS ============

/**
 * Add or update budget
 */
export const setBudget = async (userId, budget) => {
    const budgetsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.BUDGETS);
    const docRef = await addDoc(budgetsRef, {
        ...budget,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
};

/**
 * Get all budgets for a user
 */
export const getBudgets = async (userId) => {
    const budgetsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.BUDGETS);
    const snapshot = await getDocs(budgetsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ============ ADMIN ANALYTICS ============

/**
 * Get user statistics (admin only)
 */
export const getUserStats = async (userId) => {
    const transactions = await getTransactions(userId);

    const totalIncome = transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalExpense = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
        totalTransactions: transactions.length,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
    };
};

/**
 * Get all users with their stats (admin only)
 */
export const getAllUsersWithStats = async () => {
    const users = await getAllUsers();

    const usersWithStats = await Promise.all(
        users.map(async (user) => {
            try {
                const stats = await getUserStats(user.id);
                return { ...user, ...stats };
            } catch {
                return { ...user, totalTransactions: 0, totalIncome: 0, totalExpense: 0, balance: 0 };
            }
        })
    );

    return usersWithStats;
};

// ============ DATA MIGRATION ============

/**
 * Migrate local IndexedDB data to Firestore
 */
export const migrateLocalData = async (userId, localData) => {
    const batch = writeBatch(db);

    // Migrate transactions
    if (localData.transactions?.length > 0) {
        for (const tx of localData.transactions) {
            const txRef = doc(collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.TRANSACTIONS));
            batch.set(txRef, {
                ...tx,
                migratedAt: serverTimestamp(),
            });
        }
    }

    // Migrate accounts
    if (localData.accounts?.length > 0) {
        for (const acc of localData.accounts) {
            const accRef = doc(collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.ACCOUNTS));
            batch.set(accRef, {
                ...acc,
                migratedAt: serverTimestamp(),
            });
        }
    }

    // Migrate categories
    if (localData.categories?.length > 0) {
        for (const cat of localData.categories) {
            const catRef = doc(collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.CATEGORIES));
            batch.set(catRef, {
                ...cat,
                migratedAt: serverTimestamp(),
            });
        }
    }

    await batch.commit();
    return true;
};

/**
 * Initialize default categories for new user
 */
export const initializeDefaultCategories = async (userId) => {
    const defaultCategories = [
        { name: 'Food & Dining', icon: '🍽️', type: 'expense', color: '#FF6B6B' },
        { name: 'Transport', icon: '🚗', type: 'expense', color: '#4ECDC4' },
        { name: 'Shopping', icon: '🛍️', type: 'expense', color: '#45B7D1' },
        { name: 'Bills & Utilities', icon: '📱', type: 'expense', color: '#96CEB4' },
        { name: 'Entertainment', icon: '🎬', type: 'expense', color: '#FFEAA7' },
        { name: 'Healthcare', icon: '🏥', type: 'expense', color: '#DDA0DD' },
        { name: 'Groceries', icon: '🛒', type: 'expense', color: '#98D8C8' },
        { name: 'Transfer', icon: '💸', type: 'transfer', color: '#74B9FF' },
        { name: 'Salary', icon: '💰', type: 'income', color: '#00B894' },
        { name: 'Freelance', icon: '💼', type: 'income', color: '#6C5CE7' },
        { name: 'Other Income', icon: '📈', type: 'income', color: '#55A3FF' },
        { name: 'Other', icon: '📦', type: 'expense', color: '#636E72' },
    ];

    const batch = writeBatch(db);

    for (const cat of defaultCategories) {
        const catRef = doc(collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.CATEGORIES));
        batch.set(catRef, {
            ...cat,
            createdAt: serverTimestamp(),
        });
    }

    await batch.commit();
};
