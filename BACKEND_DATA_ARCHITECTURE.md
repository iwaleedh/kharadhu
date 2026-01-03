# 🏗️ Kharadhu - Backend Data Architecture & Integration Strategy

## 📊 Current State Analysis

### Existing Data Structure (IndexedDB - Client Side)

```javascript
// Database: Kharadhu (Dexie/IndexedDB)
{
  users: {
    id: number (PK),
    name: string,
    nameLower: string,
    pinSalt: string,
    pinHash: string,
    startingBalance: number, // NEW: Initial balance
    createdAt: ISO string,
    lastLoginAt: ISO string
  },
  
  transactions: {
    id: number (PK),
    userId: number (FK → users.id),
    date: ISO string,
    type: 'credit' | 'debit',
    amount: number,
    category: string,
    bank: string,
    accountNumber: string,
    merchant: string,
    description: string,
    createdAt: ISO string,
    updatedAt: ISO string
  },
  
  categories: {
    id: number (PK),
    userId: number (FK → users.id),
    name: string,
    nameDv: string (Dhivehi),
    icon: emoji,
    color: hex,
    type: 'income' | 'expense' | 'transfer',
    budget: number
  },
  
  accounts: {
    id: number (PK),
    userId: number (FK → users.id),
    bankName: string,
    accountNumber: string,
    balance: number,
    isActive: boolean,
    createdAt: ISO string
  }
}
```

---

## 🎯 Recommended Backend Architecture

### Inspired by: YNAB, Mint, PocketGuard, Wallet by BudgetBakers

### Option 1: **Progressive Enhancement** (Recommended for MVP)
Keep IndexedDB as primary storage, add backend sync layer

### Option 2: **Full Backend Migration**
Move all data to backend, client acts as view layer

---

## 🚀 RECOMMENDED: Progressive Enhancement Strategy

### Phase 1: Backend Data Sync (Current → Future)

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                         │
├─────────────────────────────────────────────────────────────┤
│  IndexedDB (Primary)  ←→  Sync Queue  ←→  Backend API      │
│                                                             │
│  • Local-first data                                         │
│  • Instant operations                                       │
│  • Offline support                                          │
│  • Background sync                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
                         Sync Status
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Server)                         │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL / MySQL  +  Redis Cache                         │
│                                                             │
│  • Cloud backup                                             │
│  • Multi-device sync                                        │
│  • Data recovery                                            │
│  • Analytics                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 Enhanced Data Models with Backend

### 1. **User Model** (Extended)

```javascript
{
  // Existing fields
  id: UUID,
  name: string,
  email: string (optional for recovery),
  phone: string (optional),
  pinHash: string,
  pinSalt: string,
  startingBalance: number,
  
  // NEW: Backend fields
  encryptionKey: string, // For E2E encryption
  syncEnabled: boolean,
  lastSyncAt: ISO string,
  deviceIds: string[], // Multi-device support
  preferences: {
    currency: 'MVR',
    language: 'en' | 'dv',
    theme: 'light' | 'dark' | 'auto',
    notifications: boolean
  },
  
  createdAt: ISO string,
  updatedAt: ISO string,
  deletedAt: ISO string (soft delete)
}
```

### 2. **Transaction Model** (Extended)

```javascript
{
  // Existing fields
  id: UUID,
  userId: UUID,
  date: ISO string,
  type: 'credit' | 'debit',
  amount: number,
  category: string,
  bank: string,
  accountNumber: string,
  merchant: string,
  description: string,
  
  // NEW: Enhanced fields
  accountId: UUID, // Link to accounts table
  categoryId: UUID, // Link to categories table
  
  // Metadata
  source: 'manual' | 'sms' | 'api' | 'import',
  smsRaw: string, // Original SMS text
  
  // Reconciliation
  isReconciled: boolean,
  reconciledAt: ISO string,
  
  // Tagging & Search
  tags: string[],
  notes: string,
  attachments: string[], // Receipt images
  
  // Location (optional)
  location: {
    lat: number,
    lng: number,
    address: string
  },
  
  // Sync tracking
  syncStatus: 'pending' | 'synced' | 'conflict',
  localId: number, // Original IndexedDB id
  version: number, // For conflict resolution
  
  createdAt: ISO string,
  updatedAt: ISO string,
  deletedAt: ISO string (soft delete)
}
```

### 3. **Account Model** (Bank Accounts)

```javascript
{
  id: UUID,
  userId: UUID,
  
  // Account details
  bankName: 'BML' | 'MIB' | 'Other',
  accountNumber: string (encrypted),
  accountType: 'savings' | 'current' | 'credit',
  nickname: string, // User-friendly name
  
  // Balance tracking
  currentBalance: number, // Calculated from transactions
  availableBalance: number, // User reported
  lastBalanceUpdate: ISO string,
  
  // Account settings
  isActive: boolean,
  isPrimary: boolean,
  icon: string,
  color: string,
  
  // Integration (future)
  isLinked: boolean, // Open Banking API
  lastSyncAt: ISO string,
  
  createdAt: ISO string,
  updatedAt: ISO string
}
```

### 4. **Category Model** (Extended)

```javascript
{
  id: UUID,
  userId: UUID,
  
  // Category details
  name: string,
  nameDv: string,
  icon: string,
  color: string,
  type: 'income' | 'expense' | 'transfer',
  
  // Budgeting
  monthlyBudget: number,
  budgetPeriod: 'monthly' | 'weekly' | 'yearly',
  
  // Hierarchy (subcategories)
  parentId: UUID,
  order: number, // Display order
  
  // Smart categorization
  keywords: string[], // For auto-categorization
  merchantPatterns: string[], // Regex patterns
  
  // Statistics
  isSystem: boolean, // Default vs user-created
  usageCount: number,
  
  createdAt: ISO string,
  updatedAt: ISO string
}
```

### 5. **NEW: Budget Model**

```javascript
{
  id: UUID,
  userId: UUID,
  
  // Budget details
  name: string, // e.g., "January 2026 Budget"
  period: 'monthly' | 'weekly' | 'yearly' | 'custom',
  startDate: ISO string,
  endDate: ISO string,
  
  // Budget items (category allocations)
  items: [
    {
      categoryId: UUID,
      allocated: number,
      spent: number, // Calculated
      remaining: number // Calculated
    }
  ],
  
  totalAllocated: number,
  totalSpent: number,
  
  // Status
  status: 'active' | 'completed' | 'archived',
  
  createdAt: ISO string,
  updatedAt: ISO string
}
```

### 6. **NEW: Balance Snapshot Model**

```javascript
// For accurate balance tracking over time
{
  id: UUID,
  userId: UUID,
  accountId: UUID,
  
  // Snapshot data
  date: ISO string,
  balance: number,
  source: 'manual' | 'calculated' | 'reconciliation',
  
  // Verification
  isVerified: boolean,
  verifiedAt: ISO string,
  
  createdAt: ISO string
}
```

### 7. **NEW: Sync Queue Model**

```javascript
// Track pending sync operations
{
  id: UUID,
  userId: UUID,
  
  // Operation details
  operation: 'create' | 'update' | 'delete',
  entity: 'transaction' | 'category' | 'account',
  entityId: UUID,
  localId: number, // Original IndexedDB id
  
  // Payload
  data: JSON,
  
  // Status tracking
  status: 'pending' | 'in_progress' | 'completed' | 'failed',
  attempts: number,
  lastAttempt: ISO string,
  error: string,
  
  createdAt: ISO string,
  completedAt: ISO string
}
```

---

## 🔄 Balance Calculation System

### Inspired by: Double-Entry Accounting (YNAB) + Real-time Balance (Mint)

### Balance Formula

```javascript
// USER'S CURRENT BALANCE
currentBalance = startingBalance + Σ(credits) - Σ(debits)

// PER ACCOUNT BALANCE
accountBalance = accountStartingBalance + Σ(account_credits) - Σ(account_debits)

// AVAILABLE BALANCE (after pending)
availableBalance = currentBalance - Σ(pending_transactions)

// NET WORTH (all accounts)
netWorth = Σ(all_account_balances) - Σ(liabilities)
```

### Balance Tracking Strategy

```javascript
// 1. STARTING BALANCE (One-time setup)
User sets: startingBalance = 10,000 MVR

// 2. TRANSACTION-BASED CALCULATION (Real-time)
For each transaction:
  if (type === 'credit') balance += amount
  if (type === 'debit')  balance -= amount

// 3. PERIODIC RECONCILIATION (User verification)
User confirms: "My actual bank balance is 12,450 MVR"
System calculates: difference = actualBalance - calculatedBalance
If difference !== 0:
  Create adjustment transaction
  Alert user to discrepancy

// 4. SNAPSHOT HISTORY (Daily/Weekly)
Store balance snapshots for trend analysis:
  - Daily balance at midnight
  - Weekly average
  - Monthly comparison
```

### Balance Display Components

```javascript
// Dashboard Balance Card
{
  startingBalance: 10000,
  totalIncome: 5000,
  totalExpenses: 3000,
  currentBalance: 12000,
  
  // Breakdown
  breakdown: {
    'BML ****1234': 8000,
    'MIB ****5678': 4000
  },
  
  // Trends
  comparedToLastMonth: +5%, // ↑
  projectedEndOfMonth: 15000
}
```

---

## 🔐 Data Flow & Sync Strategy

### 1. **Local-First Architecture**

```javascript
// User performs action (e.g., add transaction)
┌─────────────────────────────────────────────────────┐
│ 1. Write to IndexedDB (instant)                     │
│ 2. Update UI (instant)                              │
│ 3. Add to sync queue (background)                   │
│ 4. Attempt sync to backend (when online)            │
│ 5. Update sync status                               │
└─────────────────────────────────────────────────────┘

// If online:  IndexedDB → Backend (within seconds)
// If offline: IndexedDB → Queue → Backend (when online)
```

### 2. **Conflict Resolution**

```javascript
// Version-based conflict resolution (CRDT-inspired)
{
  localVersion: 5,
  serverVersion: 6,
  
  conflictStrategy: {
    // Server wins (default)
    'server_wins': () => overwriteLocal(),
    
    // Local wins
    'local_wins': () => overwriteServer(),
    
    // Manual merge
    'manual': () => showConflictDialog(),
    
    // Last-write wins
    'lww': () => updatedAt > serverUpdatedAt ? local : server
  }
}
```

### 3. **Sync Algorithm**

```javascript
// Incremental sync (efficient)
async function syncToBackend() {
  // 1. Get pending changes
  const pending = await syncQueue.where('status').equals('pending').toArray();
  
  // 2. Batch upload
  const batch = pending.slice(0, 50); // Max 50 items per request
  const response = await api.post('/sync', { changes: batch });
  
  // 3. Process server response
  for (const item of response.synced) {
    await syncQueue.update(item.localId, { status: 'completed' });
  }
  
  // 4. Handle conflicts
  for (const conflict of response.conflicts) {
    await handleConflict(conflict);
  }
  
  // 5. Pull server changes
  const serverChanges = await api.get(`/sync?since=${lastSyncAt}`);
  await applyServerChanges(serverChanges);
  
  // 6. Update last sync timestamp
  await updateLastSyncAt(new Date());
}
```

---

## 🎨 UI/UX for Balance & Data Display

### Inspired by: Mint's Dashboard + YNAB's Budget View + Wallet's Timeline

### 1. **Dashboard - Balance Overview**

```
┌────────────────────────────────────────────────────────┐
│ 💰 Current Balance                    [Sync: ✓ 2m ago] │
│ MVR 12,450.00                         [↑ +5% this month]│
├────────────────────────────────────────────────────────┤
│ Starting Balance        MVR 10,000.00                  │
│ Total Income           +MVR  5,000.00                  │
│ Total Expenses         -MVR  2,550.00                  │
│ ───────────────────────────────────────────────────    │
│ Current Balance         MVR 12,450.00  ✓              │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ 🏦 Accounts                                            │
├────────────────────────────────────────────────────────┤
│ 🔵 BML ****1234         MVR 8,200.00   [Primary]      │
│ 🟢 MIB ****5678         MVR 4,250.00                   │
│ ────────────────────────────────────────────────       │
│ Total                   MVR 12,450.00                  │
└────────────────────────────────────────────────────────┘
```

### 2. **Transaction Timeline (Smart Display)**

```
┌────────────────────────────────────────────────────────┐
│ Today                                   MVR 12,450.00   │
├────────────────────────────────────────────────────────┤
│ 🍔 Foodco                -MVR 150.00   11:30 AM       │
│    Groceries                           BML ****1234     │
│                                        MVR 12,450.00   │
├────────────────────────────────────────────────────────┤
│ Yesterday                              MVR 12,600.00   │
├────────────────────────────────────────────────────────┤
│ ⛽ STO Male              -MVR 350.00   4:20 PM        │
│    Fuel                                BML ****1234     │
│                                        MVR 12,600.00   │
│ ────────────────────────────────────────────────       │
│ 💰 Salary               +MVR 5,000.00  9:00 AM        │
│    Income/Salary                       BML ****1234     │
│                                        MVR 12,950.00   │
└────────────────────────────────────────────────────────┘
```

### 3. **Balance Trends Chart**

```javascript
// Line chart showing balance over time
{
  data: [
    { date: '2026-01-01', balance: 10000 },
    { date: '2026-01-02', balance: 15000 }, // Salary
    { date: '2026-01-03', balance: 14650 }, // Expenses
    { date: '2026-01-04', balance: 14200 },
    { date: '2026-01-05', balance: 12450 }
  ],
  
  insights: [
    "💡 Your balance decreased by 17% this week",
    "📊 Average daily spending: MVR 450",
    "🎯 On track to save MVR 2,000 this month"
  ]
}
```

---

## 🔗 Backend API Endpoints (Recommended)

### Authentication
```
POST   /api/auth/signup          - Create new user
POST   /api/auth/signin          - Sign in with PIN
POST   /api/auth/refresh         - Refresh session
POST   /api/auth/signout         - Sign out
POST   /api/auth/reset-pin       - Reset PIN
```

### Users
```
GET    /api/user/profile         - Get current user
PATCH  /api/user/profile         - Update profile
PATCH  /api/user/preferences     - Update preferences
GET    /api/user/balance         - Get current balance summary
```

### Transactions
```
GET    /api/transactions         - List transactions (paginated)
POST   /api/transactions         - Create transaction
GET    /api/transactions/:id     - Get single transaction
PATCH  /api/transactions/:id     - Update transaction
DELETE /api/transactions/:id     - Delete transaction
POST   /api/transactions/bulk    - Bulk create (import)
```

### Categories
```
GET    /api/categories           - List categories
POST   /api/categories           - Create category
PATCH  /api/categories/:id       - Update category
DELETE /api/categories/:id       - Delete category
```

### Accounts
```
GET    /api/accounts             - List accounts
POST   /api/accounts             - Create account
PATCH  /api/accounts/:id         - Update account
DELETE /api/accounts/:id         - Delete account
POST   /api/accounts/:id/reconcile - Reconcile balance
```

### Sync
```
POST   /api/sync                 - Sync changes (bidirectional)
GET    /api/sync/status          - Get sync status
POST   /api/sync/force           - Force full sync
```

### Analytics
```
GET    /api/analytics/summary    - Dashboard summary
GET    /api/analytics/trends     - Balance trends
GET    /api/analytics/spending   - Spending by category
GET    /api/analytics/budget     - Budget vs actual
```

---

## 💡 Smart Features to Implement

### 1. **Predictive Balance**
```javascript
// Machine learning to predict future balance
"Based on your spending patterns, your balance on Jan 31 
 will be approximately MVR 11,500"
```

### 2. **Smart Categorization**
```javascript
// Auto-categorize based on merchant + ML
"STO MALE" → Fuel (95% confidence)
"FOODCO"   → Groceries (90% confidence)
```

### 3. **Spending Insights**
```javascript
"🔥 You've spent 120% of your usual food budget this week"
"💡 You can save MVR 500 by reducing dining out"
"📊 Your grocery spending is 15% higher than last month"
```

### 4. **Balance Alerts**
```javascript
"⚠️ Balance below MVR 5,000 (your alert threshold)"
"🎉 You've saved MVR 2,000 this month!"
"💰 Upcoming: Salary expected in 3 days"
```

---

## 📊 Implementation Priority

### Phase 1: Local Enhancement (Week 1-2)
✅ Starting balance (DONE)
✅ Account-based tracking
✅ Balance reconciliation
✅ Enhanced transaction display

### Phase 2: Backend Setup (Week 3-4)
- Set up backend API (Node.js + PostgreSQL)
- Implement authentication with JWT
- Create API endpoints for CRUD operations
- Add data validation & security

### Phase 3: Sync Implementation (Week 5-6)
- Implement sync queue
- Background sync worker
- Conflict resolution
- Offline support

### Phase 4: Advanced Features (Week 7-8)
- Budget management
- Spending insights
- Balance predictions
- Multi-account support

---

## 🎯 Next Steps

1. **Choose Backend Stack**
   - Option A: Node.js + Express + PostgreSQL
   - Option B: Python + FastAPI + PostgreSQL
   - Option C: Go + Gin + PostgreSQL

2. **Set Up Infrastructure**
   - Cloud provider (AWS/GCP/DigitalOcean)
   - Database (PostgreSQL with backups)
   - Redis for caching
   - Object storage for attachments

3. **Implement Core APIs**
   - Start with auth + transactions
   - Add sync layer
   - Implement balance calculations

4. **Client-Side Updates**
   - Add sync queue to IndexedDB
   - Implement background sync worker
   - Add sync status indicators
   - Handle conflicts

---

**Status:** Ready for implementation
**Estimated Time:** 8 weeks for full backend integration
**MVP Time:** 2 weeks for enhanced local features
