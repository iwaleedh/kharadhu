import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, getMonthRange, calculateTotalByType, groupByCategory } from '../../lib/utils';

/**
 * ExpenseComparison - Side-by-side month comparison widget
 */
export const ExpenseComparison = ({ transactions, month1 = 0, month2 = 1 }) => {
    const comparison = useMemo(() => {
        const getMonthData = (offset) => {
            const range = getMonthRange(offset);
            const date = new Date();
            date.setMonth(date.getMonth() - offset);

            const monthTxns = transactions.filter(t => {
                const d = new Date(t.date);
                return d >= new Date(range.start) && d <= new Date(range.end);
            });

            return {
                label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                income: calculateTotalByType(monthTxns, 'credit'),
                expenses: calculateTotalByType(monthTxns, 'debit'),
                transactions: monthTxns.length,
                categories: groupByCategory(monthTxns.filter(t => t.type === 'debit')),
            };
        };

        const m1 = getMonthData(month1);
        const m2 = getMonthData(month2);

        const expenseChange = m2.expenses > 0
            ? ((m1.expenses - m2.expenses) / m2.expenses) * 100
            : 0;

        return { m1, m2, expenseChange };
    }, [transactions, month1, month2]);

    const getTrendIcon = (change) => {
        if (change > 5) return <TrendingUp size={14} className="text-red-500" />;
        if (change < -5) return <TrendingDown size={14} className="text-green-500" />;
        return <Minus size={14} className="text-gray-400" />;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Calendar className="text-blue-500" size={20} />
                    <CardTitle>Month Comparison</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    {/* Month 1 */}
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">{comparison.m1.label}</p>
                        <p className="text-lg font-bold text-red-600">
                            {formatCurrency(comparison.m1.expenses)}
                        </p>
                        <p className="text-xs text-gray-500">{comparison.m1.transactions} txns</p>
                    </div>

                    {/* Month 2 */}
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">{comparison.m2.label}</p>
                        <p className="text-lg font-bold text-gray-700">
                            {formatCurrency(comparison.m2.expenses)}
                        </p>
                        <p className="text-xs text-gray-500">{comparison.m2.transactions} txns</p>
                    </div>
                </div>

                {/* Change indicator */}
                <div className="mt-3 flex items-center justify-center space-x-2">
                    {getTrendIcon(comparison.expenseChange)}
                    <span className={`text-sm font-medium ${comparison.expenseChange > 5 ? 'text-red-600' :
                        comparison.expenseChange < -5 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                        {comparison.expenseChange > 0 ? '+' : ''}
                        {comparison.expenseChange.toFixed(0)}% vs last month
                    </span>
                </div>

                {/* Top categories comparison */}
                <div className="mt-4 space-y-2">
                    <p className="text-xs text-gray-500 font-medium">Top Categories</p>
                    {comparison.m1.categories.slice(0, 3).map((cat) => {
                        const prevCat = comparison.m2.categories.find(c => c.category === cat.category);
                        const prevTotal = prevCat?.total || 0;
                        const change = prevTotal > 0 ? ((cat.total - prevTotal) / prevTotal) * 100 : 0;

                        return (
                            <div key={cat.category} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">{cat.category}</span>
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium">{formatCurrency(cat.total)}</span>
                                    {prevTotal > 0 && (
                                        <span className={`text-xs ${change > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                            {change > 0 ? '↑' : '↓'}{Math.abs(change).toFixed(0)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
