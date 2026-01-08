import { parse } from 'date-fns';

// Bank SMS patterns
const bankParsers = {
  BML: {
    identifier: /Transaction from|BML/i,
    patterns: {
      // New BML format: "Transaction from 1621 on 31/12/25 at 10:18:03 for MVR265.00"
      amount: /for\s+MVR\s*([\d,]+\.?\d*)/i,
      merchant: /at\s+([A-Z0-9\s]+)\s+was\s+processed/i,
      date: /on\s+(\d{2}\/\d{2}\/\d{2})/i,
      time: /at\s+(\d{2}:\d{2}:\d{2})/i,
      reference: /Reference\s+No:(\d+)/i,
      approval: /Approval\s+Code:(\d+)/i,
      account: /from\s+(\d{4})/i,

      // Old BML format support
      debit: /debited\s+MVR\s+([\d,]+\.?\d*)/i,
      credit: /credited\s+MVR\s+([\d,]+\.?\d*)/i,
      balance: /Balance:\s*MVR\s*([\d,]+\.?\d*)/i,
    }
  },
  MIB: {
    identifier: /MIB|POS PURCHASE|E-COMMERCE TRX|Favara Transfer|Fund Transfer/i,
    patterns: {
      // New MIB formats: 
      // - POS PURCHASE: "Your POS PURCHASE from ***7894 for 38.08 MVR at CHEFBITE, MV on 29.10.25 16:55"
      // - E-COMMERCE: "Your E-COMMERCE TRX from ***7894 for 513.00 MVR at DHIVEHI RAAJJEYGE GULH, MV on 29.10.25 20:02"
      // - FAVARA TRANSFER: "Favara Transfer from your account 99010***72100 for MVR 8000.00 was processed on 02/01/2026 12:32:38"
      // Supports both: "for 38.08 MVR" and "for MVR 110.00"
      amount: /for\s+(?:MVR\s*)?([\d,]+\.?\d*)\s*(?:MVR)?/i,
      merchant: /at\s+([A-Z0-9\s,]+?)(?:\s+on\s+\d{2}\.\d{2}\.\d{2})/i,

      // Date patterns for different formats
      date: /on\s+(\d{2}\.\d{2}\.\d{2})\s+(\d{2}:\d{2})/i,
      dateLong: /on\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2}:\d{2})/i, // Favara: 02/01/2026 12:32:38
      time: /on\s+\d{2}\.\d{2}\.\d{2}\s+(\d{2}:\d{2})/i,
      timeLong: /on\s+\d{2}\/\d{2}\/\d{4}\s+(\d{2}:\d{2}:\d{2})/i,

      // Account patterns
      account: /from\s+\*+(\d{4,5})/i, // Support both ***7894 and ***72100
      accountLong: /account\s+(\d+\*+\d+)/i, // Favara: 99010***72100

      // Reference and approval
      approval: /Approval Code:\s*(\d+)/i,
      reference: /Ref\.\s*no\.\s*([\d-]+)/i, // Favara: 734074219-767178523

      // Old MIB format support
      debit: /Debit\s+of\s+MVR\s+([\d,]+\.?\d*)/i,
      credit: /Credit\s+of\s+MVR\s+([\d,]+\.?\d*)/i,
      balance: /(?:Avl Bal|Balance):\s*MVR\s*([\d,]+\.?\d*)/i,
    }
  },
};

// Merchant to category mapping
const merchantCategories = {
  'FOODCO': 'Groceries',
  'AGORA': 'Groceries',
  'STO': 'Fuel',
  'SHELL': 'Fuel',
  'DHIRAAGU': 'Telecommunications',
  'OOREDOO': 'Telecommunications',
  'STELCO': 'Housing & Utilities',
  'MWSC': 'Housing & Utilities',
  'FENAKA': 'Housing & Utilities',
  'STATE BANK': 'Bank Fees',
  'BML': 'Bank Fees',
  'MIB': 'Bank Fees',
  'SALSA': 'Food & Dining',
  'SEAGULL': 'Food & Dining',
  'THAI WOK': 'Food & Dining',
  'PIZZA': 'Food & Dining',
  'CAFE': 'Food & Dining',
  'RESTAURANT': 'Food & Dining',
  'HOTEL': 'Food & Dining',
  'PHARMACY': 'Healthcare',
  'HOSPITAL': 'Healthcare',
  'CLINIC': 'Healthcare',
  'ADK': 'Healthcare',
  'IGMH': 'Healthcare',
  'CINEMA': 'Entertainment',
  'MOVIE': 'Entertainment',
  'GYM': 'Entertainment',
  'MAJEEDEE': 'Shopping',
  'CHAANDANEE': 'Shopping',
  'SALARY': 'Income/Salary',
  'TRANSFER': 'Transfer',
};

// Helper function to clean amount string
const parseAmount = (amountStr) => {
  if (!amountStr) return 0;
  return parseFloat(amountStr.replace(/,/g, ''));
};

// Helper function to parse date
const parseDate = (dateStr, bank, timeStr = null) => {
  try {
    if (bank === 'BML') {
      // New format: 31/12/25 at 10:18:03
      if (dateStr.includes('/')) {
        let dateTimeStr = dateStr;
        if (timeStr) {
          dateTimeStr = `${dateStr} ${timeStr}`;
          const parsed = parse(dateTimeStr, 'dd/MM/yy HH:mm:ss', new Date());
          return parsed.toISOString();
        } else {
          const parsed = parse(dateStr, 'dd/MM/yy', new Date());
          return parsed.toISOString();
        }
      }
      // Old format: 02-Jan-26
      const parsed = parse(dateStr, 'dd-MMM-yy', new Date());
      return parsed.toISOString();
    } else if (bank === 'MIB') {
      // Favara Transfer format: 02/01/2026 12:32:38 (full year)
      if (dateStr.includes('/') && dateStr.length > 8) {
        let dateTimeStr = dateStr;
        if (timeStr) {
          dateTimeStr = `${dateStr} ${timeStr}`;
          const parsed = parse(dateTimeStr, 'dd/MM/yyyy HH:mm:ss', new Date());
          return parsed.toISOString();
        } else {
          const parsed = parse(dateStr, 'dd/MM/yyyy', new Date());
          return parsed.toISOString();
        }
      }
      // MIB POS format: 29.10.25 16:55
      else if (dateStr.includes('.')) {
        let dateTimeStr = dateStr;
        if (timeStr) {
          dateTimeStr = `${dateStr} ${timeStr}`;
          const parsed = parse(dateTimeStr, 'dd.MM.yy HH:mm', new Date());
          return parsed.toISOString();
        } else {
          const parsed = parse(dateStr, 'dd.MM.yy', new Date());
          return parsed.toISOString();
        }
      }
      // Old format: 02/01/26
      else if (dateStr.includes('/')) {
        const parsed = parse(dateStr, 'dd/MM/yy', new Date());
        return parsed.toISOString();
      }
    }
  } catch (error) {
    console.error('Date parsing error:', error);
  }
  return new Date().toISOString();
};

// Categorize based on merchant name
const categorizeTransaction = (merchant) => {
  if (!merchant) return 'Other';

  const merchantUpper = merchant.trim().toUpperCase();

  // Check exact matches
  for (const [key, category] of Object.entries(merchantCategories)) {
    if (merchantUpper.includes(key)) {
      return category;
    }
  }

  // Default category
  return 'Other';
};

// Main SMS parser
export const parseSMS = (smsText) => {
  if (!smsText || typeof smsText !== 'string') {
    throw new Error('Invalid SMS text');
  }

  // Detect bank
  let bank = null;
  let parser = null;

  for (const [bankName, config] of Object.entries(bankParsers)) {
    if (config.identifier.test(smsText)) {
      bank = bankName;
      parser = config.patterns;
      break;
    }
  }

  if (!bank || !parser) {
    throw new Error('Unable to detect bank. Please ensure the SMS is from BML or MIB.');
  }

  // Extract transaction details
  const amountMatch = smsText.match(parser.amount);
  const debitMatch = smsText.match(parser.debit);
  const creditMatch = smsText.match(parser.credit);
  const balanceMatch = smsText.match(parser.balance);
  const merchantMatch = smsText.match(parser.merchant);
  const accountMatch = smsText.match(parser.account);
  const accountLongMatch = smsText.match(parser.accountLong);
  const dateMatch = smsText.match(parser.date);
  const dateLongMatch = smsText.match(parser.dateLong);
  const timeMatch = smsText.match(parser.time);
  const timeLongMatch = smsText.match(parser.timeLong);
  const referenceMatch = smsText.match(parser.reference);
  const approvalMatch = smsText.match(parser.approval);

  // Determine transaction type and amount
  let type, amount;

  // New BML format (Transaction from...)
  if (amountMatch && smsText.includes('Transaction from')) {
    type = 'debit'; // Transactions are usually expenses
    amount = parseAmount(amountMatch[1]);
  }
  // New MIB POS format (POS PURCHASE)
  else if (amountMatch && smsText.includes('POS PURCHASE')) {
    type = 'debit'; // POS purchases are expenses
    amount = parseAmount(amountMatch[1]);
  }
  // New MIB E-COMMERCE format (E-COMMERCE TRX)
  else if (amountMatch && smsText.includes('E-COMMERCE TRX')) {
    type = 'debit'; // E-commerce purchases are expenses
    amount = parseAmount(amountMatch[1]);
  }
  // New MIB FAVARA TRANSFER format (Money Transfer)
  else if (amountMatch && smsText.includes('Favara Transfer')) {
    type = 'debit'; // Transfers are outgoing (expense/transfer)
    amount = parseAmount(amountMatch[1]);
  }
  // MIB FUND TRANSFER format (incoming funds in user's use-case)
  else if (amountMatch && smsText.includes('Fund Transfer')) {
    type = 'credit';
    amount = parseAmount(amountMatch[1]);
  }
  // Old BML format
  else if (debitMatch) {
    type = 'debit';
    amount = parseAmount(debitMatch[1]);
  } else if (creditMatch) {
    type = 'credit';
    amount = parseAmount(creditMatch[1]);
  } else {
    throw new Error('Unable to extract transaction amount');
  }

  let merchant = merchantMatch ? merchantMatch[1].trim() : '';

  // For Transfer messages, set a consistent merchant label
  if (smsText.includes('Favara Transfer')) {
    merchant = 'Money Transfer';
  }
  if (smsText.includes('Fund Transfer')) {
    merchant = 'Fund Transfer';
  }

  // Clean up merchant name (remove country codes, extra spaces)
  merchant = merchant.replace(/,\s*MV\s*$/i, '').trim(); // Remove ", MV" suffix

  // Force category for transfers
  const category = smsText.includes('Fund Transfer') || smsText.includes('Favara Transfer')
    ? 'Transfer'
    : categorizeTransaction(merchant);
  const balance = balanceMatch ? parseAmount(balanceMatch[1]) : null;

  // Get account number
  // - Short format (***7894) -> last4
  // - Long format (99010***72100) -> keep raw, derive last4
  let accountNumberRaw = null;
  let accountNumber = accountMatch ? accountMatch[1] : null;
  if (accountNumber) {
    accountNumberRaw = accountNumber;
  }
  if (!accountNumber && accountLongMatch && accountLongMatch[1]) {
    accountNumberRaw = accountLongMatch[1]; // e.g., "99010***72100"
    const last4 = accountNumberRaw.match(/(\d{4})\s*$/);
    accountNumber = last4 ? last4[1] : accountNumberRaw;
  }

  const referenceNumber = referenceMatch ? referenceMatch[1] : null;
  const approvalCode = approvalMatch ? approvalMatch[1] : null;

  // Parse date with time - prefer long format for Favara Transfer
  let timeStr = timeMatch ? timeMatch[1] : null;
  let dateStr = dateMatch ? dateMatch[1] : null;

  if (dateLongMatch) {
    dateStr = dateLongMatch[1];
    timeStr = dateLongMatch[2];
  }
  if (timeLongMatch && !timeStr) {
    timeStr = timeLongMatch[1];
  }

  const date = dateStr ? parseDate(dateStr, bank, timeStr) : new Date().toISOString();

  // Build description with reference number
  let description = `Transaction at ${merchant || 'Unknown'}`;
  if (referenceNumber) {
    description += ` (Ref: ${referenceNumber})`;
  }

  return {
    date,
    type,
    amount,
    currency: 'MVR',
    category,
    merchant,
    accountNumber,
    accountNumberRaw,
    bank,
    balance,
    description,
    referenceNumber,
    approvalCode,
    time: timeStr,
    rawSMS: smsText,
  };
};

// Test function
export const testSMSParser = () => {
  const testSMS = [
    // New BML format
    'Transaction from 1621 on 31/12/25 at 10:18:03 for MVR265.00 at MARRYBROWN MALDIVES was processed. Reference No:123116608083, Approval Code:986780.',
    // Old BML formats
    'BML: Your account ending 1234 has been debited MVR 250.00 at FOODCO on 02-Jan-26. Balance: MVR 5,750.00',
    'BML: Your account ending 1234 has been credited MVR 10,000.00 on 01-Jan-26. Balance: MVR 15,750.00',
    // New MIB POS format
    'Your POS PURCHASE from ***7894 for 38.08 MVR at CHEFBITE, MV on 29.10.25 16:55 was processed successfully. Approval Code: 541461',
    // New MIB E-COMMERCE format
    'Your E-COMMERCE TRX from ***7894 for 513.00 MVR at DHIVEHI RAAJJEYGE GULH, MV on 29.10.25 20:02 was processed successfully. Approval Code: 164784',
    // New MIB FAVARA TRANSFER format
    'Favara Transfer from your account 99010***72100 for MVR 8000.00 was processed on 02/01/2026 12:32:38. Ref. no. 734074219-767178523',
    // Old MIB formats
    'MIB Alert: Debit of MVR 150.50 from A/C ***5678 at STO MALE on 02/01/26. Avl Bal: MVR 8,500.00',
    'MIB Alert: Credit of MVR 5,000.00 to A/C ***5678 on 02/01/26. Avl Bal: MVR 13,500.00',
  ];

  console.log('Testing SMS Parser:');
  testSMS.forEach((sms, index) => {
    try {
      const result = parseSMS(sms);
      console.log(`\nTest ${index + 1}:`, result);
    } catch (error) {
      console.error(`Test ${index + 1} failed:`, error.message);
    }
  });
};
