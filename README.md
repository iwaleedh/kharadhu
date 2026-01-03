# 🌊 Kharadhu - ޚަރަދު ބަރަދު ބެލެހެއްޓުން

A beautiful, modern personal expense tracker web app designed specifically for **Bank of Maldives (BML)** and **Maldives Islamic Bank (MIB)** customers. Track your expenses, import transactions from SMS, and get insights into your spending habits.

**Kharadhu** (ޚަރަދު ބަރަދު ބެލެހެއްޓުން) is your expense tracker for keeping spending under control.

![Kharadhu](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8.svg)

## ✨ Features

### 🎯 Core Features
- **📱 SMS Import** - Paste BML/MIB transaction SMS for automatic parsing
- **✏️ Manual Entry** - Add transactions manually with full control
- **📊 Visual Dashboard** - Beautiful charts and spending analytics
- **📈 Reports** - Monthly reports, category breakdowns, and trends
- **🏷️ Auto-Categorization** - Smart categorization based on merchants
- **💾 Local Storage** - Privacy-first with IndexedDB (no cloud storage)
- **📤 Export Data** - Export transactions to CSV
- **🎨 Beautiful UI** - Ocean-inspired design with Maldivian colors

### 🏦 Supported Banks
- ✅ Bank of Maldives (BML)
- ✅ Maldives Islamic Bank (MIB)

### 🏷️ Default Categories
- 🍔 Food & Dining
- 🛒 Groceries
- 🏠 Housing & Utilities
- 🚗 Transportation
- 💊 Healthcare
- 🎬 Entertainment
- 👕 Shopping
- 📚 Education
- ☎️ Telecommunications (Dhiraagu/Ooredoo)
- ⛽ Fuel (STO)
- 🏦 Bank Fees
- 💰 Income/Salary
- 🔄 Transfer
- 🔧 Other

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd maldives-expense-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5174` (or the port shown in terminal)

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` folder.

## 📱 How to Use

### 1. Import from SMS

**Example BML SMS:**
```
BML: Your account ending 1234 has been debited MVR 250.00 at FOODCO on 02-Jan-26. Balance: MVR 5,750.00
```

**Example MIB SMS:**
```
MIB Alert: Debit of MVR 150.50 from A/C ***5678 at STO MALE on 02/01/26. Avl Bal: MVR 8,500.00
```

**Steps:**
1. Click the **"+"** button in the bottom navigation
2. Choose **"Import from SMS"**
3. Copy your transaction SMS from your phone
4. Paste it into the text area
5. Click **"Parse SMS"** to extract transaction details
6. Review the parsed data
7. Click **"Import Transaction"** to save

### 2. Manual Entry

1. Click the **"+"** button in the bottom navigation
2. Choose **"Manual Entry"**
3. Fill in the transaction details
4. Click **"Add Transaction"**

## 🎨 Design & Branding

### Color Palette

- **Ocean Blue** (`#0066CC`, `#1E40AF`) - Primary, trust
- **Coral/Sunset** (`#FF6B6B`, `#F97316`) - Expenses, alerts
- **Tropical Green** (`#10B981`, `#059669`) - Income, success
- **Turquoise** (`#06B6D4`) - Accents, highlights

## 🛠️ Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **Recharts** - Data visualization
- **Dexie.js** - IndexedDB wrapper
- **Zustand** - State management
- **date-fns** - Date manipulation

## 🔒 Privacy & Security

- **Local Storage**: All data is stored locally on your device
- **No Cloud**: No data is sent to external servers
- **Privacy-First**: You own your data
- **Export Anytime**: Export your data as CSV

## 🚧 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Budget management
- [ ] Recurring transactions
- [ ] Receipt scanning (OCR)
- [ ] Cloud backup (optional)
- [ ] Open Banking API integration (when available)

---

**Made with ❤️ for Maldivian Banking Customers** 🇲🇻
