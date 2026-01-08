import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Award, Star, Target, Zap, Shield, TrendingDown } from 'lucide-react';
import { getMonthRange, calculateTotalByType } from '../../lib/utils';

// Badge definitions
const BADGE_DEFINITIONS = [
    {
        id: 'saver',
        name: 'Super Saver',
        icon: Shield,
        color: 'text-green-500',
        bg: 'bg-green-100',
        check: (data) => data.savingsRate >= 30,
        description: '30%+ savings rate',
    },
    {
        id: 'budgeteer',
        name: 'Budget Master',
        icon: Target,
        color: 'text-blue-500',
        bg: 'bg-blue-100',
        check: (data) => data.underBudgetCategories >= 3,
        description: '3+ categories under budget',
    },
    {
        id: 'streak',
        name: 'Streak Keeper',
        icon: Zap,
        color: 'text-yellow-500',
        bg: 'bg-yellow-100',
        check: (data) => data.noSpendDays >= 5,
        description: '5+ no-spend days',
    },
    {
        id: 'reducer',
        name: 'Spending Reducer',
        icon: TrendingDown,
        color: 'text-purple-500',
        bg: 'bg-purple-100',
        check: (data) => data.spendingReduction >= 10,
        description: '10%+ less than last month',
    },
    {
        id: 'consistent',
        name: 'Consistent Tracker',
        icon: Star,
        color: 'text-orange-500',
        bg: 'bg-orange-100',
        check: (data) => data.trackingDays >= 20,
        description: '20+ days tracked',
    },
];

/**
 * MonthlyBadges - Achievement badges for the current month
 */
export const MonthlyBadges = ({ transactions, categories }) => {
    const badges = useMemo(() => {
        const today = new Date();
        const thisMonthRange = getMonthRange(0);
        const lastMonthRange = getMonthRange(1);

        const thisMonthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(thisMonthRange.start) && d <= new Date(thisMonthRange.end);
        });

        const lastMonthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(lastMonthRange.start) && d <= new Date(lastMonthRange.end);
        });

        const thisMonthIncome = calculateTotalByType(thisMonthTxns, 'credit');
        const thisMonthExpenses = calculateTotalByType(thisMonthTxns, 'debit');
        const lastMonthExpenses = calculateTotalByType(lastMonthTxns, 'debit');

        // Calculate metrics
        const savingsRate = thisMonthIncome > 0
            ? ((thisMonthIncome - thisMonthExpenses) / thisMonthIncome) * 100
            : 0;

        // Count categories under budget
        const underBudgetCategories = categories.filter(c => {
            if (c.type !== 'expense' || !c.budget || c.budget <= 0) return false;
            const spent = thisMonthTxns
                .filter(t => t.category === c.name && t.type === 'debit')
                .reduce((sum, t) => sum + t.amount, 0);
            return spent < c.budget;
        }).length;

        // Count no-spend days
        const spendDays = new Set(
            thisMonthTxns
                .filter(t => t.type === 'debit')
                .map(t => new Date(t.date).toDateString())
        );
        const noSpendDays = today.getDate() - spendDays.size;

        // Calculate spending reduction
        const spendingReduction = lastMonthExpenses > 0
            ? ((lastMonthExpenses - thisMonthExpenses) / lastMonthExpenses) * 100
            : 0;

        // Count tracking days
        const trackingDays = new Set(
            thisMonthTxns.map(t => new Date(t.date).toDateString())
        ).size;

        const data = {
            savingsRate,
            underBudgetCategories,
            noSpendDays,
            spendingReduction,
            trackingDays,
        };

        // Check which badges are earned
        return BADGE_DEFINITIONS.map(badge => ({
            ...badge,
            earned: badge.check(data),
        }));
    }, [transactions, categories]);

    const earnedBadges = badges.filter(b => b.earned);
    const unearnedBadges = badges.filter(b => !b.earned);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Award className="text-yellow-500" size={20} />
                        <CardTitle>Monthly Badges</CardTitle>
                    </div>
                    <span className="text-xs text-gray-500">
                        {earnedBadges.length}/{badges.length} earned
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                {/* Earned badges */}
                {earnedBadges.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">🏆 Earned This Month</p>
                        <div className="flex flex-wrap gap-2">
                            {earnedBadges.map(badge => {
                                const Icon = badge.icon;
                                return (
                                    <div
                                        key={badge.id}
                                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full ${badge.bg}`}
                                    >
                                        <Icon size={14} className={badge.color} />
                                        <span className={`text-xs font-medium ${badge.color}`}>{badge.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Unearned badges */}
                {unearnedBadges.length > 0 && (
                    <div>
                        <p className="text-xs text-gray-500 mb-2">🎯 Keep Going!</p>
                        <div className="space-y-2">
                            {unearnedBadges.map(badge => {
                                const Icon = badge.icon;
                                return (
                                    <div
                                        key={badge.id}
                                        className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 opacity-60"
                                    >
                                        <Icon size={14} className="text-gray-400" />
                                        <div className="flex-1">
                                            <span className="text-xs font-medium text-gray-600">{badge.name}</span>
                                            <span className="text-xs text-gray-400 ml-2">— {badge.description}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {earnedBadges.length === badges.length && (
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-700">
                            🎉 Amazing! You've earned all badges this month!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
