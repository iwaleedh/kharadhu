import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, getMonthRange, calculateTotalByType } from '../../lib/utils';

/**
 * IncomeVsExpense - Visual comparison of income vs expenses
 */
export const IncomeVsExpense = ({ transactions }) => {
    const data = useMemo(() => {
        const thisMonthRange = getMonthRange(0);
        const thisMonthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(thisMonthRange.start) && d <= new Date(thisMonthRange.end);
        });

        const income = calculateTotalByType(thisMonthTxns, 'credit');
        const expenses = calculateTotalByType(thisMonthTxns, 'debit');
        const savings = income - expenses;
        const savingsRate = income > 0 ? (savings / income) * 100 : 0;

        return {
            income,
            expenses,
            savings,
            savingsRate,
            chartData: [
                { name: 'Expenses', value: expenses, color: '#ef4444' },
                { name: 'Savings', value: Math.max(0, savings), color: '#22c55e' },
            ].filter(d => d.value > 0),
        };
    }, [transactions]);

    const RADIAN = Math.PI / 180;
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <DollarSign className="text-green-500" size={20} />
                    <CardTitle>Income vs Expenses</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-1 mb-1">
                            <ArrowUpRight size={14} className="text-green-500" />
                            <span className="text-xs text-green-600">Income</span>
                        </div>
                        <p className="text-lg font-bold text-green-700">
                            {formatCurrency(data.income)}
                        </p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-1 mb-1">
                            <ArrowDownRight size={14} className="text-red-500" />
                            <span className="text-xs text-red-600">Expenses</span>
                        </div>
                        <p className="text-lg font-bold text-red-700">
                            {formatCurrency(data.expenses)}
                        </p>
                    </div>
                </div>

                {/* Pie chart */}
                {data.chartData.length > 0 && (
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomLabel}
                                    outerRadius={60}
                                    dataKey="value"
                                >
                                    {data.chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend
                                    wrapperStyle={{ fontSize: '12px' }}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Savings indicator */}
                <div className={`mt-3 p-3 rounded-lg text-center ${data.savings >= 0 ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                    <p className={`text-sm ${data.savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.savings >= 0 ? 'Net Savings' : 'Overspent by'}
                    </p>
                    <p className={`text-xl font-bold ${data.savings >= 0 ? 'text-green-700' : 'text-red-700'
                        }`}>
                        {formatCurrency(Math.abs(data.savings))}
                    </p>
                    {data.income > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                            {data.savingsRate.toFixed(0)}% savings rate
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
