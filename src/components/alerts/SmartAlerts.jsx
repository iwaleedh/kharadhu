import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { AlertTriangle, TrendingUp, ShoppingBag, AlertCircle, CheckCircle, X, Bell } from 'lucide-react';
import { formatCurrency, getMonthRange, calculateTotalByType, groupByCategory } from '../../lib/utils';

/**
 * SmartAlerts - AI-detected unusual spending patterns
 */
export const SmartAlerts = ({ transactions, categories }) => {
    const [dismissedAlerts, setDismissedAlerts] = useState(() => {
        const stored = localStorage.getItem('dismissed_alerts');
        return stored ? JSON.parse(stored) : [];
    });

    const dismissAlert = (alertId) => {
        const newDismissed = [...dismissedAlerts, alertId];
        setDismissedAlerts(newDismissed);
        localStorage.setItem('dismissed_alerts', JSON.stringify(newDismissed));
    };

    const alerts = useMemo(() => {
        const alertsList = [];
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

        const thisMonthExpenses = calculateTotalByType(thisMonthTxns, 'debit');
        const lastMonthExpenses = calculateTotalByType(lastMonthTxns, 'debit');
        const today = new Date();
        const dayOfMonth = today.getDate();

        // Alert 1: Spending pace alert
        if (dayOfMonth >= 10 && lastMonthExpenses > 0) {
            const projectedSpending = (thisMonthExpenses / dayOfMonth) * 30;
            if (projectedSpending > lastMonthExpenses * 1.2) {
                alertsList.push({
                    id: `pace_${today.getMonth()}`,
                    type: 'warning',
                    icon: TrendingUp,
                    title: 'High Spending Pace',
                    message: `You're on track to spend ${formatCurrency(projectedSpending)} this month, ${Math.round(((projectedSpending / lastMonthExpenses) - 1) * 100)}% more than last month.`,
                    priority: 1,
                });
            }
        }

        // Alert 2: Category spike detection
        const thisMonthByCategory = groupByCategory(thisMonthTxns.filter(t => t.type === 'debit'));
        const lastMonthByCategory = groupByCategory(lastMonthTxns.filter(t => t.type === 'debit'));

        thisMonthByCategory.forEach(cat => {
            const lastMonthCat = lastMonthByCategory.find(c => c.category === cat.category);
            if (lastMonthCat && lastMonthCat.total > 0) {
                const increase = ((cat.total - lastMonthCat.total) / lastMonthCat.total) * 100;
                if (increase > 50 && cat.total > 500) {
                    const catInfo = categories.find(c => c.name === cat.category);
                    alertsList.push({
                        id: `category_spike_${cat.category}_${today.getMonth()}`,
                        type: 'info',
                        icon: ShoppingBag,
                        title: `${catInfo?.icon || '📁'} ${cat.category} Spike`,
                        message: `${cat.category} spending is up ${Math.round(increase)}% compared to last month (${formatCurrency(cat.total)} vs ${formatCurrency(lastMonthCat.total)}).`,
                        priority: 2,
                    });
                }
            }
        });

        // Alert 3: Unusual large transaction
        const avgTransactionSize = thisMonthExpenses / Math.max(thisMonthTxns.filter(t => t.type === 'debit').length, 1);
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recentLargeTxn = thisMonthTxns
            .filter(t => t.type === 'debit' && t.amount > avgTransactionSize * 3 && new Date(t.date) > sevenDaysAgo)
            .sort((a, b) => b.amount - a.amount)[0];

        if (recentLargeTxn) {
            alertsList.push({
                id: `large_txn_${recentLargeTxn.id}`,
                type: 'info',
                icon: AlertCircle,
                title: 'Large Transaction',
                message: `${formatCurrency(recentLargeTxn.amount)} at ${recentLargeTxn.merchant || recentLargeTxn.category || 'Unknown'} is ${Math.round(recentLargeTxn.amount / avgTransactionSize)}x your average transaction.`,
                priority: 3,
            });
        }

        // Alert 4: Budget exceeded
        categories.filter(c => c.type === 'expense' && c.budget > 0).forEach(cat => {
            const spent = thisMonthTxns
                .filter(t => t.category === cat.name && t.type === 'debit')
                .reduce((sum, t) => sum + t.amount, 0);

            if (spent > cat.budget) {
                alertsList.push({
                    id: `budget_exceeded_${cat.name}_${today.getMonth()}`,
                    type: 'error',
                    icon: AlertTriangle,
                    title: `${cat.icon} Budget Exceeded`,
                    message: `${cat.name} is over budget by ${formatCurrency(spent - cat.budget)} (${formatCurrency(spent)} / ${formatCurrency(cat.budget)}).`,
                    priority: 1,
                });
            } else if (spent >= cat.budget * 0.9) {
                alertsList.push({
                    id: `budget_warning_${cat.name}_${today.getMonth()}`,
                    type: 'warning',
                    icon: AlertTriangle,
                    title: `${cat.icon} Budget Warning`,
                    message: `${cat.name} is at ${Math.round((spent / cat.budget) * 100)}% of budget (${formatCurrency(cat.budget - spent)} remaining).`,
                    priority: 2,
                });
            }
        });

        // Alert 5: No income this month
        const thisMonthIncome = calculateTotalByType(thisMonthTxns, 'credit');
        if (dayOfMonth >= 15 && thisMonthIncome === 0) {
            alertsList.push({
                id: `no_income_${today.getMonth()}`,
                type: 'info',
                icon: AlertCircle,
                title: 'No Income Recorded',
                message: `No income has been recorded this month. Don't forget to add your income transactions.`,
                priority: 3,
            });
        }

        // Filter out dismissed alerts
        return alertsList
            .filter(a => !dismissedAlerts.includes(a.id))
            .sort((a, b) => a.priority - b.priority);
    }, [transactions, categories, dismissedAlerts]);

    const getAlertStyle = (type) => {
        switch (type) {
            case 'error': return 'bg-red-50 border-red-200';
            case 'warning': return 'bg-yellow-50 border-yellow-200';
            default: return 'bg-blue-50 border-blue-200';
        }
    };

    const getIconColor = (type) => {
        switch (type) {
            case 'error': return 'text-red-500';
            case 'warning': return 'text-yellow-500';
            default: return 'text-blue-500';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Bell className="text-orange-500" size={20} />
                    <CardTitle>Smart Alerts</CardTitle>
                    {alerts.length > 0 && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                            {alerts.length}
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {alerts.length === 0 ? (
                    <div className="flex items-center justify-center space-x-2 py-6 text-green-600">
                        <CheckCircle size={20} />
                        <span className="text-sm">All good! No alerts at the moment.</span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {alerts.map(alert => {
                            const Icon = alert.icon;
                            return (
                                <div
                                    key={alert.id}
                                    className={`p-3 rounded-lg border ${getAlertStyle(alert.type)} relative`}
                                >
                                    <button
                                        onClick={() => dismissAlert(alert.id)}
                                        className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded"
                                    >
                                        <X size={14} className="text-gray-500" />
                                    </button>
                                    <div className="flex items-start space-x-3 pr-6">
                                        <Icon size={18} className={`mt-0.5 ${getIconColor(alert.type)}`} />
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{alert.title}</p>
                                            <p className="text-xs text-gray-600 mt-0.5">{alert.message}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
