import { create } from 'zustand';
import { db } from '../lib/database';
import { generateSalt, hashPIN } from '../lib/crypto';
import { getCurrentUserId, setCurrentUserId } from '../lib/currentUser';

const normalizePin = (pin) => String(pin ?? '').trim();

const safeParseId = (id) => {
  if (id == null) return null;
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
};

export const useAuthStore = create((set, get) => ({
  // ephemeral security state (not persisted)
  failedAttempts: 0,
  nextAllowedSignInAt: 0,
  users: [],
  currentUserId: safeParseId(getCurrentUserId()),
  currentUser: null,
  loading: false,
  error: null,

  init: async () => {
    set({ loading: true, error: null });
    try {
      const users = await db.users.toArray();
      const currentUserId = safeParseId(getCurrentUserId());
      const currentUser = currentUserId
        ? users.find((u) => u.id === currentUserId) || null
        : null;

      // If stored current userId is invalid, clear it.
      if (currentUserId && !currentUser) {
        setCurrentUserId(null);
      }

      set({ users, currentUserId: currentUser?.id ?? null, currentUser, loading: false });
    } catch (e) {
      set({ error: e?.message || 'Failed to load users', loading: false });
    }
  },

  signUp: async ({ name, pin }) => {
    set({ loading: true, error: null });
    try {
      const cleanName = String(name ?? '').trim();
      const cleanPin = normalizePin(pin);
      if (!cleanName) throw new Error('Name is required');
      if (cleanPin.length < 4) throw new Error('PIN must be at least 4 digits');

      const existing = await db.users.where('nameLower').equals(cleanName.toLowerCase()).first();
      if (existing) throw new Error('An account with that name already exists');

      const salt = generateSalt();
      const pinHash = await hashPIN(cleanPin, salt);

      const now = new Date().toISOString();
      const existingUserCount = await db.users.count();

      const userId = await db.users.add({
        name: cleanName,
        nameLower: cleanName.toLowerCase(),
        pinSalt: salt,
        pinHash,
        createdAt: now,
        lastLoginAt: now,
        startingBalance: null, // Will be set via modal after first login
      });

      // Create a default account for new users
      await db.accounts.add({
        userId,
        bankName: 'Bank Account',
        accountNumber: '****',
        nickname: 'My First Account',
        icon: '🏦',
        startingBalance: 0,
        currentBalance: 0,
        isPrimary: true,
        createdAt: now,
      });

      // Claim legacy data (records without userId) only for the very first created account.
      if (existingUserCount === 0) {
        await db.transaction('rw', db.transactions, db.categories, db.accounts, async () => {
          await db.transactions.where('userId').equals(undefined).modify({ userId });
          await db.categories.where('userId').equals(undefined).modify({ userId });
          await db.accounts.where('userId').equals(undefined).modify({ userId });
        });
      }

      setCurrentUserId(userId);
      await get().init();
      return userId;
    } catch (e) {
      set({ error: e?.message || 'Sign up failed', loading: false });
      return null;
    }
  },

  // Verify PIN only, without switching user or updating lastLogin
  verifyPin: async ({ userId, pin }) => {
    try {
      const id = safeParseId(userId);
      if (!id) throw new Error('Invalid user');

      const now = Date.now();
      const { nextAllowedSignInAt, failedAttempts } = get();
      if (now < (nextAllowedSignInAt || 0)) {
        const waitMs = (nextAllowedSignInAt || 0) - now;
        set({ error: `Please wait ${Math.ceil(waitMs/1000)}s before trying again.` });
        return false;
      }

      const cleanPin = normalizePin(pin);
      if (!cleanPin) {
        set({ error: 'PIN is required' });
        return false;
      }

      const user = await db.users.get(id);
      if (!user) {
        set({ error: 'Invalid credentials' });
        return false;
      }

      const candidateHash = await hashPIN(cleanPin, user.pinSalt);
      if (candidateHash !== user.pinHash) {
        const attempts = (failedAttempts || 0) + 1;
        const delay = Math.min(30000, 1000 * Math.pow(2, Math.min(attempts, 4))); // up to 30s
        set({ failedAttempts: attempts, nextAllowedSignInAt: Date.now() + delay, error: 'Invalid credentials' });
        return false;
      }

      // success
      set({ failedAttempts: 0, nextAllowedSignInAt: 0, error: null });
      return true;
    } catch (e) {
      set({ error: e?.message || 'Verification failed' });
      return false;
    }
  },

  signIn: async ({ userId, pin }) => {
    set({ loading: true, error: null });
    try {
      const id = safeParseId(userId);
      if (!id) { set({ loading: false, error: 'Select an account' }); return false; }

      const cleanPin = normalizePin(pin);
      if (!cleanPin) { set({ loading: false, error: 'PIN is required' }); return false; }

      const user = await db.users.get(id);
      if (!user) { set({ loading: false, error: 'Invalid credentials' }); return false; }

      const candidateHash = await hashPIN(cleanPin, user.pinSalt);
      if (candidateHash !== user.pinHash) { const attempts = (get().failedAttempts || 0) + 1; const delay = Math.min(30000, 1000 * Math.pow(2, Math.min(attempts, 4))); set({ failedAttempts: attempts, nextAllowedSignInAt: Date.now() + delay, loading: false, error: 'Invalid credentials' }); return false; }

      const now = new Date().toISOString();
      await db.users.update(id, { lastLoginAt: now });

      setCurrentUserId(id);
      await get().init();
      return true;
    } catch (e) {
      set({ error: e?.message || 'Sign in failed', loading: false });
      return false;
    }
  },

  switchUser: async (userId) => {
    // Per your preference: switch immediately (no PIN prompt).
    const id = safeParseId(userId);
    if (!id) return;
    setCurrentUserId(id);
    await get().init();
  },

  renameUser: async ({ userId, name }) => {
    set({ loading: true, error: null });
    try {
      const id = safeParseId(userId);
      if (!id) throw new Error('Invalid user');

      const cleanName = String(name ?? '').trim();
      if (!cleanName) throw new Error('Name is required');

      const existing = await db.users.where('nameLower').equals(cleanName.toLowerCase()).first();
      if (existing && existing.id !== id) {
        throw new Error('An account with that name already exists');
      }

      await db.users.update(id, { name: cleanName, nameLower: cleanName.toLowerCase() });
      await get().init();
      return true;
    } catch (e) {
      set({ error: e?.message || 'Rename failed', loading: false });
      return false;
    }
  },

  updatePin: async ({ userId, pin }) => {
    set({ loading: true, error: null });
    try {
      const id = safeParseId(userId);
      if (!id) throw new Error('Invalid user');

      const cleanPin = normalizePin(pin);
      if (cleanPin.length < 4) throw new Error('PIN must be at least 4 digits');

      const salt = generateSalt();
      const pinHash = await hashPIN(cleanPin, salt);
      await db.users.update(id, { pinSalt: salt, pinHash });

      await get().init();
      return true;
    } catch (e) {
      set({ error: e?.message || 'Change PIN failed', loading: false });
      return false;
    }
  },

  deleteUser: async ({ userId }) => {
    set({ loading: true, error: null });
    try {
      const id = safeParseId(userId);
      if (!id) throw new Error('Invalid user');

      // Delete user-scoped data
      await db.transaction('rw', db.transactions, db.categories, db.accounts, db.users, async () => {
        await db.transactions.where('userId').equals(id).delete();
        await db.categories.where('userId').equals(id).delete();
        await db.accounts.where('userId').equals(id).delete();
        await db.users.delete(id);
      });

      // If we deleted the current user, clear session.
      if (safeParseId(getCurrentUserId()) === id) {
        setCurrentUserId(null);
      }

      // Pick another user if available.
      const users = await db.users.toArray();
      if (!getCurrentUserId() && users.length > 0) {
        setCurrentUserId(users[0].id);
      }

      await get().init();
      return true;
    } catch (e) {
      set({ error: e?.message || 'Delete failed', loading: false });
      return false;
    }
  },

  signOut: async () => {
    setCurrentUserId(null);
    await get().init();
  },

  setStartingBalance: async ({ userId, balance, accountNumber }) => {
    set({ loading: true, error: null });
    try {
      const id = safeParseId(userId);
      if (!id) throw new Error('Invalid user');
      
      const balanceNum = Number(balance);
      if (isNaN(balanceNum) || balanceNum < 0) {
        throw new Error('Invalid balance amount');
      }

      const cleanAccountNumber = String(accountNumber || '').trim();
      if (!cleanAccountNumber || cleanAccountNumber.length < 4) {
        throw new Error('Account number (last 4 digits) is required');
      }

      // Check if starting balance is already set
      const user = await db.users.get(id);
      if (user?.startingBalance !== null && user?.startingBalance !== undefined) {
        throw new Error('Starting balance has already been set and cannot be changed');
      }

      await db.users.update(id, { 
        startingBalance: balanceNum,
        accountNumber: cleanAccountNumber 
      });

      // Create a default account when starting balance is set
      const existingAccounts = await db.accounts.where('userId').equals(id).toArray();
      if (existingAccounts.length === 0) {
        const accountId = generateId();
        await db.accounts.add({
          id: accountId,
          userId: id,
          bankName: 'Bank Account',
          accountNumber: cleanAccountNumber,
          nickname: 'My Account',
          icon: '🏦',
          startingBalance: balanceNum,
          currentBalance: balanceNum,
          isPrimary: true,
          createdAt: new Date().toISOString(),
        });
      }

      await get().init();
      return true;
    } catch (e) {
      set({ error: e?.message || 'Failed to set starting balance', loading: false });
      return false;
    }
  },
}));
