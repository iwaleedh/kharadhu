import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Download, Upload, Database, Check, AlertCircle } from 'lucide-react';
import { db } from '../../lib/database';
import { getCurrentUserId } from '../../lib/currentUser';
import { useTransactionStore } from '../../store/transactionStore';

/**
 * DataBackup - Export and import transaction data
 */
export const DataBackup = () => {
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const { loadTransactions, loadCategories } = useTransactionStore();

    const handleExport = async () => {
        setIsExporting(true);
        setStatus({ type: '', message: '' });

        try {
            const userId = getCurrentUserId();

            // Get all user data
            const transactions = await db.transactions.where('userId').equals(Number(userId)).toArray();
            const categories = await db.categories.where('userId').equals(Number(userId)).toArray();
            const budgets = await db.budgets.where('userId').equals(Number(userId)).toArray();

            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                userId,
                data: {
                    transactions,
                    categories,
                    budgets,
                },
                stats: {
                    transactionCount: transactions.length,
                    categoryCount: categories.length,
                }
            };

            // Create and download file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `kharadhu-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setStatus({
                type: 'success',
                message: `Exported ${transactions.length} transactions successfully!`
            });
        } catch (error) {
            console.error('Export failed:', error);
            setStatus({ type: 'error', message: 'Failed to export data' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setStatus({ type: '', message: '' });

        try {
            const text = await file.text();
            const importData = JSON.parse(text);

            if (!importData.version || !importData.data) {
                throw new Error('Invalid backup file format');
            }

            const userId = Number(getCurrentUserId());
            const { transactions: txnsToImport } = importData.data;

            // Import transactions (with new user ID)
            let importedCount = 0;
            for (const txn of txnsToImport) {
                const { id: _id, ...txnData } = txn;
                await db.transactions.add({
                    ...txnData,
                    userId,
                    imported: true,
                    importDate: new Date().toISOString(),
                });
                importedCount++;
            }

            // Reload data
            await loadTransactions(userId);
            await loadCategories(userId);

            setStatus({
                type: 'success',
                message: `Imported ${importedCount} transactions successfully!`
            });
        } catch (error) {
            console.error('Import failed:', error);
            setStatus({ type: 'error', message: 'Failed to import data. Check file format.' });
        } finally {
            setIsImporting(false);
            event.target.value = '';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Database className="text-blue-500" size={20} />
                    <CardTitle>Data Backup</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Export */}
                    <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Export Data</h4>
                        <p className="text-sm text-gray-600 mb-3">
                            Download all your transactions, categories, and budgets as a JSON file.
                        </p>
                        <Button
                            variant="primary"
                            onClick={handleExport}
                            disabled={isExporting}
                            className="w-full"
                        >
                            <Download size={16} className="mr-2" />
                            {isExporting ? 'Exporting...' : 'Export Backup'}
                        </Button>
                    </div>

                    {/* Import */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Import Data</h4>
                        <p className="text-sm text-gray-600 mb-3">
                            Restore from a previously exported backup file.
                        </p>
                        <label className="block">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                disabled={isImporting}
                                className="hidden"
                            />
                            <span className={`flex items-center justify-center w-full px-4 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${isImporting
                                ? 'border-gray-300 bg-gray-100'
                                : 'border-blue-300 hover:border-blue-400 hover:bg-blue-100'
                                }`}>
                                <Upload size={16} className="mr-2 text-blue-500" />
                                {isImporting ? 'Importing...' : 'Select Backup File'}
                            </span>
                        </label>
                    </div>

                    {/* Status message */}
                    {status.message && (
                        <div className={`p-3 rounded-lg flex items-center space-x-2 ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {status.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                            <span className="text-sm">{status.message}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
