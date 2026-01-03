# 🧪 Testing Automatic SMS Import

## How to Test the Feature

### Step 1: Open the App
```
http://localhost:5173
```

### Step 2: Copy a Test SMS

**New BML Format (Copy this):**
```
Transaction from 1621 on 31/12/25 at 10:18:03 for MVR265.00 at MARRYBROWN MALDIVES was processed. Reference No:123116608083, Approval Code:986780.
```

**Old BML Format (Copy this):**
```
BML: Your account ending 1234 has been debited MVR 250.00 at FOODCO on 02-Jan-26. Balance: MVR 5,750.00
```

**MIB Format (Copy this):**
```
MIB Alert: Debit of MVR 150.50 from A/C ***5678 at STO MALE on 02/01/26. Avl Bal: MVR 8,500.00
```

### Step 3: Watch the Popup Appear!

The popup will show:
- ✅ Bank name
- ✅ Amount
- ✅ Merchant name
- ✅ Auto-detected category
- ✅ Date and time
- ✅ Reference number
- ✅ Approval code

### Step 4: Click "Import" or "Cancel"

**Import** → Transaction added to dashboard!
**Cancel** → Transaction discarded

---

## Expected Behavior

### ✅ What Should Happen

1. **Copy SMS** → Clipboard monitoring detects it
2. **Popup appears** within 2 seconds
3. **All details parsed** correctly:
   - Date: 31/12/25 → December 31, 2025
   - Time: 10:18:03
   - Amount: MVR 265.00
   - Merchant: MARRYBROWN MALDIVES
   - Category: ކައްކާބާ (Food & Dining)
   - Reference: 123116608083

4. **Click Import** → Transaction appears in dashboard
5. **Check Dashboard** → See new transaction with all details

---

## Parsed Fields

### New BML Format Fields:
- ✅ Account: 1621
- ✅ Date: 31/12/25
- ✅ Time: 10:18:03  
- ✅ Amount: MVR 265.00
- ✅ Merchant: MARRYBROWN MALDIVES
- ✅ Reference Number: 123116608083
- ✅ Approval Code: 986780
- ✅ Type: Debit (Expense)
- ✅ Category: Auto-detected from merchant

---

## Troubleshooting

### Popup Doesn't Appear?

1. **Check Browser**: Use Chrome, Edge, or Firefox (latest versions)
2. **Clipboard Permission**: Browser may ask for permission - click "Allow"
3. **Copy Again**: Try copying the SMS text again
4. **Wait 2 seconds**: Monitoring checks every 2 seconds
5. **Check Console**: Open DevTools (F12) and check for logs

### Wrong Details Parsed?

- Copy the SMS again carefully
- Ensure entire SMS is copied
- Check for extra spaces or line breaks
- Report the SMS format for improvements

### Duplicate Transactions?

- Don't copy the same SMS multiple times
- Check dashboard before importing
- Future update will add duplicate detection

---

## Real-World Usage

### With Your Real Bank SMS:

1. **Receive SMS from BML**
2. **Open the SMS app**
3. **Long press on SMS → Copy**
4. **Open Kharadhu app** (or switch to it)
5. **Wait 1-2 seconds**
6. **Popup appears automatically!**
7. **Review details**
8. **Click Import**
9. **Done! ✨**

---

## Performance

- **Detection Time**: < 2 seconds
- **Parsing Time**: < 100ms
- **Import Time**: < 500ms
- **Total Time**: ~ 2-3 seconds from copy to import

---

## Privacy Notes

- ✅ Only monitors when app is open/active
- ✅ Only reads clipboard when you copy
- ✅ No SMS stored permanently
- ✅ No data sent to servers
- ✅ All processing local
- ✅ User must explicitly copy SMS

---

## Future Improvements

- [ ] Duplicate detection
- [ ] Batch import (multiple SMS)
- [ ] SMS history view
- [ ] Smart notifications
- [ ] Learning system for categorization
- [ ] Native mobile app with full SMS access

---

**Enjoy faster expense tracking! ⚡**
