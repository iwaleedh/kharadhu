import { describe, it, expect } from 'vitest';
import {
    formatCurrency,
    formatDate,
    calculateTotalByType,
    groupByCategory,
    groupByDate,
    exportToCSV,
    cn,
} from './utils';

describe('Utility Functions', () => {
    describe('formatCurrency', () => {
        it('should format currency with Rf symbol', () => {
            const result = formatCurrency(1000);
            expect(result).toContain('1,000');
            // Maldives locale uses 'Rf' as currency symbol
            expect(result).toMatch(/Rf|MVR/);
        });

        it('should handle decimal amounts', () => {
            const result = formatCurrency(1234.56);
            expect(result).toContain('1,234.56');
        });

        it('should handle zero', () => {
            const result = formatCurrency(0);
            expect(result).toContain('0.00');
        });
    });

    describe('formatDate', () => {
        it('should format date with default format', () => {
            const date = new Date('2026-01-15');
            const result = formatDate(date);
            expect(result).toBe('15 Jan 2026');
        });

        it('should format date with custom format', () => {
            const date = new Date('2026-01-15');
            const result = formatDate(date, 'yyyy-MM-dd');
            expect(result).toBe('2026-01-15');
        });
    });

    describe('calculateTotalByType', () => {
        const transactions = [
            { type: 'credit', amount: 1000 },
            { type: 'credit', amount: 500 },
            { type: 'debit', amount: 200 },
            { type: 'debit', amount: 300 },
        ];

        it('should calculate total credits', () => {
            expect(calculateTotalByType(transactions, 'credit')).toBe(1500);
        });

        it('should calculate total debits', () => {
            expect(calculateTotalByType(transactions, 'debit')).toBe(500);
        });

        it('should return 0 for empty array', () => {
            expect(calculateTotalByType([], 'credit')).toBe(0);
        });
    });

    describe('groupByCategory', () => {
        const transactions = [
            { category: 'Food', amount: 100 },
            { category: 'Food', amount: 200 },
            { category: 'Transport', amount: 50 },
        ];

        it('should group transactions by category', () => {
            const result = groupByCategory(transactions);

            expect(result).toHaveLength(2);
            expect(result[0].category).toBe('Food');
            expect(result[0].total).toBe(300);
            expect(result[0].count).toBe(2);
        });

        it('should sort by total descending', () => {
            const result = groupByCategory(transactions);
            expect(result[0].total).toBeGreaterThan(result[1].total);
        });

        it('should use "Other" for missing category', () => {
            const tx = [{ amount: 100 }];
            const result = groupByCategory(tx);
            expect(result[0].category).toBe('Other');
        });
    });

    describe('groupByDate', () => {
        it('should group transactions by date', () => {
            const transactions = [
                { date: '2026-01-15T10:00:00Z', amount: 100 },
                { date: '2026-01-15T14:00:00Z', amount: 200 },
                { date: '2026-01-16T10:00:00Z', amount: 50 },
            ];

            const result = groupByDate(transactions);
            const keys = Object.keys(result);

            expect(keys.length).toBe(2);
        });
    });

    describe('exportToCSV', () => {
        it('should generate valid CSV with headers', () => {
            const transactions = [
                {
                    date: '2026-01-15T10:00:00Z',
                    type: 'debit',
                    amount: 100,
                    category: 'Food',
                    merchant: 'Restaurant',
                    bank: 'BML',
                    accountNumber: '1234',
                    balance: 5000,
                    description: 'Lunch',
                },
            ];

            const csv = exportToCSV(transactions);
            const lines = csv.split('\n');

            expect(lines[0]).toBe('Date,Type,Amount,Category,Merchant,Bank,Account,Balance,Description');
            expect(lines[1]).toContain('2026-01-15');
            expect(lines[1]).toContain('debit');
            expect(lines[1]).toContain('100');
        });
    });

    describe('cn (classNames utility)', () => {
        it('should join class names', () => {
            expect(cn('a', 'b', 'c')).toBe('a b c');
        });

        it('should filter falsy values', () => {
            expect(cn('a', null, 'b', undefined, 'c', false)).toBe('a b c');
        });

        it('should handle conditional classes', () => {
            const isActive = true;
            expect(cn('base', isActive && 'active')).toBe('base active');
        });
    });
});
