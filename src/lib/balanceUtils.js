// Balance calculation utilities

/**
 * Calculate total balance from starting balance and transactions
 */
export const calculateTotalBalance = (startingBalance, transactions) => {
  const totalIncome = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  return (startingBalance || 0) + totalIncome - totalExpenses;
};

/**
 * Add running balance to transactions
 * Returns transactions sorted newest first with balanceAfter field
 */
export const addRunningBalances = (transactions, startingBalance) => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  // Sort by date (oldest first for calculation)
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  
  let runningBalance = startingBalance || 0;
  
  const withBalances = sorted.map(tx => {
    const balanceBefore = runningBalance;
    
    if (tx.type === 'credit') {
      runningBalance += tx.amount || 0;
    } else if (tx.type === 'debit') {
      runningBalance -= tx.amount || 0;
    }
    
    return {
      ...tx,
      balanceBefore,
      balanceAfter: runningBalance
    };
  });
  
  // Return newest first for display
  return withBalances.reverse();
};

/**
 * Calculate balance for specific account
 */
export const calculateAccountBalance = (account, transactions) => {
  if (!account) return 0;
  
  const accountTransactions = transactions.filter(
    t => t.accountId === account.id
  );
  
  return calculateTotalBalance(account.startingBalance || 0, accountTransactions);
};

/**
 * Generate balance history for charts
 */
export const generateBalanceHistory = (startingBalance, transactions, days = 30) => {
  const history = [];
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get transactions up to end of this day
    const txUpToDate = transactions.filter(
      t => new Date(t.date) <= endOfDay
    );
    
    const balance = calculateTotalBalance(startingBalance, txUpToDate);
    
    const previousBalance = i === days - 1 ? startingBalance : history[history.length - 1]?.balance || startingBalance;
    
    history.push({
      date: date.toISOString(),
      balance,
      change: balance - previousBalance
    });
  }
  
  return history;
};

/**
 * Calculate reconciliation difference
 */
export const calculateReconciliation = (calculatedBalance, actualBalance) => {
  const difference = actualBalance - calculatedBalance;
  
  return {
    difference,
    needsAdjustment: Math.abs(difference) >= 0.01,
    adjustmentType: difference > 0 ? 'credit' : 'debit',
    adjustmentAmount: Math.abs(difference)
  };
};

/**
 * Group transactions by account
 */
export const groupTransactionsByAccount = (transactions) => {
  return transactions.reduce((acc, tx) => {
    const accountId = tx.accountId || 'unassigned';
    if (!acc[accountId]) {
      acc[accountId] = [];
    }
    acc[accountId].push(tx);
    return acc;
  }, {});
};

/**
 * Calculate statistics for balance
 */
export const calculateBalanceStats = (balanceHistory) => {
  if (!balanceHistory || balanceHistory.length === 0) {
    return {
      average: 0,
      min: 0,
      max: 0,
      trend: 0
    };
  }
  
  const balances = balanceHistory.map(h => h.balance);
  const average = balances.reduce((sum, b) => sum + b, 0) / balances.length;
  const min = Math.min(...balances);
  const max = Math.max(...balances);
  
  // Calculate trend (first vs last)
  const first = balances[0];
  const last = balances[balances.length - 1];
  const trend = first !== 0 ? ((last - first) / first) * 100 : 0;
  
  return {
    average,
    min,
    max,
    trend
  };
};
