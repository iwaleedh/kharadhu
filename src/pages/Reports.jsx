import { useMemo, useState } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, getMonthRange, calculateTotalByType, groupByCategory } from '../lib/utils';
import { Select } from '../components/ui/Input';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export const Reports = () => {
  const { transactions } = useTransactionStore();
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
          <h2 className="text-lg font-bold text-gray-900">
            <span className="dhivehi">ރިޕޯޓް</span> <span className="text-sm text-gray-600">Reports</span>
          </h2>
          <p className="text-xs text-gray-600"><span className="dhivehi">ފައިސާގެ ތަފްސީލް</span></p>
        </div>
        
        <div className="flex items-center space-x-1">
          <Calendar size={16} className="text-gray-500" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
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
        <Card className="bg-gradient-to-br from-tropical-500 to-tropical-600 text-white border-0">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-tropical-100 text-xs font-medium dhivehi leading-tight">އާމްދަނީ</p>
                <p className="text-tropical-200 text-[9px] leading-tight">Income</p>
              </div>
              <TrendingUp size={18} />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.income)}</p>
            <p className="text-tropical-100 text-xs mt-1">
              {filteredTransactions.filter(t => t.type === 'credit').length} <span className="dhivehi">ހަރަދު</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-coral-500 to-coral-600 text-white border-0">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-coral-100 text-xs font-medium dhivehi leading-tight">ހަރަދު</p>
                <p className="text-coral-200 text-[9px] leading-tight">Expenses</p>
              </div>
              <TrendingDown size={18} />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.expenses)}</p>
            <p className="text-coral-100 text-xs mt-1">
              {filteredTransactions.filter(t => t.type === 'debit').length} <span className="dhivehi">ހަރަދު</span>
            </p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${stats.net >= 0 ? 'from-ocean-500 to-ocean-600' : 'from-gray-500 to-gray-600'} text-white border-0`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-ocean-100 text-xs font-medium dhivehi leading-tight">ޖުމްލަ އާމްދަނީ</p>
                <p className="text-ocean-200 text-[9px] leading-tight">Net Income</p>
              </div>
              {stats.net >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>
            <p className="text-2xl font-bold">{formatCurrency(Math.abs(stats.net))}</p>
            <p className="text-ocean-100 text-xs mt-1">
              <span className="dhivehi">{stats.net >= 0 ? 'އިތުރު' : 'ދަށް'}</span> <span className="text-[9px]">{stats.net >= 0 ? 'Surplus' : 'Deficit'}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <CategoryChart data={categoryData} />

      {/* Monthly Comparison */}
      <Card className="p-3">
        <CardHeader className="mb-2">
          <CardTitle className="text-base">
            <span className="dhivehi block leading-tight">6 މަސްދުވަހުގެ ގްރާފް</span>
            <span className="text-[10px] text-gray-600 leading-tight">6-Month Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" style={{ fontSize: '11px' }} />
              <YAxis style={{ fontSize: '11px' }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="income" fill="#10B981" name="Income" />
              <Bar dataKey="expenses" fill="#FF6B6B" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card className="p-3">
        <CardHeader className="mb-2">
          <CardTitle className="text-base">
            <span className="dhivehi block leading-tight">އެންމެ ބޮޑަށް ހަރަދުވި ބައިތައް</span>
            <span className="text-[10px] text-gray-600 leading-tight">Top Spending Categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {categoryData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No data available</p>
          ) : (
            <div className="space-y-2">
              {categoryData.slice(0, 8).map((item, index) => (
                <div key={item.category} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{item.category}</p>
                      <p className="text-xs text-gray-500">{item.count} transactions</p>
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className="font-bold text-sm text-coral-600">{formatCurrency(item.total)}</p>
                    <p className="text-xs text-gray-500">
                      {((item.total / stats.expenses) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
