# ✅ Testing Checklist

## Quick Test Guide for Your Maldives Expense Tracker

Use this checklist to verify all features are working correctly.

---

## 🚀 Setup Test

- [ ] App is running on `http://localhost:5174`
- [ ] Page loads without errors
- [ ] Dashboard is visible
- [ ] Bottom navigation is present
- [ ] All tabs are clickable

---

## 📱 SMS Import Tests

### Test 1: BML Debit Transaction
```
BML: Your account ending 1234 has been debited MVR 250.00 at FOODCO on 02-Jan-26. Balance: MVR 5,750.00
```

**Expected Results:**
- [ ] Type: Expense (debit)
- [ ] Amount: MVR 250.00
- [ ] Bank: BML
- [ ] Account: 1234
- [ ] Merchant: FOODCO
- [ ] Category: Groceries (auto-categorized)
- [ ] Balance: MVR 5,750.00

### Test 2: BML Credit Transaction
```
BML: Your account ending 1234 has been credited MVR 10,000.00 on 01-Jan-26. Balance: MVR 15,750.00
```

**Expected Results:**
- [ ] Type: Income (credit)
- [ ] Amount: MVR 10,000.00
- [ ] Category: Income/Salary

### Test 3: MIB Debit Transaction
```
MIB Alert: Debit of MVR 150.50 from A/C ***5678 at STO MALE on 02/01/26. Avl Bal: MVR 8,500.00
```

**Expected Results:**
- [ ] Type: Expense (debit)
- [ ] Amount: MVR 150.50
- [ ] Bank: MIB
- [ ] Account: 5678
- [ ] Merchant: STO MALE
- [ ] Category: Fuel (auto-categorized)

### Test 4: MIB Credit Transaction
```
MIB Alert: Credit of MVR 5,000.00 to A/C ***5678 on 02/01/26. Avl Bal: MVR 13,500.00
```

**Expected Results:**
- [ ] Type: Income (credit)
- [ ] Amount: MVR 5,000.00

---

## ✏️ Manual Entry Tests

### Test 5: Add Manual Expense
1. Click the `+` button
2. Choose "Manual Entry"
3. Fill in:
   - Type: Expense
   - Amount: 100
   - Date: Today
   - Category: Food & Dining
   - Merchant: Test Restaurant
   - Bank: BML
   - Account: 1234

**Expected Results:**
- [ ] Transaction is added successfully
- [ ] Appears in recent transactions
- [ ] Dashboard updates with new amount

### Test 6: Add Manual Income
1. Repeat above with Type: Income
2. Amount: 5000

**Expected Results:**
- [ ] Income is added
- [ ] Balance increases
- [ ] Shows in green color

---

## 📊 Dashboard Tests

### Test 7: Dashboard Display
After adding transactions above:

**Expected Results:**
- [ ] Total balance shows correctly
- [ ] Income total is accurate
- [ ] Expenses total is accurate
- [ ] Net income calculation is correct
- [ ] Recent transactions list shows latest entries
- [ ] Category chart displays pie chart
- [ ] Quick stats show transaction count

---

## 📝 Transaction Management Tests

### Test 8: View Transactions
1. Navigate to "Transactions" tab

**Expected Results:**
- [ ] All transactions are listed
- [ ] Grouped by date
- [ ] Search bar is present
- [ ] Filter dropdowns work

### Test 9: Search Transactions
1. Type "FOODCO" in search

**Expected Results:**
- [ ] Only FOODCO transactions show
- [ ] Results update in real-time

### Test 10: Filter by Category
1. Select "Groceries" from category filter

**Expected Results:**
- [ ] Only grocery transactions show
- [ ] Count updates

### Test 11: Edit Transaction
1. Click edit icon on any transaction
2. Change amount to 300
3. Save

**Expected Results:**
- [ ] Modal opens
- [ ] Form is pre-filled
- [ ] Changes are saved
- [ ] Dashboard updates

### Test 12: Delete Transaction
1. Click delete icon
2. Confirm deletion

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Transaction is removed
- [ ] Dashboard updates

---

## 📈 Reports Tests

### Test 13: View Reports
1. Navigate to "Reports" tab

**Expected Results:**
- [ ] Income card shows total
- [ ] Expenses card shows total
- [ ] Net income card shows calculation
- [ ] Category chart displays
- [ ] 6-month trend chart shows
- [ ] Top categories list appears

### Test 14: Month Selection
1. Change month dropdown to "Last Month"

**Expected Results:**
- [ ] Data updates for selected month
- [ ] Charts refresh
- [ ] Stats update

---

## 📤 Export Tests

### Test 15: Export to CSV
1. Go to Transactions tab
2. Click "Export" button

**Expected Results:**
- [ ] CSV file downloads
- [ ] Contains all transactions
- [ ] Proper formatting
- [ ] Headers are correct

### Test 16: Export from Settings
1. Go to Settings tab
2. Click "Export Data (CSV)"

**Expected Results:**
- [ ] CSV file downloads
- [ ] Contains all data

---

## ⚙️ Settings Tests

### Test 17: View App Info
1. Navigate to Settings tab

**Expected Results:**
- [ ] Version displays
- [ ] Transaction count shows
- [ ] Storage type shows (Local)
- [ ] About section is readable

### Test 18: Clear Data (CAREFUL!)
1. Click "Clear All Data"
2. Confirm (or cancel to not lose data)

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Warning message is clear
- [ ] If confirmed, all data is cleared

---

## 🎨 UI/UX Tests

### Test 19: Responsive Design
1. Resize browser window to mobile size (375px)

**Expected Results:**
- [ ] Layout adapts to mobile
- [ ] Bottom nav is visible
- [ ] All elements are accessible
- [ ] No horizontal scrolling
- [ ] Touch targets are large enough

### Test 20: Navigation
1. Click through all bottom nav tabs

**Expected Results:**
- [ ] Dashboard loads
- [ ] Transactions loads
- [ ] Reports loads
- [ ] Settings loads
- [ ] Active tab is highlighted
- [ ] Smooth transitions

### Test 21: Modal Behavior
1. Open add transaction modal
2. Click outside modal

**Expected Results:**
- [ ] Modal closes
- [ ] No data is lost
- [ ] Background is blurred

---

## 🔄 Data Persistence Tests

### Test 22: Page Refresh
1. Add some transactions
2. Refresh the page (F5 or Cmd+R)

**Expected Results:**
- [ ] All transactions remain
- [ ] Dashboard data persists
- [ ] No data loss

### Test 23: Close and Reopen
1. Close browser tab
2. Open `http://localhost:5174` again

**Expected Results:**
- [ ] All data is still there
- [ ] App state is preserved

---

## 🌊 Maldivian Merchant Tests

### Test 24: Auto-Categorization
Test SMS with different Maldivian merchants:

**DHIRAAGU** → Should categorize as "Telecommunications"
```
BML: Your account ending 1234 has been debited MVR 500.00 at DHIRAAGU on 03-Jan-26. Balance: MVR 5,250.00
```

**OOREDOO** → Should categorize as "Telecommunications"
```
BML: Your account ending 1234 has been debited MVR 450.00 at OOREDOO on 03-Jan-26. Balance: MVR 4,800.00
```

**STELCO** → Should categorize as "Housing & Utilities"
```
MIB Alert: Debit of MVR 850.00 from A/C ***5678 at STELCO on 05/01/26. Avl Bal: MVR 7,650.00
```

**MWSC** → Should categorize as "Housing & Utilities"
```
BML: Your account ending 1234 has been debited MVR 200.00 at MWSC on 06-Jan-26. Balance: MVR 4,600.00
```

**STO** → Should categorize as "Fuel"
```
MIB Alert: Debit of MVR 350.00 from A/C ***5678 at STO HULHUMALE on 07/01/26. Avl Bal: MVR 7,300.00
```

**AGORA** → Should categorize as "Groceries"
```
BML: Your account ending 1234 has been debited MVR 600.00 at AGORA MALE on 08-Jan-26. Balance: MVR 4,000.00
```

---

## 🎯 Performance Tests

### Test 25: Large Dataset
1. Add 50+ transactions (use SMS import repeatedly)

**Expected Results:**
- [ ] App remains responsive
- [ ] Charts render correctly
- [ ] Scrolling is smooth
- [ ] Search works quickly

### Test 26: Load Time
1. Refresh page with full dataset

**Expected Results:**
- [ ] Page loads in < 3 seconds
- [ ] Data loads from IndexedDB quickly
- [ ] No visible lag

---

## 🐛 Error Handling Tests

### Test 27: Invalid SMS
Try parsing this invalid SMS:
```
This is not a valid bank SMS
```

**Expected Results:**
- [ ] Error message displays
- [ ] User is informed clearly
- [ ] No crash or blank screen

### Test 28: Empty Form Submission
1. Open manual entry
2. Try submitting without filling required fields

**Expected Results:**
- [ ] Form validation prevents submission
- [ ] Required fields are highlighted
- [ ] Clear error messages

---

## ✅ Final Checks

- [ ] All 28 tests passed
- [ ] No console errors (F12 → Console)
- [ ] No visual glitches
- [ ] Smooth user experience
- [ ] Data persists correctly
- [ ] Export works
- [ ] Mobile responsive

---

## 📊 Test Results Summary

**Date Tested:** _______________

**Tests Passed:** _____ / 28

**Issues Found:**
1. ________________________________
2. ________________________________
3. ________________________________

**Overall Status:** ⭐ ⭐ ⭐ ⭐ ⭐

---

## 🎉 If All Tests Pass

**Congratulations!** Your Maldives Expense Tracker is fully functional and ready to use!

### Next Steps:
1. Start using with real transaction SMS
2. Build up your transaction history
3. Monitor your spending habits
4. Export data regularly for backup
5. Share with friends and family!

---

**Happy Testing! 🧪✨**
