import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Heart, TrendingUp, TrendingDown, Shield, AlertTriangle } from 'lucide-react';
import { getMonthRange, calculateTotalByType } from '../../lib/utils';

/**
 * FinancialHealthScore - Overall financial health indicator
 */
export const FinancialHealthScore = ({ transactions, categories }) => {
    const healthData = useMemo(() => {
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

        const thisMonthIncome = calculateTotalByType(thisMonthTxns, 'credit');
        const thisMonthExpenses = calculateTotalByType(thisMonthTxns, 'debit');
        const lastMonthExpenses = calculateTotalByType(lastMonthTxns, 'debit');

        // Calculate individual scores (0-100)
        const scores = [];

        // 1. Savings Rate Score (40% weight)
        const savingsRate = thisMonthIncome > 0
            ? ((thisMonthIncome - thisMonthExpenses) / thisMonthIncome) * 100
            : 0;
        const savingsScore = Math.min(100, Math.max(0, savingsRate * 3.33)); // 30% = 100
        scores.push({ name: 'Savings Rate', score: savingsScore, weight: 0.4 });

        // 2. Budget Adherence Score (30% weight)
        const budgetedCategories = categories.filter(c => c.type === 'expense' && c.budget > 0);
        let budgetScore = 100;
        if (budgetedCategories.length > 0) {
            const underBudget = budgetedCategories.filter(c => {
                const spent = thisMonthTxns
                    .filter(t => t.category === c.name && t.type === 'debit')
                    .reduce((sum, t) => sum + t.amount, 0);
                return spent <= c.budget;
            }).length;
            budgetScore = (underBudget / budgetedCategories.length) * 100;
        }
        scores.push({ name: 'Budget Control', score: budgetScore, weight: 0.3 });

        // 3. Spending Trend Score (30% weight)
        let trendScore = 50;
        if (lastMonthExpenses > 0) {
            const change = ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
            if (change <= -10) trendScore = 100;      // Significantly reduced
            else if (change <= 0) trendScore = 80;    // Reduced
            else if (change <= 10) trendScore = 60;   // Slight increase
            else if (change <= 20) trendScore = 40;   // Moderate increase
            else trendScore = 20;                     // High increase
        }
        scores.push({ name: 'Spending Trend', score: trendScore, weight: 0.3 });

        // Calculate weighted overall score
        const overallScore = Math.round(
            scores.reduce((sum, s) => sum + s.score * s.weight, 0)
        );

        // Determine health status
        let status, color, statusIcon;
        if (overallScore >= 80) {
            status = 'Excellent';
            color = 'text-green-500';
            statusIcon = Shield;
        } else if (overallScore >= 60) {
            status = 'Good';
            color = 'text-blue-500';
            statusIcon = TrendingUp;
        } else if (overallScore >= 40) {
            status = 'Fair';
            color = 'text-yellow-500';
            statusIcon = TrendingDown;
        } else {
            status = 'Needs Attention';
            color = 'text-red-500';
            statusIcon = AlertTriangle;
        }

        return { overallScore, scores, status, color, statusIcon, savingsRate };
    }, [transactions, categories]);

    const StatusIcon = healthData.statusIcon;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Heart className="text-red-500" size={20} />
                    <CardTitle>Financial Health</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {/* Main Score */}
                <div className="text-center mb-4">
                    <div className="relative inline-flex items-center justify-center">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="#e5e7eb"
                                strokeWidth="12"
                                fill="none"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke={healthData.overallScore >= 80 ? '#22c55e' :
                                    healthData.overallScore >= 60 ? '#3b82f6' :
                                        healthData.overallScore >= 40 ? '#eab308' : '#ef4444'}
                                strokeWidth="12"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${(healthData.overallScore / 100) * 352} 352`}
                                className="transition-all duration-1000"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-3xl font-bold ${healthData.color}`}>
                                {healthData.overallScore}
                            </span>
                            <span className="text-xs text-gray-500">out of 100</span>
                        </div>
                    </div>

                    <div className={`flex items-center justify-center space-x-1 mt-2 ${healthData.color}`}>
                        <StatusIcon size={16} />
                        <span className="font-medium">{healthData.status}</span>
                    </div>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-3">
                    {healthData.scores.map((item) => (
                        <div key={item.name}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">{item.name}</span>
                                <span className="font-medium">{Math.round(item.score)}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${item.score >= 80 ? 'bg-green-500' :
                                        item.score >= 60 ? 'bg-blue-500' :
                                            item.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${item.score}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick tip */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                        {healthData.savingsRate >= 20
                            ? `💰 Great! You're saving ${healthData.savingsRate.toFixed(0)}% of income.`
                            : healthData.savingsRate >= 0
                                ? `💡 Try to save at least 20% of your income for better financial health.`
                                : `⚠️ You're spending more than you earn. Review your expenses.`
                        }
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
