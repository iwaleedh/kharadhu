import Dexie from 'dexie';

const downloadJson = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const createLegacyDb = () => {
  const legacy = new Dexie('MaldivesExpenseTracker');

  // Support both known versions.
  legacy.version(1).stores({
    transactions: '++id, date, type, amount, category, bank, accountNumber, merchant',
    categories: '++id, name, type',
    accounts: '++id, bankName, accountNumber',
    settings: 'key',
  });

  legacy.version(2).stores({
    users: '++id, nameLower, createdAt, lastLoginAt',
    transactions: '++id, userId, date, type, amount, category, bank, accountNumber, merchant',
    categories: '++id, userId, name, type',
    accounts: '++id, userId, bankName, accountNumber',
    settings: 'key',
  });

  return legacy;
};

export const exportLegacyDatabase = async () => {
  const legacy = createLegacyDb();
  try {
    await legacy.open();

    const payload = {
      exportedAt: new Date().toISOString(),
      dbName: 'MaldivesExpenseTracker',
      version: legacy.verno,
      tables: {},
    };

    const tableNames = legacy.tables.map((t) => t.name);
    for (const name of tableNames) {
      payload.tables[name] = await legacy.table(name).toArray();
    }

    const date = new Date().toISOString().split('T')[0];
    downloadJson(payload, `kharadhu-legacy-backup-${date}.json`);

    return { ok: true, payload };
  } finally {
    legacy.close();
  }
};
