# 💰 Balance System - Immediate Implementation Plan

## 🎯 Current Status

✅ **Already Implemented:**
- Starting balance (one-time setup)
- Basic balance calculation: `startingBalance + income - expenses`
- Transaction tracking by user
- Multi-user support

## 🚀 Immediate Enhancements (No Backend Required)

### 1. **Per-Account Balance Tracking**

Currently: Single balance for all transactions
Needed: Track balance per bank account

```javascript
// Data structure enhancement
Account {
  id: UUID,
  userId: number,
  bankName: 'BML' | 'MIB',
  accountNumber: string,
  nickname: string, // e.g., "Savings Account", "Main Card"
  
  // Balance tracking
  startingBalance: number, // Initial balance for this account
  currentBalance: number, // Calculated from transactions
  
  // Display
  icon: string,
  color: string,
  isPrimary: boolean,
  isActive: boolean,
  
  createdAt: ISO string
}
```

**Balance Calculation:**
```javascript
// Total balance (all accounts)
totalBalance = user.startingBalance + Σ(all_credits) - Σ(all_debits)

// Per account balance
accountBalance(accountId) = account.startingBalance 
                          + Σ(credits for this account) 
                          - Σ(debits for this account)
```

### 2. **Balance Display Components**

#### A. Dashboard Balance Card (Enhanced)
```
┌─────────────────────────────────────────────────────┐
│ 💰 Total Balance                                    │
│ MVR 12,450.00                    [↑ +5% this month] │
├─────────────────────────────────────────────────────┤
│ Starting Balance       MVR 10,000.00                │
│ Total Income          +MVR  5,000.00                │
│ Total Expenses        -MVR  2,550.00                │
│ ─────────────────────────────────────────────       │
│ Current Balance        MVR 12,450.00 ✓              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🏦 My Accounts                                      │
├─────────────────────────────────────────────────────┤
│ 🔵 BML Main Card                    MVR 8,200.00    │
│    ****1234                         [Primary]       │
│                                                     │
│ 🟢 MIB Savings                      MVR 4,250.00    │
│    ****5678                                         │
│ ─────────────────────────────────────────────       │
│ Total                               MVR 12,450.00   │
└─────────────────────────────────────────────────────┘
```

#### B. Transaction List (Enhanced with Balance)
```
┌─────────────────────────────────────────────────────┐
│ Today - Jan 5, 2026                 MVR 12,450.00   │
├─────────────────────────────────────────────────────┤
│ 🍔 Foodco                  -150.00   11:30 AM       │
│    Groceries • BML ****1234                         │
│    Balance: MVR 12,450.00                           │
├─────────────────────────────────────────────────────┤
│ Yesterday - Jan 4, 2026            MVR 12,600.00   │
├─────────────────────────────────────────────────────┤
│ ⛽ STO Male                -350.00   4:20 PM        │
│    Fuel • BML ****1234                              │
│    Balance: MVR 12,600.00                           │
├─────────────────────────────────────────────────────┤
│ 💰 Salary                 +5,000.00  9:00 AM        │
│    Income • BML ****1234                            │
│    Balance: MVR 12,950.00                           │
└─────────────────────────────────────────────────────┘
```

### 3. **Running Balance in Transaction List**

Show balance after each transaction (like bank statements)

```javascript
// Algorithm: Calculate running balance
function calculateRunningBalances(transactions, startingBalance) {
  // Sort by date (oldest first)
  const sorted = transactions.sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
  
  let balance = startingBalance;
  
  return sorted.map(tx => {
    if (tx.type === 'credit') balance += tx.amount;
    if (tx.type === 'debit') balance -= tx.amount;
    
    return {
      ...tx,
      balanceAfter: balance
    };
  }).reverse(); // Show newest first
}
```

### 4. **Balance Reconciliation Feature**

Allow users to verify their balance matches bank statement

```javascript
// Reconciliation Modal
{
  calculatedBalance: 12450.00,
  userEnteredBalance: 12500.00,
  difference: +50.00,
  
  action: "Create adjustment transaction?",
  
  options: [
    "✓ Yes, adjust balance (adds income transaction)",
    "✗ No, I'll check my transactions",
    "📝 Add note about discrepancy"
  ]
}
```

### 5. **Balance History Chart**

Show balance trends over time

```javascript
// Daily balance snapshots
[
  { date: '2026-01-01', balance: 10000, change: 0 },
  { date: '2026-01-02', balance: 15000, change: +5000 },
  { date: '2026-01-03', balance: 14650, change: -350 },
  { date: '2026-01-04', balance: 14200, change: -450 },
  { date: '2026-01-05', balance: 12450, change: -1750 }
]

// Insights
"📊 Your balance decreased by 17% this week"
"💰 Average daily balance: MVR 13,260"
"📈 Projected end of month: MVR 11,000"
```

---

## 📋 Implementation Checklist

### Phase 1: Multi-Account Support (Priority 1)

- [ ] Update database schema to add accounts table enhancements
- [ ] Create account management UI (add, edit, delete accounts)
- [ ] Update transaction form to select account
- [ ] Link transactions to specific accounts
- [ ] Calculate per-account balances
- [ ] Display account balances on dashboard

### Phase 2: Running Balance Display (Priority 2)

- [ ] Add balanceAfter field to transaction display
- [ ] Calculate running balance for transaction list
- [ ] Show balance timeline in transaction details
- [ ] Add balance indicator to each transaction card

### Phase 3: Balance Reconciliation (Priority 3)

- [ ] Create reconciliation modal
- [ ] Add "Reconcile Balance" button to accounts
- [ ] Allow user to enter actual balance
- [ ] Calculate and show discrepancy
- [ ] Create adjustment transaction if needed
- [ ] Track reconciliation history

### Phase 4: Balance Analytics (Priority 4)

- [ ] Create balance history snapshots
- [ ] Build balance trend chart
- [ ] Calculate balance statistics (avg, min, max)
- [ ] Show balance predictions
- [ ] Display spending insights

---

## 🎨 UI Components Needed

### 1. Account Manager Component
```jsx
<AccountManager>
  <AccountCard account={bmlAccount} />
  <AccountCard account={mibAccount} />
  <AddAccountButton />
</AccountManager>
```

### 2. Enhanced Balance Card
```jsx
<BalanceCard>
  <TotalBalance amount={12450} change={+5%} />
  <BalanceBreakdown>
    <BalanceItem label="Starting" amount={10000} />
    <BalanceItem label="Income" amount={5000} type="credit" />
    <BalanceItem label="Expenses" amount={2550} type="debit" />
  </BalanceBreakdown>
  <AccountsList accounts={accounts} />
</BalanceCard>
```

### 3. Transaction with Balance
```jsx
<TransactionCard transaction={tx}>
  <TransactionDetails {...tx} />
  <RunningBalance 
    before={12600} 
    after={12450} 
    change={-150} 
  />
</TransactionCard>
```

### 4. Reconciliation Modal
```jsx
<ReconciliationModal account={account}>
  <BalanceComparison
    calculated={12450}
    actual={userInput}
    difference={difference}
  />
  <AdjustmentOptions />
  <ConfirmButton />
</ReconciliationModal>
```

### 5. Balance Trend Chart
```jsx
<BalanceTrendChart>
  <LineChart data={balanceHistory} />
  <Insights insights={insights} />
  <DateRangeSelector />
</BalanceTrendChart>
```

---

## 💾 Data Storage Strategy (Current: IndexedDB)

### Enhanced Database Schema

```javascript
// v4: Multi-account balance tracking
db.version(4)
  .stores({
    users: '++id, nameLower, createdAt, lastLoginAt',
    transactions: '++id, userId, accountId, date, type, amount, category',
    categories: '++id, userId, name, type',
    accounts: '++id, userId, bankName, accountNumber, nickname',
    balanceSnapshots: '++id, userId, accountId, date, balance',
    settings: 'key'
  })
  .upgrade(async (tx) => {
    // Migration logic
    // 1. Create default account for each user
    // 2. Link existing transactions to default account
    // 3. Calculate initial account balance
  });
```

### Account Schema
```javascript
{
  id: number (PK),
  userId: number (FK),
  
  // Account details
  bankName: 'BML' | 'MIB' | 'Other',
  accountNumber: string,
  nickname: string,
  
  // Balance
  startingBalance: number,
  
  // Display
  icon: string,
  color: string,
  isPrimary: boolean,
  isActive: boolean,
  
  // Reconciliation
  lastReconciledAt: ISO string,
  lastReconciledBalance: number,
  
  createdAt: ISO string,
  updatedAt: ISO string
}
```

### Balance Snapshot Schema
```javascript
{
  id: number (PK),
  userId: number (FK),
  accountId: number (FK),
  
  date: ISO string (day only),
  balance: number,
  source: 'calculated' | 'reconciled',
  
  createdAt: ISO string
}
```

---

## 🔢 Balance Calculation Functions

### 1. Calculate Total Balance
```javascript
export const calculateTotalBalance = (user, transactions) => {
  const totalIncome = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return user.startingBalance + totalIncome - totalExpenses;
};
```

### 2. Calculate Account Balance
```javascript
export const calculateAccountBalance = (account, transactions) => {
  const accountTransactions = transactions.filter(
    t => t.accountId === account.id
  );
  
  const income = accountTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = accountTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return account.startingBalance + income - expenses;
};
```

### 3. Calculate Running Balances
```javascript
export const addRunningBalances = (transactions, startingBalance) => {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  
  let runningBalance = startingBalance;
  
  return sorted.map(tx => {
    const before = runningBalance;
    
    if (tx.type === 'credit') runningBalance += tx.amount;
    if (tx.type === 'debit') runningBalance -= tx.amount;
    
    return {
      ...tx,
      balanceBefore: before,
      balanceAfter: runningBalance
    };
  }).reverse(); // Newest first for display
};
```

### 4. Generate Balance History
```javascript
export const generateBalanceHistory = (
  startingBalance, 
  transactions, 
  days = 30
) => {
  const history = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    // Get transactions up to this date
    const txUpToDate = transactions.filter(
      t => new Date(t.date) <= date
    );
    
    const balance = calculateTotalBalance(
      { startingBalance }, 
      txUpToDate
    );
    
    history.push({
      date: date.toISOString(),
      balance,
      change: i === days - 1 ? 0 : balance - history[history.length - 1]?.balance
    });
  }
  
  return history;
};
```

### 5. Balance Reconciliation
```javascript
export const reconcileBalance = async (
  accountId, 
  actualBalance,
  calculatedBalance
) => {
  const difference = actualBalance - calculatedBalance;
  
  if (Math.abs(difference) < 0.01) {
    return { needsAdjustment: false };
  }
  
  // Create adjustment transaction
  const adjustment = {
    date: new Date().toISOString(),
    type: difference > 0 ? 'credit' : 'debit',
    amount: Math.abs(difference),
    category: 'Balance Adjustment',
    merchant: 'Reconciliation',
    description: `Balance reconciliation adjustment: ${
      difference > 0 ? 'Missing income' : 'Missing expense'
    }`,
    accountId,
    isReconciliation: true
  };
  
  return {
    needsAdjustment: true,
    difference,
    adjustment
  };
};
```

---

## 📊 Example: Complete Balance Flow

### Scenario: User "Ali" with 2 accounts

```javascript
// User
{
  id: 1,
  name: "Ali",
  startingBalance: 10000 // Initial total balance
}

// Accounts
[
  {
    id: 1,
    userId: 1,
    bankName: "BML",
    accountNumber: "****1234",
    nickname: "Main Card",
    startingBalance: 6000,
    isPrimary: true
  },
  {
    id: 2,
    userId: 1,
    bankName: "MIB",
    accountNumber: "****5678",
    nickname: "Savings",
    startingBalance: 4000,
    isPrimary: false
  }
]

// Transactions
[
  { date: "2026-01-01", type: "credit", amount: 5000, accountId: 1 }, // Salary
  { date: "2026-01-02", type: "debit", amount: 150, accountId: 1 },   // Groceries
  { date: "2026-01-03", type: "debit", amount: 350, accountId: 1 },   // Fuel
  { date: "2026-01-04", type: "debit", amount: 50, accountId: 2 }     // Transfer
]

// Balance Calculations

// BML Account Balance
bmlBalance = 6000 + 5000 - 150 - 350 = 10,500

// MIB Account Balance
mibBalance = 4000 - 50 = 3,950

// Total Balance
totalBalance = 10,500 + 3,950 = 14,450
// OR: 10,000 + 5,000 - 550 = 14,450 ✓

// Balance After Each Transaction
[
  { date: "2026-01-01", ..., balanceAfter: 15000 },
  { date: "2026-01-02", ..., balanceAfter: 14850 },
  { date: "2026-01-03", ..., balanceAfter: 14500 },
  { date: "2026-01-04", ..., balanceAfter: 14450 }
]
```

---

## 🎯 Next Immediate Action Items

### To implement today:

1. **Add Account Management to Database**
   - Create accounts table schema v4
   - Migration script for existing users

2. **Build Account Manager UI**
   - Account list component
   - Add/edit account modal
   - Link to transactions

3. **Enhanced Balance Display**
   - Update BalanceCard to show per-account balances
   - Add running balance to transaction list

4. **Test Balance Calculations**
   - Unit tests for all balance functions
   - Test with multiple accounts
   - Test reconciliation logic

---

**Status:** Design complete, ready for implementation
**Priority:** High - Core feature for expense tracking
**Estimated Time:** 3-4 days for full implementation
