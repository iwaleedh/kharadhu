import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
    Lightbulb, TrendingUp, TrendingDown, AlertCircle, Award, Flame,
    Calendar, ShoppingBag, Clock, Zap, Target, CreditCard, Repeat
} from 'lucide-react';
import { useTransactionStore } from '../../store/transactionStore';
import { formatCurrency, getMonthRange, calculateTotalByType, groupByCategory } from '../../lib/utils';

export const SpendingInsights = () => {
    const { transactions, categories } = useTransactionStore();

    const insights = useMemo(() => {
        const results = [];
        const today = new Date();
        const dayOfMonth = today.getDate();

        // Get this month and last month data
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
        const thisMonthIncome = calculateTotalByType(thisMonthTxns, 'credit');

        // ===== NEW: Daily Average Spending =====
        if (dayOfMonth > 1 && thisMonthExpenses > 0) {
            const dailyAverage = thisMonthExpenses / dayOfMonth;
            const projectedMonthly = dailyAverage * 30;

            if (projectedMonthly > lastMonthExpenses * 1.2 && lastMonthExpenses > 0) {
                results.push({
                    type: 'warning',
                    icon: Calendar,
                    title: 'Pace Alert',
                    message: `At ${formatCurrency(dailyAverage)}/day, you're on track to spend ${formatCurrency(projectedMonthly)} this month.`,
                    color: 'text-orange-500',
                    bgColor: 'bg-orange-50',
                });
            }
        }

        // ===== NEW: Biggest Transaction This Month =====
        const expenseTxns = thisMonthTxns.filter(t => t.type === 'debit');
        if (expenseTxns.length > 0) {
            const biggest = expenseTxns.reduce((max, t) => t.amount > max.amount ? t : max, expenseTxns[0]);
            if (biggest.amount > thisMonthExpenses * 0.15) {
                results.push({
                    type: 'info',
                    icon: ShoppingBag,
                    title: 'Biggest Expense',
                    message: `${biggest.merchant || biggest.category}: ${formatCurrency(biggest.amount)} (${((biggest.amount / thisMonthExpenses) * 100).toFixed(0)}% of monthly spending)`,
                    color: 'text-indigo-600',
                    bgColor: 'bg-indigo-50',
                });
            }
        }

        // ===== NEW: Weekend vs Weekday Spending =====
        const weekendSpend = expenseTxns.filter(t => {
            const day = new Date(t.date).getDay();
            return day === 0 || day === 6;
        }).reduce((sum, t) => sum + t.amount, 0);

        const weekendPercent = thisMonthExpenses > 0 ? (weekendSpend / thisMonthExpenses) * 100 : 0;

        if (weekendPercent > 40) {
            results.push({
                type: 'info',
                icon: Calendar,
                title: 'Weekend Spender',
                message: `${weekendPercent.toFixed(0)}% of your spending happens on weekends (${formatCurrency(weekendSpend)}).`,
                color: 'text-cyan-600',
                bgColor: 'bg-cyan-50',
            });
        }

        // ===== NEW: Most Frequent Merchant =====
        const merchantCount = {};
        expenseTxns.forEach(t => {
            if (t.merchant) {
                merchantCount[t.merchant] = (merchantCount[t.merchant] || 0) + 1;
            }
        });
        const topMerchant = Object.entries(merchantCount).sort((a, b) => b[1] - a[1])[0];
        if (topMerchant && topMerchant[1] >= 5) {
            results.push({
                type: 'info',
                icon: Repeat,
                title: 'Frequent Visit',
                message: `You've shopped at ${topMerchant[0]} ${topMerchant[1]} times this month.`,
                color: 'text-violet-600',
                bgColor: 'bg-violet-50',
            });
        }

        // ===== NEW: Spending Streak =====
        const uniqueDays = new Set(expenseTxns.map(t => new Date(t.date).toDateString())).size;
        if (uniqueDays >= 10) {
            results.push({
                type: 'info',
                icon: Zap,
                title: 'Active Spender',
                message: `You've made purchases on ${uniqueDays} different days this month.`,
                color: 'text-amber-600',
                bgColor: 'bg-amber-50',
            });
        }

        // ===== NEW: Small Transactions Add Up =====
        const smallTxns = expenseTxns.filter(t => t.amount < 50);
        const smallTotal = smallTxns.reduce((sum, t) => sum + t.amount, 0);
        if (smallTxns.length >= 10 && smallTotal > 500) {
            results.push({
                type: 'warning',
                icon: CreditCard,
                title: 'Small Purchases Add Up',
                message: `${smallTxns.length} transactions under MVR 50 totaled ${formatCurrency(smallTotal)}.`,
                color: 'text-pink-600',
                bgColor: 'bg-pink-50',
            });
        }

        // ===== EXISTING: Total spending comparison =====
        if (lastMonthExpenses > 0 && thisMonthExpenses > 0) {
            const changePercent = ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;

            if (changePercent > 20) {
                results.push({
                    type: 'warning',
                    icon: TrendingUp,
                    title: 'Spending Up',
                    message: `You've spent ${Math.abs(changePercent).toFixed(0)}% more this month compared to last month.`,
                    color: 'text-red-500',
                    bgColor: 'bg-red-50',
                });
            } else if (changePercent < -20) {
                results.push({
                    type: 'success',
                    icon: TrendingDown,
                    title: 'Great Savings!',
                    message: `You've spent ${Math.abs(changePercent).toFixed(0)}% less this month. Keep it up!`,
                    color: 'text-green-500',
                    bgColor: 'bg-green-50',
                });
            }
        }

        // ===== EXISTING: Category-wise comparison =====
        const thisMonthByCategory = groupByCategory(thisMonthTxns.filter(t => t.type === 'debit'));
        const lastMonthByCategory = groupByCategory(lastMonthTxns.filter(t => t.type === 'debit'));

        const lastMonthMap = {};
        lastMonthByCategory.forEach(c => { lastMonthMap[c.category] = c.total; });

        thisMonthByCategory.forEach(cat => {
            const lastTotal = lastMonthMap[cat.category] || 0;
            if (lastTotal > 0 && cat.total > lastTotal) {
                const increase = ((cat.total - lastTotal) / lastTotal) * 100;
                if (increase > 30 && cat.total > 500) {
                    results.push({
                        type: 'alert',
                        icon: Flame,
                        title: `${cat.category} Spike`,
                        message: `${cat.category} spending up ${increase.toFixed(0)}% (${formatCurrency(cat.total)} vs ${formatCurrency(lastTotal)})`,
                        color: 'text-orange-500',
                        bgColor: 'bg-orange-50',
                    });
                }
            }
        });

        // ===== EXISTING: Budget alerts =====
        categories.filter(c => c.type === 'expense' && c.budget > 0).forEach(cat => {
            const catTxns = thisMonthTxns.filter(t => t.category === cat.name && t.type === 'debit');
            const spent = catTxns.reduce((sum, t) => sum + t.amount, 0);
            const percent = (spent / cat.budget) * 100;

            if (percent >= 100) {
                results.push({
                    type: 'danger',
                    icon: AlertCircle,
                    title: `${cat.name} Over Budget`,
                    message: `You've exceeded your ${cat.name} budget by ${formatCurrency(spent - cat.budget)}`,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                });
            } else if (percent >= 80) {
                results.push({
                    type: 'warning',
                    icon: AlertCircle,
                    title: `${cat.name} Budget Warning`,
                    message: `You've used ${percent.toFixed(0)}% of your ${cat.name} budget`,
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                });
            }
        });

        // ===== EXISTING: Savings rate =====
        if (thisMonthIncome > 0 && thisMonthExpenses > 0) {
            const savingsRate = ((thisMonthIncome - thisMonthExpenses) / thisMonthIncome) * 100;
            if (savingsRate > 30) {
                results.push({
                    type: 'success',
                    icon: Award,
                    title: 'Excellent Savings Rate!',
                    message: `You're saving ${savingsRate.toFixed(0)}% of your income this month.`,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                });
            } else if (savingsRate < 10 && savingsRate > 0) {
                results.push({
                    type: 'info',
                    icon: Lightbulb,
                    title: 'Savings Tip',
                    message: `Your savings rate is ${savingsRate.toFixed(0)}%. Try to aim for at least 20%.`,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                });
            }
        }

        // ===== NEW: Budget on track =====
        const budgetedCategories = categories.filter(c => c.type === 'expense' && c.budget > 0);
        const underBudgetCount = budgetedCategories.filter(cat => {
            const spent = thisMonthTxns.filter(t => t.category === cat.name && t.type === 'debit')
                .reduce((sum, t) => sum + t.amount, 0);
            return spent < cat.budget * 0.5;
        }).length;

        if (underBudgetCount >= 3) {
            results.push({
                type: 'success',
                icon: Target,
                title: 'Budget Champion!',
                message: `You're under 50% budget in ${underBudgetCount} categories. Excellent discipline!`,
                color: 'text-emerald-600',
                bgColor: 'bg-emerald-50',
            });
        }

        // ===== EXISTING: Top spending category =====
        if (thisMonthByCategory.length > 0) {
            const top = thisMonthByCategory[0];
            const percentOfTotal = thisMonthExpenses > 0 ? (top.total / thisMonthExpenses) * 100 : 0;
            if (percentOfTotal > 40) {
                results.push({
                    type: 'info',
                    icon: Lightbulb,
                    title: 'Top Category',
                    message: `${top.category} accounts for ${percentOfTotal.toFixed(0)}% of your spending.`,
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-50',
                });
            }
        }

        return results.slice(0, 6); // Limit to 6 insights
    }, [transactions, categories]);

    if (insights.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Lightbulb className="text-yellow-500" size={20} />
                        <CardTitle>Spending Insights</CardTitle>
                    </div>
                    <span className="text-xs text-gray-500">{insights.length} insights</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {insights.map((insight, index) => {
                        const Icon = insight.icon;
                        return (
                            <div
                                key={index}
                                className={`p-3 rounded-lg border ${insight.bgColor} border-opacity-50`}
                            >
                                <div className="flex items-start space-x-3">
                                    <Icon size={18} className={insight.color} />
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-medium text-sm ${insight.color}`}>
                                            {insight.title}
                                        </h4>
                                        <p className="text-sm text-gray-700 mt-0.5">
                                            {insight.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
