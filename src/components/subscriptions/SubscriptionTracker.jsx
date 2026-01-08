import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { RefreshCw, Plus, Trash2, Edit2, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { getCurrentUserId } from '../../lib/currentUser';

const BILLING_CYCLES = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'weekly', label: 'Weekly' },
];

const SUBSCRIPTION_CATEGORIES = [
    { value: 'streaming', label: '🎬 Streaming', color: 'bg-purple-100 text-purple-700' },
    { value: 'software', label: '💻 Software', color: 'bg-blue-100 text-blue-700' },
    { value: 'gaming', label: '🎮 Gaming', color: 'bg-green-100 text-green-700' },
    { value: 'fitness', label: '💪 Fitness', color: 'bg-orange-100 text-orange-700' },
    { value: 'news', label: '📰 News/Media', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'utilities', label: '🏠 Utilities', color: 'bg-gray-100 text-gray-700' },
    { value: 'other', label: '📦 Other', color: 'bg-gray-100 text-gray-700' },
];

/**
 * SubscriptionTracker - Track and manage recurring subscriptions
 */
export const SubscriptionTracker = ({ transactions }) => {
    const [subscriptions, setSubscriptions] = useState(() => {
        const userId = getCurrentUserId();
        const stored = localStorage.getItem(`subscriptions_${userId}`);
        return stored ? JSON.parse(stored) : [];
    });
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        category: 'streaming',
        billingCycle: 'monthly',
        nextBillingDate: '',
    });

    // Save to localStorage
    const saveSubscriptions = (subs) => {
        const userId = getCurrentUserId();
        localStorage.setItem(`subscriptions_${userId}`, JSON.stringify(subs));
        setSubscriptions(subs);
    };

    // Detect subscriptions from transaction patterns
    const detectedSubscriptions = useMemo(() => {
        // Group transactions by merchant
        const merchantGroups = {};
        transactions
            .filter(t => t.type === 'debit')
            .forEach(t => {
                const key = t.merchant || t.description || '';
                if (!key) return;
                if (!merchantGroups[key]) merchantGroups[key] = [];
                merchantGroups[key].push(t);
            });

        // Find recurring patterns (same amount, monthly interval)
        const detected = [];
        Object.entries(merchantGroups).forEach(([merchant, txns]) => {
            if (txns.length < 2) return;

            // Check for consistent amounts
            const amounts = txns.map(t => t.amount);
            const mostCommonAmount = amounts.sort((a, b) =>
                amounts.filter(v => v === a).length - amounts.filter(v => v === b).length
            ).pop();

            const sameAmountTxns = txns.filter(t => t.amount === mostCommonAmount);
            if (sameAmountTxns.length >= 2) {
                // Check if already tracked
                const alreadyTracked = subscriptions.some(
                    s => s.name.toLowerCase() === merchant.toLowerCase()
                );
                if (!alreadyTracked) {
                    detected.push({
                        name: merchant,
                        amount: mostCommonAmount,
                        occurrences: sameAmountTxns.length,
                    });
                }
            }
        });

        return detected.slice(0, 5);
    }, [transactions, subscriptions]);

    const totals = useMemo(() => {
        const monthly = subscriptions.reduce((sum, sub) => {
            const amount = parseFloat(sub.amount) || 0;
            switch (sub.billingCycle) {
                case 'yearly': return sum + (amount / 12);
                case 'quarterly': return sum + (amount / 3);
                case 'weekly': return sum + (amount * 4.33);
                default: return sum + amount;
            }
        }, 0);

        return {
            monthly,
            yearly: monthly * 12,
            count: subscriptions.length,
        };
    }, [subscriptions]);

    const handleOpenModal = (item = null) => {
        setEditItem(item);
        if (item) {
            setFormData({
                name: item.name,
                amount: item.amount.toString(),
                category: item.category,
                billingCycle: item.billingCycle,
                nextBillingDate: item.nextBillingDate || '',
            });
        } else {
            setFormData({
                name: '',
                amount: '',
                category: 'streaming',
                billingCycle: 'monthly',
                nextBillingDate: '',
            });
        }
        setShowModal(true);
    };

    const handleAddDetected = (detected) => {
        setFormData({
            name: detected.name,
            amount: detected.amount.toString(),
            category: 'other',
            billingCycle: 'monthly',
            nextBillingDate: '',
        });
        setEditItem(null);
        setShowModal(true);
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.amount) return;

        const sub = {
            id: editItem?.id || Date.now(),
            name: formData.name,
            amount: parseFloat(formData.amount),
            category: formData.category,
            billingCycle: formData.billingCycle,
            nextBillingDate: formData.nextBillingDate,
            createdAt: editItem?.createdAt || new Date().toISOString(),
        };

        const newSubs = editItem
            ? subscriptions.map(s => s.id === editItem.id ? sub : s)
            : [...subscriptions, sub];

        saveSubscriptions(newSubs);
        setShowModal(false);
    };

    const handleDelete = (id) => {
        saveSubscriptions(subscriptions.filter(s => s.id !== id));
    };

    const getCategoryStyle = (category) => {
        return SUBSCRIPTION_CATEGORIES.find(c => c.value === category)?.color || 'bg-gray-100 text-gray-700';
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <RefreshCw className="text-indigo-500" size={20} />
                            <CardTitle>Subscriptions</CardTitle>
                        </div>
                        <Button size="sm" onClick={() => handleOpenModal()}>
                            <Plus size={14} className="mr-1" /> Add
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Totals */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-indigo-50 rounded-lg text-center">
                            <p className="text-xs text-indigo-600">Monthly Cost</p>
                            <p className="text-lg font-bold text-indigo-700">{formatCurrency(totals.monthly)}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg text-center">
                            <p className="text-xs text-purple-600">Yearly Cost</p>
                            <p className="text-lg font-bold text-purple-700">{formatCurrency(totals.yearly)}</p>
                        </div>
                    </div>

                    {/* Detected subscriptions */}
                    {detectedSubscriptions.length > 0 && (
                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <AlertCircle size={14} className="text-yellow-600" />
                                <span className="text-xs font-medium text-yellow-700">Detected Subscriptions</span>
                            </div>
                            <div className="space-y-1">
                                {detectedSubscriptions.map((d, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700">{d.name}</span>
                                        <button
                                            onClick={() => handleAddDetected(d)}
                                            className="text-xs text-blue-600 hover:text-blue-700"
                                        >
                                            + Add ({formatCurrency(d.amount)})
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Subscription list */}
                    {subscriptions.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm py-4">
                            No subscriptions tracked yet
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {subscriptions.map(sub => (
                                <div
                                    key={sub.id}
                                    className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className={`px-2 py-0.5 rounded text-xs ${getCategoryStyle(sub.category)}`}>
                                            {SUBSCRIPTION_CATEGORIES.find(c => c.value === sub.category)?.label.split(' ')[0]}
                                        </span>
                                        <div>
                                            <p className="font-medium text-gray-900">{sub.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {BILLING_CYCLES.find(b => b.value === sub.billingCycle)?.label}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-bold text-gray-900">{formatCurrency(sub.amount)}</span>
                                        <button
                                            onClick={() => handleOpenModal(sub)}
                                            className="p-1 hover:bg-gray-100 rounded"
                                        >
                                            <Edit2 size={14} className="text-gray-500" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sub.id)}
                                            className="p-1 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={14} className="text-red-500" />
                                        </button>
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
                title={editItem ? 'Edit Subscription' : 'Add Subscription'}
            >
                <div className="space-y-4">
                    <Input
                        label="Service Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Netflix, Spotify"
                    />

                    <Input
                        label="Amount (MVR)"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                    />

                    <Select
                        label="Category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        options={SUBSCRIPTION_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
                    />

                    <Select
                        label="Billing Cycle"
                        value={formData.billingCycle}
                        onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                        options={BILLING_CYCLES}
                    />

                    <Input
                        label="Next Billing Date (optional)"
                        type="date"
                        value={formData.nextBillingDate}
                        onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
                    />

                    <div className="flex space-x-2 pt-2">
                        <Button variant="primary" onClick={handleSubmit} className="flex-1">
                            {editItem ? 'Update' : 'Add'}
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
