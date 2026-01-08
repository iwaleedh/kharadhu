import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatCurrency, getMonthRange, calculateTotalByType } from '../../lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * SpendingForecast - Predict end-of-month spending
 */
export const SpendingForecast = ({ transactions }) => {
    const forecast = useMemo(() => {
        const today = new Date();
        const dayOfMonth = today.getDate();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const daysRemaining = daysInMonth - dayOfMonth;

        // Get this month's data
        const thisMonthRange = getMonthRange(0);
        const thisMonthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(thisMonthRange.start) && d <= new Date(thisMonthRange.end);
        });

        const currentExpenses = calculateTotalByType(thisMonthTxns, 'debit');
        const currentIncome = calculateTotalByType(thisMonthTxns, 'credit');

        // Calculate daily spending for forecast
        const dailyAverage = dayOfMonth > 0 ? currentExpenses / dayOfMonth : 0;
        const projectedTotal = dailyAverage * daysInMonth;
        const projectedRemaining = dailyAverage * daysRemaining;

        // Get last month for comparison
        const lastMonthRange = getMonthRange(1);
        const lastMonthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(lastMonthRange.start) && d <= new Date(lastMonthRange.end);
        });
        const lastMonthExpenses = calculateTotalByType(lastMonthTxns, 'debit');

        // Build cumulative spending chart data
        const cumulativeData = [];
        let cumulative = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const dayTxns = thisMonthTxns.filter(t => new Date(t.date).getDate() === day && t.type === 'debit');
            const daySpending = dayTxns.reduce((sum, t) => sum + t.amount, 0);

            if (day <= dayOfMonth) {
                cumulative += daySpending;
                cumulativeData.push({
                    day,
                    actual: cumulative,
                    projected: null,
                });
            } else {
                // Forecast future days
                cumulative += dailyAverage;
                cumulativeData.push({
                    day,
                    actual: null,
                    projected: cumulative,
                });
            }
        }

        // Determine forecast status
        let status = 'normal';
        let statusMessage = '';

        if (projectedTotal > lastMonthExpenses * 1.2) {
            status = 'warning';
            statusMessage = `On track to exceed last month by ${formatCurrency(projectedTotal - lastMonthExpenses)}`;
        } else if (projectedTotal < lastMonthExpenses * 0.8) {
            status = 'good';
            statusMessage = `On track to save ${formatCurrency(lastMonthExpenses - projectedTotal)} vs last month`;
        } else {
            status = 'normal';
            statusMessage = 'Spending is similar to last month';
        }

        return {
            currentExpenses,
            currentIncome,
            dailyAverage,
            projectedTotal,
            projectedRemaining,
            lastMonthExpenses,
            dayOfMonth,
            daysRemaining,
            daysInMonth,
            status,
            statusMessage,
            cumulativeData,
        };
    }, [transactions]);

    const getStatusIcon = () => {
        switch (forecast.status) {
            case 'warning': return <AlertTriangle size={18} className="text-orange-500" />;
            case 'good': return <CheckCircle size={18} className="text-green-500" />;
            default: return <TrendingUp size={18} className="text-blue-500" />;
        }
    };

    const getStatusColor = () => {
        switch (forecast.status) {
            case 'warning': return 'text-orange-600 bg-orange-50';
            case 'good': return 'text-green-600 bg-green-50';
            default: return 'text-blue-600 bg-blue-50';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <TrendingUp className="text-indigo-500" size={20} />
                    <CardTitle>Spending Forecast</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {/* Status banner */}
                <div className={`p-3 rounded-lg mb-4 flex items-start space-x-2 ${getStatusColor()}`}>
                    {getStatusIcon()}
                    <div>
                        <p className="text-sm font-medium">{forecast.statusMessage}</p>
                        <p className="text-xs mt-0.5 opacity-80">
                            {forecast.daysRemaining} days remaining in this month
                        </p>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Spent So Far</p>
                        <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(forecast.currentExpenses)}
                        </p>
                        <p className="text-xs text-gray-500">
                            Day {forecast.dayOfMonth} of {forecast.daysInMonth}
                        </p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg">
                        <p className="text-xs text-indigo-600">Projected Total</p>
                        <p className="text-lg font-bold text-indigo-700">
                            {formatCurrency(forecast.projectedTotal)}
                        </p>
                        <p className="text-xs text-indigo-500">
                            ~{formatCurrency(forecast.dailyAverage)}/day
                        </p>
                    </div>
                </div>

                {/* Comparison with last month */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                    <span className="text-sm text-gray-600">Last month total:</span>
                    <span className="font-medium text-gray-900">
                        {formatCurrency(forecast.lastMonthExpenses)}
                    </span>
                </div>

                {/* Cumulative chart */}
                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecast.cumulativeData}>
                            <defs>
                                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#A5B4FC" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#A5B4FC" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="day"
                                tick={{ fontSize: 10 }}
                                tickFormatter={(v) => v % 5 === 0 ? v : ''}
                            />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{ fontSize: '12px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="actual"
                                stroke="#6366F1"
                                fillOpacity={1}
                                fill="url(#colorActual)"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="projected"
                                stroke="#A5B4FC"
                                fillOpacity={1}
                                fill="url(#colorProjected)"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-center text-gray-400 mt-1">
                    Solid: Actual | Dashed: Projected
                </p>
            </CardContent>
        </Card>
    );
};
