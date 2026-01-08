import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Store, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { useTransactionStore } from '../../store/transactionStore';
import { formatCurrency } from '../../lib/utils';

export const MerchantAnalytics = () => {
    const { transactions } = useTransactionStore();

    // Get merchant statistics
    const merchantStats = useMemo(() => {
        const stats = {};
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // Only consider expense transactions
        const expenses = transactions.filter(t => t.type === 'debit' && t.merchant);

        expenses.forEach(t => {
            const merchant = t.merchant.trim();
            const tDate = new Date(t.date);

            if (!stats[merchant]) {
                stats[merchant] = {
                    name: merchant,
                    totalAmount: 0,
                    count: 0,
                    thisMonth: 0,
                    lastMonth: 0,
                    lastTransaction: null,
                    category: t.category,
                };
            }

            stats[merchant].totalAmount += t.amount;
            stats[merchant].count += 1;

            if (!stats[merchant].lastTransaction || tDate > new Date(stats[merchant].lastTransaction)) {
                stats[merchant].lastTransaction = t.date;
            }

            // This month
            if (tDate >= thisMonth) {
                stats[merchant].thisMonth += t.amount;
            }
            // Last month
            if (tDate >= lastMonth && tDate <= lastMonthEnd) {
                stats[merchant].lastMonth += t.amount;
            }
        });

        // Calculate trends and sort by total amount
        return Object.values(stats)
            .map(m => {
                let trend = 'stable';
                let trendPercent = 0;

                if (m.lastMonth > 0 && m.thisMonth > 0) {
                    trendPercent = ((m.thisMonth - m.lastMonth) / m.lastMonth) * 100;
                    if (trendPercent > 10) trend = 'up';
                    else if (trendPercent < -10) trend = 'down';
                }

                return { ...m, trend, trendPercent };
            })
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, 15); // Top 15 merchants
    }, [transactions]);

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up':
                return <TrendingUp size={14} className="text-red-500" />;
            case 'down':
                return <TrendingDown size={14} className="text-green-500" />;
            default:
                return <Minus size={14} className="text-gray-400" />;
        }
    };

    const formatTrend = (percent) => {
        if (percent === 0) return '';
        const sign = percent > 0 ? '+' : '';
        return `${sign}${percent.toFixed(0)}%`;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Store className="text-purple-500" size={20} />
                    <CardTitle>Top Merchants</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {merchantStats.length === 0 ? (
                    <p className="text-center text-gray-500 py-4 text-sm">
                        No merchant data yet. Import transactions to see analytics.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {merchantStats.map((merchant, index) => (
                            <div
                                key={merchant.name}
                                className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-400 text-xs font-mono">
                                                #{index + 1}
                                            </span>
                                            <h4 className="font-medium text-gray-900 truncate">
                                                {merchant.name}
                                            </h4>
                                        </div>
                                        <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                                            <span>{merchant.count} transactions</span>
                                            {merchant.category && (
                                                <span className="text-gray-400">• {merchant.category}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end ml-4">
                                        <span className="font-semibold text-gray-900">
                                            {formatCurrency(merchant.totalAmount)}
                                        </span>

                                        {(merchant.thisMonth > 0 || merchant.lastMonth > 0) && (
                                            <div className="flex items-center space-x-1 mt-1">
                                                {getTrendIcon(merchant.trend)}
                                                <span className={`text-xs ${merchant.trend === 'up' ? 'text-red-500' :
                                                        merchant.trend === 'down' ? 'text-green-500' :
                                                            'text-gray-400'
                                                    }`}>
                                                    {formatTrend(merchant.trendPercent)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Monthly comparison bar */}
                                <div className="mt-2 flex items-center space-x-2">
                                    <div className="flex-1 flex items-center space-x-1">
                                        <span className="text-xs text-gray-400 w-16">This mo:</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                            <div
                                                className="h-1.5 rounded-full bg-red-400"
                                                style={{
                                                    width: `${Math.min((merchant.thisMonth / merchant.totalAmount) * 100 * 2, 100)}%`
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-600 w-20 text-right">
                                            {formatCurrency(merchant.thisMonth)}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-1 flex items-center space-x-2">
                                    <div className="flex-1 flex items-center space-x-1">
                                        <span className="text-xs text-gray-400 w-16">Last mo:</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                            <div
                                                className="h-1.5 rounded-full bg-gray-400"
                                                style={{
                                                    width: `${Math.min((merchant.lastMonth / merchant.totalAmount) * 100 * 2, 100)}%`
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 w-20 text-right">
                                            {formatCurrency(merchant.lastMonth)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
