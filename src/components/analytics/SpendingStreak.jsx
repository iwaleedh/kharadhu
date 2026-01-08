import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Flame, Calendar, Award, Zap } from 'lucide-react';
import { formatCurrency, getMonthRange } from '../../lib/utils';

/**
 * SpendingStreak - Shows streak information about spending habits
 */
export const SpendingStreak = ({ transactions }) => {
    const streakData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all expense transactions sorted by date
        const expenses = transactions
            .filter(t => t.type === 'debit')
            .map(t => ({ ...t, dateObj: new Date(t.date) }))
            .sort((a, b) => b.dateObj - a.dateObj);

        if (expenses.length === 0) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                noSpendDays: 0,
                lastSpendDate: null,
                avgDailySpend: 0,
                spendFreeDays: [],
            };
        }

        // Calculate current no-spend streak (days without spending)
        let currentNoSpendStreak = 0;
        let checkDate = new Date(today);

        // Check if today has spending
        const todaySpend = expenses.find(e =>
            e.dateObj.toDateString() === checkDate.toDateString()
        );

        if (!todaySpend) {
            currentNoSpendStreak = 1;
            checkDate.setDate(checkDate.getDate() - 1);

            // Count consecutive no-spend days going back
            while (currentNoSpendStreak < 30) {
                const daySpend = expenses.find(e =>
                    e.dateObj.toDateString() === checkDate.toDateString()
                );
                if (daySpend) break;
                currentNoSpendStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
        }

        // Calculate spend-free days this month
        const thisMonthRange = getMonthRange(0);
        const thisMonthExpenses = expenses.filter(e =>
            e.dateObj >= new Date(thisMonthRange.start) &&
            e.dateObj <= new Date(thisMonthRange.end)
        );

        const spendDaysSet = new Set(
            thisMonthExpenses.map(e => e.dateObj.toDateString())
        );

        const daysPassed = today.getDate();
        const noSpendDaysThisMonth = daysPassed - spendDaysSet.size;

        // Calculate average daily spend
        const thisMonthTotal = thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
        const avgDailySpend = daysPassed > 0 ? thisMonthTotal / daysPassed : 0;

        // Find longest no-spend streak in last 30 days
        let longestStreak = 0;
        let currentStreak = 0;

        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);

            const dayHasSpend = expenses.some(e =>
                e.dateObj.toDateString() === checkDate.toDateString()
            );

            if (!dayHasSpend) {
                currentStreak++;
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                }
            } else {
                currentStreak = 0;
            }
        }

        return {
            currentNoSpendStreak,
            longestStreak,
            noSpendDaysThisMonth,
            daysPassed,
            avgDailySpend,
            spendFrequency: spendDaysSet.size,
        };
    }, [transactions]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Flame className="text-orange-500" size={20} />
                    <CardTitle>Spending Streaks</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    {/* Current No-Spend Streak */}
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                        <Zap className="w-6 h-6 text-green-500 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-green-600">
                            {streakData.currentNoSpendStreak}
                        </p>
                        <p className="text-xs text-green-700">Days No Spend</p>
                    </div>

                    {/* Longest Streak */}
                    <div className="p-3 bg-purple-50 rounded-lg text-center">
                        <Award className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-purple-600">
                            {streakData.longestStreak}
                        </p>
                        <p className="text-xs text-purple-700">Best Streak (30d)</p>
                    </div>

                    {/* No-Spend Days This Month */}
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                        <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-blue-600">
                            {streakData.noSpendDaysThisMonth}
                        </p>
                        <p className="text-xs text-blue-700">
                            No-Spend Days / {streakData.daysPassed}
                        </p>
                    </div>

                    {/* Average Daily Spend */}
                    <div className="p-3 bg-orange-50 rounded-lg text-center">
                        <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-orange-600">
                            {formatCurrency(streakData.avgDailySpend)}
                        </p>
                        <p className="text-xs text-orange-700">Avg Daily Spend</p>
                    </div>
                </div>

                {/* Encouragement message */}
                <div className="mt-3 p-2 bg-gray-50 rounded-lg text-center">
                    {streakData.currentNoSpendStreak >= 3 ? (
                        <p className="text-sm text-green-600">
                            🎉 Amazing! {streakData.currentNoSpendStreak} days without spending!
                        </p>
                    ) : streakData.noSpendDaysThisMonth >= 5 ? (
                        <p className="text-sm text-blue-600">
                            👍 {streakData.noSpendDaysThisMonth} spend-free days this month!
                        </p>
                    ) : (
                        <p className="text-sm text-gray-600">
                            💡 Try to have at least 1 no-spend day per week
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
