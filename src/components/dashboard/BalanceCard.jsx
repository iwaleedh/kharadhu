import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export const BalanceCard = ({ income, expenses, balance, startingBalance, onAddIncome, onAddExpense }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white rounded-2xl p-4 shadow-2xl border border-gray-800 scale-in">
      {/* Top Row: Total Balance and Initial Balance */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Total Balance (Initial - Expenses) */}
        <div>
          <p className="text-gray-300 text-sm font-semibold mb-2">
            <span className="dhivehi block">ޖުމްލަ ބޭލެންސް</span>
            <span className="text-xs text-gray-400">Total Balance</span>
          </p>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {formatCurrency(balance)}
          </h2>
          <p className="text-xs text-gray-400 mt-1">Initial - Expenses</p>
        </div>
        
        {/* Initial Balance */}
        <div>
          <p className="text-gray-300 text-sm font-semibold mb-2">
            <span className="dhivehi block">ފެށުމުގެ ބޭލެންސް</span>
            <span className="text-xs text-gray-400">Initial Balance</span>
          </p>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            {formatCurrency(startingBalance || 0)}
          </h2>
        </div>
      </div>
      
      {/* Bottom Row: Income and Expenses */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {/* Income Card - Clickable */}
        <button
          onClick={onAddIncome}
          className="bg-gradient-to-br from-green-900/40 to-green-800/30 rounded-lg p-3 border border-green-800/50 hover:border-green-700/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <TrendingUp size={18} className="text-green-400" />
              <div>
                <p className="text-sm text-green-300 dhivehi leading-tight">އާމްދަނީ</p>
                <p className="text-xs text-green-400 leading-tight">Income</p>
              </div>
            </div>
            <span className="text-xs text-green-400 opacity-75">+ Add</span>
          </div>
          <p className="text-xl font-bold text-green-400">{formatCurrency(income)}</p>
          <p className="text-xs text-green-500 mt-1">All Accounts</p>
        </button>
        
        {/* Expenses Card - Clickable */}
        <button
          onClick={onAddExpense}
          className="bg-gradient-to-br from-red-900/40 to-red-800/30 rounded-lg p-3 border border-red-800/50 hover:border-red-700/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <TrendingDown size={18} className="text-red-400" />
              <div>
                <p className="text-sm text-red-300 dhivehi leading-tight">ހަރަދު</p>
                <p className="text-xs text-red-400 leading-tight">Expenses</p>
              </div>
            </div>
            <span className="text-xs text-red-400 opacity-75">+ Add</span>
          </div>
          <p className="text-xl font-bold text-red-400">{formatCurrency(expenses)}</p>
          <p className="text-xs text-red-500 mt-1">All Accounts</p>
        </button>
      </div>
    </div>
  );
};
