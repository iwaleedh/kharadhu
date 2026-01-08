import { useMemo, useState } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, getMonthRange, calculateTotalByType, groupByCategory } from '../lib/utils';
import { Select } from '../components/ui/Input';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { MerchantAnalytics } from '../components/analytics/MerchantAnalytics';
import { ExpenseComparison } from '../components/dashboard/ExpenseComparison';
import { FinancialCalendar } from '../components/calendar/FinancialCalendar';
import { SpendingTrends } from '../components/charts/SpendingTrends';
import { CategoryTrends } from '../components/charts/CategoryTrends';
import { IncomeVsExpense } from '../components/analytics/IncomeVsExpense';
import { PaymentMethods } from '../components/analytics/PaymentMethods';
import { YearComparison } from '../components/analytics/YearComparison';

export const Reports = () => {
  const { transactions, categories } = useTransactionStore();
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = current month

  const monthRange = getMonthRange(selectedMonth);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= new Date(monthRange.start) && tDate <= new Date(monthRange.end);
    });
  }, [transactions, monthRange]);

  const stats = useMemo(() => {
    const income = calculateTotalByType(filteredTransactions, 'credit');
    const expenses = calculateTotalByType(filteredTransactions, 'debit');
    return { income, expenses, net: income - expenses };
  }, [filteredTransactions]);

  const categoryData = useMemo(() => {
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'debit');
    return groupByCategory(expenseTransactions);
  }, [filteredTransactions]);

  // Last 6 months comparison
  const monthlyComparison = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const range = getMonthRange(i);
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= new Date(range.start) && tDate <= new Date(range.end);
      });

      const income = calculateTotalByType(monthTransactions, 'credit');
      const expenses = calculateTotalByType(monthTransactions, 'debit');

      data.push({
        month: new Date(range.start).toLocaleDateString('en-US', { month: 'short' }),
        income,
        expenses,
      });
    }
    return data;
  }, [transactions]);

  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Reports</h2>
          <p className="text-xs text-gray-800">Financial Overview</p>
        </div>

        <div className="flex items-center space-x-1">
          <Calendar size={16} className="text-gray-700" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value={0}>This Month</option>
            <option value={1}>Last Month</option>
            <option value={2}>2 Months Ago</option>
            <option value={3}>3 Months Ago</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-2">
        <Card className="bg-white border-2" style={{ borderColor: '#50C878' }}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold" style={{ color: '#50C878' }}>Income</p>
              <TrendingUp size={18} style={{ color: '#50C878' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: '#50C878' }}>{formatCurrency(stats.income)}</p>
            <p className="text-gray-800 text-xs mt-1">
              {filteredTransactions.filter(t => t.type === 'credit').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-2" style={{ borderColor: '#880808' }}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold" style={{ color: '#880808' }}>Expenses</p>
              <TrendingDown size={18} style={{ color: '#880808' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: '#880808' }}>{formatCurrency(stats.expenses)}</p>
            <p className="text-gray-800 text-xs mt-1">
              {filteredTransactions.filter(t => t.type === 'debit').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className={`bg-white border-2 ${stats.net >= 0 ? '' : 'border-gray-700'}`} style={stats.net >= 0 ? { borderColor: '#50C878' } : {}}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold" style={{ color: stats.net >= 0 ? '#50C878' : '#6b7280' }}>Net Income</p>
              {stats.net >= 0 ? <TrendingUp size={18} style={{ color: '#50C878' }} /> : <TrendingDown size={18} className="text-gray-800" />}
            </div>
            <p className="text-2xl font-bold" style={{ color: stats.net >= 0 ? '#50C878' : '#6b7280' }}>{formatCurrency(Math.abs(stats.net))}</p>
            <p className="text-gray-800 text-xs mt-1">
              {stats.net >= 0 ? 'Surplus' : 'Deficit'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <CategoryChart data={categoryData} />

      {/* Monthly Comparison */}
      <Card className="p-3">
        <CardHeader className="mb-2">
          <CardTitle className="text-base">6-Month Trend</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" style={{ fontSize: '11px' }} />
              <YAxis style={{ fontSize: '11px' }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="income" fill="#50C878" name="Income" />
              <Bar dataKey="expenses" fill="#880808" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card className="p-3">
        <CardHeader className="mb-2">
          <CardTitle className="text-base">Top Spending Categories</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {categoryData.length === 0 ? (
            <p className="text-center text-gray-700 py-8">No data available</p>
          ) : (
            <div className="space-y-2">
              {categoryData.slice(0, 8).map((item, index) => (
                <div key={item.category} className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-lg font-bold text-gray-700">#{index + 1}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{item.category}</p>
                      <p className="text-xs text-gray-700">{item.count} transactions</p>
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className="font-bold text-sm #880808">{formatCurrency(item.total)}</p>
                    <p className="text-xs text-gray-700">
                      {((item.total / stats.expenses) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Merchant Analytics */}
      <MerchantAnalytics />

      {/* Income vs Expense */}
      <IncomeVsExpense transactions={transactions} />

      {/* Spending Trends */}
      <SpendingTrends transactions={transactions} />

      {/* Category Trends */}
      <CategoryTrends transactions={transactions} categories={categories} />

      {/* Payment Methods */}
      <PaymentMethods transactions={transactions} />

      {/* Year Comparison */}
      <YearComparison transactions={transactions} />

      {/* Expense Comparison */}
      <ExpenseComparison transactions={transactions} />

      {/* Financial Calendar */}
      <FinancialCalendar transactions={transactions} />
    </div>
  );
};

