import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { calculateMonthlySummary, formatCurrency, getMonthRange } from '../../lib/utils';

const pct = (current, prev) => {
  if (!prev) return null;
  return ((current - prev) / prev) * 100;
};

const Delta = ({ current, prev, positiveIsGood = false }) => {
  const change = current - prev;
  const percent = pct(current, prev);
  const good = positiveIsGood ? change >= 0 : change <= 0;
  const Icon = good ? TrendingUp : TrendingDown;
  const color = good ? 'text-emerald-500' : 'text-red-900';

  return (
    <div className={`flex items-center gap-1 text-xs font-semibold ${color}`}>
      <Icon size={14} />
      <span>{formatCurrency(Math.abs(change))}</span>
      {percent != null ? <span>({Math.abs(percent).toFixed(1)}%)</span> : <span>(new)</span>}
    </div>
  );
};

export const MonthlyComparison = ({ transactions }) => {
  const thisMonth = calculateMonthlySummary(transactions, getMonthRange(0));
  const lastMonth = calculateMonthlySummary(transactions, getMonthRange(1));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card className="bg-white border border-orange-100">
        <CardHeader>
          <CardTitle className="text-gray-900 text-base">This Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-800">Income</div>
              <div className="text-lg font-bold text-emerald-500">{formatCurrency(thisMonth.income)}</div>
            </div>
            <Delta current={thisMonth.income} prev={lastMonth.income} positiveIsGood />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-800">Expenses</div>
              <div className="text-lg font-bold text-red-900">{formatCurrency(thisMonth.expenses)}</div>
            </div>
            <Delta current={thisMonth.expenses} prev={lastMonth.expenses} positiveIsGood={false} />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div>
              <div className="text-xs text-gray-800">Transactions</div>
              <div className="text-base font-semibold text-gray-900">{thisMonth.transactionCount}</div>
            </div>
            <div className="text-xs text-gray-800">vs {lastMonth.transactionCount} last month</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-orange-100">
        <CardHeader>
          <CardTitle className="text-gray-900 text-base">Last Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-800">Income</div>
              <div className="text-lg font-bold text-emerald-500">{formatCurrency(lastMonth.income)}</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-800">Expenses</div>
              <div className="text-lg font-bold text-red-900">{formatCurrency(lastMonth.expenses)}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div>
              <div className="text-xs text-gray-800">Transactions</div>
              <div className="text-base font-semibold text-gray-900">{lastMonth.transactionCount}</div>
            </div>
            <div className="text-xs text-gray-700">Previous period</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
