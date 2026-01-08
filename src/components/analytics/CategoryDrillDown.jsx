import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { ChevronRight, ArrowLeft, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, getMonthRange, groupByCategory } from '../../lib/utils';

/**
 * CategoryDrillDown - Click a category to see all transactions
 */
export const CategoryDrillDown = ({ transactions, categories }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const categoryData = useMemo(() => {
        const thisMonthRange = getMonthRange(0);
        const lastMonthRange = getMonthRange(1);

        const thisMonthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(thisMonthRange.start) &&
                d <= new Date(thisMonthRange.end) &&
                t.type === 'debit';
        });

        const lastMonthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(lastMonthRange.start) &&
                d <= new Date(lastMonthRange.end) &&
                t.type === 'debit';
        });

        const thisMonthGrouped = groupByCategory(thisMonthTxns);
        const lastMonthGrouped = groupByCategory(lastMonthTxns);
        const totalThisMonth = thisMonthGrouped.reduce((sum, c) => sum + c.total, 0);

        return thisMonthGrouped.map(cat => {
            const categoryInfo = categories.find(c => c.name === cat.category);
            const lastMonthCat = lastMonthGrouped.find(c => c.category === cat.category);
            const lastMonthTotal = lastMonthCat?.total || 0;
            const change = lastMonthTotal > 0
                ? ((cat.total - lastMonthTotal) / lastMonthTotal) * 100
                : 0;

            return {
                ...cat,
                icon: categoryInfo?.icon || '📁',
                percentage: totalThisMonth > 0 ? (cat.total / totalThisMonth) * 100 : 0,
                change,
                lastMonthTotal,
            };
        });
    }, [transactions, categories]);

    const selectedCategoryData = useMemo(() => {
        if (!selectedCategory) return null;

        const thisMonthRange = getMonthRange(0);
        const categoryTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(thisMonthRange.start) &&
                d <= new Date(thisMonthRange.end) &&
                t.type === 'debit' &&
                t.category === selectedCategory.category;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        // Group by date
        const byDate = {};
        categoryTxns.forEach(t => {
            const dateKey = new Date(t.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            if (!byDate[dateKey]) byDate[dateKey] = [];
            byDate[dateKey].push(t);
        });

        return {
            transactions: categoryTxns,
            byDate,
            total: categoryTxns.reduce((sum, t) => sum + t.amount, 0),
            count: categoryTxns.length,
            avgTransaction: categoryTxns.length > 0
                ? categoryTxns.reduce((sum, t) => sum + t.amount, 0) / categoryTxns.length
                : 0,
        };
    }, [selectedCategory, transactions]);

    const handleCategoryClick = (cat) => {
        setSelectedCategory(cat);
        setShowModal(true);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <ChevronRight className="text-orange-500" size={20} />
                        <CardTitle>Category Breakdown</CardTitle>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Tap a category to see transactions</p>
                </CardHeader>
                <CardContent>
                    {categoryData.length === 0 ? (
                        <p className="text-center text-gray-500 py-4 text-sm">
                            No expenses this month
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {categoryData.map((cat) => (
                                <button
                                    key={cat.category}
                                    onClick={() => handleCategoryClick(cat)}
                                    className="w-full p-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-gray-200 transition-all group text-left"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">{cat.icon}</span>
                                            <div>
                                                <p className="font-medium text-gray-900">{cat.category}</p>
                                                <p className="text-xs text-gray-500">{cat.count} transactions</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{formatCurrency(cat.total)}</p>
                                            <div className="flex items-center justify-end space-x-1">
                                                {cat.change !== 0 && (
                                                    <>
                                                        {cat.change < 0 ? (
                                                            <TrendingDown size={12} className="text-green-500" />
                                                        ) : (
                                                            <TrendingUp size={12} className="text-red-500" />
                                                        )}
                                                        <span className={`text-xs ${cat.change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {cat.change > 0 ? '+' : ''}{cat.change.toFixed(0)}%
                                                        </span>
                                                    </>
                                                )}
                                                <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 ml-1" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-orange-400 rounded-full transition-all"
                                            style={{ width: `${cat.percentage}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{cat.percentage.toFixed(1)}% of total</p>
                                </button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Category Detail Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl">{selectedCategory?.icon}</span>
                        <span>{selectedCategory?.category}</span>
                    </div>
                }
            >
                {selectedCategoryData && (
                    <div className="space-y-4">
                        {/* Summary stats */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 bg-orange-50 rounded-lg text-center">
                                <p className="text-xs text-orange-600">Total</p>
                                <p className="font-bold text-orange-700">{formatCurrency(selectedCategoryData.total)}</p>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg text-center">
                                <p className="text-xs text-blue-600">Count</p>
                                <p className="font-bold text-blue-700">{selectedCategoryData.count}</p>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg text-center">
                                <p className="text-xs text-purple-600">Average</p>
                                <p className="font-bold text-purple-700">{formatCurrency(selectedCategoryData.avgTransaction)}</p>
                            </div>
                        </div>

                        {/* Transaction list by date */}
                        <div className="max-h-80 overflow-y-auto">
                            {Object.entries(selectedCategoryData.byDate).map(([date, txns]) => (
                                <div key={date} className="mb-3">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Calendar size={12} className="text-gray-400" />
                                        <span className="text-xs font-medium text-gray-500">{date}</span>
                                    </div>
                                    <div className="space-y-1 pl-4">
                                        {txns.map((txn) => (
                                            <div
                                                key={txn.id}
                                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {txn.merchant || txn.description || 'No description'}
                                                    </p>
                                                    {txn.notes && (
                                                        <p className="text-xs text-gray-500 truncate">{txn.notes}</p>
                                                    )}
                                                </div>
                                                <span className="text-sm font-bold text-red-600 ml-2">
                                                    {formatCurrency(txn.amount)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};
