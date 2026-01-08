import { useState } from 'react';
import {
    ALL_CURRENCIES,
    CURRENCY_SYMBOLS,
    COMMON_CURRENCIES,
    convertToMVR,
    formatWithCurrency
} from '../../lib/currency';

/**
 * CurrencyInput - Amount input with currency selection
 */
export const CurrencyInput = ({
    value,
    currency = 'MVR',
    onChange,
    onCurrencyChange,
    label = 'Amount',
    showConversion = true,
    className = ''
}) => {
    const [showAllCurrencies, setShowAllCurrencies] = useState(false);

    const mvrAmount = currency !== 'MVR' ? convertToMVR(parseFloat(value) || 0, currency) : parseFloat(value) || 0;

    const currenciesToShow = showAllCurrencies ? ALL_CURRENCIES : COMMON_CURRENCIES;

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div className="flex space-x-2">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        {CURRENCY_SYMBOLS[currency]}
                    </span>
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>
                <div className="relative">
                    <select
                        value={currency}
                        onChange={(e) => onCurrencyChange(e.target.value)}
                        className="appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    >
                        {currenciesToShow.map(cur => (
                            <option key={cur} value={cur}>{cur}</option>
                        ))}
                    </select>
                    {!showAllCurrencies && (
                        <button
                            type="button"
                            onClick={() => setShowAllCurrencies(true)}
                            className="absolute right-0 top-full mt-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                            More currencies
                        </button>
                    )}
                </div>
            </div>

            {/* Show MVR conversion */}
            {showConversion && currency !== 'MVR' && value && (
                <p className="mt-1 text-xs text-gray-500">
                    ≈ {formatWithCurrency(mvrAmount, 'MVR')} MVR
                </p>
            )}
        </div>
    );
};

/**
 * CurrencySelector - Dropdown for selecting currency
 */
export const CurrencySelector = ({
    value,
    onChange,
    showCommonOnly = false,
    className = ''
}) => {
    const currencies = showCommonOnly ? COMMON_CURRENCIES : ALL_CURRENCIES;

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${className}`}
        >
            {currencies.map(cur => (
                <option key={cur} value={cur}>
                    {CURRENCY_SYMBOLS[cur]} {cur}
                </option>
            ))}
        </select>
    );
};

/**
 * CurrencyBadge - Display amount with currency badge
 */
export const CurrencyBadge = ({ amount, currency = 'MVR', className = '' }) => {
    const formatted = formatWithCurrency(amount, currency);

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-sm font-medium ${className}`}>
            {formatted}
        </span>
    );
};
