import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { PiggyBank, AlertTriangle, CheckCircle, Edit2 } from 'lucide-react';
import { useTransactionStore } from '../../store/transactionStore';
import { formatCurrency } from '../../lib/utils';
import { updateCategory, getCategories } from '../../lib/database';
import { getCurrentUserId } from '../../lib/currentUser';

export const BudgetManager = () => {
    const { transactions, categories } = useTransactionStore();
    const [editingCategory, setEditingCategory] = useState(null);
    const [budgetAmount, setBudgetAmount] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Get current month's expenses by category
    const getCurrentMonthSpending = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const monthlyExpenses = transactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'debit' && tDate >= startOfMonth && tDate <= endOfMonth;
        });

        // Group by category
        const spending = {};
        monthlyExpenses.forEach(t => {
            const cat = t.category || 'Other';
            spending[cat] = (spending[cat] || 0) + t.amount;
        });

        return spending;
    };

    const spending = getCurrentMonthSpending();

    // Get budget categories (expense only)
    const budgetCategories = categories
        .filter(c => c.type === 'expense' && c.budget > 0)
        .map(c => {
            const spent = spending[c.name] || 0;
            const percentage = c.budget > 0 ? Math.min((spent / c.budget) * 100, 150) : 0;
            const status = percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'good';
            return { ...c, spent, percentage, status };
        })
        .sort((a, b) => b.percentage - a.percentage);

    const handleEditBudget = (category) => {
        setEditingCategory(category);
        setBudgetAmount(category.budget?.toString() || '');
        setShowModal(true);
    };

    const handleSaveBudget = async () => {
        if (!editingCategory) return;

        const userId = Number(getCurrentUserId());
        try {
            await updateCategory(userId, editingCategory.id, {
                budget: parseFloat(budgetAmount) || 0
            });

            // Refresh by reloading page since store doesn't have refresh method
            await getCategories(userId);
            window.location.reload();
        } catch (err) {
            console.error('Failed to update budget:', err);
        }

        setShowModal(false);
        setEditingCategory(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'over': return 'text-red-500';
            case 'warning': return 'text-yellow-500';
            default: return 'text-emerald-500';
        }
    };

    const getProgressColor = (status) => {
        switch (status) {
            case 'over': return 'bg-red-500';
            case 'warning': return 'bg-yellow-500';
            default: return 'bg-emerald-500';
        }
    };

    const totalBudget = budgetCategories.reduce((sum, c) => sum + c.budget, 0);
    const totalSpent = budgetCategories.reduce((sum, c) => sum + c.spent, 0);
    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <PiggyBank className="text-orange-500" size={20} />
                            <CardTitle>Monthly Budgets</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Overall Summary */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-700">Total Budget</span>
                            <span className="text-sm font-semibold text-gray-900">
                                {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${overallPercentage >= 100 ? 'bg-red-500' : overallPercentage >= 80 ? 'bg-yellow-500' : 'bg-emerald-500'
                                    }`}
                                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Category Budgets */}
                    {budgetCategories.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">
                            No budgets set. Edit categories in Settings to add budgets.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {budgetCategories.map((cat) => (
                                <div key={cat.id} className="p-3 bg-white border border-gray-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span>{cat.icon}</span>
                                            <span className="font-medium text-gray-900">{cat.name}</span>
                                            {cat.status === 'over' && (
                                                <AlertTriangle className="text-red-500" size={14} />
                                            )}
                                            {cat.status === 'good' && cat.percentage > 0 && (
                                                <CheckCircle className="text-emerald-500" size={14} />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleEditBudget(cat)}
                                            className="p-1 hover:bg-gray-100 rounded"
                                        >
                                            <Edit2 size={14} className="text-gray-500" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className={getStatusColor(cat.status)}>
                                            {formatCurrency(cat.spent)}
                                        </span>
                                        <span className="text-gray-500">/ {formatCurrency(cat.budget)}</span>
                                    </div>

                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                            className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor(cat.status)}`}
                                            style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                                        />
                                    </div>

                                    {cat.status === 'over' && (
                                        <p className="text-xs text-red-500 mt-1">
                                            Over budget by {formatCurrency(cat.spent - cat.budget)}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Budget Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={`Edit Budget: ${editingCategory?.name || ''}`}
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            Monthly Budget (MVR)
                        </label>
                        <Input
                            type="number"
                            value={budgetAmount}
                            onChange={(e) => setBudgetAmount(e.target.value)}
                            placeholder="Enter amount"
                            step="100"
                            min="0"
                        />
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="primary" onClick={handleSaveBudget} className="flex-1">
                            Save Budget
                        </Button>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};
