import Dexie from 'dexie';

export const db = new Dexie('Kharadhu');

// v1: single-user data
db.version(1).stores({
  transactions: '++id, date, type, amount, category, bank, accountNumber, merchant',
  categories: '++id, name, type',
  accounts: '++id, bankName, accountNumber',
  settings: 'key'
});

// v2: local multi-user support
db.version(2)
  .stores({
    users: '++id, nameLower, createdAt, lastLoginAt',
    transactions: '++id, userId, date, type, amount, category, bank, accountNumber, merchant',
    categories: '++id, userId, name, type',
    accounts: '++id, userId, bankName, accountNumber',
    settings: 'key'
  })
  .upgrade(async (tx) => {
    // On upgrade we don't know which user owns the existing data.
    // We'll leave userId undefined; first created account can claim it.
    // (see authStore.signUp)
    await tx.table('transactions').toCollection().modify((t) => {
      if (!('userId' in t)) t.userId = undefined;
    });
    await tx.table('categories').toCollection().modify((c) => {
      if (!('userId' in c)) c.userId = undefined;
    });
    await tx.table('accounts').toCollection().modify((a) => {
      if (!('userId' in a)) a.userId = undefined;
    });
  });

// v3: add startingBalance field to users
db.version(3)
  .stores({
    users: '++id, nameLower, createdAt, lastLoginAt',
    transactions: '++id, userId, date, type, amount, category, bank, accountNumber, merchant',
    categories: '++id, userId, name, type',
    accounts: '++id, userId, bankName, accountNumber',
    settings: 'key'
  })
  .upgrade(async (tx) => {
    // Add startingBalance field to existing users (set to null, will be prompted)
    await tx.table('users').toCollection().modify((user) => {
      if (!('startingBalance' in user)) {
        user.startingBalance = null;
      }
    });
  });

// v4: Enhanced accounts table with balance tracking
db.version(4)
  .stores({
    users: '++id, nameLower, createdAt, lastLoginAt',
    transactions: '++id, userId, accountId, date, type, amount, category, bank, accountNumber, merchant',
    categories: '++id, userId, name, type',
    accounts: '++id, userId, bankName, accountNumber, nickname, isPrimary',
    settings: 'key'
  })
  .upgrade(async (tx) => {
    // Enhance accounts table with new fields
    await tx.table('accounts').toCollection().modify((account) => {
      if (!('nickname' in account)) {
        account.nickname = `${account.bankName} ${account.accountNumber}`;
      }
      if (!('startingBalance' in account)) {
        account.startingBalance = 0;
      }
      if (!('isPrimary' in account)) {
        account.isPrimary = false;
      }
      if (!('icon' in account)) {
        account.icon = account.bankName === 'BML' ? '🔵' : account.bankName === 'MIB' ? '🟢' : '💳';
      }
      if (!('color' in account)) {
        account.color = account.bankName === 'BML' ? '#0066CC' : account.bankName === 'MIB' ? '#10B981' : '#6B7280';
      }
    });

    // Link existing transactions to accounts
    // For each user, create a default account if none exists
    const users = await tx.table('users').toArray();
    for (const user of users) {
      const userAccounts = await tx.table('accounts').where('userId').equals(user.id).toArray();
      
      if (userAccounts.length === 0) {
        // Create default account
        const defaultAccountId = await tx.table('accounts').add({
          userId: user.id,
          bankName: 'Default',
          accountNumber: '****0000',
          nickname: 'Main Account',
          startingBalance: user.startingBalance || 0,
          isPrimary: true,
          isActive: true,
          icon: '💰',
          color: '#0066CC',
          createdAt: new Date().toISOString()
        });

        // Link all existing transactions to this default account
        await tx.table('transactions').where('userId').equals(user.id).modify((transaction) => {
          if (!('accountId' in transaction)) {
            transaction.accountId = defaultAccountId;
          }
        });
      } else {
        // Link transactions to existing accounts based on accountNumber
        const transactions = await tx.table('transactions').where('userId').equals(user.id).toArray();
        for (const transaction of transactions) {
          if (!('accountId' in transaction) && transaction.accountNumber) {
            const matchingAccount = userAccounts.find(
              acc => acc.accountNumber === transaction.accountNumber
            );
            if (matchingAccount) {
              await tx.table('transactions').update(transaction.id, {
                accountId: matchingAccount.id
              });
            }
          }
        }
      }
    }
  });

// Default categories
export const defaultCategories = [
  { name: 'Food & Dining', nameDv: 'ކައްކާބާ', icon: '🍔', color: '#FF6B6B', type: 'expense', budget: 5000 },
  { name: 'Groceries', nameDv: 'ކާބޯތަކެތި', icon: '🛒', color: '#F97316', type: 'expense', budget: 8000 },
  { name: 'Housing & Utilities', nameDv: 'ގޭގެ ހަރަދު', icon: '🏠', color: '#8B5CF6', type: 'expense', budget: 10000 },
  { name: 'Transportation', nameDv: 'ދަތުރުފަތުރު', icon: '🚗', color: '#3B82F6', type: 'expense', budget: 3000 },
  { name: 'Healthcare', nameDv: 'ސިއްހީ', icon: '💊', color: '#EC4899', type: 'expense', budget: 2000 },
  { name: 'Entertainment', nameDv: 'މަޖާ', icon: '🎬', color: '#F59E0B', type: 'expense', budget: 2000 },
  { name: 'Shopping', nameDv: 'ގަތުން', icon: '👕', color: '#A855F7', type: 'expense', budget: 3000 },
  { name: 'Education', nameDv: 'ތައުލީމް', icon: '📚', color: '#06B6D4', type: 'expense', budget: 2000 },
  { name: 'Telecommunications', nameDv: 'ފޯން/އިންޓަނެޓް', icon: '☎️', color: '#10B981', type: 'expense', budget: 1000 },
  { name: 'Fuel', nameDv: 'ތެޔޮ', icon: '⛽', color: '#EF4444', type: 'expense', budget: 2000 },
  { name: 'Bank Fees', nameDv: 'ބޭންކް ފީ', icon: '🏦', color: '#6B7280', type: 'expense', budget: 500 },
  { name: 'Income/Salary', nameDv: 'އާމްދަނީ/މުސާރަ', icon: '💰', color: '#10B981', type: 'income', budget: 0 },
  { name: 'Transfer', nameDv: 'ބަދަލުކުރުން', icon: '🔄', color: '#06B6D4', type: 'transfer', budget: 0 },
  { name: 'Other', nameDv: 'އެހެނިހެން', icon: '🔧', color: '#9CA3AF', type: 'expense', budget: 1000 },
];

// Initialize database with default categories for a given user.
export const initDatabase = async (userId) => {
  if (!userId) return;
  const count = await db.categories.where('userId').equals(userId).count();
  if (count === 0) {
    await db.categories.bulkAdd(defaultCategories.map((c) => ({ ...c, userId })));
  }
};

// Transaction operations
export const addTransaction = async (userId, transaction) => {
  if (!userId) throw new Error('Missing userId');
  return await db.transactions.add({
    ...transaction,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const bulkAddTransactions = async (userId, transactions) => {
  if (!userId) throw new Error('Missing userId');
  const now = new Date().toISOString();
  const payload = (transactions || []).map((t) => ({
    ...t,
    userId,
    createdAt: t.createdAt || now,
    updatedAt: now,
  }));
  if (!payload.length) return { imported: 0 };
  await db.transactions.bulkAdd(payload);
  return { imported: payload.length };
};

export const updateTransaction = async (userId, id, updates) => {
  if (!userId) throw new Error('Missing userId');

  const existing = await db.transactions.get(id);
  if (!existing || existing.userId !== userId) {
    throw new Error('Transaction not found');
  }

  return await db.transactions.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteTransaction = async (userId, id) => {
  if (!userId) throw new Error('Missing userId');

  const existing = await db.transactions.get(id);
  if (!existing || existing.userId !== userId) {
    // Idempotent delete for non-owned records
    return;
  }

  return await db.transactions.delete(id);
};

export const getTransactions = async (userId, filters = {}) => {
  if (!userId) return [];
  
  // Get all transactions for user, then sort in JavaScript
  let transactions = await db.transactions.where('userId').equals(userId).toArray();
  
  // Sort by date (newest first)
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Apply filters
  if (filters.startDate && filters.endDate) {
    transactions = transactions.filter(t => t.date >= filters.startDate && t.date <= filters.endDate);
  }
  
  if (filters.type) {
    transactions = transactions.filter(t => t.type === filters.type);
  }
  
  if (filters.category) {
    transactions = transactions.filter(t => t.category === filters.category);
  }
  
  if (filters.bank) {
    transactions = transactions.filter(t => t.bank === filters.bank);
  }
  
  return transactions;
};

// Category operations
export const getCategories = async (userId, type = null) => {
  if (!userId) return [];
  if (type) {
    return await db.categories.where({ userId, type }).toArray();
  }
  return await db.categories.where('userId').equals(userId).toArray();
};

export const addCategory = async (userId, category) => {
  if (!userId) throw new Error('Missing userId');
  return await db.categories.add({ ...category, userId });
};

export const updateCategory = async (userId, categoryId, updates) => {
  if (!userId) throw new Error('Missing userId');
  
  const existing = await db.categories.get(categoryId);
  if (!existing || existing.userId !== userId) {
    throw new Error('Category not found');
  }
  
  return await db.categories.update(categoryId, updates);
};

export const deleteCategory = async (userId, categoryId) => {
  if (!userId) throw new Error('Missing userId');
  
  const existing = await db.categories.get(categoryId);
  if (!existing || existing.userId !== userId) {
    return; // Idempotent delete
  }
  
  return await db.categories.delete(categoryId);
};

// Account operations
export const getAccounts = async (userId) => {
  if (!userId) return [];
  return await db.accounts.where('userId').equals(userId).toArray();
};

export const addAccount = async (userId, account) => {
  if (!userId) throw new Error('Missing userId');
  
  // If this is the first account, make it primary
  const existingAccounts = await getAccounts(userId);
  const isPrimary = existingAccounts.length === 0 ? true : (account.isPrimary || false);
  
  // If setting as primary, unset other primary accounts
  if (isPrimary) {
    await db.accounts.where('userId').equals(userId).modify({ isPrimary: false });
  }
  
  return await db.accounts.add({
    ...account,
    userId,
    isPrimary,
    isActive: true,
    createdAt: new Date().toISOString(),
  });
};

export const updateAccount = async (userId, accountId, updates) => {
  if (!userId) throw new Error('Missing userId');
  
  const existing = await db.accounts.get(accountId);
  if (!existing || existing.userId !== userId) {
    throw new Error('Account not found');
  }
  
  // If setting as primary, unset other primary accounts
  if (updates.isPrimary) {
    await db.accounts.where('userId').equals(userId).modify({ isPrimary: false });
  }
  
  return await db.accounts.update(accountId, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteAccount = async (userId, accountId) => {
  if (!userId) throw new Error('Missing userId');
  
  const existing = await db.accounts.get(accountId);
  if (!existing || existing.userId !== userId) {
    return; // Idempotent delete
  }
  
  // Don't allow deleting if transactions exist for this account
  const transactionCount = await db.transactions.where({ userId, accountId }).count();
  if (transactionCount > 0) {
    throw new Error('Cannot delete account with existing transactions');
  }
  
  return await db.accounts.delete(accountId);
};

export const updateAccountBalance = async (userId, accountNumber, balance) => {
  if (!userId) throw new Error('Missing userId');
  const account = await db.accounts.where({ userId, accountNumber }).first();
  if (account) {
    return await db.accounts.update(account.id, { balance });
  }
};

// Calculate account balance from transactions
export const calculateAccountBalance = async (userId, accountId) => {
  if (!userId || !accountId) return 0;
  
  const account = await db.accounts.get(accountId);
  if (!account || account.userId !== userId) return 0;
  
  const transactions = await db.transactions.where({ userId, accountId }).toArray();
  
  const income = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const expenses = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  return (account.startingBalance || 0) + income - expenses;
};

// Get account balances for all user accounts
export const getAccountBalances = async (userId) => {
  if (!userId) return [];
  
  const accounts = await getAccounts(userId);
  const balances = await Promise.all(
    accounts.map(async (account) => {
      const balance = await calculateAccountBalance(userId, account.id);
      return {
        ...account,
        currentBalance: balance
      };
    })
  );
  
  return balances;
};
