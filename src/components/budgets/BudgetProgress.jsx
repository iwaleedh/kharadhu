import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { PieChart, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency, getMonthRange } from '../../lib/utils';

/**
 * BudgetProgress - Visual budget tracking with progress bars
 */
export const BudgetProgress = ({ transactions, categories }) => {
    const budgetData = useMemo(() => {
        const thisMonthRange = getMonthRange(0);
        const thisMonthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(thisMonthRange.start) &&
                d <= new Date(thisMonthRange.end) &&
                t.type === 'debit';
        });

        // Get categories with budgets
        const budgetedCategories = categories
            .filter(c => c.type === 'expense' && c.budget && c.budget > 0)
            .map(cat => {
                const spent = thisMonthTxns
                    .filter(t => t.category === cat.name)
                    .reduce((sum, t) => sum + t.amount, 0);

                const percentage = (spent / cat.budget) * 100;
                const remaining = cat.budget - spent;

                let status;
                if (percentage >= 100) status = 'over';
                else if (percentage >= 80) status = 'warning';
                else status = 'good';

                return {
                    name: cat.name,
                    icon: cat.icon,
                    budget: cat.budget,
                    spent,
                    remaining,
                    percentage: Math.min(percentage, 100),
                    actualPercentage: percentage,
                    status,
                };
            })
            .sort((a, b) => b.percentage - a.percentage);

        const totalBudget = budgetedCategories.reduce((sum, c) => sum + c.budget, 0);
        const totalSpent = budgetedCategories.reduce((sum, c) => sum + c.spent, 0);
        const overBudgetCount = budgetedCategories.filter(c => c.status === 'over').length;
        const warningCount = budgetedCategories.filter(c => c.status === 'warning').length;

        return {
            categories: budgetedCategories,
            totalBudget,
            totalSpent,
            overBudgetCount,
            warningCount
        };
    }, [transactions, categories]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'over': return 'bg-red-500';
            case 'warning': return 'bg-yellow-500';
            default: return 'bg-green-500';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'over': return <AlertCircle size={14} className="text-red-500" />;
            case 'warning': return <Clock size={14} className="text-yellow-500" />;
            default: return <CheckCircle size={14} className="text-green-500" />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <PieChart className="text-purple-500" size={20} />
                        <CardTitle>Budget Progress</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                        {budgetData.overBudgetCount > 0 && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                                {budgetData.overBudgetCount} over
                            </span>
                        )}
                        {budgetData.warningCount > 0 && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                                {budgetData.warningCount} warning
                            </span>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {budgetData.categories.length === 0 ? (
                    <p className="text-center text-gray-500 py-4 text-sm">
                        No budgets set. Add budgets in Settings → Categories to track spending limits.
                    </p>
                ) : (
                    <>
                        {/* Overall progress */}
                        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Total Budget Used</span>
                                <span className="font-bold text-purple-700">
                                    {formatCurrency(budgetData.totalSpent)} / {formatCurrency(budgetData.totalBudget)}
                                </span>
                            </div>
                            <div className="h-3 bg-purple-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${budgetData.totalSpent > budgetData.totalBudget ? 'bg-red-500' : 'bg-purple-500'
                                        }`}
                                    style={{ width: `${Math.min(100, (budgetData.totalSpent / budgetData.totalBudget) * 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Individual categories */}
                        <div className="space-y-3">
                            {budgetData.categories.map((cat) => (
                                <div key={cat.name} className="p-3 bg-white border border-gray-100 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg">{cat.icon}</span>
                                            <span className="font-medium text-gray-900 text-sm">{cat.name}</span>
                                            {getStatusIcon(cat.status)}
                                        </div>
                                        <span className={`text-sm font-bold ${cat.status === 'over' ? 'text-red-600' :
                                                cat.status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                                            }`}>
                                            {cat.actualPercentage.toFixed(0)}%
                                        </span>
                                    </div>

                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${getStatusColor(cat.status)}`}
                                            style={{ width: `${cat.percentage}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Spent: {formatCurrency(cat.spent)}</span>
                                        <span>
                                            {cat.remaining >= 0
                                                ? `${formatCurrency(cat.remaining)} left`
                                                : `${formatCurrency(Math.abs(cat.remaining))} over`
                                            }
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};
