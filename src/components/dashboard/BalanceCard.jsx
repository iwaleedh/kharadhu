import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export const BalanceCard = ({ income, expenses, balance, startingBalance, onAddIncome, onAddExpense }) => {
  return (
    <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-2xl p-5 shadow-md border border-orange-100/50 scale-in">
      {/* Top Row: Total Balance and Initial Balance */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Total Balance (Initial - Expenses) */}
        <div>
          <p className="text-gray-700 text-xs font-medium mb-1 uppercase tracking-wide">
            Total Balance
          </p>
          <h2 className="text-4xl font-bold text-gray-900">
            {formatCurrency(balance)}
          </h2>
          <p className="text-xs text-gray-700 mt-1.5">Available to spend</p>
        </div>
        
        {/* Initial Balance */}
        <div>
          <p className="text-gray-700 text-xs font-medium mb-1 uppercase tracking-wide">
            Initial Balance
          </p>
          <h2 className="text-3xl font-bold text-gray-700">
            {formatCurrency(startingBalance || 0)}
          </h2>
        </div>
      </div>
      
      {/* Bottom Row: Income and Expenses */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {/* Income Card - Clickable */}
        <button
          onClick={onAddIncome}
          className="bg-white rounded-xl p-4 border-2 hover:shadow-md active:scale-98 transition-all duration-200 cursor-pointer text-left"
          style={{ borderColor: '#50C878' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp size={18} style={{ color: '#50C878' }} />
              <p className="text-sm font-semibold" style={{ color: '#50C878' }}>Income</p>
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#50C878' }}>{formatCurrency(income)}</p>
          <p className="text-xs text-gray-700 mt-1">This month</p>
        </button>
        
        {/* Expenses Card - Clickable */}
        <button
          onClick={onAddExpense}
          className="bg-white rounded-xl p-4 border-2 hover:shadow-md active:scale-98 transition-all duration-200 cursor-pointer text-left"
          style={{ borderColor: '#880808' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <TrendingDown size={18} style={{ color: '#880808' }} />
              <p className="text-sm font-semibold" style={{ color: '#880808' }}>Expenses</p>
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#880808' }}>{formatCurrency(expenses)}</p>
          <p className="text-xs text-gray-700 mt-1">This month</p>
        </button>
      </div>
    </div>
  );
};
