import { useMemo, useState, useEffect } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { useAuthStore } from '../store/authStore';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { AccountManager } from '../components/accounts/AccountManager';
import { Analytics } from '../components/dashboard/Analytics';
import { MonthlyComparison } from '../components/dashboard/MonthlyComparison';
import { SpendingInsights } from '../components/insights/SpendingInsights';
import { SpendingHeatmap } from '../components/dashboard/SpendingHeatmap';
import { SpendingForecast } from '../components/dashboard/SpendingForecast';
import { GoalTracker } from '../components/goals/GoalTracker';
import { QuickStats } from '../components/analytics/QuickStats';
import { SpendingStreak } from '../components/analytics/SpendingStreak';
import { WeeklySummary } from '../components/analytics/WeeklySummary';
import { FinancialTips } from '../components/widgets/FinancialTips';
import { MonthlyBadges } from '../components/widgets/MonthlyBadges';
import { TimePatterns } from '../components/analytics/TimePatterns';
import { CategoryLeaderboard } from '../components/analytics/CategoryLeaderboard';
import { FinancialHealthScore } from '../components/analytics/FinancialHealthScore';
import { BudgetProgress } from '../components/budgets/BudgetProgress';
import { SpendingVelocity } from '../components/analytics/SpendingVelocity';
import { TopTransactions } from '../components/analytics/TopTransactions';
import { TransactionStats } from '../components/analytics/TransactionStats';
import { SmartAlerts } from '../components/alerts/SmartAlerts';
import { MultiCurrencyView } from '../components/currency/MultiCurrencyView';
import { CategoryDrillDown } from '../components/analytics/CategoryDrillDown';
import { NetWorthTracker } from '../components/networth/NetWorthTracker';
import { SubscriptionTracker } from '../components/subscriptions/SubscriptionTracker';
import { calculateTotalByType } from '../lib/utils';
import { getAccountBalances } from '../lib/database';
import { getCurrentUserId } from '../lib/currentUser';

export const Dashboard = ({ onViewTransactions, onAddIncome, onAddExpense }) => {
  const { transactions, categories, loading } = useTransactionStore();
  const { currentUser } = useAuthStore();
  const [accounts, setAccounts] = useState([]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading...</p>
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

      {/* Spending Insights */}
      <SpendingInsights />

      {/* Quick Stats */}
      <QuickStats transactions={transactions} />

      {/* Spending Forecast */}
      <SpendingForecast transactions={transactions} />

      {/* Account Manager */}
      <AccountManager />

      {/* Savings Goals */}
      <GoalTracker />

      {/* Spending Streak */}
      <SpendingStreak transactions={transactions} />

      {/* Weekly Summary */}
      <WeeklySummary transactions={transactions} />

      {/* Time Patterns */}
      <TimePatterns transactions={transactions} />

      {/* Category Leaderboard */}
      <CategoryLeaderboard transactions={transactions} categories={categories} />

      {/* Spending Heatmap */}
      <SpendingHeatmap transactions={transactions} />

      {/* Monthly Badges */}
      <MonthlyBadges transactions={transactions} categories={categories} />

      {/* Financial Health Score */}
      <FinancialHealthScore transactions={transactions} categories={categories} />

      {/* Budget Progress */}
      <BudgetProgress transactions={transactions} categories={categories} />

      {/* Spending Velocity */}
      <SpendingVelocity transactions={transactions} />

      {/* Top Transactions */}
      <TopTransactions transactions={transactions} />

      {/* Transaction Stats */}
      <TransactionStats transactions={transactions} />

      {/* Financial Tips */}
      {/* Financial Tips */}
      <FinancialTips />

      {/* Smart Alerts */}
      <SmartAlerts transactions={transactions} categories={categories} />

      {/* Multi-Currency View */}
      <MultiCurrencyView transactions={transactions} />

      {/* Category Drill-Down */}
      <CategoryDrillDown transactions={transactions} categories={categories} />

      {/* Net Worth Tracker */}
      <NetWorthTracker />

      {/* Subscription Tracker */}
      <SubscriptionTracker transactions={transactions} />

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

