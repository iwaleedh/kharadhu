import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate, formatCurrency, groupByCategory, calculateTotalByType } from './utils';

/**
 * Generate a PDF expense report from transactions
 */
export const generatePDFReport = (transactions, categories, user) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38); // Red color
    doc.text('Kharadhu', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Expense Report', pageWidth / 2, 28, { align: 'center' });

    // Report date
    doc.setFontSize(10);
    doc.text(`Generated: ${formatDate(new Date(), 'dd MMM yyyy, HH:mm')}`, pageWidth / 2, 35, { align: 'center' });

    if (user?.name) {
        doc.text(`Account: ${user.name}`, pageWidth / 2, 41, { align: 'center' });
    }

    // Summary section
    const totalIncome = calculateTotalByType(transactions, 'credit');
    const totalExpenses = calculateTotalByType(transactions, 'debit');
    const netBalance = totalIncome - totalExpenses;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary', 14, 55);

    doc.setFontSize(11);
    doc.setTextColor(34, 197, 94); // Green
    doc.text(`Total Income: ${formatCurrency(totalIncome)}`, 14, 65);

    doc.setTextColor(220, 38, 38); // Red
    doc.text(`Total Expenses: ${formatCurrency(totalExpenses)}`, 14, 72);

    doc.setTextColor(0, 0, 0);
    doc.text(`Net Balance: ${formatCurrency(netBalance)}`, 14, 79);
    doc.text(`Transactions: ${transactions.length}`, 14, 86);

    // Date range if transactions exist
    if (transactions.length > 0) {
        const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a - b);
        const startDate = formatDate(dates[0], 'dd MMM yyyy');
        const endDate = formatDate(dates[dates.length - 1], 'dd MMM yyyy');
        doc.text(`Period: ${startDate} - ${endDate}`, 14, 93);
    }

    // Category breakdown
    const expenseTransactions = transactions.filter(t => t.type === 'debit');
    const categoryBreakdown = groupByCategory(expenseTransactions);

    if (categoryBreakdown.length > 0) {
        doc.setFontSize(14);
        doc.text('Spending by Category', 14, 108);

        const categoryData = categoryBreakdown.slice(0, 10).map(cat => [
            cat.category,
            cat.count.toString(),
            formatCurrency(cat.total),
            totalExpenses > 0 ? `${((cat.total / totalExpenses) * 100).toFixed(1)}%` : '0%'
        ]);

        doc.autoTable({
            startY: 113,
            head: [['Category', 'Count', 'Amount', '%']],
            body: categoryData,
            theme: 'striped',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [220, 38, 38] },
            columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 45, halign: 'right' },
                3: { cellWidth: 25, halign: 'right' },
            },
        });
    }

    // Recent transactions table
    const startY = doc.lastAutoTable?.finalY + 15 || 160;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Transactions', 14, startY);

    // Limit to most recent 50 transactions for the PDF
    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 50);

    const tableData = recentTransactions.map(t => [
        formatDate(new Date(t.date), 'dd/MM/yy'),
        t.type === 'credit' ? 'Income' : 'Expense',
        (t.merchant || t.category || '-').substring(0, 25),
        formatCurrency(t.amount),
    ]);

    doc.autoTable({
        startY: startY + 5,
        head: [['Date', 'Type', 'Details', 'Amount']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [220, 38, 38] },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 20 },
            2: { cellWidth: 80 },
            3: { cellWidth: 40, halign: 'right' },
        },
        didDrawPage: (data) => {
            // Footer on each page
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                `Page ${data.pageNumber} of ${pageCount}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        },
    });

    // Download the PDF
    const fileName = `kharadhu-report-${formatDate(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);

    return fileName;
};

/**
 * Generate a monthly summary PDF
 */
export const generateMonthlySummaryPDF = (transactions, categories, month, year) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

    // Filter transactions for the month
    const monthlyTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === month && date.getFullYear() === year;
    });

    // Header
    doc.setFontSize(20);
    doc.setTextColor(220, 38, 38);
    doc.text('Monthly Report', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(`${monthName} ${year}`, pageWidth / 2, 28, { align: 'center' });

    // Summary
    const totalIncome = calculateTotalByType(monthlyTransactions, 'credit');
    const totalExpenses = calculateTotalByType(monthlyTransactions, 'debit');

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary', 14, 45);

    doc.setFontSize(10);
    doc.text(`Income: ${formatCurrency(totalIncome)}`, 14, 55);
    doc.text(`Expenses: ${formatCurrency(totalExpenses)}`, 14, 62);
    doc.text(`Net: ${formatCurrency(totalIncome - totalExpenses)}`, 14, 69);
    doc.text(`Transactions: ${monthlyTransactions.length}`, 14, 76);

    // Category breakdown
    const expenseTransactions = monthlyTransactions.filter(t => t.type === 'debit');
    const categoryBreakdown = groupByCategory(expenseTransactions);

    if (categoryBreakdown.length > 0) {
        doc.setFontSize(12);
        doc.text('Expenses by Category', 14, 90);

        const categoryData = categoryBreakdown.map(cat => [
            cat.category,
            formatCurrency(cat.total),
        ]);

        doc.autoTable({
            startY: 95,
            head: [['Category', 'Amount']],
            body: categoryData,
            theme: 'striped',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [220, 38, 38] },
        });
    }

    const fileName = `kharadhu-${monthName.toLowerCase()}-${year}.pdf`;
    doc.save(fileName);

    return fileName;
};
