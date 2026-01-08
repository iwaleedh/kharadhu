import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { ArrowUpCircle, ArrowDownCircle, Star } from 'lucide-react';
import { formatCurrency, getMonthRange } from '../../lib/utils';

/**
 * TopTransactions - Shows largest transactions of the month
 */
export const TopTransactions = ({ transactions }) => {
    const topData = useMemo(() => {
        const thisMonthRange = getMonthRange(0);
        const thisMonthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(thisMonthRange.start) && d <= new Date(thisMonthRange.end);
        });

        // Top 5 expenses
        const topExpenses = thisMonthTxns
            .filter(t => t.type === 'debit')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map((t, idx) => ({ ...t, rank: idx + 1 }));

        // Top 5 income
        const topIncome = thisMonthTxns
            .filter(t => t.type === 'credit')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map((t, idx) => ({ ...t, rank: idx + 1 }));

        return { topExpenses, topIncome };
    }, [transactions]);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const TransactionItem = ({ txn, isExpense }) => (
        <div className={`flex items-center justify-between p-2 rounded-lg ${isExpense ? 'bg-red-50' : 'bg-green-50'
            }`}>
            <div className="flex items-center space-x-2 min-w-0">
                <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${txn.rank === 1
                        ? 'bg-yellow-400 text-yellow-900'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                    {txn.rank === 1 ? <Star size={12} /> : txn.rank}
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {txn.merchant || txn.category || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(txn.date)}</p>
                </div>
            </div>
            <span className={`text-sm font-bold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(txn.amount)}
            </span>
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Star className="text-yellow-500" size={20} />
                    <CardTitle>Top Transactions</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Top Expenses */}
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <ArrowDownCircle size={16} className="text-red-500" />
                            <h4 className="text-sm font-medium text-gray-700">Largest Expenses</h4>
                        </div>
                        {topData.topExpenses.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-2">No expenses this month</p>
                        ) : (
                            <div className="space-y-1">
                                {topData.topExpenses.map((txn) => (
                                    <TransactionItem key={txn.id} txn={txn} isExpense={true} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Top Income */}
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <ArrowUpCircle size={16} className="text-green-500" />
                            <h4 className="text-sm font-medium text-gray-700">Largest Income</h4>
                        </div>
                        {topData.topIncome.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-2">No income this month</p>
                        ) : (
                            <div className="space-y-1">
                                {topData.topIncome.map((txn) => (
                                    <TransactionItem key={txn.id} txn={txn} isExpense={false} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
