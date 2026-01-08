import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { formatCurrency, getMonthRange, calculateTotalByType } from '../../lib/utils';

/**
 * SpendingTrends - Line chart showing spending trends over time
 */
export const SpendingTrends = ({ transactions, months = 6 }) => {
    const trendData = useMemo(() => {
        const data = [];

        for (let i = months - 1; i >= 0; i--) {
            const range = getMonthRange(i);
            const date = new Date();
            date.setMonth(date.getMonth() - i);

            const monthTxns = transactions.filter(t => {
                const d = new Date(t.date);
                return d >= new Date(range.start) && d <= new Date(range.end);
            });

            const income = calculateTotalByType(monthTxns, 'credit');
            const expenses = calculateTotalByType(monthTxns, 'debit');
            const savings = income - expenses;

            data.push({
                month: date.toLocaleDateString('en-US', { month: 'short' }),
                income,
                expenses,
                savings,
                net: savings,
            });
        }

        return data;
    }, [transactions, months]);

    const formatYAxis = (value) => {
        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
        return value;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <TrendingUp className="text-blue-500" size={20} />
                    <CardTitle>Spending Trends</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 11 }}
                                stroke="#9ca3af"
                            />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                tickFormatter={formatYAxis}
                                stroke="#9ca3af"
                            />
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{
                                    fontSize: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb'
                                }}
                            />
                            <Legend
                                wrapperStyle={{ fontSize: '12px' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="income"
                                stroke="#22c55e"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                name="Income"
                            />
                            <Line
                                type="monotone"
                                dataKey="expenses"
                                stroke="#ef4444"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                name="Expenses"
                            />
                            <Line
                                type="monotone"
                                dataKey="savings"
                                stroke="#6366f1"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={{ r: 3 }}
                                name="Savings"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
