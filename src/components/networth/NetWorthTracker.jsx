import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { TrendingUp, TrendingDown, Plus, Trash2, Wallet, Home, Car, CreditCard, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { getCurrentUserId } from '../../lib/currentUser';

const ASSET_TYPES = [
    { value: 'cash', label: 'Cash & Savings', icon: Wallet },
    { value: 'property', label: 'Property', icon: Home },
    { value: 'vehicle', label: 'Vehicle', icon: Car },
    { value: 'investment', label: 'Investments', icon: TrendingUp },
    { value: 'other', label: 'Other Assets', icon: PiggyBank },
];

const LIABILITY_TYPES = [
    { value: 'loan', label: 'Personal Loan', icon: CreditCard },
    { value: 'mortgage', label: 'Mortgage', icon: Home },
    { value: 'car_loan', label: 'Car Loan', icon: Car },
    { value: 'credit_card', label: 'Credit Card Debt', icon: CreditCard },
    { value: 'other', label: 'Other Debt', icon: Wallet },
];

/**
 * NetWorthTracker - Track assets, liabilities, and net worth over time
 */
export const NetWorthTracker = () => {
    // Initialize state from localStorage
    const [assets, setAssets] = useState(() => {
        const userId = getCurrentUserId();
        const stored = localStorage.getItem(`networth_assets_${userId}`);
        return stored ? JSON.parse(stored) : [];
    });
    const [liabilities, setLiabilities] = useState(() => {
        const userId = getCurrentUserId();
        const stored = localStorage.getItem(`networth_liabilities_${userId}`);
        return stored ? JSON.parse(stored) : [];
    });
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('asset');
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'cash',
        value: '',
    });

    // Save to localStorage
    const saveData = (newAssets, newLiabilities) => {
        const userId = getCurrentUserId();
        localStorage.setItem(`networth_assets_${userId}`, JSON.stringify(newAssets));
        localStorage.setItem(`networth_liabilities_${userId}`, JSON.stringify(newLiabilities));
    };

    const totals = useMemo(() => {
        const totalAssets = assets.reduce((sum, a) => sum + (parseFloat(a.value) || 0), 0);
        const totalLiabilities = liabilities.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
        const netWorth = totalAssets - totalLiabilities;
        return { totalAssets, totalLiabilities, netWorth };
    }, [assets, liabilities]);

    const handleOpenModal = (type, item = null) => {
        setModalType(type);
        setEditItem(item);
        if (item) {
            setFormData({ name: item.name, type: item.type, value: item.value.toString() });
        } else {
            setFormData({ name: '', type: type === 'asset' ? 'cash' : 'loan', value: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.value) return;

        const newItem = {
            id: editItem?.id || Date.now(),
            name: formData.name,
            type: formData.type,
            value: parseFloat(formData.value),
            updatedAt: new Date().toISOString(),
        };

        if (modalType === 'asset') {
            const newAssets = editItem
                ? assets.map(a => a.id === editItem.id ? newItem : a)
                : [...assets, newItem];
            setAssets(newAssets);
            saveData(newAssets, liabilities);
        } else {
            const newLiabilities = editItem
                ? liabilities.map(l => l.id === editItem.id ? newItem : l)
                : [...liabilities, newItem];
            setLiabilities(newLiabilities);
            saveData(assets, newLiabilities);
        }

        setShowModal(false);
    };

    const handleDelete = (type, id) => {
        if (type === 'asset') {
            const newAssets = assets.filter(a => a.id !== id);
            setAssets(newAssets);
            saveData(newAssets, liabilities);
        } else {
            const newLiabilities = liabilities.filter(l => l.id !== id);
            setLiabilities(newLiabilities);
            saveData(assets, newLiabilities);
        }
    };

    const getTypeIcon = (type, isAsset) => {
        const types = isAsset ? ASSET_TYPES : LIABILITY_TYPES;
        const found = types.find(t => t.value === type);
        return found ? found.icon : Wallet;
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <Wallet className="text-indigo-500" size={20} />
                        <CardTitle>Net Worth</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Net Worth Display */}
                    <div className={`p-4 rounded-xl text-center mb-4 ${totals.netWorth >= 0
                        ? 'bg-gradient-to-br from-green-50 to-emerald-100'
                        : 'bg-gradient-to-br from-red-50 to-orange-100'
                        }`}>
                        <p className="text-sm text-gray-600 mb-1">Total Net Worth</p>
                        <p className={`text-3xl font-bold ${totals.netWorth >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {formatCurrency(totals.netWorth)}
                        </p>
                    </div>

                    {/* Summary Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-green-700">Assets</span>
                                <button
                                    onClick={() => handleOpenModal('asset')}
                                    className="p-1 hover:bg-green-100 rounded"
                                >
                                    <Plus size={14} className="text-green-600" />
                                </button>
                            </div>
                            <p className="text-lg font-bold text-green-700">{formatCurrency(totals.totalAssets)}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-red-700">Liabilities</span>
                                <button
                                    onClick={() => handleOpenModal('liability')}
                                    className="p-1 hover:bg-red-100 rounded"
                                >
                                    <Plus size={14} className="text-red-600" />
                                </button>
                            </div>
                            <p className="text-lg font-bold text-red-700">{formatCurrency(totals.totalLiabilities)}</p>
                        </div>
                    </div>

                    {/* Asset/Liability Lists */}
                    <div className="space-y-3">
                        {/* Assets */}
                        {assets.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-2">Assets</p>
                                <div className="space-y-1">
                                    {assets.map(asset => {
                                        const Icon = getTypeIcon(asset.type, true);
                                        return (
                                            <div
                                                key={asset.id}
                                                className="flex items-center justify-between p-2 bg-green-50 rounded-lg"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <Icon size={16} className="text-green-600" />
                                                    <span className="text-sm text-gray-900">{asset.name}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium text-green-700">
                                                        {formatCurrency(asset.value)}
                                                    </span>
                                                    <button
                                                        onClick={() => handleOpenModal('asset', asset)}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete('asset', asset.id)}
                                                        className="text-gray-400 hover:text-red-600"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Liabilities */}
                        {liabilities.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-2">Liabilities</p>
                                <div className="space-y-1">
                                    {liabilities.map(liability => {
                                        const Icon = getTypeIcon(liability.type, false);
                                        return (
                                            <div
                                                key={liability.id}
                                                className="flex items-center justify-between p-2 bg-red-50 rounded-lg"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <Icon size={16} className="text-red-600" />
                                                    <span className="text-sm text-gray-900">{liability.name}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium text-red-700">
                                                        -{formatCurrency(liability.value)}
                                                    </span>
                                                    <button
                                                        onClick={() => handleOpenModal('liability', liability)}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete('liability', liability.id)}
                                                        className="text-gray-400 hover:text-red-600"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {assets.length === 0 && liabilities.length === 0 && (
                            <p className="text-center text-gray-500 text-sm py-4">
                                Add your assets and liabilities to track your net worth
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={`${editItem ? 'Edit' : 'Add'} ${modalType === 'asset' ? 'Asset' : 'Liability'}`}
            >
                <div className="space-y-4">
                    <Input
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={modalType === 'asset' ? 'e.g., Savings Account' : 'e.g., Car Loan'}
                    />

                    <Select
                        label="Type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        options={(modalType === 'asset' ? ASSET_TYPES : LIABILITY_TYPES).map(t => ({
                            value: t.value,
                            label: t.label,
                        }))}
                    />

                    <Input
                        label="Value (MVR)"
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="0.00"
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
