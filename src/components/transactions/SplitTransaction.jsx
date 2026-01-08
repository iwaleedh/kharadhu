import { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Scissors, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

/**
 * SplitTransactionModal - Allows splitting a single transaction across multiple categories
 */
export const SplitTransactionModal = ({
    isOpen,
    onClose,
    transaction,
    categories,
    onSave
}) => {
    const [splits, setSplits] = useState([
        { category: transaction?.category || '', amount: transaction?.amount || 0, note: '' }
    ]);

    const totalAmount = transaction?.amount || 0;
    const allocatedAmount = splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
    const remainingAmount = totalAmount - allocatedAmount;

    const addSplit = () => {
        setSplits([...splits, { category: '', amount: remainingAmount > 0 ? remainingAmount : 0, note: '' }]);
    };

    const removeSplit = (index) => {
        if (splits.length <= 1) return;
        const newSplits = splits.filter((_, i) => i !== index);
        setSplits(newSplits);
    };

    const updateSplit = (index, field, value) => {
        const newSplits = [...splits];
        newSplits[index] = { ...newSplits[index], [field]: value };
        setSplits(newSplits);
    };

    const handleSave = () => {
        if (Math.abs(remainingAmount) > 0.01) {
            alert('Split amounts must equal the transaction total');
            return;
        }

        // Return splits data
        onSave({
            ...transaction,
            splits: splits.map(s => ({
                category: s.category,
                amount: parseFloat(s.amount),
                note: s.note,
            }))
        });
        onClose();
    };

    const expenseCategories = categories.filter(c => c.type === 'expense');

    if (!transaction) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Split Transaction"
        >
            <div className="space-y-4">
                {/* Original transaction info */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">{transaction.merchant || 'Transaction'}</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
                    </div>
                </div>

                {/* Splits */}
                <div className="space-y-3">
                    {splits.map((split, index) => (
                        <Card key={index} className="p-3">
                            <CardContent className="p-0 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Split {index + 1}</span>
                                    {splits.length > 1 && (
                                        <button
                                            onClick={() => removeSplit(index)}
                                            className="p-1 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={14} className="text-red-500" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Select
                                        value={split.category}
                                        onChange={(e) => updateSplit(index, 'category', e.target.value)}
                                        options={[
                                            { value: '', label: 'Select Category' },
                                            ...expenseCategories.map(c => ({
                                                value: c.name,
                                                label: `${c.icon} ${c.name}`
                                            }))
                                        ]}
                                    />
                                    <Input
                                        type="number"
                                        value={split.amount}
                                        onChange={(e) => updateSplit(index, 'amount', e.target.value)}
                                        placeholder="Amount"
                                        step="0.01"
                                        min="0"
                                        max={totalAmount}
                                    />
                                </div>

                                <Input
                                    value={split.note}
                                    onChange={(e) => updateSplit(index, 'note', e.target.value)}
                                    placeholder="Note (optional)"
                                    className="text-sm"
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Add split button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={addSplit}
                    className="w-full flex items-center justify-center space-x-2"
                >
                    <Plus size={16} />
                    <span>Add Split</span>
                </Button>

                {/* Remaining amount indicator */}
                <div className={`p-2 rounded-lg text-center text-sm ${Math.abs(remainingAmount) < 0.01
                    ? 'bg-green-50 text-green-700'
                    : remainingAmount > 0
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                    {Math.abs(remainingAmount) < 0.01 ? (
                        '✓ Fully allocated'
                    ) : remainingAmount > 0 ? (
                        `${formatCurrency(remainingAmount)} remaining to allocate`
                    ) : (
                        `${formatCurrency(Math.abs(remainingAmount))} over-allocated`
                    )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        className="flex-1"
                        disabled={Math.abs(remainingAmount) > 0.01}
                    >
                        <Scissors size={16} className="mr-2" />
                        Save Split
                    </Button>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

/**
 * Component to display split breakdown in transaction list
 */
export const SplitBadge = ({ transaction }) => {
    // Inline check for split transaction
    const isSplit = transaction?.splits && Array.isArray(transaction.splits) && transaction.splits.length > 1;
    if (!isSplit) return null;

    return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-700">
            <Scissors size={10} className="mr-1" />
            {transaction.splits.length} splits
        </span>
    );
};

