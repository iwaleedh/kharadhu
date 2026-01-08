import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CalendarRange, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, calculateTotalByType } from '../../lib/utils';

/**
 * YearComparison - Compare spending across years
 */
export const YearComparison = ({ transactions }) => {
    const currentYear = new Date().getFullYear();
    const [year1, setYear1] = useState(currentYear);
    const [year2, setYear2] = useState(currentYear - 1);

    const comparisonData = useMemo(() => {
        const getYearData = (year) => {
            const yearTxns = transactions.filter(t => {
                const d = new Date(t.date);
                return d.getFullYear() === year;
            });

            const income = calculateTotalByType(yearTxns, 'credit');
            const expenses = calculateTotalByType(yearTxns, 'debit');

            // Monthly breakdown
            const monthlyData = [];
            for (let month = 0; month < 12; month++) {
                const monthTxns = yearTxns.filter(t => new Date(t.date).getMonth() === month);
                monthlyData.push({
                    month: new Date(year, month).toLocaleDateString('en-US', { month: 'short' }),
                    expenses: calculateTotalByType(monthTxns, 'debit'),
                    income: calculateTotalByType(monthTxns, 'credit'),
                });
            }

            return { income, expenses, savings: income - expenses, monthlyData, count: yearTxns.length };
        };

        const data1 = getYearData(year1);
        const data2 = getYearData(year2);

        // Calculate changes
        const expenseChange = data2.expenses > 0
            ? ((data1.expenses - data2.expenses) / data2.expenses) * 100
            : 0;
        const incomeChange = data2.income > 0
            ? ((data1.income - data2.income) / data2.income) * 100
            : 0;

        // Combined chart data
        const chartData = data1.monthlyData.map((m, idx) => ({
            month: m.month,
            [`${year1} Expenses`]: m.expenses,
            [`${year2} Expenses`]: data2.monthlyData[idx]?.expenses || 0,
        }));

        return { year1: data1, year2: data2, expenseChange, incomeChange, chartData };
    }, [transactions, year1, year2]);

    const availableYears = useMemo(() => {
        const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
        return Array.from(years).sort((a, b) => b - a);
    }, [transactions]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <CalendarRange className="text-purple-500" size={20} />
                        <CardTitle>Year Comparison</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                        <select
                            value={year1}
                            onChange={(e) => setYear1(Number(e.target.value))}
                            className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
                        >
                            {availableYears.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <span className="text-gray-400">vs</span>
                        <select
                            value={year2}
                            onChange={(e) => setYear2(Number(e.target.value))}
                            className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
                        >
                            {availableYears.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Summary comparison */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Year 1 */}
                    <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-xs text-purple-600 font-medium mb-2">{year1}</p>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Expenses</span>
                                <span className="font-bold text-red-600">{formatCurrency(comparisonData.year1.expenses)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Income</span>
                                <span className="font-bold text-green-600">{formatCurrency(comparisonData.year1.income)}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-1 border-t">
                                <span className="text-gray-600">Savings</span>
                                <span className={`font-bold ${comparisonData.year1.savings >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                    {formatCurrency(comparisonData.year1.savings)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Year 2 */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 font-medium mb-2">{year2}</p>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Expenses</span>
                                <span className="font-bold text-red-600">{formatCurrency(comparisonData.year2.expenses)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Income</span>
                                <span className="font-bold text-green-600">{formatCurrency(comparisonData.year2.income)}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-1 border-t">
                                <span className="text-gray-600">Savings</span>
                                <span className={`font-bold ${comparisonData.year2.savings >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                    {formatCurrency(comparisonData.year2.savings)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change indicators */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className={`p-2 rounded-lg flex items-center justify-center space-x-2 ${comparisonData.expenseChange <= 0 ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                        {comparisonData.expenseChange <= 0 ? (
                            <TrendingDown size={16} className="text-green-500" />
                        ) : (
                            <TrendingUp size={16} className="text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${comparisonData.expenseChange <= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {comparisonData.expenseChange > 0 ? '+' : ''}{comparisonData.expenseChange.toFixed(0)}% expenses
                        </span>
                    </div>
                    <div className={`p-2 rounded-lg flex items-center justify-center space-x-2 ${comparisonData.incomeChange >= 0 ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                        {comparisonData.incomeChange >= 0 ? (
                            <TrendingUp size={16} className="text-green-500" />
                        ) : (
                            <TrendingDown size={16} className="text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${comparisonData.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {comparisonData.incomeChange > 0 ? '+' : ''}{comparisonData.incomeChange.toFixed(0)}% income
                        </span>
                    </div>
                </div>

                {/* Monthly comparison chart */}
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData.chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                                stroke="#9ca3af"
                            />
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Bar
                                dataKey={`${year1} Expenses`}
                                fill="#8b5cf6"
                                radius={[2, 2, 0, 0]}
                            />
                            <Bar
                                dataKey={`${year2} Expenses`}
                                fill="#d1d5db"
                                radius={[2, 2, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
