import { useMemo, useState, useEffect } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { useAuthStore } from '../store/authStore';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { AccountManager } from '../components/accounts/AccountManager';
import { Analytics } from '../components/dashboard/Analytics';
import { MonthlyComparison } from '../components/dashboard/MonthlyComparison';
import { calculateTotalByType, groupByCategory, getMonthRange } from '../lib/utils';
import { getAccountBalances } from '../lib/database';
import { getCurrentUserId } from '../lib/currentUser';

export const Dashboard = ({ onViewTransactions, onAddIncome, onAddExpense }) => {
  const { transactions, categories, loading } = useTransactionStore();
  const { currentUser } = useAuthStore();
  const [accounts, setAccounts] = useState([]);

  const monthRange = getMonthRange(0);
  
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= new Date(monthRange.start) && tDate <= new Date(monthRange.end);
    });
  }, [transactions, monthRange]);

  // Load accounts
  useEffect(() => {
    const loadAccounts = async () => {
      const userId = getCurrentUserId();
      if (userId) {
        const accountBalances = await getAccountBalances(Number(userId));
        setAccounts(accountBalances);
      }
    };
    loadAccounts();
  }, [transactions]); // Reload when transactions change

  const stats = useMemo(() => {
    // Calculate TOTAL income and expenses from ALL transactions (not just this month)
    const totalIncome = calculateTotalByType(transactions, 'credit');
    const totalExpenses = calculateTotalByType(transactions, 'debit');
    
    // Calculate total balance from all accounts
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
    
    // Fallback: use starting balance if no accounts
    const startingBalance = currentUser?.startingBalance ?? 0;
    const fallbackBalance = startingBalance + totalIncome - totalExpenses;
    
    const balance = accounts.length > 0 ? totalBalance : fallbackBalance;
    
    // Return total income and expenses (not monthly)
    return { 
      income: totalIncome, 
      expenses: totalExpenses, 
      balance 
    };
  }, [transactions, currentUser, accounts]);

  const categoryData = useMemo(() => {
    const expenseTransactions = currentMonthTransactions.filter(t => t.type === 'debit');
    return groupByCategory(expenseTransactions);
  }, [currentMonthTransactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      {/* Balance Card */}
      <BalanceCard 
        income={stats.income}
        expenses={stats.expenses}
        balance={stats.balance}
        startingBalance={currentUser?.startingBalance || 0}
        onAddIncome={onAddIncome}
        onAddExpense={onAddExpense}
      />

      {/* Account Manager */}
      <AccountManager />

      {/* Monthly Comparison */}
      <MonthlyComparison transactions={transactions} />

      {/* Analytics - Expense & Income Breakdown */}
      <Analytics transactions={transactions} categories={categories} />

      {/* Recent Transactions */}
      <RecentTransactions 
        transactions={transactions}
        onViewAll={onViewTransactions}
      />
    </div>
  );
};
