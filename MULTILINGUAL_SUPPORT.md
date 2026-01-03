# 🌐 Multilingual Support Documentation

## ✨ Bilingual Interface

**Kharadhu (ޚަރަދު ބަރަދު ބެލެހެއްޓުން)** now features complete bilingual support with **Dhivehi** and **English** displayed together throughout the app.

---

## 🎯 Design Philosophy

### Why Bilingual?

1. **Inclusive**: Accessible to both Dhivehi and English speakers
2. **Educational**: Helps users learn both languages
3. **Professional**: Maintains international standards
4. **Clear**: No confusion about meaning
5. **Cultural**: Respects Maldivian identity while being globally accessible

### Display Pattern

```
Primary Language (Dhivehi)
Secondary Language (English)
```

**Dhivehi** is shown first (larger) as the primary language, with **English** below (smaller) for clarity.

---

## 📱 Implementation by Section

### 1. Navigation Bar

Each tab shows both languages:

```
ފުރަތަމަ
Home

ހަރަދު
Transactions

އާ
Add

ރިޕޯޓް
Reports

ސެޓިންގްސް
Settings
```

**Styling:**
- Dhivehi: `text-xs` (12px), Faruma font
- English: `text-[10px]` (10px), system font
- Stacked vertically for clarity

---

### 2. Dashboard

#### Quick Stats Cards

**This Month Card:**
```
މި މަސް
This Month

8
Transactions
```

**Categories Card:**
```
ބައިތައް
Categories

14
Active
```

---

### 3. Balance Card

**Header:**
```
ޖުމްލަ ބޭލެންސް
Total Balance
MVR 0.00
```

**Income/Expenses:**
```
އާމްދަނީ          ހަރަދު
Income           Expenses
MVR 0.00         MVR 0.00
```

**Net Income:**
```
ޖުމްލަ އާމްދަނީ
Net Income
MVR 0.00
```

---

### 4. Recent Transactions

**Header:**
```
ފަހުގެ ހަރަދު
Recent Transactions

[ހުރިހާ ބަލާ]
[View All]
```

---

### 5. Category Chart

**Title:**
```
ބައިތަކުން ހަރަދު
Spending by Category
```

---

### 6. Reports Page

#### Page Title
```
ރިޕޯޓް Reports
ފައިސާގެ ތަފްސީލް
```

#### Summary Cards

**Income Card:**
```
އާމްދަނީ
Income
MVR 0.00
```

**Expenses Card:**
```
ހަރަދު
Expenses
MVR 0.00
```

**Net Income Card:**
```
ޖުމްލަ އާމްދަނީ
Net Income
MVR 0.00
އިތުރު / Surplus
```

#### Chart Titles

**6-Month Trend:**
```
6 މަސްދުވަހުގެ ގްރާފް
6-Month Trend
```

**Top Categories:**
```
އެންމެ ބޮޑަށް ހަރަދުވި ބައިތައް
Top Spending Categories
```

---

### 7. Add Transaction Modal

**Options:**
```
އެސްއެމްއެސްއިން
Import from SMS
Paste your BML or MIB transaction SMS

އަމިއްލައަށް ލިޔުއްވުން
Manual Entry
Enter transaction details manually
```

---

### 8. Categories

**Dropdown Display:**
```
🍔 ކައްކާބާ (Food & Dining)
🛒 ކާބޯތަކެތި (Groceries)
🏠 ގޭގެ ހަރަދު (Housing & Utilities)
🚗 ދަތުރުފަތުރު (Transportation)
💊 ސިއްހީ (Healthcare)
🎬 މަޖާ (Entertainment)
👕 ގަތުން (Shopping)
📚 ތައުލީމް (Education)
☎️ ފޯން/އިންޓަނެޓް (Telecommunications)
⛽ ތެޔޮ (Fuel)
🏦 ބޭންކް ފީ (Bank Fees)
💰 އާމްދަނީ/މުސާރަ (Income/Salary)
🔄 ބަދަލުކުރުން (Transfer)
🔧 އެހެނިހެން (Other)
```

---

## 🎨 Typography System

### Font Sizes

| Element | Dhivehi | English |
|---------|---------|---------|
| Navigation | text-xs (12px) | text-[10px] (10px) |
| Card Labels | text-xs (12px) | text-[10px] (10px) |
| Small Labels | text-xs (12px) | text-[9px] (9px) |
| Headers | text-base (16px) | text-[10px] (10px) |
| Page Titles | text-lg (18px) | text-sm (14px) |

### Font Families

| Language | Font |
|----------|------|
| Dhivehi | Faruma (Thaana) |
| English | System Font |

### Text Alignment

| Language | Direction | Alignment |
|----------|-----------|-----------|
| Dhivehi | RTL | Right |
| English | LTR | Left |

---

## 💡 Layout Patterns

### 1. Vertical Stack (Default)

Most common pattern - Dhivehi on top, English below:

```jsx
<div>
  <span className="dhivehi block leading-tight">ދިވެހި</span>
  <span className="text-[10px] leading-tight">English</span>
</div>
```

### 2. Inline (Compact)

For space-constrained areas:

```jsx
<span>
  <span className="dhivehi">ދިވެހި</span> 
  <span className="text-[10px]">English</span>
</span>
```

### 3. Side by Side

For status or short labels:

```jsx
<p>
  <span className="dhivehi">އިތުރު</span> 
  <span className="text-[9px]">Surplus</span>
</p>
```

---

## 🎯 User Experience Benefits

### For Dhivehi Speakers
- ✅ Native language first
- ✅ Comfortable reading
- ✅ Cultural connection
- ✅ Can learn English terms

### For English Speakers
- ✅ Clear understanding
- ✅ Can use app fully
- ✅ Learn Dhivehi
- ✅ Professional feel

### For Bilingual Users
- ✅ Best of both worlds
- ✅ Quick comprehension
- ✅ Context switching easy
- ✅ Educational value

---

## 📊 Coverage Statistics

### Bilingual Elements

| Section | Elements | Coverage |
|---------|----------|----------|
| Navigation | 5 tabs | 100% |
| Dashboard | 10 labels | 100% |
| Balance Card | 5 labels | 100% |
| Transactions | 2 labels | 100% |
| Reports | 10 labels | 100% |
| Settings | 3 labels | 100% |
| Categories | 14 items | 100% |
| Modals | 2 options | 100% |

**Total: 51 bilingual UI elements** ✨

---

## 🔧 Technical Implementation

### CSS Classes

```css
/* Dhivehi text */
.dhivehi {
  font-family: 'Faruma', 'MV Waheed', sans-serif;
  direction: rtl;
  text-align: right;
}

/* Leading/line-height control */
.leading-tight {
  line-height: 1.25;
}
```

### Component Pattern

```jsx
// Bilingual Label Component Pattern
<div>
  <span className="dhivehi block leading-tight">
    ދިވެހި ލޭބަލް
  </span>
  <span className="text-[10px] text-gray-600 leading-tight">
    English Label
  </span>
</div>
```

---

## 🌍 Future Enhancements

### Planned Features

- [ ] Language toggle (Dhivehi only / English only / Both)
- [ ] User preference storage
- [ ] More languages (Hindi, Bengali)
- [ ] Dynamic translation system
- [ ] Language learning mode

### Community Contributions

We welcome:
- Translation improvements
- New language additions
- UX feedback
- Design suggestions

---

## 📱 Mobile Optimization

### Spacing Considerations

- Tight `leading-tight` for vertical stacking
- Small English text (`text-[9px]`, `text-[10px]`)
- Efficient use of screen space
- Clear hierarchy

### Touch Targets

- Navigation buttons: 44x44px minimum
- All interactive elements: Properly sized
- No text-only tap areas

---

## 🎊 Summary

**Kharadhu** now offers:

✅ **Complete Bilingual Support**
- Dhivehi + English everywhere
- Clear visual hierarchy
- Professional appearance

✅ **Cultural Authenticity**
- Dhivehi-first approach
- Beautiful Faruma font
- Respects local identity

✅ **Global Accessibility**
- English for clarity
- International standards
- Easy to understand

✅ **Educational Value**
- Learn both languages
- Context for terms
- Cultural exchange

---

**Made with ❤️ for Maldivian and International Users** 🇲🇻🌍

---

*Last updated: January 2, 2026*
