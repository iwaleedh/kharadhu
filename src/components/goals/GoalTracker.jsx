import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Target, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { getCurrentUserId } from '../../lib/currentUser';
import { formatCurrency } from '../../lib/utils';
import { useTransactionStore } from '../../store/transactionStore';

/**
 * GoalTracker - Savings goals with visual progress
 */
export const GoalTracker = () => {
    const { transactions } = useTransactionStore();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        targetAmount: '',
        deadline: '',
        category: 'savings',
    });

    // Load goals from local storage (or could use IndexedDB)
    useState(() => {
        const loadGoals = async () => {
            try {
                const userId = getCurrentUserId();
                const stored = localStorage.getItem(`goals_${userId}`);
                if (stored) {
                    setGoals(JSON.parse(stored));
                }
            } catch (err) {
                console.error('Failed to load goals:', err);
            }
            setLoading(false);
        };
        loadGoals();
    }, []);

    // Calculate current progress for each goal
    const goalsWithProgress = useMemo(() => {
        const totalSaved = transactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + t.amount, 0) -
            transactions
                .filter(t => t.type === 'debit')
                .reduce((sum, t) => sum + t.amount, 0);

        return goals.map(goal => {
            // For savings goals, use current balance
            const currentAmount = goal.category === 'savings'
                ? Math.max(0, totalSaved * (goal.allocation || 0.1)) // 10% allocation per goal
                : goal.savedAmount || 0;

            const progress = goal.targetAmount > 0
                ? Math.min((currentAmount / goal.targetAmount) * 100, 100)
                : 0;

            const remaining = Math.max(0, goal.targetAmount - currentAmount);
            const daysLeft = goal.deadline
                ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                : null;

            return { ...goal, currentAmount, progress, remaining, daysLeft };
        });
    }, [goals, transactions]);

    const saveGoals = (newGoals) => {
        const userId = getCurrentUserId();
        localStorage.setItem(`goals_${userId}`, JSON.stringify(newGoals));
        setGoals(newGoals);
    };

    const handleOpenModal = (goal = null) => {
        if (goal) {
            setEditingGoal(goal);
            setFormData({
                title: goal.title,
                targetAmount: goal.targetAmount.toString(),
                deadline: goal.deadline || '',
                category: goal.category || 'savings',
            });
        } else {
            setEditingGoal(null);
            setFormData({ title: '', targetAmount: '', deadline: '', category: 'savings' });
        }
        setShowModal(true);
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.targetAmount) return;

        const goalData = {
            id: editingGoal?.id || Date.now(),
            title: formData.title,
            targetAmount: parseFloat(formData.targetAmount),
            deadline: formData.deadline || null,
            category: formData.category,
            createdAt: editingGoal?.createdAt || new Date().toISOString(),
            savedAmount: editingGoal?.savedAmount || 0,
        };

        if (editingGoal) {
            saveGoals(goals.map(g => g.id === editingGoal.id ? goalData : g));
        } else {
            saveGoals([...goals, goalData]);
        }
        setShowModal(false);
    };

    const handleDelete = (id) => {
        saveGoals(goals.filter(g => g.id !== id));
    };

    const getProgressColor = (progress) => {
        if (progress >= 100) return 'bg-green-500';
        if (progress >= 75) return 'bg-blue-500';
        if (progress >= 50) return 'bg-yellow-500';
        if (progress >= 25) return 'bg-orange-500';
        return 'bg-red-500';
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Target className="text-green-500" size={20} />
                            <CardTitle>Savings Goals</CardTitle>
                        </div>
                        <Button size="sm" onClick={() => handleOpenModal()}>
                            <Plus size={16} className="mr-1" />
                            Add
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center text-gray-500 py-4">Loading...</p>
                    ) : goalsWithProgress.length === 0 ? (
                        <p className="text-center text-gray-500 py-4 text-sm">
                            No savings goals yet. Set a goal to track your progress!
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {goalsWithProgress.map((goal) => (
                                <div key={goal.id} className="p-3 bg-white border border-gray-200 rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className="font-medium text-gray-900 flex items-center">
                                                {goal.title}
                                                {goal.progress >= 100 && (
                                                    <Check size={16} className="ml-2 text-green-500" />
                                                )}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                                            </p>
                                        </div>
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => handleOpenModal(goal)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                <Edit2 size={14} className="text-gray-500" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(goal.id)}
                                                className="p-1 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={14} className="text-red-500" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getProgressColor(goal.progress)} transition-all duration-500`}
                                            style={{ width: `${goal.progress}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                                        <span>{goal.progress.toFixed(0)}% complete</span>
                                        {goal.daysLeft !== null && goal.daysLeft > 0 && (
                                            <span>{goal.daysLeft} days left</span>
                                        )}
                                        {goal.daysLeft !== null && goal.daysLeft <= 0 && (
                                            <span className="text-red-500">Deadline passed</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingGoal ? 'Edit Goal' : 'Add Savings Goal'}
            >
                <div className="space-y-4">
                    <Input
                        label="Goal Name"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Emergency Fund, Vacation"
                        required
                    />

                    <Input
                        label="Target Amount (MVR)"
                        type="number"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                        placeholder="10000"
                        required
                    />

                    <Input
                        label="Target Date (optional)"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />

                    <div className="flex space-x-2 pt-2">
                        <Button variant="primary" onClick={handleSubmit} className="flex-1">
                            {editingGoal ? 'Update' : 'Add Goal'}
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
