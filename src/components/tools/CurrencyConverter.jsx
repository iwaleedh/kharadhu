import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { ArrowRightLeft, DollarSign } from 'lucide-react';

// Common currency exchange rates (approximate, would need API for real rates)
const EXCHANGE_RATES = {
    MVR: 1,
    USD: 0.065, // 1 MVR = 0.065 USD
    EUR: 0.060,
    GBP: 0.051,
    AED: 0.238,
    INR: 5.40,
    LKR: 19.5,
    SGD: 0.087,
    MYR: 0.305,
};

const CURRENCY_NAMES = {
    MVR: 'Maldivian Rufiyaa',
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    AED: 'UAE Dirham',
    INR: 'Indian Rupee',
    LKR: 'Sri Lankan Rupee',
    SGD: 'Singapore Dollar',
    MYR: 'Malaysian Ringgit',
};

/**
 * CurrencyConverter - Convert between currencies
 */
export const CurrencyConverter = () => {
    const [amount, setAmount] = useState('1000');
    const [fromCurrency, setFromCurrency] = useState('MVR');
    const [toCurrency, setToCurrency] = useState('USD');

    const convertedAmount = useMemo(() => {
        const value = parseFloat(amount) || 0;
        const fromRate = EXCHANGE_RATES[fromCurrency];
        const toRate = EXCHANGE_RATES[toCurrency];

        // Convert to MVR first, then to target currency
        const inMVR = fromCurrency === 'MVR' ? value : value / fromRate;
        const result = toCurrency === 'MVR' ? inMVR : inMVR * toRate;

        return result;
    }, [amount, fromCurrency, toCurrency]);

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <DollarSign className="text-green-500" size={20} />
                    <CardTitle>Currency Converter</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* From Currency */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">From</label>
                        <div className="flex space-x-2">
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="flex-1"
                            />
                            <select
                                value={fromCurrency}
                                onChange={(e) => setFromCurrency(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                            >
                                {Object.keys(EXCHANGE_RATES).map(cur => (
                                    <option key={cur} value={cur}>{cur}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Swap button */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleSwap}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowRightLeft size={20} className="text-gray-600" />
                        </button>
                    </div>

                    {/* To Currency */}
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">To</label>
                        <div className="flex space-x-2">
                            <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                                <p className="text-xl font-bold text-gray-900">
                                    {convertedAmount.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </p>
                                <p className="text-xs text-gray-500">{CURRENCY_NAMES[toCurrency]}</p>
                            </div>
                            <select
                                value={toCurrency}
                                onChange={(e) => setToCurrency(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                            >
                                {Object.keys(EXCHANGE_RATES).map(cur => (
                                    <option key={cur} value={cur}>{cur}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Exchange rate info */}
                    <p className="text-xs text-center text-gray-400">
                        1 {fromCurrency} = {(EXCHANGE_RATES[toCurrency] / EXCHANGE_RATES[fromCurrency]).toFixed(4)} {toCurrency}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
