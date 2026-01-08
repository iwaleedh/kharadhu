import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Globe, RefreshCw } from 'lucide-react';
import {
    ALL_CURRENCIES,
    CURRENCY_SYMBOLS,
    formatWithCurrency,
    getExchangeRate
} from '../../lib/currency';
import { formatCurrency, getMonthRange, calculateTotalByType } from '../../lib/utils';

/**
 * MultiCurrencyView - Shows spending in different currencies
 */
export const MultiCurrencyView = ({ transactions }) => {
    const [displayCurrency, setDisplayCurrency] = useState('MVR');

    const currencyData = useMemo(() => {
        const thisMonthRange = getMonthRange(0);
        const thisMonthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(thisMonthRange.start) && d <= new Date(thisMonthRange.end);
        });

        const totalIncomeMVR = calculateTotalByType(thisMonthTxns, 'credit');
        const totalExpensesMVR = calculateTotalByType(thisMonthTxns, 'debit');
        const balanceMVR = totalIncomeMVR - totalExpensesMVR;

        // Convert to display currency
        const rate = getExchangeRate('MVR', displayCurrency);

        return {
            income: totalIncomeMVR * rate,
            expenses: totalExpensesMVR * rate,
            balance: balanceMVR * rate,
            incomeMVR: totalIncomeMVR,
            expensesMVR: totalExpensesMVR,
            balanceMVR,
            rate,
        };
    }, [transactions, displayCurrency]);

    const popularCurrencies = ['MVR', 'USD', 'EUR', 'GBP', 'INR', 'AED'];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Globe className="text-blue-500" size={20} />
                        <CardTitle>Multi-Currency View</CardTitle>
                    </div>
                    <select
                        value={displayCurrency}
                        onChange={(e) => setDisplayCurrency(e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-lg bg-white"
                    >
                        {ALL_CURRENCIES.map(cur => (
                            <option key={cur} value={cur}>
                                {CURRENCY_SYMBOLS[cur]} {cur}
                            </option>
                        ))}
                    </select>
                </div>
            </CardHeader>
            <CardContent>
                {/* Main amounts in selected currency */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                        <p className="text-xs text-green-600 mb-1">Income</p>
                        <p className="text-lg font-bold text-green-700">
                            {formatWithCurrency(currencyData.income, displayCurrency)}
                        </p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg text-center">
                        <p className="text-xs text-red-600 mb-1">Expenses</p>
                        <p className="text-lg font-bold text-red-700">
                            {formatWithCurrency(currencyData.expenses, displayCurrency)}
                        </p>
                    </div>
                    <div className={`p-3 rounded-lg text-center ${currencyData.balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'
                        }`}>
                        <p className={`text-xs mb-1 ${currencyData.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                            }`}>Balance</p>
                        <p className={`text-lg font-bold ${currencyData.balance >= 0 ? 'text-blue-700' : 'text-orange-700'
                            }`}>
                            {formatWithCurrency(currencyData.balance, displayCurrency)}
                        </p>
                    </div>
                </div>

                {/* Quick currency switcher */}
                <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">Quick View</p>
                    <div className="flex flex-wrap gap-1">
                        {popularCurrencies.map(cur => (
                            <button
                                key={cur}
                                onClick={() => setDisplayCurrency(cur)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${displayCurrency === cur
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {CURRENCY_SYMBOLS[cur]} {cur}
                            </button>
                        ))}
                    </div>
                </div>

                {/* MVR equivalent */}
                {displayCurrency !== 'MVR' && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">MVR Equivalent</span>
                            <span className="font-medium text-gray-900">
                                {formatCurrency(currencyData.expensesMVR)} spent
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Rate: 1 {displayCurrency} = {(1 / currencyData.rate).toFixed(4)} MVR
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
