const readFileText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
    reader.readAsText(file);
  });

export const previewLegacyBackupJsonFile = async (file) => {
  if (!file) throw new Error('No file selected');
  const text = await readFileText(file);

  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON');
  }

  const tables = payload?.tables;
  if (!tables || typeof tables !== 'object') {
    throw new Error('Invalid backup format (missing tables)');
  }

  const transactions = Array.isArray(tables.transactions) ? tables.transactions.length : 0;
  const categories = Array.isArray(tables.categories) ? tables.categories.length : 0;
  const accounts = Array.isArray(tables.accounts) ? tables.accounts.length : 0;
  const users = Array.isArray(tables.users) ? tables.users.length : 0;

  return {
    exportedAt: payload.exportedAt || null,
    dbName: payload.dbName || null,
    version: payload.version || null,
    counts: { users, accounts, categories, transactions },
  };
};
