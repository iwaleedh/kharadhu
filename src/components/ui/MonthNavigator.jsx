import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

/**
 * MonthNavigator - Easy month navigation component
 */
export const MonthNavigator = ({ selectedMonth, onMonthChange, showYear = true }) => {
    const getMonthInfo = (offset) => {
        const date = new Date();
        date.setMonth(date.getMonth() - offset);
        return {
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            year: date.getFullYear(),
            fullMonth: date.toLocaleDateString('en-US', { month: 'long' }),
        };
    };

    const currentInfo = getMonthInfo(selectedMonth);

    const handlePrevious = () => {
        if (selectedMonth < 11) { // Limit to 12 months back
            onMonthChange(selectedMonth + 1);
        }
    };

    const handleNext = () => {
        if (selectedMonth > 0) {
            onMonthChange(selectedMonth - 1);
        }
    };

    return (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-2">
            <button
                onClick={handlePrevious}
                disabled={selectedMonth >= 11}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous month"
            >
                <ChevronLeft size={20} className="text-gray-600" />
            </button>

            <div className="flex items-center space-x-2">
                <Calendar size={18} className="text-orange-500" />
                <div className="text-center">
                    <span className="font-semibold text-gray-900">{currentInfo.fullMonth}</span>
                    {showYear && (
                        <span className="text-gray-500 ml-1">{currentInfo.year}</span>
                    )}
                </div>
            </div>

            <button
                onClick={handleNext}
                disabled={selectedMonth <= 0}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next month"
            >
                <ChevronRight size={20} className="text-gray-600" />
            </button>
        </div>
    );
};

/**
 * MonthQuickPicker - Quick month selection buttons
 */
export const MonthQuickPicker = ({ selectedMonth, onMonthChange }) => {
    const months = [
        { label: 'This Month', value: 0 },
        { label: 'Last Month', value: 1 },
        { label: '2 Mo Ago', value: 2 },
        { label: '3 Mo Ago', value: 3 },
    ];

    return (
        <div className="flex space-x-1 overflow-x-auto pb-1">
            {months.map((m) => (
                <button
                    key={m.value}
                    onClick={() => onMonthChange(m.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedMonth === m.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {m.label}
                </button>
            ))}
        </div>
    );
};
