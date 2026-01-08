import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { BarChart3, Hash, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, getMonthRange, calculateTotalByType } from '../../lib/utils';

/**
 * TransactionStats - Detailed statistics about transactions
 */
export const TransactionStats = ({ transactions }) => {
    const stats = useMemo(() => {
        const today = new Date();
        const thisMonthRange = getMonthRange(0);
        const lastMonthRange = getMonthRange(1);

        const thisMonthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(thisMonthRange.start) && d <= new Date(thisMonthRange.end);
        });

        const lastMonthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(lastMonthRange.start) && d <= new Date(lastMonthRange.end);
        });

        const expenses = thisMonthTxns.filter(t => t.type === 'debit');
        const income = thisMonthTxns.filter(t => t.type === 'credit');

        // Calculate averages
        const avgExpense = expenses.length > 0
            ? expenses.reduce((sum, t) => sum + t.amount, 0) / expenses.length
            : 0;
        const avgIncome = income.length > 0
            ? income.reduce((sum, t) => sum + t.amount, 0) / income.length
            : 0;

        // Find min/max
        const maxExpense = expenses.length > 0
            ? Math.max(...expenses.map(t => t.amount))
            : 0;
        const minExpense = expenses.length > 0
            ? Math.min(...expenses.map(t => t.amount))
            : 0;

        // Calculate daily average
        const daysPassed = today.getDate();
        const totalExpenses = calculateTotalByType(thisMonthTxns, 'debit');
        const dailyAvg = daysPassed > 0 ? totalExpenses / daysPassed : 0;

        // Transaction frequency
        const activeDays = new Set(thisMonthTxns.map(t => new Date(t.date).toDateString())).size;
        const txnsPerActiveDay = activeDays > 0 ? thisMonthTxns.length / activeDays : 0;

        // Month over month comparison
        const lastMonthTotal = calculateTotalByType(lastMonthTxns, 'debit');
        const momChange = lastMonthTotal > 0
            ? ((totalExpenses - lastMonthTotal) / lastMonthTotal) * 100
            : 0;

        // Transaction count comparison
        const lastMonthTxnCount = lastMonthTxns.filter(t => t.type === 'debit').length;
        const txnCountChange = lastMonthTxnCount > 0
            ? ((expenses.length - lastMonthTxnCount) / lastMonthTxnCount) * 100
            : 0;

        return {
            totalTransactions: thisMonthTxns.length,
            expenseCount: expenses.length,
            incomeCount: income.length,
            avgExpense,
            avgIncome,
            maxExpense,
            minExpense,
            dailyAvg,
            activeDays,
            txnsPerActiveDay,
            daysPassed,
            momChange,
            txnCountChange,
        };
    }, [transactions]);

    const statItems = [
        {
            label: 'Total Transactions',
            value: stats.totalTransactions,
            subValue: `${stats.expenseCount} expenses, ${stats.incomeCount} income`,
            icon: Hash,
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        },
        {
            label: 'Daily Average',
            value: formatCurrency(stats.dailyAvg),
            subValue: `${stats.activeDays} active days`,
            icon: Calendar,
            color: 'text-purple-500',
            bg: 'bg-purple-50'
        },
        {
            label: 'Avg Transaction',
            value: formatCurrency(stats.avgExpense),
            subValue: `Range: ${formatCurrency(stats.minExpense)} - ${formatCurrency(stats.maxExpense)}`,
            icon: BarChart3,
            color: 'text-orange-500',
            bg: 'bg-orange-50'
        },
        {
            label: 'Txns/Active Day',
            value: stats.txnsPerActiveDay.toFixed(1),
            subValue: `In ${stats.daysPassed} days this month`,
            icon: TrendingUp,
            color: 'text-green-500',
            bg: 'bg-green-50'
        },
    ];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <BarChart3 className="text-indigo-500" size={20} />
                    <CardTitle>Transaction Statistics</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    {statItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.label} className={`p-3 rounded-lg ${item.bg}`}>
                                <div className="flex items-center space-x-2 mb-1">
                                    <Icon size={14} className={item.color} />
                                    <span className="text-xs text-gray-600">{item.label}</span>
                                </div>
                                <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{item.subValue}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Month comparison */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">vs Last Month</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                            {stats.momChange <= 0 ? (
                                <ArrowDownRight size={16} className="text-green-500" />
                            ) : (
                                <ArrowUpRight size={16} className="text-red-500" />
                            )}
                            <div>
                                <p className={`text-sm font-bold ${stats.momChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats.momChange > 0 ? '+' : ''}{stats.momChange.toFixed(0)}%
                                </p>
                                <p className="text-xs text-gray-500">Spending</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {stats.txnCountChange <= 0 ? (
                                <ArrowDownRight size={16} className="text-green-500" />
                            ) : (
                                <ArrowUpRight size={16} className="text-red-500" />
                            )}
                            <div>
                                <p className={`text-sm font-bold ${stats.txnCountChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats.txnCountChange > 0 ? '+' : ''}{stats.txnCountChange.toFixed(0)}%
                                </p>
                                <p className="text-xs text-gray-500">Transactions</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
