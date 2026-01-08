import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Clock, Sun, Sunset, Moon } from 'lucide-react';
import { formatCurrency, getMonthRange } from '../../lib/utils';

/**
 * TimePatterns - Shows spending patterns by time of day
 */
export const TimePatterns = ({ transactions }) => {
    const patterns = useMemo(() => {
        const thisMonthRange = getMonthRange(0);
        const expenses = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(thisMonthRange.start) &&
                d <= new Date(thisMonthRange.end) &&
                t.type === 'debit';
        });

        // Group by time of day
        const timeSlots = {
            morning: { label: 'Morning', icon: Sun, range: '6AM-12PM', total: 0, count: 0, color: 'text-yellow-500', bg: 'bg-yellow-50' },
            afternoon: { label: 'Afternoon', icon: Sun, range: '12PM-5PM', total: 0, count: 0, color: 'text-orange-500', bg: 'bg-orange-50' },
            evening: { label: 'Evening', icon: Sunset, range: '5PM-9PM', total: 0, count: 0, color: 'text-purple-500', bg: 'bg-purple-50' },
            night: { label: 'Night', icon: Moon, range: '9PM-6AM', total: 0, count: 0, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        };

        expenses.forEach(t => {
            const hour = new Date(t.date).getHours();
            let slot;

            if (hour >= 6 && hour < 12) slot = 'morning';
            else if (hour >= 12 && hour < 17) slot = 'afternoon';
            else if (hour >= 17 && hour < 21) slot = 'evening';
            else slot = 'night';

            timeSlots[slot].total += t.amount;
            timeSlots[slot].count++;
        });

        const total = Object.values(timeSlots).reduce((sum, s) => sum + s.total, 0);

        // Calculate percentages
        Object.values(timeSlots).forEach(slot => {
            slot.percentage = total > 0 ? (slot.total / total) * 100 : 0;
        });

        // Find peak spending time
        const peak = Object.entries(timeSlots).reduce((max, [key, val]) =>
            val.total > max.total ? { key, ...val } : max
            , { total: 0 });

        return { timeSlots, total, peak };
    }, [transactions]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Clock className="text-blue-500" size={20} />
                    <CardTitle>Time Patterns</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {Object.entries(patterns.timeSlots).map(([key, slot]) => {
                        const Icon = slot.icon;
                        return (
                            <div key={key} className={`p-3 rounded-lg ${slot.bg}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center space-x-2">
                                        <Icon size={16} className={slot.color} />
                                        <span className="text-sm font-medium text-gray-900">{slot.label}</span>
                                        <span className="text-xs text-gray-500">({slot.range})</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">
                                        {formatCurrency(slot.total)}
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${slot.color.replace('text-', 'bg-')} transition-all duration-500`}
                                        style={{ width: `${slot.percentage}%` }}
                                    />
                                </div>

                                <div className="flex justify-between mt-1 text-xs text-gray-500">
                                    <span>{slot.count} transactions</span>
                                    <span>{slot.percentage.toFixed(0)}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Peak time insight */}
                {patterns.peak.total > 0 && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600">
                            Peak spending time: <strong>{patterns.peak.label}</strong>
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
