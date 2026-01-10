/**
 * Admin Dashboard
 * View all users, their statistics, and analytics
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useFirebaseAuthStore } from '../store/firebaseAuthStore';
import { getAllUsersWithStats, getTransactions } from '../lib/firestore';
import { formatCurrency } from '../lib/utils';
import {
    Users,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Crown,
    RefreshCw,
    Shield
} from 'lucide-react';

export const Admin = () => {
    const { isAdmin, user, getDisplayName } = useFirebaseAuthStore();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserTransactions, setSelectedUserTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            loadUsers();
        }
    }, [isAdmin]);

    const loadUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const usersData = await getAllUsersWithStats();
            setUsers(usersData);
        } catch (err) {
            setError('Failed to load users: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadUserTransactions = async (userId) => {
        setLoadingTransactions(true);
        try {
            const transactions = await getTransactions(userId);
            setSelectedUserTransactions(transactions);
        } catch (err) {
            console.error('Failed to load transactions:', err);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const handleUserClick = (userItem) => {
        setSelectedUser(userItem);
        loadUserTransactions(userItem.id);
    };

    // If not admin, show access denied
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0F172A' }}>
                <Card className="max-w-md w-full mx-4">
                    <CardContent className="text-center py-8">
                        <Shield size={48} className="mx-auto text-red-400 mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                        <p className="text-slate-400">You don't have permission to access the admin dashboard.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Calculate aggregate stats
    const totalUsers = users.length;
    const totalIncome = users.reduce((sum, u) => sum + (u.totalIncome || 0), 0);
    const totalExpense = users.reduce((sum, u) => sum + (u.totalExpense || 0), 0);
    const totalTransactions = users.reduce((sum, u) => sum + (u.totalTransactions || 0), 0);

    // Top users by income
    const topIncomeUsers = [...users]
        .sort((a, b) => (b.totalIncome || 0) - (a.totalIncome || 0))
        .slice(0, 5);

    // Top users by transactions
    const topActiveUsers = [...users]
        .sort((a, b) => (b.totalTransactions || 0) - (a.totalTransactions || 0))
        .slice(0, 5);

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: '#0F172A' }}>
            <div className="px-4 pt-20 pb-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Crown className="text-yellow-400" />
                            Admin Dashboard
                        </h1>
                        <p className="text-slate-400">Welcome, {getDisplayName()}</p>
                    </div>
                    <Button variant="secondary" onClick={loadUsers} disabled={loading}>
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </Button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-red-400 mb-4">
                        {error}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <Card className="bg-gradient-to-br from-blue-600 to-blue-700">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-200 text-sm">Total Users</p>
                                    <p className="text-2xl font-bold text-white">{totalUsers}</p>
                                </div>
                                <Users className="text-blue-200" size={32} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-600 to-green-700">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-200 text-sm">Total Income</p>
                                    <p className="text-xl font-bold text-white">{formatCurrency(totalIncome)}</p>
                                </div>
                                <TrendingUp className="text-green-200" size={32} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-600 to-red-700">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-200 text-sm">Total Expenses</p>
                                    <p className="text-xl font-bold text-white">{formatCurrency(totalExpense)}</p>
                                </div>
                                <TrendingDown className="text-red-200" size={32} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-600 to-purple-700">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-200 text-sm">Transactions</p>
                                    <p className="text-2xl font-bold text-white">{totalTransactions}</p>
                                </div>
                                <Activity className="text-purple-200" size={32} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Income Users */}
                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ArrowUpRight className="text-green-400" size={20} />
                            Top Income Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topIncomeUsers.length === 0 ? (
                            <p className="text-slate-400 text-center py-4">No users yet</p>
                        ) : (
                            <div className="space-y-2">
                                {topIncomeUsers.map((u, index) => (
                                    <div
                                        key={u.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 cursor-pointer hover:bg-slate-700"
                                        onClick={() => handleUserClick(u)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-slate-400">#{index + 1}</span>
                                            <div>
                                                <p className="text-white font-medium">{u.displayName || u.email}</p>
                                                <p className="text-xs text-slate-400">{u.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-green-400 font-bold">{formatCurrency(u.totalIncome || 0)}</p>
                                            <p className="text-xs text-slate-400">{u.totalTransactions} txns</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* All Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="text-blue-400" size={20} />
                            All Users ({users.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">
                                <RefreshCw className="animate-spin mx-auto text-blue-400" size={32} />
                                <p className="text-slate-400 mt-2">Loading users...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">No users found</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left py-3 px-2 text-slate-400 font-medium">User</th>
                                            <th className="text-right py-3 px-2 text-slate-400 font-medium">Income</th>
                                            <th className="text-right py-3 px-2 text-slate-400 font-medium">Expense</th>
                                            <th className="text-right py-3 px-2 text-slate-400 font-medium">Balance</th>
                                            <th className="text-right py-3 px-2 text-slate-400 font-medium">Txns</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr
                                                key={u.id}
                                                className="border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer"
                                                onClick={() => handleUserClick(u)}
                                            >
                                                <td className="py-3 px-2">
                                                    <div>
                                                        <p className="text-white font-medium">{u.displayName || 'N/A'}</p>
                                                        <p className="text-xs text-slate-400">{u.email}</p>
                                                    </div>
                                                </td>
                                                <td className="text-right py-3 px-2 text-green-400">
                                                    {formatCurrency(u.totalIncome || 0)}
                                                </td>
                                                <td className="text-right py-3 px-2 text-red-400">
                                                    {formatCurrency(u.totalExpense || 0)}
                                                </td>
                                                <td className={`text-right py-3 px-2 font-bold ${(u.balance || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                    {formatCurrency(u.balance || 0)}
                                                </td>
                                                <td className="text-right py-3 px-2 text-slate-300">
                                                    {u.totalTransactions || 0}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* User Detail Modal */}
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                        <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{selectedUser.displayName || selectedUser.email}</CardTitle>
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="text-slate-400 hover:text-white"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 overflow-y-auto max-h-[60vh]">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-slate-700/50 rounded-lg">
                                        <p className="text-xs text-slate-400">Income</p>
                                        <p className="text-lg font-bold text-green-400">{formatCurrency(selectedUser.totalIncome || 0)}</p>
                                    </div>
                                    <div className="p-3 bg-slate-700/50 rounded-lg">
                                        <p className="text-xs text-slate-400">Expenses</p>
                                        <p className="text-lg font-bold text-red-400">{formatCurrency(selectedUser.totalExpense || 0)}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-400 mb-2">Recent Transactions</p>
                                    {loadingTransactions ? (
                                        <p className="text-slate-400 text-center py-4">Loading...</p>
                                    ) : selectedUserTransactions.length === 0 ? (
                                        <p className="text-slate-400 text-center py-4">No transactions</p>
                                    ) : (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {selectedUserTransactions.slice(0, 10).map((tx) => (
                                                <div key={tx.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                                                    <div>
                                                        <p className="text-sm text-white">{tx.merchant || tx.category}</p>
                                                        <p className="text-xs text-slate-400">
                                                            {tx.date ? new Date(tx.date).toLocaleDateString() : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <p className={`font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                                                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount || 0)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Button variant="secondary" className="w-full" onClick={() => setSelectedUser(null)}>
                                    Close
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};
