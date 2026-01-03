import { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatCurrency, formatDate } from '../../lib/utils';

export const Analytics = ({ transactions = [], categories = [] }) => {
  const [expandedExpenseCategory, setExpandedExpenseCategory] = useState(null);

  const expenseTransactions = useMemo(
    () => transactions.filter((t) => t.type === 'debit'),
    [transactions]
  );
  const incomeTransactions = useMemo(
    () => transactions.filter((t) => t.type === 'credit'),
    [transactions]
  );

  const getCategoryIcon = (categoryName) => {
    const category = categories.find((c) => c.name === categoryName);
    return category?.icon || '💰';
  };

  const expenseGroups = useMemo(() => {
    const grouped = new Map();
    for (const tx of expenseTransactions) {
      const key = tx.category || 'Other';
      const existing = grouped.get(key) || { category: key, total: 0, count: 0, transactions: [] };
      existing.total += tx.amount || 0;
      existing.count += 1;
      existing.transactions.push(tx);
      grouped.set(key, existing);
    }

    // sort each group's tx newest first
    for (const g of grouped.values()) {
      g.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return Array.from(grouped.values()).sort((a, b) => b.total - a.total);
  }, [expenseTransactions]);

  const incomeGroups = useMemo(() => {
    const grouped = new Map();
    for (const tx of incomeTransactions) {
      const key = tx.category || 'Other';
      const existing = grouped.get(key) || { category: key, total: 0, count: 0 };
      existing.total += tx.amount || 0;
      existing.count += 1;
      grouped.set(key, existing);
    }

    return Array.from(grouped.values()).sort((a, b) => b.total - a.total);
  }, [incomeTransactions]);

  const totalExpenses = useMemo(
    () => expenseGroups.reduce((sum, item) => sum + item.total, 0),
    [expenseGroups]
  );
  const totalIncome = useMemo(
    () => incomeGroups.reduce((sum, item) => sum + item.total, 0),
    [incomeGroups]
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-100 flex items-center space-x-2">
          <PieChartIcon size={24} className="text-red-500" />
          <span className="dhivehi">އެނަލިޓިކްސް</span>
          <span className="text-base text-gray-300">Analytics</span>
        </h2>
        <p className="text-sm text-gray-400">
          <span className="dhivehi">ހަރަދާއި އާމްދަނީގެ ތަފްސީލް</span>
        </p>
      </div>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingDown size={20} className="text-red-400" />
            <span>Expense Breakdown</span>
            <span className="text-sm text-gray-400 dhivehi">ހަރަދުގެ ތަފްސީލް</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expenseGroups.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No expenses yet</p>
          ) : (
            <div className="space-y-2">
              {expenseGroups.map((group) => {
                const percentage = totalExpenses > 0 ? (group.total / totalExpenses) * 100 : 0;
                const isOpen = expandedExpenseCategory === group.category;

                return (
                  <div key={group.category} className="bg-black/30 rounded-lg border border-gray-800 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedExpenseCategory(isOpen ? null : group.category)}
                      className="w-full p-3 text-left hover:bg-black/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getCategoryIcon(group.category)}</span>
                          <div>
                            <p className="font-semibold text-white flex items-center space-x-2">
                              <span>{group.category}</span>
                              <span className="text-xs text-gray-400">({group.count})</span>
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatCurrency(group.total)} • {percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-red-400 font-bold">{formatCurrency(group.total)}</span>
                          {isOpen ? (
                            <ChevronDown size={18} className="text-gray-400" />
                          ) : (
                            <ChevronRight size={18} className="text-gray-400" />
                          )}
                        </div>
                      </div>

                      <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                        <div
                          className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </button>

                    {/* Collapsible details */}
                    {isOpen && (
                      <div className="px-3 pb-3">
                        <div className="mt-2 border-t border-gray-800 pt-2 space-y-2">
                          {group.transactions.slice(0, 20).map((t) => (
                            <div
                              key={t.id}
                              className="flex items-start justify-between bg-black/30 border border-gray-800 rounded-lg p-2"
                            >
                              <div className="min-w-0">
                                <p className="text-sm text-gray-100 font-semibold truncate">
                                  {t.merchant || 'Expense'}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  {formatDate(t.date, 'dd MMM HH:mm')} • {t.bank}{t.accountNumber ? ` • ****${t.accountNumber}` : ''}
                                </p>
                                {t.description ? (
                                  <p className="text-xs text-gray-500 mt-1 truncate">{t.description}</p>
                                ) : null}
                                {t.referenceNumber ? (
                                  <p className="text-xs text-gray-500 mt-1 truncate">Ref: {t.referenceNumber}</p>
                                ) : null}
                              </div>
                              <div className="ml-3 text-right flex-shrink-0">
                                <p className="text-sm font-bold text-red-400">-{formatCurrency(t.amount)}</p>
                              </div>
                            </div>
                          ))}

                          {group.transactions.length > 20 && (
                            <p className="text-xs text-gray-500 text-center">
                              Showing latest 20 of {group.transactions.length} transactions
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="bg-gradient-to-br from-red-950/30 to-red-900/20 border border-red-900/50 rounded-lg p-3 mt-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">Total Expenses</p>
                  <p className="text-xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Income Breakdown (kept simple for now) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp size={20} className="text-green-400" />
            <span>Income Breakdown</span>
            <span className="text-sm text-gray-400 dhivehi">އާމްދަނީގެ ތަފްސީލް</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incomeGroups.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No income yet</p>
          ) : (
            <div className="space-y-2">
              {incomeGroups.map((item) => {
                const percentage = totalIncome > 0 ? (item.total / totalIncome) * 100 : 0;
                return (
                  <div key={item.category} className="bg-black/30 rounded-lg p-3 border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                        <div>
                          <p className="font-semibold text-white">{item.category}</p>
                          <p className="text-xs text-gray-400">{item.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-400">{formatCurrency(item.total)}</p>
                        <p className="text-xs text-gray-400">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="bg-gradient-to-br from-green-950/30 to-green-900/20 border border-green-900/50 rounded-lg p-3 mt-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">Total Income</p>
                  <p className="text-xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
