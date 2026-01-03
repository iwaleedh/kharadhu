# 🚀 Quick Start Guide

## Your App is Ready! 🎉

**Kharadhu (ޚަރަދު ބަރަދު ބެލެހެއްޓުން)** - Your Maldives Expense Tracker is now running at: **http://localhost:5173**

## 📱 Test the App

### 1. Test SMS Import (BML)

Copy this sample SMS and try importing it:

```
BML: Your account ending 1234 has been debited MVR 250.00 at FOODCO on 02-Jan-26. Balance: MVR 5,750.00
```

**Steps:**
1. Open http://localhost:5174
2. Click the **+** button (floating button in bottom navigation)
3. Click **"Import from SMS"**
4. Paste the sample SMS above
5. Click **"Parse SMS"**
6. See the parsed transaction details
7. Click **"Import Transaction"**

### 2. Test SMS Import (MIB)

Copy this sample SMS:

```
MIB Alert: Debit of MVR 150.50 from A/C ***5678 at STO MALE on 02/01/26. Avl Bal: MVR 8,500.00
```

Follow the same steps as above.

### 3. Add Manual Transaction

1. Click the **+** button
2. Click **"Manual Entry"**
3. Fill in:
   - Type: Expense
   - Amount: 100
   - Date: Today
   - Category: Food & Dining
   - Merchant: Restaurant
   - Bank: BML
4. Click **"Add Transaction"**

### 4. Explore Features

- **Dashboard**: View balance, charts, recent transactions
- **Transactions**: See all transactions, search, filter, edit, delete
- **Reports**: Monthly summaries, trends, top categories
- **Settings**: Export data, view app info

## 🎨 Features to Try

✅ Import SMS (BML & MIB)
✅ Manual transaction entry
✅ Auto-categorization
✅ Dashboard with charts
✅ Transaction list with filters
✅ Monthly reports
✅ Export to CSV
✅ Edit/Delete transactions

## 🏦 Supported Merchants (Auto-Categorization)

- **FOODCO, AGORA** → Groceries
- **STO, SHELL** → Fuel
- **DHIRAAGU, OOREDOO** → Telecommunications
- **STELCO, MWSC** → Utilities
- **Restaurants, Cafes** → Food & Dining
- And many more!

## 📊 Sample Data for Testing

### Income SMS (BML)
```
BML: Your account ending 1234 has been credited MVR 25,000.00 on 01-Jan-26. Balance: MVR 30,750.00
```

### Expense SMS Examples

**Groceries:**
```
BML: Your account ending 1234 has been debited MVR 450.00 at FOODCO on 02-Jan-26. Balance: MVR 5,750.00
```

**Fuel:**
```
MIB Alert: Debit of MVR 350.00 from A/C ***5678 at STO MALE on 02/01/26. Avl Bal: MVR 8,500.00
```

**Telecommunications:**
```
BML: Your account ending 1234 has been debited MVR 500.00 at DHIRAAGU on 03-Jan-26. Balance: MVR 5,250.00
```

**Utilities:**
```
MIB Alert: Debit of MVR 850.00 from A/C ***5678 at STELCO on 05/01/26. Avl Bal: MVR 7,650.00
```

## 🛠️ Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Stop dev server
# Press Ctrl+C in the terminal
```

## 🎯 Next Steps

1. ✅ **Test the SMS parser** with real SMS from your phone
2. ✅ **Add some transactions** to see the dashboard populate
3. ✅ **Check the reports** to see charts and analytics
4. ✅ **Export your data** as CSV
5. ✅ **Customize categories** if needed

## 💡 Tips

- All data is stored **locally** in your browser (IndexedDB)
- No data is sent to external servers
- You can export your data anytime
- The app works offline after first load
- Works on mobile browsers too!

## 🐛 Troubleshooting

**If you see errors:**
1. Make sure you're in the `maldives-expense-tracker` directory
2. Try refreshing the browser (Ctrl+R or Cmd+R)
3. Clear browser cache and reload
4. Check the browser console (F12) for errors

**If the port is already in use:**
- The app will automatically use another port (shown in terminal)
- Or stop the other process and restart

## 📞 Need Help?

Check the main README.md for detailed documentation.

---

**Enjoy tracking your expenses!** 💰🌊
