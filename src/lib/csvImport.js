// CSV Import utilities for Kharadhu

// Minimal CSV parser for our exported CSV (comma-separated, no quoted commas support)
const parseCsv = (text) => {
  const lines = (text || '').split(/\r?\n/).filter((l) => l.trim().length);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = lines.slice(1).map((line) => line.split(',').map((c) => c.trim()));
  return { headers, rows };
};

const normalizeType = (v) => {
  const t = String(v || '').toLowerCase();
  if (t === 'income' || t === 'credit') return 'credit';
  if (t === 'expense' || t === 'debit') return 'debit';
  return t || 'debit';
};

const parseDateToIso = (v) => {
  const s = String(v || '').trim();
  if (!s) return new Date().toISOString();
  // Accept yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(`${s}T12:00:00`).toISOString();
  // fallback
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export const importTransactionsFromCsvText = ({ csvText, defaultAccount }) => {
  const { headers, rows } = parseCsv(csvText);
  if (!headers.length) throw new Error('Invalid CSV file');

  const idx = (name) => headers.findIndex((h) => h.toLowerCase() === name.toLowerCase());

  const iDate = idx('Date');
  const iType = idx('Type');
  const iAmount = idx('Amount');
  const iCategory = idx('Category');
  const iMerchant = idx('Merchant');
  const iBank = idx('Bank');
  const iAccount = idx('Account');
  const iBalance = idx('Balance');
  const iDescription = idx('Description');

  if (iDate < 0 || iType < 0 || iAmount < 0) {
    throw new Error('CSV missing required columns: Date, Type, Amount');
  }

  return rows
    .map((r) => {
      const amount = Number(r[iAmount] || 0);
      if (!Number.isFinite(amount) || amount === 0) return null;

      return {
        date: parseDateToIso(r[iDate]),
        type: normalizeType(r[iType]),
        amount,
        category: r[iCategory] || 'Other',
        merchant: r[iMerchant] || '',
        bank: r[iBank] || defaultAccount?.bankName || '',
        accountNumber: r[iAccount] || defaultAccount?.accountNumber || '',
        accountId: defaultAccount?.id,
        balance: r[iBalance] ? Number(r[iBalance]) : undefined,
        description: r[iDescription] || 'CSV import',
        source: 'csv',
      };
    })
    .filter(Boolean);
};
