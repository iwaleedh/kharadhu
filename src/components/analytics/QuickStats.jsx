import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Wallet, Clock, CreditCard } from 'lucide-react';
import { formatCurrency, getMonthRange, calculateTotalByType } from '../../lib/utils';

/**
 * QuickStats - Quick statistics widget for key financial metrics
 */
export const QuickStats = ({ transactions }) => {
    const stats = useMemo(() => {
        const today = new Date();
        const todayStr = today.toDateString();

        // Today's spending
        const todaySpend = transactions
            .filter(t => t.type === 'debit' && new Date(t.date).toDateString() === todayStr)
            .reduce((sum, t) => sum + t.amount, 0);

        // This week's spending
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const thisWeekSpend = transactions
            .filter(t => t.type === 'debit' && new Date(t.date) >= weekStart)
            .reduce((sum, t) => sum + t.amount, 0);

        // This month range
        const thisMonthRange = getMonthRange(0);
        const thisMonthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(thisMonthRange.start) && d <= new Date(thisMonthRange.end);
        });

        const thisMonthSpend = calculateTotalByType(thisMonthTxns, 'debit');
        const transactionCount = thisMonthTxns.filter(t => t.type === 'debit').length;
        const avgTransaction = transactionCount > 0 ? thisMonthSpend / transactionCount : 0;

        // Largest transaction this month
        const expenses = thisMonthTxns.filter(t => t.type === 'debit');
        const largestTxn = expenses.reduce((max, t) => t.amount > max.amount ? t : max, { amount: 0 });

        return {
            todaySpend,
            thisWeekSpend,
            thisMonthSpend,
            transactionCount,
            avgTransaction,
            largestTxn,
        };
    }, [transactions]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Wallet className="text-indigo-500" size={20} />
                    <CardTitle>Quick Stats</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {/* Today & This Week */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                            <div className="flex items-center space-x-1 mb-1">
                                <Clock size={12} className="text-blue-500" />
                                <span className="text-xs text-blue-600">Today</span>
                            </div>
                            <p className="text-lg font-bold text-blue-700">
                                {formatCurrency(stats.todaySpend)}
                            </p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                            <div className="flex items-center space-x-1 mb-1">
                                <Clock size={12} className="text-purple-500" />
                                <span className="text-xs text-purple-600">This Week</span>
                            </div>
                            <p className="text-lg font-bold text-purple-700">
                                {formatCurrency(stats.thisWeekSpend)}
                            </p>
                        </div>
                    </div>

                    {/* Other stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Transactions</p>
                            <p className="text-lg font-bold text-gray-900">
                                {stats.transactionCount}
                            </p>
                            <p className="text-xs text-gray-500">this month</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Avg Transaction</p>
                            <p className="text-lg font-bold text-gray-900">
                                {formatCurrency(stats.avgTransaction)}
                            </p>
                        </div>
                    </div>

                    {/* Largest transaction */}
                    {stats.largestTxn.amount > 0 && (
                        <div className="p-3 bg-orange-50 rounded-lg flex items-center justify-between">
                            <div>
                                <div className="flex items-center space-x-1">
                                    <CreditCard size={12} className="text-orange-500" />
                                    <span className="text-xs text-orange-600">Largest Expense</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                    {stats.largestTxn.merchant || stats.largestTxn.category}
                                </p>
                            </div>
                            <p className="text-lg font-bold text-orange-600">
                                {formatCurrency(stats.largestTxn.amount)}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
