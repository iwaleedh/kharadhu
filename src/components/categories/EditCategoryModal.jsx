import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { updateCategory } from '../../lib/database';
import { getCurrentUserId } from '../../lib/currentUser';

const COMMON_ICONS = ['🍔', '🛒', '🏠', '🚗', '💊', '🎬', '👕', '📚', '☎️', '⛽', '🏦', '💰', '✈️', '🎮', '🏋️', '🐕', '🎨', '🔧', '💼', '🎓', '🍕', '☕', '🎵', '📱', '🏥', '🚕', '🛍️', '💳'];

const COMMON_COLORS = ['#FF6B6B', '#F97316', '#8B5CF6', '#3B82F6', '#EC4899', '#F59E0B', '#A855F7', '#06B6D4', '#10B981', '#EF4444', '#6B7280', '#14B8A6', '#F43F5E', '#8B5CF6', '#0EA5E9'];

export const EditCategoryModal = ({ isOpen, onClose, category, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    nameDv: '',
    icon: '🔧',
    color: '#6B7280',
    type: 'expense',
    budget: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        nameDv: category.nameDv || '',
        icon: category.icon || '🔧',
        color: category.color || '#6B7280',
        type: category.type || 'expense',
        budget: category.budget || ''
      });
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userId = getCurrentUserId();
      if (!userId) throw new Error('Not signed in');
      if (!category?.id) throw new Error('Invalid category');

      if (!formData.name) throw new Error('Please enter category name');
      if (!formData.nameDv) throw new Error('Please enter Dhivehi name');

      await updateCategory(Number(userId), category.id, {
        name: formData.name.trim(),
        nameDv: formData.nameDv.trim(),
        icon: formData.icon,
        color: formData.color,
        type: formData.type,
        budget: parseFloat(formData.budget) || 0
      });

      onSuccess && onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Category">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Category Type */}
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">
            Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            required
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        {/* Name (English) */}
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">
            Category Name (English)
          </label>
          <Input
            type="text"
            placeholder="e.g., Food, Transport, Bills"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* Name (Dhivehi) */}
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">
            Category Name (Dhivehi)
          </label>
          <Input
            type="text"
            placeholder="e.g., ކައްކާބާ، ދަތުރުފަތުރު، ބިލްތައް"
            value={formData.nameDv}
            onChange={(e) => setFormData({ ...formData, nameDv: e.target.value })}
            className="dhivehi"
            required
          />
        </div>

        {/* Icon Selector */}
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">
            Icon
          </label>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-4xl">{formData.icon}</span>
            <Input
              type="text"
              placeholder="Enter emoji"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              maxLength={2}
              className="flex-1"
            />
          </div>
          <div className="grid grid-cols-10 gap-1">
            {COMMON_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setFormData({ ...formData, icon })}
                className={cn(
                  'p-2 text-xl rounded hover:bg-gray-700 transition-colors',
                  formData.icon === icon && 'bg-red-900/50 ring-2 ring-red-500'
                )}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selector */}
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">
            Color
          </label>
          <div className="grid grid-cols-8 gap-2">
            {COMMON_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={cn(
                  'w-10 h-10 rounded-lg transition-all',
                  formData.color === color && 'ring-2 ring-white scale-110'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Budget (Optional) */}
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">
            Monthly Budget (Optional)
          </label>
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="e.g., 5000"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          />
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const cn = (...classes) => classes.filter(Boolean).join(' ');
