import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

/**
 * WeeklySummary - Shows spending by day of week
 */
export const WeeklySummary = ({ transactions }) => {
    const weeklyData = useMemo(() => {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayTotals = [0, 0, 0, 0, 0, 0, 0];
        const dayCounts = [0, 0, 0, 0, 0, 0, 0];

        // Only consider last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        transactions
            .filter(t => t.type === 'debit' && new Date(t.date) >= thirtyDaysAgo)
            .forEach(t => {
                const dayOfWeek = new Date(t.date).getDay();
                dayTotals[dayOfWeek] += t.amount;
                dayCounts[dayOfWeek]++;
            });

        const data = dayNames.map((name, index) => ({
            day: name,
            total: dayTotals[index],
            count: dayCounts[index],
            avg: dayCounts[index] > 0 ? dayTotals[index] / dayCounts[index] : 0,
        }));

        const maxSpend = Math.max(...dayTotals);
        const minSpend = Math.min(...dayTotals.filter(t => t > 0));
        const maxDay = dayNames[dayTotals.indexOf(maxSpend)];
        const minDay = dayNames[dayTotals.indexOf(minSpend)];

        return { data, maxDay, minDay, maxSpend, minSpend };
    }, [transactions]);

    const getBarColor = (value, max) => {
        const intensity = max > 0 ? value / max : 0;
        if (intensity > 0.8) return '#ef4444';
        if (intensity > 0.6) return '#f97316';
        if (intensity > 0.4) return '#eab308';
        if (intensity > 0.2) return '#22c55e';
        return '#86efac';
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Clock className="text-blue-500" size={20} />
                    <CardTitle>Weekly Patterns</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {/* Chart */}
                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData.data}>
                            <XAxis
                                dataKey="day"
                                tick={{ fontSize: 11 }}
                                stroke="#9ca3af"
                            />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                                stroke="#9ca3af"
                            />
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                            />
                            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                {weeklyData.data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={getBarColor(entry.total, weeklyData.maxSpend)}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Insights */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="p-2 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-1">
                            <TrendingUp size={12} className="text-red-500" />
                            <span className="text-xs text-red-600">Most Spent</span>
                        </div>
                        <p className="font-semibold text-red-700">{weeklyData.maxDay}</p>
                        <p className="text-xs text-red-600">{formatCurrency(weeklyData.maxSpend)}</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-1">
                            <TrendingDown size={12} className="text-green-500" />
                            <span className="text-xs text-green-600">Least Spent</span>
                        </div>
                        <p className="font-semibold text-green-700">{weeklyData.minDay}</p>
                        <p className="text-xs text-green-600">{formatCurrency(weeklyData.minSpend)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
