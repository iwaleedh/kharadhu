import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { RefreshCw, Plus, Trash2, Edit2, Play, Pause, Calendar } from 'lucide-react';
import { db } from '../../lib/database';
import { getCurrentUserId } from '../../lib/currentUser';
import { formatDate, formatCurrency } from '../../lib/utils';
import { useTransactionStore } from '../../store/transactionStore';

export const RecurringManager = () => {
    const { categories, addTransaction } = useTransactionStore();
    const [recurring, setRecurring] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: '',
        frequency: 'monthly',
        nextDueDate: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const loadRecurring = async () => {
        setLoading(true);
        try {
            const userId = Number(getCurrentUserId());
            if (userId) {
                const items = await db.recurringTransactions.where('userId').equals(userId).toArray();
                setRecurring(items.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate)));
            }
        } catch (error) {
            console.error('Failed to load recurring transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecurring();
    }, []);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                amount: item.amount?.toString() || '',
                category: item.category || '',
                frequency: item.frequency || 'monthly',
                nextDueDate: new Date(item.nextDueDate).toISOString().split('T')[0],
                notes: item.notes || '',
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: '',
                amount: '',
                category: '',
                frequency: 'monthly',
                nextDueDate: new Date().toISOString().split('T')[0],
                notes: '',
            });
        }
        setShowModal(true);
    };

    const getNextDueDate = (currentDate, frequency) => {
        const date = new Date(currentDate);
        switch (frequency) {
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
            case 'biweekly':
                date.setDate(date.getDate() + 14);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'quarterly':
                date.setMonth(date.getMonth() + 3);
                break;
            case 'yearly':
                date.setFullYear(date.getFullYear() + 1);
                break;
            default:
                break;
        }
        return date.toISOString();
    };

    const handleSubmit = async () => {
        const userId = Number(getCurrentUserId());
        if (!userId || !formData.title.trim() || !formData.amount) return;

        const data = {
            userId,
            title: formData.title.trim(),
            amount: parseFloat(formData.amount),
            category: formData.category,
            frequency: formData.frequency,
            nextDueDate: new Date(formData.nextDueDate).toISOString(),
            notes: formData.notes.trim(),
            isActive: true,
            createdAt: new Date().toISOString(),
        };

        try {
            if (editingItem) {
                await db.recurringTransactions.update(editingItem.id, data);
            } else {
                await db.recurringTransactions.add(data);
            }
            await loadRecurring();
            setShowModal(false);
        } catch (error) {
            console.error('Failed to save recurring transaction:', error);
        }
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        try {
            await db.recurringTransactions.delete(deletingItem.id);
            await loadRecurring();
            setDeletingItem(null);
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const toggleActive = async (item) => {
        try {
            await db.recurringTransactions.update(item.id, { isActive: !item.isActive });
            await loadRecurring();
        } catch (error) {
            console.error('Failed to toggle:', error);
        }
    };

    const executeRecurring = async (item) => {
        const userId = Number(getCurrentUserId());
        if (!userId) return;

        try {
            // Create the transaction
            await addTransaction({
                date: item.nextDueDate,
                type: 'debit',
                amount: item.amount,
                category: item.category || 'Other',
                merchant: item.title,
                description: `Recurring: ${item.title}`,
                bank: '',
                accountNumber: '',
            });

            // Update next due date
            const newNextDue = getNextDueDate(item.nextDueDate, item.frequency);
            await db.recurringTransactions.update(item.id, { nextDueDate: newNextDue });
            await loadRecurring();
        } catch (error) {
            console.error('Failed to execute recurring:', error);
        }
    };

    const getDueStatus = (nextDueDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(nextDueDate);
        due.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((due - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'Overdue', color: 'text-red-500 bg-red-50' };
        if (diffDays === 0) return { label: 'Today', color: 'text-orange-500 bg-orange-50' };
        if (diffDays <= 7) return { label: `${diffDays}d`, color: 'text-yellow-600 bg-yellow-50' };
        return { label: formatDate(due, 'MMM d'), color: 'text-gray-600 bg-gray-50' };
    };

    const frequencyOptions = [
        { value: 'weekly', label: 'Weekly' },
        { value: 'biweekly', label: 'Bi-weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'yearly', label: 'Yearly' },
    ];

    const expenseCategories = categories.filter(c => c.type === 'expense');

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <RefreshCw className="text-blue-500" size={20} />
                            <CardTitle>Recurring Transactions</CardTitle>
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
                    ) : recurring.length === 0 ? (
                        <p className="text-center text-gray-500 py-4 text-sm">
                            No recurring transactions. Add monthly bills, subscriptions, etc.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {recurring.map((item) => {
                                const status = getDueStatus(item.nextDueDate);
                                return (
                                    <div
                                        key={item.id}
                                        className={`p-3 bg-white border rounded-lg ${item.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                                                    <span className="text-xs text-gray-500 capitalize">{item.frequency}</span>
                                                </div>
                                                <p className="text-sm font-semibold text-red-600 mt-0.5">
                                                    {formatCurrency(item.amount)}
                                                </p>
                                                {item.category && (
                                                    <p className="text-xs text-gray-500">{item.category}</p>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-1">
                                                <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                                                    {status.label}
                                                </span>
                                                <button
                                                    onClick={() => executeRecurring(item)}
                                                    className="p-1 hover:bg-green-50 rounded"
                                                    title="Execute now"
                                                >
                                                    <Calendar size={14} className="text-green-500" />
                                                </button>
                                                <button
                                                    onClick={() => toggleActive(item)}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                >
                                                    {item.isActive ? (
                                                        <Play size={14} className="text-green-500" />
                                                    ) : (
                                                        <Pause size={14} className="text-gray-400" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                >
                                                    <Edit2 size={14} className="text-gray-500" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingItem(item)}
                                                    className="p-1 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 size={14} className="text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingItem ? 'Edit Recurring' : 'Add Recurring Transaction'}
            >
                <div className="space-y-4">
                    <Input
                        label="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Netflix, Rent, Gym"
                        required
                    />

                    <Input
                        label="Amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                        required
                    />

                    <Select
                        label="Category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        options={[{ value: '', label: 'Select Category' }, ...expenseCategories.map(c => ({ value: c.name, label: `${c.icon} ${c.name}` }))]}
                    />

                    <Select
                        label="Frequency"
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        options={frequencyOptions}
                    />

                    <Input
                        label="Next Due Date"
                        type="date"
                        value={formData.nextDueDate}
                        onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                        required
                    />

                    <div className="flex space-x-2 pt-2">
                        <Button variant="primary" onClick={handleSubmit} className="flex-1">
                            {editingItem ? 'Update' : 'Add'}
                        </Button>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deletingItem}
                onClose={() => setDeletingItem(null)}
                title="Delete Recurring?"
                message={`Are you sure you want to delete "${deletingItem?.title}"?`}
                confirmText="Delete"
                destructive
                onConfirm={handleDelete}
            />
        </>
    );
};
