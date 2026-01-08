/**
 * Currency utilities for multi-currency support
 */

// Exchange rates (approximate - in production would fetch from API)
export const EXCHANGE_RATES = {
    MVR: 1,
    USD: 15.42,    // 1 USD = 15.42 MVR
    EUR: 16.80,
    GBP: 19.50,
    AED: 4.20,
    INR: 0.185,
    LKR: 0.047,
    SGD: 11.50,
    MYR: 3.45,
    THB: 0.44,
    JPY: 0.103,
    AUD: 10.20,
    CAD: 11.35,
    CHF: 17.80,
};

export const CURRENCY_SYMBOLS = {
    MVR: 'MVR',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'AED',
    INR: '₹',
    LKR: 'Rs',
    SGD: 'S$',
    MYR: 'RM',
    THB: '฿',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
};

export const CURRENCY_NAMES = {
    MVR: 'Maldivian Rufiyaa',
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    AED: 'UAE Dirham',
    INR: 'Indian Rupee',
    LKR: 'Sri Lankan Rupee',
    SGD: 'Singapore Dollar',
    MYR: 'Malaysian Ringgit',
    THB: 'Thai Baht',
    JPY: 'Japanese Yen',
    AUD: 'Australian Dollar',
    CAD: 'Canadian Dollar',
    CHF: 'Swiss Franc',
};

/**
 * Convert amount from one currency to MVR
 */
export const convertToMVR = (amount, fromCurrency) => {
    if (fromCurrency === 'MVR') return amount;
    const rate = EXCHANGE_RATES[fromCurrency] || 1;
    return amount * rate;
};

/**
 * Convert amount from MVR to another currency
 */
export const convertFromMVR = (amountMVR, toCurrency) => {
    if (toCurrency === 'MVR') return amountMVR;
    const rate = EXCHANGE_RATES[toCurrency] || 1;
    return amountMVR / rate;
};

/**
 * Format amount with currency symbol
 */
export const formatWithCurrency = (amount, currency = 'MVR') => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const formatted = amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    // Some currencies have symbol before, some after
    if (['USD', 'EUR', 'GBP', 'SGD', 'AUD', 'CAD'].includes(currency)) {
        return `${symbol}${formatted}`;
    }
    return `${formatted} ${symbol}`;
};

/**
 * Get exchange rate between two currencies
 */
export const getExchangeRate = (from, to) => {
    const fromRate = EXCHANGE_RATES[from] || 1;
    const toRate = EXCHANGE_RATES[to] || 1;
    return fromRate / toRate;
};

/**
 * Common currencies for quick selection
 */
export const COMMON_CURRENCIES = ['MVR', 'USD', 'EUR', 'GBP', 'INR', 'AED'];

/**
 * All available currencies
 */
export const ALL_CURRENCIES = Object.keys(EXCHANGE_RATES);
