import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, Upload, Trash2, Info } from 'lucide-react';
import { useTransactionStore } from '../store/transactionStore';
import { downloadCSV } from '../lib/utils';
import { importTransactionsFromCsvText } from '../lib/csvImport';
import { getAccounts, bulkAddTransactions } from '../lib/database';
import { exportLegacyDatabase } from '../lib/legacyExport';
import { importLegacyBackupJsonFile } from '../lib/legacyImport';
import { previewLegacyBackupJsonFile } from '../lib/legacyPreview';
import { getCurrentUserId } from '../lib/currentUser';
import { ThemePreference } from '../components/settings/ThemePreference';
import { getSecuritySettings, updateSecuritySettings } from '../lib/securitySettings';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { CategoryManager } from '../components/categories/CategoryManager';
import { BudgetManager } from '../components/budgets/BudgetManager';
import { ReminderManager } from '../components/reminders/ReminderManager';
import { RecurringManager } from '../components/recurring/RecurringManager';
import { CurrencyConverter } from '../components/tools/CurrencyConverter';
import { DataBackup } from '../components/settings/DataBackup';
import { useEffect, useState } from 'react';

export const Settings = () => {
  const { transactions, init: initStore } = useTransactionStore();
  const [confirmClear, setConfirmClear] = useState(false);
  const [hasLegacyDb, setHasLegacyDb] = useState(false);
  const [confirmDeleteLegacy, setConfirmDeleteLegacy] = useState(false);
  const [legacyExporting, setLegacyExporting] = useState(false);
  const [legacyExportError, setLegacyExportError] = useState(null);
  const [legacyImporting, setLegacyImporting] = useState(false);
  const [legacyImportError, setLegacyImportError] = useState(null);
  const [legacyImportSuccess, setLegacyImportSuccess] = useState(null);
  const [legacyImportFile, setLegacyImportFile] = useState(null);
  const [legacyPreview, setLegacyPreview] = useState(null);
  const [legacyImportAcknowledge, setLegacyImportAcknowledge] = useState(false);

  const [csvImporting, setCsvImporting] = useState(false);
  const [csvImportError, setCsvImportError] = useState(null);
  const [csvImportSuccess, setCsvImportSuccess] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const checkLegacy = async () => {
      try {
        if (indexedDB.databases) {
          const dbs = await indexedDB.databases();
          const found = (dbs || []).some((d) => d?.name === 'MaldivesExpenseTracker');
          if (!cancelled) setHasLegacyDb(found);
          return;
        }
      } catch {
        // ignore and fall back
      }

      // Fallback: attempt to open the DB; if it upgrades/opens, consider it present.
      // This is best-effort; some browsers may not allow reliable detection.
      try {
        const req = indexedDB.open('MaldivesExpenseTracker');
        req.onsuccess = () => {
          try { req.result.close(); } catch { /* ignore */ }
          if (!cancelled) setHasLegacyDb(true);
        };
        req.onerror = () => {
          if (!cancelled) setHasLegacyDb(false);
        };
      } catch {
        if (!cancelled) setHasLegacyDb(false);
      }
    };

    checkLegacy();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleExportData = () => {
    downloadCSV(transactions);
  };

  const handleClearData = () => {
    setConfirmClear(true);
  };

  const clearAllData = () => {
    // Delete both the current and legacy DB names.
    indexedDB.deleteDatabase('Kharadhu');
    indexedDB.deleteDatabase('MaldivesExpenseTracker');
    window.location.reload();
  };

  const deleteLegacyData = () => {
    indexedDB.deleteDatabase('MaldivesExpenseTracker');
    setHasLegacyDb(false);
  };

  return (
    <div className="space-y-3 pb-4">
      <ConfirmDialog
        isOpen={confirmDeleteLegacy}
        onClose={() => setConfirmDeleteLegacy(false)}
        title="Delete legacy data?"
        message="A legacy database named 'MaldivesExpenseTracker' was detected. It is not migrated to the new Kharadhu database. Delete it to free space."
        confirmText="Delete legacy data"
        destructive
        requireText="DELETE"
        requireTextLabel="Type"
        requireAcknowledge
        acknowledgeLabel="I understand this will permanently remove the legacy database."
        onConfirm={() => {
          setConfirmDeleteLegacy(false);
          deleteLegacyData();
        }}
      />

      <ConfirmDialog
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear all data?"
        message="Are you sure you want to clear all data? This action cannot be undone."
        confirmText="Clear"
        destructive
        requireText="DELETE"
        requireTextLabel="Type"
        requireAcknowledge
        acknowledgeLabel="I understand this cannot be undone."
        onConfirm={() => {
          setConfirmClear(false);
          clearAllData();
        }}
      />
      {hasLegacyDb ? (
        <Card className="bg-red-950/20 border border-red-200/40">
          <CardHeader>
            <CardTitle className="text-gray-900">Legacy data detected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-3">
              We found an older local database named <span className="font-semibold">MaldivesExpenseTracker</span>. Your app now uses <span className="font-semibold">Kharadhu</span> and does not migrate old data.
            </p>
            {legacyExportError ? (
              <p className="text-sm text-red-400 mb-2">{legacyExportError}</p>
            ) : null}
            {legacyExportError ? (
              <p className="text-sm text-red-400 mb-2">{legacyExportError}</p>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  setLegacyExportError(null);
                  setLegacyExporting(true);
                  try {
                    await exportLegacyDatabase();
                  } catch (e) {
                    setLegacyExportError(e?.message || 'Failed to export legacy data');
                  } finally {
                    setLegacyExporting(false);
                  }
                }}
                disabled={legacyExporting}
              >
                {legacyExporting ? 'Exporting…' : 'Export legacy data'}
              </Button>

              <Button variant="danger" onClick={() => setConfirmDeleteLegacy(true)}>
                Delete legacy data
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-700">App Configuration</p>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-base text-gray-800">Require PIN on account switch</label>
              <input
                type="checkbox"
                defaultChecked={getSecuritySettings().requirePinOnSwitch}
                onChange={(e) => updateSecuritySettings({ requirePinOnSwitch: e.target.checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-base text-gray-800">Auto sign-out after inactivity</label>
              <select
                className="bg-white border border-gray-300 rounded-lg text-gray-900 px-3 py-2"
                defaultValue={getSecuritySettings().idleTimeoutMinutes}
                onChange={(e) => updateSecuritySettings({ idleTimeoutMinutes: Number(e.target.value) })}
              >
                <option value={0}>Disabled</option>
                <option value={1}>1 minute</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Management */}
      <CategoryManager />

      {/* Budget Tracking */}
      <BudgetManager />

      {/* Bill Reminders */}
      <ReminderManager />

      {/* Recurring Transactions */}
      <RecurringManager />

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle>App Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-base text-gray-800">Version</span>
              <span className="text-base font-semibold text-gray-900">1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-base text-gray-800">Total Transactions</span>
              <span className="text-base font-semibold text-gray-900">{transactions.length}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-base text-gray-800">Data Storage</span>
              <span className="text-base font-semibold text-gray-900">Local (IndexedDB)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Preference */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Preference</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemePreference />
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={handleExportData}
              className="w-full flex items-center justify-center space-x-2"
            >
              <Download size={18} />
              <span>Export Data (CSV)</span>
            </Button>

            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Import CSV</CardTitle>
              </CardHeader>
              <CardContent>
                {csvImportError ? <p className="text-sm text-red-900 mb-2">{csvImportError}</p> : null}
                {csvImportSuccess ? <p className="text-sm text-emerald-500 mb-2">{csvImportSuccess}</p> : null}

                <input
                  type="file"
                  accept="text/csv,.csv"
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-800 file:text-gray-900 hover:file:bg-gray-700"
                  onChange={async (e) => {
                    setCsvImportError(null);
                    setCsvImportSuccess(null);
                    const file = e.target.files?.[0];
                    if (!file) return;

                    try {
                      setCsvImporting(true);
                      const userId = Number(getCurrentUserId());
                      if (!userId) throw new Error('Not signed in');

                      const accounts = await getAccounts(userId);
                      const defaultAccount = accounts.find((a) => a.isPrimary) || accounts[0];
                      if (!defaultAccount) throw new Error('Create an account first before importing CSV');

                      const text = await file.text();
                      const txs = importTransactionsFromCsvText({ csvText: text, defaultAccount });
                      const res = await bulkAddTransactions(userId, txs);
                      setCsvImportSuccess(`Imported ${res.imported} transactions from CSV.`);
                      await initStore();
                    } catch (err) {
                      setCsvImportError(err?.message || 'CSV import failed');
                    } finally {
                      setCsvImporting(false);
                    }
                  }}
                  disabled={csvImporting}
                />

                <p className="text-xs text-gray-700 mt-2">
                  Use the exported CSV format from Kharadhu (Date, Type, Amount, Category, Merchant, Bank, Account, Balance, Description).
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Import legacy backup</CardTitle>
              </CardHeader>
              <CardContent>
                {legacyImportError ? (
                  <p className="text-sm text-red-400 mb-2">{legacyImportError}</p>
                ) : null}
                {legacyImportSuccess ? (
                  <p className="text-sm text-green-300 mb-2">{legacyImportSuccess}</p>
                ) : null}

                <div className="space-y-2">
                  <label className="text-sm text-gray-800">Backup file (JSON)</label>
                  <input
                    type="file"
                    accept="application/json,.json"
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-800 file:text-gray-900 hover:file:bg-gray-700"
                    onChange={async (e) => {
                      setLegacyImportSuccess(null);
                      setLegacyImportError(null);
                      setLegacyPreview(null);
                      setLegacyImportAcknowledge(false);
                      const file = e.target.files?.[0] || null;
                      setLegacyImportFile(file);
                      if (!file) return;
                      try {
                        const preview = await previewLegacyBackupJsonFile(file);
                        setLegacyPreview(preview);
                      } catch (err) {
                        setLegacyImportError(err?.message || 'Invalid backup file');
                      }
                    }}
                  />

                  {legacyPreview ? (
                    <div className="text-sm text-gray-800 bg-white border border-gray-200 rounded-lg p-3">
                      <div className="font-semibold text-gray-900 mb-1">Preview</div>
                      <div className="text-xs text-gray-700">
                        {legacyPreview.dbName ? `DB: ${legacyPreview.dbName} • ` : ''}
                        {legacyPreview.version ? `Version: ${legacyPreview.version} • ` : ''}
                        {legacyPreview.exportedAt ? `Exported: ${legacyPreview.exportedAt}` : ''}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div>Transactions: <span className="font-semibold">{legacyPreview.counts.transactions}</span></div>
                        <div>Categories: <span className="font-semibold">{legacyPreview.counts.categories}</span></div>
                        <div>Accounts: <span className="font-semibold">{legacyPreview.counts.accounts}</span></div>
                        <div>Users: <span className="font-semibold">{legacyPreview.counts.users}</span></div>
                      </div>
                    </div>
                  ) : null}

                  <label className="flex items-center gap-2 text-sm text-gray-800">
                    <input
                      type="checkbox"
                      checked={legacyImportAcknowledge}
                      onChange={(e) => setLegacyImportAcknowledge(e.target.checked)}
                      className="h-4 w-4"
                    />
                    I understand this will merge into my current account.
                  </label>

                  <Button
                    className="w-full"
                    variant="primary"
                    onClick={async () => {
                      setLegacyImportError(null);
                      setLegacyImportSuccess(null);
                      setLegacyImporting(true);
                      try {
                        const userId = Number(getCurrentUserId());
                        const res = await importLegacyBackupJsonFile({ file: legacyImportFile, userId });
                        setLegacyImportSuccess(
                          `Imported: ${res.imported.transactions} transactions, ${res.imported.categories} categories, ${res.imported.accounts} accounts.`
                        );
                        await initStore();
                      } catch (e) {
                        setLegacyImportError(e?.message || 'Failed to import legacy backup');
                      } finally {
                        setLegacyImporting(false);
                      }
                    }}
                    disabled={legacyImporting || !legacyImportFile || !legacyPreview || !legacyImportAcknowledge}
                  >
                    {legacyImporting ? 'Importing…' : 'Import backup'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="danger"
              onClick={handleClearData}
              className="w-full flex items-center justify-center space-x-2"
            >
              <Trash2 size={18} />
              <span>Clear All Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="bg-gradient-to-br from-red-50/30 to-red-100/20 border-red-200/50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Info size={20} className="text-red-900" />
            <CardTitle className="text-gray-900">About This App</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-base text-gray-700 space-y-2">
            <p>
              <strong className="text-gray-900">Kharadhu</strong> is a personal finance management tool designed specifically for BML and MIB customers in the Maldives.
            </p>
            <p className="text-gray-900">
              <strong>Features:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-gray-800">
              <li>SMS transaction parsing (BML & MIB)</li>
              <li>Automatic categorization</li>
              <li>Visual reports and analytics</li>
              <li>Local data storage (privacy-first)</li>
              <li>Export to CSV</li>
            </ul>
            <p className="mt-4 text-sm text-gray-700">
              All your financial data is stored locally on your device. No data is sent to external servers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Currency Converter */}
      <CurrencyConverter />

      {/* Data Backup */}
      <DataBackup />

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Support & Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-gray-800 mb-4">
            Have questions or suggestions? We'd love to hear from you!
          </p>
          <div className="space-y-2 text-base">
            <p className="text-gray-700"><strong className="text-gray-900">Email:</strong> support@expensetracker.mv</p>
            <p className="text-gray-700"><strong className="text-gray-900">Version:</strong> 1.0.0 (2026)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
