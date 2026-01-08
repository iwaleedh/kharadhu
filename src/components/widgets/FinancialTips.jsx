import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Lightbulb, RefreshCw, ChevronRight } from 'lucide-react';

// Financial tips database
const FINANCIAL_TIPS = [
    {
        category: 'Saving',
        tips: [
            'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
            'Set up automatic transfers to savings on payday',
            'Create a separate emergency fund with 3-6 months of expenses',
            'Review subscriptions monthly and cancel unused ones',
        ]
    },
    {
        category: 'Budgeting',
        tips: [
            'Track every expense for at least one month to understand your spending',
            'Use the envelope method: allocate cash to spending categories',
            'Plan your meals weekly to reduce food spending',
            'Wait 24 hours before making non-essential purchases over MVR 500',
        ]
    },
    {
        category: 'Spending',
        tips: [
            'Compare prices before buying - check at least 3 stores',
            'Use a shopping list and stick to it',
            'Consider the cost-per-use of items you buy frequently',
            'Bring lunch from home instead of eating out',
        ]
    },
    {
        category: 'Income',
        tips: [
            'Develop a side skill that can generate extra income',
            'Negotiate your salary - research market rates first',
            'Sell items you no longer need',
            'Consider passive income opportunities',
        ]
    },
    {
        category: 'Debt',
        tips: [
            'Pay off high-interest debt first (avalanche method)',
            'Or pay smallest debts first for motivation (snowball method)',
            'Avoid taking new debt while paying off existing ones',
            'Consider debt consolidation if you have multiple high-interest debts',
        ]
    },
];

/**
 * FinancialTips - Random rotating financial advice
 */
export const FinancialTips = () => {
    const getRandomTip = () => {
        const categoryIndex = Math.floor(Math.random() * FINANCIAL_TIPS.length);
        const category = FINANCIAL_TIPS[categoryIndex];
        const tipIndex = Math.floor(Math.random() * category.tips.length);

        return {
            category: category.category,
            tip: category.tips[tipIndex],
        };
    };

    const [currentTip, setCurrentTip] = useState(() => getRandomTip());
    const [isAnimating, setIsAnimating] = useState(false);

    const handleNewTip = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentTip(getRandomTip());
            setIsAnimating(false);
        }, 300);
    };

    const getCategoryColor = (category) => {
        const colors = {
            Saving: 'bg-green-100 text-green-700',
            Budgeting: 'bg-blue-100 text-blue-700',
            Spending: 'bg-orange-100 text-orange-700',
            Income: 'bg-purple-100 text-purple-700',
            Debt: 'bg-red-100 text-red-700',
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Lightbulb className="text-yellow-500" size={20} />
                        <CardTitle>Financial Tip</CardTitle>
                    </div>
                    <button
                        onClick={handleNewTip}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Get new tip"
                    >
                        <RefreshCw size={16} className="text-gray-500" />
                    </button>
                </div>
            </CardHeader>
            <CardContent>
                <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${getCategoryColor(currentTip.category)}`}>
                        {currentTip.category}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {currentTip.tip}
                    </p>
                </div>

                <button
                    onClick={handleNewTip}
                    className="mt-3 flex items-center text-xs text-orange-600 hover:text-orange-700"
                >
                    Next tip <ChevronRight size={14} />
                </button>
            </CardContent>
        </Card>
    );
};
