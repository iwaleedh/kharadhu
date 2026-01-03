import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useTransactionStore } from '../../store/transactionStore';
import { AddCategoryModal } from './AddCategoryModal';
import { EditCategoryModal } from './EditCategoryModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { deleteCategory } from '../../lib/database';
import { getCurrentUserId } from '../../lib/currentUser';
import { cn } from '../../lib/utils';

export const CategoryManager = () => {
  const { categories, init } = useTransactionStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    
    try {
      const userId = getCurrentUserId();
      await deleteCategory(Number(userId), deletingCategory.id);
      setDeletingCategory(null);
      await init(); // Reload categories
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Categories</CardTitle>
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1"
            >
              <Plus size={16} />
              <span>Add</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Expense Categories */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Expenses ({expenseCategories.length})
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {expenseCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-2xl">{category.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {category.name}
                        </p>
                        {category.nameDv && (
                          <p className="text-xs text-gray-700 truncate">
                            {category.nameDv}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        <Edit2 size={14} className="text-gray-700" />
                      </button>
                      <button
                        onClick={() => setDeletingCategory(category)}
                        className="p-1 hover:bg-red-900/50 rounded transition-colors"
                      >
                        <Trash2 size={14} className="text-red-900" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Income Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Income ({incomeCategories.length})
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {incomeCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-2xl">{category.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {category.name}
                        </p>
                        {category.nameDv && (
                          <p className="text-xs text-gray-700 truncate">
                            {category.nameDv}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        <Edit2 size={14} className="text-gray-700" />
                      </button>
                      <button
                        onClick={() => setDeletingCategory(category)}
                        className="p-1 hover:bg-red-900/50 rounded transition-colors"
                      >
                        <Trash2 size={14} className="text-red-900" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          init();
        }}
      />

      {/* Edit Category Modal */}
      {editingCategory && (
        <EditCategoryModal
          isOpen={!!editingCategory}
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSuccess={() => {
            setEditingCategory(null);
            init();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deletingCategory && (
        <ConfirmDialog
          isOpen={!!deletingCategory}
          onClose={() => setDeletingCategory(null)}
          title="Delete Category?"
          message={`Are you sure you want to delete "${deletingCategory.name}"? Existing transactions with this category will not be affected.`}
          confirmText="Delete"
          destructive
          onConfirm={handleDeleteCategory}
        />
      )}
    </>
  );
};
