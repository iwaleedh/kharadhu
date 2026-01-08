import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Layers } from 'lucide-react';
import { formatCurrency, getMonthRange } from '../../lib/utils';

/**
 * CategoryTrends - Shows category spending trends over months
 */
export const CategoryTrends = ({ transactions, categories }) => {
    const [selectedCategory, setSelectedCategory] = useState('');

    const trendData = useMemo(() => {
        // Get top 5 expense categories
        const allCategories = categories
            .filter(c => c.type === 'expense')
            .slice(0, 5);

        const months = 6;
        const data = [];

        for (let i = months - 1; i >= 0; i--) {
            const range = getMonthRange(i);
            const date = new Date();
            date.setMonth(date.getMonth() - i);

            const monthTxns = transactions.filter(t => {
                const d = new Date(t.date);
                return d >= new Date(range.start) && d <= new Date(range.end) && t.type === 'debit';
            });

            const monthData = {
                month: date.toLocaleDateString('en-US', { month: 'short' }),
            };

            allCategories.forEach(cat => {
                const catTotal = monthTxns
                    .filter(t => t.category === cat.name)
                    .reduce((sum, t) => sum + t.amount, 0);
                monthData[cat.name] = catTotal;
            });

            data.push(monthData);
        }

        return { data, categories: allCategories };
    }, [transactions, categories]);

    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#6366f1'];

    // Filter data for selected category
    const displayData = selectedCategory
        ? trendData.data.map(d => ({ month: d.month, [selectedCategory]: d[selectedCategory] }))
        : trendData.data;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Layers className="text-purple-500" size={20} />
                        <CardTitle>Category Trends</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Category filter buttons */}
                <div className="flex flex-wrap gap-1 mb-3">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-2 py-1 rounded-full text-xs transition-colors ${!selectedCategory
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                    {trendData.categories.map((cat, idx) => (
                        <button
                            key={cat.name}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={`px-2 py-1 rounded-full text-xs transition-colors ${selectedCategory === cat.name
                                ? 'text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            style={selectedCategory === cat.name ? { backgroundColor: colors[idx] } : {}}
                        >
                            {cat.icon} {cat.name.split(' ')[0]}
                        </button>
                    ))}
                </div>

                {/* Chart */}
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={displayData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 10 }}
                                stroke="#9ca3af"
                            />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                                stroke="#9ca3af"
                            />
                            <Tooltip
                                formatter={(value, name) => [formatCurrency(value), name]}
                                contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                            />
                            {selectedCategory ? (
                                <Line
                                    type="monotone"
                                    dataKey={selectedCategory}
                                    stroke={colors[trendData.categories.findIndex(c => c.name === selectedCategory)]}
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                            ) : (
                                trendData.categories.map((cat, idx) => (
                                    <Line
                                        key={cat.name}
                                        type="monotone"
                                        dataKey={cat.name}
                                        stroke={colors[idx]}
                                        strokeWidth={1.5}
                                        dot={{ r: 2 }}
                                    />
                                ))
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
