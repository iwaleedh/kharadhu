import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Trophy, Medal, Award } from 'lucide-react';
import { formatCurrency, getMonthRange, groupByCategory } from '../../lib/utils';

/**
 * CategoryLeaderboard - Ranking of spending by category
 */
export const CategoryLeaderboard = ({ transactions, categories }) => {
    const leaderboard = useMemo(() => {
        const thisMonthRange = getMonthRange(0);
        const expenses = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(thisMonthRange.start) &&
                d <= new Date(thisMonthRange.end) &&
                t.type === 'debit';
        });

        const grouped = groupByCategory(expenses);
        const total = grouped.reduce((sum, c) => sum + c.total, 0);

        return grouped.slice(0, 5).map((cat, index) => {
            const categoryInfo = categories.find(c => c.name === cat.category);
            return {
                rank: index + 1,
                name: cat.category,
                icon: categoryInfo?.icon || '📁',
                total: cat.total,
                percentage: total > 0 ? (cat.total / total) * 100 : 0,
                count: cat.count,
            };
        });
    }, [transactions, categories]);

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
            case 2: return <Medal className="w-5 h-5 text-gray-400" />;
            case 3: return <Medal className="w-5 h-5 text-amber-600" />;
            default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-400">{rank}</span>;
        }
    };

    const getRankBg = (rank) => {
        switch (rank) {
            case 1: return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
            case 2: return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
            case 3: return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
            default: return 'bg-white border-gray-100';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Trophy className="text-yellow-500" size={20} />
                    <CardTitle>Category Leaderboard</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {leaderboard.length === 0 ? (
                    <p className="text-center text-gray-500 py-4 text-sm">
                        No expenses this month yet
                    </p>
                ) : (
                    <div className="space-y-2">
                        {leaderboard.map((cat) => (
                            <div
                                key={cat.name}
                                className={`p-3 rounded-lg border ${getRankBg(cat.rank)} transition-all hover:scale-[1.01]`}
                            >
                                <div className="flex items-center space-x-3">
                                    {getRankIcon(cat.rank)}
                                    <span className="text-2xl">{cat.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-gray-900 truncate">{cat.name}</h4>
                                            <span className="font-bold text-gray-900">{formatCurrency(cat.total)}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-gray-500">{cat.count} transactions</span>
                                            <span className="text-xs font-medium text-gray-600">{cat.percentage.toFixed(1)}%</span>
                                        </div>
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
