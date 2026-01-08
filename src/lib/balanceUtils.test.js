import { describe, it, expect } from 'vitest';
import {
    calculateTotalBalance,
    addRunningBalances,
    calculateAccountBalance,
    calculateBalanceStats,
    groupTransactionsByAccount,
} from './balanceUtils';

describe('Balance Utilities', () => {
    describe('calculateTotalBalance', () => {
        it('should calculate balance from starting balance and transactions', () => {
            const transactions = [
                { type: 'credit', amount: 1000 },
                { type: 'debit', amount: 300 },
            ];

            const result = calculateTotalBalance(5000, transactions);
            expect(result).toBe(5700); // 5000 + 1000 - 300
        });

        it('should handle null starting balance', () => {
            const transactions = [
                { type: 'credit', amount: 500 },
            ];

            expect(calculateTotalBalance(null, transactions)).toBe(500);
        });

        it('should handle empty transactions', () => {
            expect(calculateTotalBalance(1000, [])).toBe(1000);
        });
    });

    describe('addRunningBalances', () => {
        it('should add running balances to transactions', () => {
            const transactions = [
                { date: '2026-01-02', type: 'credit', amount: 500 },
                { date: '2026-01-01', type: 'debit', amount: 100 },
            ];

            const result = addRunningBalances(transactions, 1000);

            // Sorted oldest first for calculation, then reversed for display
            // Jan 1: 1000 - 100 = 900
            // Jan 2: 900 + 500 = 1400
            expect(result[0].balanceAfter).toBe(1400); // Newest first in result
            expect(result[1].balanceAfter).toBe(900);
        });

        it('should return empty array for no transactions', () => {
            expect(addRunningBalances([], 1000)).toEqual([]);
            expect(addRunningBalances(null, 1000)).toEqual([]);
        });
    });

    describe('calculateAccountBalance', () => {
        it('should calculate balance for specific account', () => {
            const account = { id: 1, startingBalance: 1000 };
            const transactions = [
                { accountId: 1, type: 'credit', amount: 500 },
                { accountId: 1, type: 'debit', amount: 200 },
                { accountId: 2, type: 'credit', amount: 1000 }, // Different account
            ];

            const result = calculateAccountBalance(account, transactions);
            expect(result).toBe(1300); // 1000 + 500 - 200
        });

        it('should return 0 for null account', () => {
            expect(calculateAccountBalance(null, [])).toBe(0);
        });
    });

    describe('groupTransactionsByAccount', () => {
        it('should group transactions by account ID', () => {
            const transactions = [
                { accountId: 1, amount: 100 },
                { accountId: 1, amount: 200 },
                { accountId: 2, amount: 50 },
                { amount: 25 }, // No account ID
            ];

            const result = groupTransactionsByAccount(transactions);

            expect(result[1]).toHaveLength(2);
            expect(result[2]).toHaveLength(1);
            expect(result['unassigned']).toHaveLength(1);
        });
    });

    describe('calculateBalanceStats', () => {
        it('should calculate statistics from balance history', () => {
            const history = [
                { balance: 1000 },
                { balance: 1200 },
                { balance: 1100 },
                { balance: 1500 },
            ];

            const result = calculateBalanceStats(history);

            expect(result.min).toBe(1000);
            expect(result.max).toBe(1500);
            expect(result.average).toBe(1200);
            expect(result.trend).toBe(50); // (1500 - 1000) / 1000 * 100
        });

        it('should return zeros for empty history', () => {
            const result = calculateBalanceStats([]);
            expect(result.min).toBe(0);
            expect(result.max).toBe(0);
            expect(result.average).toBe(0);
        });
    });
});
