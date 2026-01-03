import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-MV', {
    style: 'currency',
    currency: 'MVR',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  return format(new Date(date), formatStr);
};

// Get month range
export const getMonthRange = (monthsAgo = 0) => {
  const date = subMonths(new Date(), monthsAgo);
  return {
    start: startOfMonth(date).toISOString(),
    end: endOfMonth(date).toISOString(),
  };
};

// Calculate total by type
export const calculateTotalByType = (transactions, type) => {
  return transactions
    .filter(t => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);
};

// Group transactions by category
export const groupByCategory = (transactions) => {
  const grouped = {};
  
  transactions.forEach(transaction => {
    const category = transaction.category || 'Other';
    if (!grouped[category]) {
      grouped[category] = {
        category,
        total: 0,
        count: 0,
        transactions: [],
      };
    }
    grouped[category].total += transaction.amount;
    grouped[category].count += 1;
    grouped[category].transactions.push(transaction);
  });
  
  return Object.values(grouped).sort((a, b) => b.total - a.total);
};

// Group transactions by date
export const groupByDate = (transactions) => {
  const grouped = {};
  
  transactions.forEach(transaction => {
    const date = formatDate(transaction.date, 'dd MMM yyyy');
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(transaction);
  });
  
  return grouped;
};

// Calculate monthly summary
export const calculateMonthlySummary = (transactions, monthRange) => {
  const filtered = transactions.filter(t => 
    isWithinInterval(new Date(t.date), {
      start: new Date(monthRange.start),
      end: new Date(monthRange.end),
    })
  );
  
  const income = calculateTotalByType(filtered, 'credit');
  const expenses = calculateTotalByType(filtered, 'debit');
  const netIncome = income - expenses;
  
  return {
    income,
    expenses,
    netIncome,
    transactionCount: filtered.length,
    categoryBreakdown: groupByCategory(filtered.filter(t => t.type === 'debit')),
  };
};

// Export to CSV
export const exportToCSV = (transactions) => {
  const headers = ['Date', 'Type', 'Amount', 'Category', 'Merchant', 'Bank', 'Account', 'Balance', 'Description'];
  
  const rows = transactions.map(t => [
    formatDate(t.date, 'yyyy-MM-dd'),
    t.type,
    t.amount,
    t.category,
    t.merchant || '',
    t.bank || '',
    t.accountNumber || '',
    t.balance || '',
    t.description || '',
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};

// Download CSV file
export const downloadCSV = (transactions, filename = 'transactions.csv') => {
  const csvContent = exportToCSV(transactions);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Generate random color
export const generateColor = () => {
  const colors = [
    '#FF6B6B', '#F97316', '#F59E0B', '#10B981', '#06B6D4',
    '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#059669',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Class names utility (similar to clsx)
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
