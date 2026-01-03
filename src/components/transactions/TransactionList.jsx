import { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Edit, Trash2, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input, Select } from '../ui/Input';
import { formatCurrency, groupByDate } from '../../lib/utils';

export const TransactionList = ({ transactions, categories, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = !searchTerm || 
      t.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || t.category === filterCategory;
    const matchesType = !filterType || t.type === filterType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const groupedTransactions = groupByDate(filteredTransactions);

  return (
    <div className="space-y-3">
      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm py-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-sm py-2"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                ))}
              </Select>
              
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm py-2"
              >
                <option value="">All Types</option>
                <option value="debit">Expenses</option>
                <option value="credit">Income</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      {Object.entries(groupedTransactions).length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No transactions found</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
          <Card key={date} className="p-3">
            <CardHeader className="mb-2">
              <CardTitle className="text-xs text-gray-600 font-semibold">{date}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {dateTransactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex items-center p-2 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors group relative"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                        transaction.type === 'credit' 
                          ? 'bg-tropical-100 text-tropical-600' 
                          : 'bg-coral-100 text-coral-600'
                      }`}>
                        {transaction.type === 'credit' 
                          ? <ArrowUpCircle size={16} /> 
                          : <ArrowDownCircle size={16} />
                        }
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {transaction.merchant || transaction.category}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {transaction.category} • {transaction.bank} • {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{transaction.receiptText ? ' • 🧾' : ''}
                        </p>
                      </div>
                      
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className={`font-bold text-sm ${
                         transaction.type === 'credit' ? 'text-tropical-600' : 'text-coral-600'
                       }`}>
                         {transaction.type === 'credit' ? '+' : '-'}
                         {formatCurrency(transaction.amount)}
                       </p>
                       {typeof transaction.balanceAfter === 'number' && (
                         <p className="text-[10px] text-gray-500">
                           Balance: {formatCurrency(transaction.balanceAfter)}
                         </p>
                       )}
                      </div>
                    </div>
                    
                    {/* Mobile action buttons - always visible */}
                    <div className="flex space-x-0.5 ml-1 flex-shrink-0">
                      <button
                        onClick={() => onEdit(transaction)}
                        className="p-2 hover:bg-ocean-100 active:bg-ocean-200 rounded-lg text-ocean-600"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(transaction.id)}
                        className="p-2 hover:bg-coral-100 active:bg-coral-200 rounded-lg text-coral-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
