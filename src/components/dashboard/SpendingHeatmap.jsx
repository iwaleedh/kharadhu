import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Flame } from 'lucide-react';
import { formatCurrency, getMonthRange } from '../../lib/utils';

/**
 * SpendingHeatmap - Calendar view showing daily spending intensity
 */
export const SpendingHeatmap = ({ transactions, selectedMonth = 0 }) => {
    const heatmapData = useMemo(() => {
        const range = getMonthRange(selectedMonth);
        const startDate = new Date(range.start);
        const endDate = new Date(range.end);

        // Get month info
        const year = startDate.getFullYear();
        const month = startDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfWeek = new Date(year, month, 1).getDay();

        // Calculate daily spending
        const dailySpending = {};
        let maxSpending = 0;

        transactions
            .filter(t => {
                const d = new Date(t.date);
                return d >= startDate && d <= endDate && t.type === 'debit';
            })
            .forEach(t => {
                const day = new Date(t.date).getDate();
                dailySpending[day] = (dailySpending[day] || 0) + t.amount;
                if (dailySpending[day] > maxSpending) {
                    maxSpending = dailySpending[day];
                }
            });

        // Build calendar grid
        const weeks = [];
        let currentWeek = new Array(firstDayOfWeek).fill(null);

        for (let day = 1; day <= daysInMonth; day++) {
            currentWeek.push({
                day,
                spending: dailySpending[day] || 0,
                intensity: maxSpending > 0 ? (dailySpending[day] || 0) / maxSpending : 0,
            });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        // Fill remaining days
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeks.push(currentWeek);
        }

        const monthLabel = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const totalSpending = Object.values(dailySpending).reduce((a, b) => a + b, 0);
        const avgDaily = daysInMonth > 0 ? totalSpending / daysInMonth : 0;

        return { weeks, monthLabel, maxSpending, totalSpending, avgDaily, daysInMonth };
    }, [transactions, selectedMonth]);

    const getIntensityColor = (intensity) => {
        if (intensity === 0) return 'bg-gray-100';
        if (intensity < 0.25) return 'bg-green-200';
        if (intensity < 0.5) return 'bg-yellow-300';
        if (intensity < 0.75) return 'bg-orange-400';
        return 'bg-red-500';
    };

    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Flame className="text-orange-500" size={20} />
                        <CardTitle>Spending Heatmap</CardTitle>
                    </div>
                    <span className="text-xs text-gray-500">{heatmapData.monthLabel}</span>
                </div>
            </CardHeader>
            <CardContent>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(heatmapData.totalSpending)}
                        </p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Daily Avg</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(heatmapData.avgDaily)}
                        </p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Peak Day</p>
                        <p className="text-sm font-semibold text-red-600">
                            {formatCurrency(heatmapData.maxSpending)}
                        </p>
                    </div>
                </div>

                {/* Calendar grid */}
                <div className="space-y-1">
                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-1">
                        {weekDays.map((day, i) => (
                            <div key={i} className="text-center text-xs text-gray-400 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    {heatmapData.weeks.map((week, weekIdx) => (
                        <div key={weekIdx} className="grid grid-cols-7 gap-1">
                            {week.map((dayData, dayIdx) => (
                                <div
                                    key={dayIdx}
                                    className={`aspect-square rounded-sm flex items-center justify-center text-xs ${dayData
                                            ? `${getIntensityColor(dayData.intensity)} ${dayData.intensity > 0.5 ? 'text-white' : 'text-gray-700'}`
                                            : 'bg-transparent'
                                        }`}
                                    title={dayData ? `${dayData.day}: ${formatCurrency(dayData.spending)}` : ''}
                                >
                                    {dayData?.day}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-3 flex items-center justify-center space-x-1">
                    <span className="text-xs text-gray-500">Less</span>
                    <div className="w-4 h-4 rounded-sm bg-gray-100" />
                    <div className="w-4 h-4 rounded-sm bg-green-200" />
                    <div className="w-4 h-4 rounded-sm bg-yellow-300" />
                    <div className="w-4 h-4 rounded-sm bg-orange-400" />
                    <div className="w-4 h-4 rounded-sm bg-red-500" />
                    <span className="text-xs text-gray-500">More</span>
                </div>
            </CardContent>
        </Card>
    );
};
