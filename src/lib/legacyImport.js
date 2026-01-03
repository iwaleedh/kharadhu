import { db } from './database';

const readFileText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
    reader.readAsText(file);
  });

const normalizeString = (v) => (v == null ? '' : String(v).trim());

const transactionKey = (t) => {
  // Best-effort dedupe key.
  const date = normalizeString(t.date);
  const type = normalizeString(t.type);
  const amount = Number(t.amount ?? 0);
  const category = normalizeString(t.category);
  const bank = normalizeString(t.bank);
  const accountNumber = normalizeString(t.accountNumber);
  const merchant = normalizeString(t.merchant);
  const description = normalizeString(t.description);
  return [date, type, amount.toFixed(2), category, bank, accountNumber, merchant, description].join('|');
};

export const importLegacyBackupJsonFile = async ({ file, userId }) => {
  if (!userId) throw new Error('Not signed in');
  if (!file) throw new Error('No file selected');

  const text = await readFileText(file);
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON file');
  }

  const tables = payload?.tables;
  if (!tables || typeof tables !== 'object') {
    throw new Error('Invalid backup format (missing tables)');
  }

  const legacyTransactions = Array.isArray(tables.transactions) ? tables.transactions : [];
  const legacyCategories = Array.isArray(tables.categories) ? tables.categories : [];
  const legacyAccounts = Array.isArray(tables.accounts) ? tables.accounts : [];

  // Build a set of existing transaction keys for the current user.
  const existing = await db.transactions.where('userId').equals(userId).toArray();
  const existingKeys = new Set(existing.map(transactionKey));

  const now = new Date().toISOString();

  const transactionsToAdd = [];
  for (const t of legacyTransactions) {
    const cleaned = {
      ...t,
      id: undefined,
      userId,
      createdAt: t.createdAt || now,
      updatedAt: now,
    };

    const key = transactionKey(cleaned);
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);
    transactionsToAdd.push(cleaned);
  }

  // Categories: import only if name+type doesn't already exist for user.
  const existingCats = await db.categories.where('userId').equals(userId).toArray();
  const catKey = (c) => `${normalizeString(c.name).toLowerCase()}|${normalizeString(c.type).toLowerCase()}`;
  const existingCatKeys = new Set(existingCats.map(catKey));
  const categoriesToAdd = [];
  for (const c of legacyCategories) {
    const key = catKey(c);
    if (!key || existingCatKeys.has(key)) continue;
    existingCatKeys.add(key);
    categoriesToAdd.push({ ...c, id: undefined, userId });
  }

  // Accounts: import only if accountNumber doesn't already exist for user.
  const existingAcc = await db.accounts.where('userId').equals(userId).toArray();
  const existingAccNumbers = new Set(existingAcc.map((a) => normalizeString(a.accountNumber)));
  const accountsToAdd = [];
  for (const a of legacyAccounts) {
    const accNo = normalizeString(a.accountNumber);
    if (!accNo || existingAccNumbers.has(accNo)) continue;
    existingAccNumbers.add(accNo);
    accountsToAdd.push({ ...a, id: undefined, userId });
  }

  await db.transaction('rw', db.transactions, db.categories, db.accounts, async () => {
    if (categoriesToAdd.length) await db.categories.bulkAdd(categoriesToAdd);
    if (accountsToAdd.length) await db.accounts.bulkAdd(accountsToAdd);
    if (transactionsToAdd.length) await db.transactions.bulkAdd(transactionsToAdd);
  });

  return {
    ok: true,
    imported: {
      transactions: transactionsToAdd.length,
      categories: categoriesToAdd.length,
      accounts: accountsToAdd.length,
    },
  };
};
