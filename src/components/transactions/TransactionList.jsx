import { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Edit, Trash2, Search } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { formatCurrency, groupByDate } from '../../lib/utils';

export const TransactionList = ({ transactions, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = !searchTerm || 
      t.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const groupedTransactions = groupByDate(filteredTransactions);

  return (
    <div className="space-y-3">
      {/* Search Filter */}
      <Card>
        <CardContent className="p-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm py-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      {Object.entries(groupedTransactions).length === 0 ? (
        <p className="text-center text-gray-600 py-8">No transactions found</p>
      ) : (
        Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
          <div key={date}>
            <h3 className="text-xs font-semibold text-gray-700 px-3 py-2 uppercase tracking-wide">
              {new Date(date).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            <div className="space-y-2">
              {dateTransactions.map(transaction => (
                <Card key={transaction.id} hover>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="text-lg flex-shrink-0">
                          {transaction.type === 'credit' 
                            ? <ArrowUpCircle size={16} style={{ color: '#50C878' }} /> 
                            : <ArrowDownCircle size={16} style={{ color: '#880808' }} />
                          }
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {transaction.merchant || transaction.category}
                          </p>
                          <p className="text-xs text-gray-700 truncate">
                            {transaction.category} • {transaction.bank} • {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-sm" style={{ color: transaction.type === 'credit' ? '#50C878' : '#880808' }}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        {typeof transaction.balanceAfter === 'number' && (
                          <p className="text-[10px] text-gray-700">
                            Balance: {formatCurrency(transaction.balanceAfter)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-2 mt-2 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => onEdit(transaction)}
                        className="flex-1 p-2 hover:bg-orange-100 active:bg-orange-200 rounded text-orange-600 text-xs font-medium transition-colors"
                      >
                        <Edit size={14} className="inline mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => onDelete(transaction.id)}
                        className="flex-1 p-2 hover:bg-red-100 active:bg-red-200 rounded text-red-700 text-xs font-medium transition-colors"
                      >
                        <Trash2 size={14} className="inline mr-1" /> Delete
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
