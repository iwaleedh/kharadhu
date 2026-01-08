import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Calendar, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
import { formatCurrency, getMonthRange } from '../../lib/utils';
import { Modal } from '../ui/Modal';

/**
 * FinancialCalendar - Full calendar view of transactions
 */
export const FinancialCalendar = ({ transactions }) => {
    const [selectedMonth, setSelectedMonth] = useState(0);
    const [selectedDay, setSelectedDay] = useState(null);

    const calendarData = useMemo(() => {
        const range = getMonthRange(selectedMonth);
        const startDate = new Date(range.start);
        const year = startDate.getFullYear();
        const month = startDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfWeek = new Date(year, month, 1).getDay();

        // Group transactions by day
        const dayTransactions = {};

        transactions
            .filter(t => {
                const d = new Date(t.date);
                return d >= new Date(range.start) && d <= new Date(range.end);
            })
            .forEach(t => {
                const day = new Date(t.date).getDate();
                if (!dayTransactions[day]) {
                    dayTransactions[day] = { income: 0, expense: 0, transactions: [] };
                }
                if (t.type === 'credit') {
                    dayTransactions[day].income += t.amount;
                } else {
                    dayTransactions[day].expense += t.amount;
                }
                dayTransactions[day].transactions.push(t);
            });

        // Build calendar grid
        const weeks = [];
        let currentWeek = new Array(firstDayOfWeek).fill(null);

        for (let day = 1; day <= daysInMonth; day++) {
            const dayData = dayTransactions[day] || { income: 0, expense: 0, transactions: [] };
            currentWeek.push({
                day,
                ...dayData,
                hasActivity: dayData.transactions.length > 0,
            });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeks.push(currentWeek);
        }

        const monthLabel = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        return { weeks, monthLabel, dayTransactions };
    }, [transactions, selectedMonth]);

    const handleDayClick = (dayData) => {
        if (dayData?.hasActivity) {
            setSelectedDay(dayData);
        }
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Calendar className="text-blue-500" size={20} />
                            <CardTitle>Financial Calendar</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setSelectedMonth(m => Math.min(m + 1, 11))}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
                                {calendarData.monthLabel}
                            </span>
                            <button
                                onClick={() => setSelectedMonth(m => Math.max(m - 1, 0))}
                                disabled={selectedMonth === 0}
                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-40"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map((day) => (
                            <div key={day} className="text-center text-xs text-gray-500 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="space-y-1">
                        {calendarData.weeks.map((week, weekIdx) => (
                            <div key={weekIdx} className="grid grid-cols-7 gap-1">
                                {week.map((dayData, dayIdx) => (
                                    <div
                                        key={dayIdx}
                                        onClick={() => handleDayClick(dayData)}
                                        className={`min-h-[48px] p-1 rounded border ${dayData
                                                ? dayData.hasActivity
                                                    ? 'bg-white border-gray-300 cursor-pointer hover:border-orange-400'
                                                    : 'bg-gray-50 border-gray-100'
                                                : 'border-transparent'
                                            }`}
                                    >
                                        {dayData && (
                                            <>
                                                <div className="text-xs text-gray-600">{dayData.day}</div>
                                                {dayData.hasActivity && (
                                                    <div className="space-y-0.5">
                                                        {dayData.income > 0 && (
                                                            <div className="text-xs text-green-600 truncate">
                                                                +{formatCurrency(dayData.income, true)}
                                                            </div>
                                                        )}
                                                        {dayData.expense > 0 && (
                                                            <div className="text-xs text-red-600 truncate">
                                                                -{formatCurrency(dayData.expense, true)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Day detail modal */}
            <Modal
                isOpen={!!selectedDay}
                onClose={() => setSelectedDay(null)}
                title={selectedDay ? `${calendarData.monthLabel.split(' ')[0]} ${selectedDay.day}` : ''}
            >
                {selectedDay && (
                    <div className="space-y-3">
                        {/* Summary */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-green-50 rounded-lg text-center">
                                <p className="text-xs text-green-600">Income</p>
                                <p className="font-semibold text-green-700">
                                    {formatCurrency(selectedDay.income)}
                                </p>
                            </div>
                            <div className="p-2 bg-red-50 rounded-lg text-center">
                                <p className="text-xs text-red-600">Expenses</p>
                                <p className="font-semibold text-red-700">
                                    {formatCurrency(selectedDay.expense)}
                                </p>
                            </div>
                        </div>

                        {/* Transactions list */}
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {selectedDay.transactions.map((t, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {t.merchant || t.category}
                                        </p>
                                        <p className="text-xs text-gray-500">{t.category}</p>
                                    </div>
                                    <span className={`font-medium ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};
