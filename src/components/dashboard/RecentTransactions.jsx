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
          <div className="text-center py-8 text-gray-500">
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
          <CardTitle className="text-base">
            <span className="dhivehi block leading-tight">ފަހުގެ ހަރަދު</span>
            <span className="text-[10px] text-gray-600 leading-tight">Recent Transactions</span>
          </CardTitle>
          <button 
            onClick={onViewAll}
            className="text-xs text-ocean-600 hover:text-ocean-700 font-medium"
          >
            <span className="dhivehi block leading-tight">ހުރިހާ ބަލާ</span>
            <span className="text-[9px] leading-tight">View All</span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-2">
          {transactions.slice(0, 10).map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-300 active:bg-gray-800 cursor-pointer"
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className={`p-1.5 rounded-lg flex-shrink-0 shadow-lg ${
                  transaction.type === 'credit' 
                    ? 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-green-900/50' 
                    : 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-red-900/50'
                }`}>
                  {transaction.type === 'credit' 
                    ? <ArrowUpCircle size={16} /> 
                    : <ArrowDownCircle size={16} />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-base text-gray-100 truncate">
                    {transaction.merchant || transaction.category}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {formatDate(transaction.date, 'dd MMM HH:mm')} • {transaction.bank}
                  </p>
                </div>
              </div>
              <div className="text-right ml-2 flex-shrink-0">
                <p className={`font-bold text-base ${
                  transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
                <p className="text-sm text-gray-500 truncate dhivehi">{transaction.category}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
