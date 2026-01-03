import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatCurrency, formatDate } from '../../lib/utils';

export const RecentTransactions = ({ transactions, onViewAll }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-700">
            No transactions yet. Add your first transaction!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-3">
      <CardHeader className="mb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
          <button 
            onClick={onViewAll}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-2">
          {transactions.slice(0, 10).map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-lg transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="p-1.5 rounded-lg flex-shrink-0 bg-white" style={{ color: transaction.type === 'credit' ? '#50C878' : '#880808' }}>
                  {transaction.type === 'credit' 
                    ? <ArrowUpCircle size={16} /> 
                    : <ArrowDownCircle size={16} />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-base text-gray-900 truncate">
                    {transaction.merchant || transaction.category}
                  </p>
                  <p className="text-sm text-gray-800 truncate">
                    {formatDate(transaction.date, 'dd MMM HH:mm')} • {transaction.bank}
                  </p>
                </div>
              </div>
              <div className="text-right ml-2 flex-shrink-0">
                <p className="font-bold text-base" style={{ color: transaction.type === 'credit' ? '#50C878' : '#880808' }}>
                  {transaction.type === 'credit' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
                <p className="text-sm truncate" style={{ color: transaction.type === 'credit' ? '#50C878' : '#880808' }}>{transaction.category}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
