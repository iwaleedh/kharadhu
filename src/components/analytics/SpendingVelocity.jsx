import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Zap, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { formatCurrency, getMonthRange, calculateTotalByType } from '../../lib/utils';

/**
 * SpendingVelocity - Tracks how fast money is being spent
 */
export const SpendingVelocity = ({ transactions }) => {
    const velocityData = useMemo(() => {
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

        const thisMonthExpenses = calculateTotalByType(thisMonthTxns, 'debit');
        const lastMonthExpenses = calculateTotalByType(lastMonthTxns, 'debit');

        const daysPassed = today.getDate();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const daysRemaining = daysInMonth - daysPassed;

        // Current daily velocity
        const currentVelocity = daysPassed > 0 ? thisMonthExpenses / daysPassed : 0;

        // Last month's velocity
        const lastMonthDays = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        const lastMonthVelocity = lastMonthDays > 0 ? lastMonthExpenses / lastMonthDays : 0;

        // Velocity change
        const velocityChange = lastMonthVelocity > 0
            ? ((currentVelocity - lastMonthVelocity) / lastMonthVelocity) * 100
            : 0;

        // Projected end-of-month total
        const projectedTotal = currentVelocity * daysInMonth;
        const projectedVsLastMonth = lastMonthExpenses > 0
            ? ((projectedTotal - lastMonthExpenses) / lastMonthExpenses) * 100
            : 0;

        // Calculate weekly velocities for trend
        const weeklyData = [];
        for (let week = 0; week < 4; week++) {
            const weekStart = new Date(thisMonthRange.start);
            weekStart.setDate(weekStart.getDate() + (week * 7));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            if (weekEnd > today) break;

            const weekTxns = thisMonthTxns.filter(t => {
                const d = new Date(t.date);
                return d >= weekStart && d <= weekEnd && t.type === 'debit';
            });

            const weekTotal = weekTxns.reduce((sum, t) => sum + t.amount, 0);
            weeklyData.push({ week: week + 1, total: weekTotal });
        }

        // Spending trend direction
        let trend = 'stable';
        if (weeklyData.length >= 2) {
            const lastWeek = weeklyData[weeklyData.length - 1]?.total || 0;
            const prevWeek = weeklyData[weeklyData.length - 2]?.total || 0;
            if (lastWeek > prevWeek * 1.1) trend = 'increasing';
            else if (lastWeek < prevWeek * 0.9) trend = 'decreasing';
        }

        return {
            currentVelocity,
            lastMonthVelocity,
            velocityChange,
            projectedTotal,
            projectedVsLastMonth,
            daysRemaining,
            weeklyData,
            trend,
            lastMonthExpenses,
        };
    }, [transactions]);

    const getTrendIcon = () => {
        if (velocityData.trend === 'increasing') return <ArrowUp size={16} className="text-red-500" />;
        if (velocityData.trend === 'decreasing') return <ArrowDown size={16} className="text-green-500" />;
        return <Minus size={16} className="text-gray-400" />;
    };

    const getTrendColor = () => {
        if (velocityData.trend === 'increasing') return 'text-red-500';
        if (velocityData.trend === 'decreasing') return 'text-green-500';
        return 'text-gray-500';
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Zap className="text-yellow-500" size={20} />
                    <CardTitle>Spending Velocity</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {/* Main velocity display */}
                <div className="text-center mb-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Daily Burn Rate</p>
                    <p className="text-3xl font-bold text-orange-600">
                        {formatCurrency(velocityData.currentVelocity)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">per day</p>

                    <div className={`mt-2 flex items-center justify-center gap-1 ${velocityData.velocityChange <= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                        {velocityData.velocityChange <= 0 ? (
                            <ArrowDown size={14} />
                        ) : (
                            <ArrowUp size={14} />
                        )}
                        <span className="text-sm font-medium">
                            {Math.abs(velocityData.velocityChange).toFixed(0)}% vs last month
                        </span>
                    </div>
                </div>

                {/* Velocity stats grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-xs text-gray-500">Projected Total</p>
                        <p className="text-lg font-bold text-purple-600">
                            {formatCurrency(velocityData.projectedTotal)}
                        </p>
                        <p className={`text-xs ${velocityData.projectedVsLastMonth <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {velocityData.projectedVsLastMonth > 0 ? '+' : ''}
                            {velocityData.projectedVsLastMonth.toFixed(0)}% vs last month
                        </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-500">Days Remaining</p>
                        <p className="text-lg font-bold text-blue-600">{velocityData.daysRemaining}</p>
                        <p className="text-xs text-gray-500">
                            ≈ {formatCurrency(velocityData.currentVelocity * velocityData.daysRemaining)} more
                        </p>
                    </div>
                </div>

                {/* Weekly trend */}
                {velocityData.weeklyData.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">Weekly Trend</span>
                            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                                {getTrendIcon()}
                                <span className="text-xs font-medium capitalize">{velocityData.trend}</span>
                            </div>
                        </div>
                        <div className="flex items-end gap-2 h-12">
                            {velocityData.weeklyData.map((week, idx) => {
                                const maxWeek = Math.max(...velocityData.weeklyData.map(w => w.total));
                                const height = maxWeek > 0 ? (week.total / maxWeek) * 100 : 0;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-orange-400 rounded-t"
                                            style={{ height: `${Math.max(height, 5)}%` }}
                                        />
                                        <span className="text-xs text-gray-400 mt-1">W{week.week}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
