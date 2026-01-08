import { useState } from 'react';
import { Plus, X, DollarSign } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { useTransactionStore } from '../../store/transactionStore';

export const QuickAddWidget = () => {
    const { categories, addTransaction } = useTransactionStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        merchant: '',
        type: 'debit',
    });

    // Get recent/popular categories
    const expenseCategories = categories.filter(c => c.type === 'expense');
    const quickCategories = expenseCategories.slice(0, 6);

    const handleQuickCategory = (categoryName) => {
        setFormData({ ...formData, category: categoryName });
    };

    const handleSubmit = async () => {
        if (!formData.amount || parseFloat(formData.amount) <= 0) return;

        setIsSubmitting(true);
        try {
            await addTransaction({
                date: new Date().toISOString(),
                type: formData.type,
                amount: parseFloat(formData.amount),
                category: formData.category || 'Other',
                merchant: formData.merchant || '',
                description: '',
                bank: '',
                accountNumber: '',
            });

            // Reset and close
            setFormData({ amount: '', category: '', merchant: '', type: 'debit' });
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to add transaction:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl hover:scale-105 transition-all duration-200"
                aria-label="Quick add transaction"
            >
                <Plus size={28} strokeWidth={2.5} />
            </button>

            {/* Quick Add Modal */}
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Quick Add Expense"
            >
                <div className="space-y-4">
                    {/* Amount Input - Large and prominent */}
                    <div className="text-center">
                        <div className="relative inline-flex items-center">
                            <span className="text-2xl text-gray-500 mr-2">MVR</span>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                                className="text-4xl font-bold text-center w-48 border-0 border-b-2 border-gray-300 focus:border-orange-500 focus:outline-none bg-transparent"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Quick Category Buttons */}
                    <div>
                        <label className="text-xs text-gray-600 block mb-2">Quick Pick</label>
                        <div className="grid grid-cols-3 gap-2">
                            {quickCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleQuickCategory(cat.name)}
                                    className={`p-2 rounded-lg border text-center transition-colors ${formData.category === cat.name
                                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                                            : 'border-gray-200 bg-white hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="text-lg">{cat.icon}</span>
                                    <p className="text-xs mt-1 truncate">{cat.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Dropdown (for other categories) */}
                    <Select
                        label="Or select category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        options={[
                            { value: '', label: 'Select Category' },
                            ...expenseCategories.map(c => ({
                                value: c.name,
                                label: `${c.icon} ${c.name}`
                            }))
                        ]}
                    />

                    {/* Merchant (optional) */}
                    <Input
                        label="Merchant (optional)"
                        value={formData.merchant}
                        onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                        placeholder="e.g., Pizza Hut, ADK"
                    />

                    {/* Type Toggle */}
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFormData({ ...formData, type: 'debit' })}
                            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${formData.type === 'debit'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            Expense
                        </button>
                        <button
                            onClick={() => setFormData({ ...formData, type: 'credit' })}
                            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${formData.type === 'credit'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            Income
                        </button>
                    </div>

                    {/* Submit */}
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.amount}
                        className="w-full py-3 text-lg"
                    >
                        {isSubmitting ? 'Adding...' : 'Add Transaction'}
                    </Button>
                </div>
            </Modal>
        </>
    );
};
