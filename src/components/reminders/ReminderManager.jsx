import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Bell, Plus, Trash2, Edit2, Clock, RefreshCw, BellOff, BellRing } from 'lucide-react';
import { db } from '../../lib/database';
import { getCurrentUserId } from '../../lib/currentUser';
import { formatDate, formatCurrency } from '../../lib/utils';
import {
    requestNotificationPermission,
    hasNotificationPermission,
    isNotificationSupported
} from '../../lib/notificationService';

export const ReminderManager = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [deletingReminder, setDeletingReminder] = useState(null);
    const [hasPermission, setHasPermission] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        dueDate: new Date().toISOString().split('T')[0],
        frequency: 'once',
        notes: '',
    });

    const loadReminders = async () => {
        setLoading(true);
        try {
            const userId = Number(getCurrentUserId());
            if (userId) {
                const userReminders = await db.reminders.where('userId').equals(userId).toArray();
                setReminders(userReminders.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
            }
        } catch (error) {
            console.error('Failed to load reminders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReminders();
        setHasPermission(hasNotificationPermission());
    }, []);

    const handleRequestPermission = async () => {
        const granted = await requestNotificationPermission();
        setHasPermission(granted);
    };

    const handleOpenModal = (reminder = null) => {
        if (reminder) {
            setEditingReminder(reminder);
            setFormData({
                title: reminder.title,
                amount: reminder.amount?.toString() || '',
                dueDate: new Date(reminder.dueDate).toISOString().split('T')[0],
                frequency: reminder.frequency || 'once',
                notes: reminder.notes || '',
            });
        } else {
            setEditingReminder(null);
            setFormData({
                title: '',
                amount: '',
                dueDate: new Date().toISOString().split('T')[0],
                frequency: 'once',
                notes: '',
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async () => {
        const userId = Number(getCurrentUserId());
        if (!userId || !formData.title.trim()) return;

        const reminderData = {
            userId,
            title: formData.title.trim(),
            amount: parseFloat(formData.amount) || null,
            dueDate: new Date(formData.dueDate).toISOString(),
            frequency: formData.frequency,
            notes: formData.notes.trim(),
            isRecurring: formData.frequency !== 'once',
            isActive: true,
            createdAt: new Date().toISOString(),
        };

        try {
            if (editingReminder) {
                await db.reminders.update(editingReminder.id, reminderData);
            } else {
                await db.reminders.add(reminderData);
            }
            await loadReminders();
            setShowModal(false);
        } catch (error) {
            console.error('Failed to save reminder:', error);
        }
    };

    const handleDelete = async () => {
        if (!deletingReminder) return;
        try {
            await db.reminders.delete(deletingReminder.id);
            await loadReminders();
            setDeletingReminder(null);
        } catch (error) {
            console.error('Failed to delete reminder:', error);
        }
    };

    const toggleActive = async (reminder) => {
        try {
            await db.reminders.update(reminder.id, { isActive: !reminder.isActive });
            await loadReminders();
        } catch (error) {
            console.error('Failed to toggle reminder:', error);
        }
    };

    const getDueDateStatus = (dueDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((due - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'Overdue', color: 'text-red-500 bg-red-50' };
        if (diffDays === 0) return { label: 'Today', color: 'text-orange-500 bg-orange-50' };
        if (diffDays <= 3) return { label: `${diffDays}d`, color: 'text-yellow-600 bg-yellow-50' };
        return { label: formatDate(due, 'MMM d'), color: 'text-gray-600 bg-gray-50' };
    };

    const frequencyOptions = [
        { value: 'once', label: 'One-time' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' },
    ];

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Bell className="text-orange-500" size={20} />
                            <CardTitle>Bill Reminders</CardTitle>
                        </div>
                        <Button size="sm" onClick={() => handleOpenModal()}>
                            <Plus size={16} className="mr-1" />
                            Add
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Notification Permission Banner */}
                    {isNotificationSupported() && !hasPermission && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <BellOff size={16} className="text-blue-600" />
                                <span className="text-sm text-blue-800">Enable notifications for reminders</span>
                            </div>
                            <Button size="sm" variant="outline" onClick={handleRequestPermission}>
                                Enable
                            </Button>
                        </div>
                    )}

                    {loading ? (
                        <p className="text-center text-gray-500 py-4">Loading...</p>
                    ) : reminders.length === 0 ? (
                        <p className="text-center text-gray-500 py-4 text-sm">
                            No reminders yet. Add your first bill reminder!
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {reminders.map((reminder) => {
                                const status = getDueDateStatus(reminder.dueDate);
                                return (
                                    <div
                                        key={reminder.id}
                                        className={`p-3 bg-white border rounded-lg ${reminder.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="font-medium text-gray-900">{reminder.title}</h4>
                                                    {reminder.isRecurring && (
                                                        <RefreshCw size={12} className="text-blue-500" />
                                                    )}
                                                </div>
                                                {reminder.amount && (
                                                    <p className="text-sm text-gray-600 mt-0.5">
                                                        {formatCurrency(reminder.amount)}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                                                    {status.label}
                                                </span>
                                                <button
                                                    onClick={() => toggleActive(reminder)}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                >
                                                    {reminder.isActive ? (
                                                        <BellRing size={14} className="text-green-500" />
                                                    ) : (
                                                        <BellOff size={14} className="text-gray-400" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(reminder)}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                >
                                                    <Edit2 size={14} className="text-gray-500" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingReminder(reminder)}
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
                title={editingReminder ? 'Edit Reminder' : 'Add Reminder'}
            >
                <div className="space-y-4">
                    <Input
                        label="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Electricity Bill, Rent"
                        required
                    />

                    <Input
                        label="Amount (optional)"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                    />

                    <Input
                        label="Due Date"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                    />

                    <Select
                        label="Frequency"
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        options={frequencyOptions}
                    />

                    <Input
                        label="Notes (optional)"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Add notes..."
                    />

                    <div className="flex space-x-2 pt-2">
                        <Button variant="primary" onClick={handleSubmit} className="flex-1">
                            {editingReminder ? 'Update' : 'Add'} Reminder
                        </Button>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deletingReminder}
                onClose={() => setDeletingReminder(null)}
                title="Delete Reminder?"
                message={`Are you sure you want to delete "${deletingReminder?.title}"?`}
                confirmText="Delete"
                destructive
                onConfirm={handleDelete}
            />
        </>
    );
};
