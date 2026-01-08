import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { CreditCard, Banknote, Smartphone, Building, HelpCircle } from 'lucide-react';
import { formatCurrency, getMonthRange } from '../../lib/utils';

// Payment method icons and colors
const PAYMENT_METHODS = {
    'Bank Transfer': { icon: Building, color: 'text-blue-500', bg: 'bg-blue-50' },
    'Cash': { icon: Banknote, color: 'text-green-500', bg: 'bg-green-50' },
    'Card': { icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50' },
    'Mobile Payment': { icon: Smartphone, color: 'text-orange-500', bg: 'bg-orange-50' },
    'BML': { icon: Building, color: 'text-red-500', bg: 'bg-red-50' },
    'MIB': { icon: Building, color: 'text-green-500', bg: 'bg-green-50' },
    'Other': { icon: HelpCircle, color: 'text-gray-500', bg: 'bg-gray-50' },
};

/**
 * PaymentMethods - Analysis of payment methods used
 */
export const PaymentMethods = ({ transactions }) => {
    const methodData = useMemo(() => {
        const thisMonthRange = getMonthRange(0);
        const thisMonthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(thisMonthRange.start) &&
                d <= new Date(thisMonthRange.end) &&
                t.type === 'debit';
        });

        // Group by payment method or account
        const methodMap = {};
        thisMonthTxns.forEach(t => {
            // Try to determine payment method from merchant or description
            let method = 'Other';
            const desc = (t.merchant || t.description || '').toLowerCase();

            if (desc.includes('bml') || desc.includes('bank of maldives')) {
                method = 'BML';
            } else if (desc.includes('mib') || desc.includes('maldives islamic')) {
                method = 'MIB';
            } else if (desc.includes('cash')) {
                method = 'Cash';
            } else if (desc.includes('card') || desc.includes('visa') || desc.includes('master')) {
                method = 'Card';
            } else if (desc.includes('transfer')) {
                method = 'Bank Transfer';
            } else if (desc.includes('mobile') || desc.includes('dhiraagu') || desc.includes('ooredoo')) {
                method = 'Mobile Payment';
            }

            if (!methodMap[method]) {
                methodMap[method] = { count: 0, total: 0 };
            }
            methodMap[method].count++;
            methodMap[method].total += t.amount;
        });

        const total = Object.values(methodMap).reduce((sum, m) => sum + m.total, 0);

        const methods = Object.entries(methodMap)
            .map(([name, data]) => ({
                name,
                ...data,
                percentage: total > 0 ? (data.total / total) * 100 : 0,
                ...(PAYMENT_METHODS[name] || PAYMENT_METHODS['Other']),
            }))
            .sort((a, b) => b.total - a.total);

        return { methods, total };
    }, [transactions]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <CreditCard className="text-purple-500" size={20} />
                    <CardTitle>Payment Methods</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {methodData.methods.length === 0 ? (
                    <p className="text-center text-gray-500 py-4 text-sm">
                        No transactions this month
                    </p>
                ) : (
                    <div className="space-y-3">
                        {methodData.methods.map((method) => {
                            const Icon = method.icon;
                            return (
                                <div key={method.name} className={`p-3 rounded-lg ${method.bg}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <Icon size={18} className={method.color} />
                                            <span className="font-medium text-gray-900">{method.name}</span>
                                        </div>
                                        <span className={`font-bold ${method.color}`}>
                                            {formatCurrency(method.total)}
                                        </span>
                                    </div>

                                    <div className="h-1.5 bg-white/50 rounded-full overflow-hidden mb-1">
                                        <div
                                            className={`h-full rounded-full ${method.color.replace('text-', 'bg-')}`}
                                            style={{ width: `${method.percentage}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>{method.count} transactions</span>
                                        <span>{method.percentage.toFixed(0)}%</span>
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
