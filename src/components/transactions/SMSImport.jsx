import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { TextArea, Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { parseSMS } from '../../lib/smsParser';
import { formatCurrency } from '../../lib/utils';
import { getAccounts, getCategories } from '../../lib/database';
import { getCurrentUserId } from '../../lib/currentUser';
import { isGeminiConfigured, parseSmsWithGemini } from '../../lib/geminiOcr';

export const SMSImport = ({ onImport, onCancel, initialText = '', autoParse = false }) => {
  const [smsText, setSmsText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Gemini AI state
  const [useGemini, setUseGemini] = useState(() => isGeminiConfigured());
  const geminiAvailable = isGeminiConfigured();
  const [aiParsing, setAiParsing] = useState(false);

  // Load user accounts and categories
  useEffect(() => {
    const loadData = async () => {
      const userId = getCurrentUserId();
      if (userId) {
        const userAccounts = await getAccounts(Number(userId));
        const userCategories = await getCategories(Number(userId));
        setAccounts(userAccounts);
        setCategories(userCategories);
      }
    };
    loadData();
  }, []);

  // Initialize with clipboard text if provided
  useEffect(() => {
    if (initialText && initialText.trim()) {
      setSmsText(initialText);
    }
  }, [initialText]);

  const handleParse = async () => {
    setError('');
    setParsedData(null);

    if (!smsText.trim()) {
      setError('Please paste an SMS message');
      return;
    }

    let result = null;

    // Try Gemini AI if available and selected
    if (useGemini && geminiAvailable) {
      setAiParsing(true);
      try {
        const aiResult = await parseSmsWithGemini(smsText);
        result = {
          type: aiResult.type,
          amount: aiResult.amount,
          merchant: aiResult.merchant,
          date: aiResult.date ? new Date(aiResult.date).toISOString() : new Date().toISOString(),
          balance: aiResult.balance,
          bank: aiResult.bank,
          accountNumber: aiResult.accountNumber,
          referenceNumber: aiResult.reference,
          category: aiResult.category,
          rawText: smsText,
        };
      } catch (aiError) {
        console.error('Gemini AI parse failed:', aiError);
        setError(`AI parsing failed: ${aiError.message}. Trying local parser...`);
        // Fall back to local parser
        try {
          result = parseSMS(smsText);
        } catch (err) {
          setError(err.message);
          setAiParsing(false);
          return;
        }
      }
      setAiParsing(false);
    } else {
      // Use local regex parser
      try {
        result = parseSMS(smsText);
      } catch (err) {
        setError(err.message);
        return;
      }
    }

    // Try to find matching account
    let accountId = null;
    if (result.bank) {
      // Try by account number first
      if (result.accountNumber) {
        const matchingAccount = accounts.find(
          acc => acc.accountNumber?.endsWith(result.accountNumber) ||
            acc.accountNumber === result.accountNumber
        );
        if (matchingAccount) {
          accountId = matchingAccount.id;
        }
      }

      // Try by bank name
      if (!accountId) {
        const bankAccount = accounts.find(acc =>
          acc.bankName?.toLowerCase().includes(result.bank.toLowerCase()) ||
          result.bank.toLowerCase().includes(acc.bankName?.toLowerCase())
        );
        if (bankAccount) {
          accountId = bankAccount.id;
        }
      }
    }

    // Fallback to primary/first account
    if (!accountId && accounts.length > 0) {
      const primaryAccount = accounts.find(acc => acc.isPrimary) || accounts[0];
      accountId = primaryAccount.id;
    }

    // Add accountId to parsed data
    setParsedData({ ...result, accountId });

    // Set initial category from parsed data
    setSelectedCategory(result.category || '');

    // Show warning if no account matched
    if (!accountId && accounts.length > 0) {
      setError('Warning: Could not match account. Using default account.');
    } else if (accounts.length === 0) {
      setError('Error: No accounts found. Please create an account first.');
      setParsedData(null);
      return;
    }
  };

  // Auto-parse when coming from clipboard
  useEffect(() => {
    if (!autoParse) return;
    if (!smsText.trim()) return;
    if (!accounts.length || !categories.length) return;

    // Avoid re-parsing if already parsed
    if (parsedData) return;

    handleParse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoParse, smsText, accounts.length, categories.length]);

  const getCategoryTypeForTx = (txType) => (txType === 'debit' ? 'expense' : 'income');

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    // Update parsed data with new category
    setParsedData(prev => ({ ...prev, category: e.target.value }));
  };

  const handleFieldChange = (field, value) => {
    setParsedData((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleTypeChange = (e) => {
    const uiType = e.target.value; // 'expense' | 'income'
    const txType = uiType === 'expense' ? 'debit' : 'credit';
    setParsedData((prev) => (prev ? { ...prev, type: txType } : prev));

    // Reset category if it doesn't match the new type
    const allowedType = uiType;
    const currentCategory = selectedCategory;
    if (currentCategory) {
      const catObj = categories.find((c) => c.name === currentCategory);
      if (catObj && catObj.type !== allowedType && catObj.type !== 'transfer') {
        setSelectedCategory('');
        setParsedData((prev) => (prev ? { ...prev, category: '' } : prev));
      }
    }
  };

  const availableBanks = Array.from(
    new Set([
      ...(accounts || []).map((a) => a.bankName),
      parsedData?.bank,
    ].filter(Boolean))
  );

  const accountsForSelectedBank = parsedData?.bank
    ? accounts.filter((a) => a.bankName === parsedData.bank)
    : accounts;

  const handleBankChange = (e) => {
    const bankName = e.target.value;
    setParsedData((prev) => {
      if (!prev) return prev;
      return { ...prev, bank: bankName };
    });

    // Auto-pick primary/first account for this bank
    const candidates = accounts.filter((a) => a.bankName === bankName);
    const pick = candidates.find((a) => a.isPrimary) || candidates[0];
    if (pick) {
      setParsedData((prev) => (prev ? {
        ...prev,
        accountId: pick.id,
        accountNumber: pick.accountNumber,
      } : prev));
    }
  };

  const handleAccountChange = (e) => {
    const accountId = Number(e.target.value);
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return;
    setParsedData((prev) => (prev ? {
      ...prev,
      accountId: account.id,
      bank: account.bankName,
      accountNumber: account.accountNumber,
    } : prev));
  };

  const toDatetimeLocalValue = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleImport = async () => {
    if (!parsedData) return;

    setLoading(true);
    try {
      await onImport(parsedData);
      setSmsText('');
      setParsedData(null);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Card className="p-3">
        <CardHeader className="mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {geminiAvailable && useGemini ? (
                <Sparkles className="text-blue-400" size={20} />
              ) : (
                <MessageSquare className="text-blue-400" size={20} />
              )}
              <CardTitle className="text-base">Import from SMS</CardTitle>
            </div>
            {geminiAvailable && (
              <button
                onClick={() => setUseGemini(!useGemini)}
                className={`text-xs px-3 py-1 rounded-full transition-all ${useGemini
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                    : 'bg-slate-700 text-slate-400 border border-slate-600'
                  }`}
              >
                {useGemini ? '✨ AI Mode' : '📝 Local'}
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {geminiAvailable && useGemini
              ? 'Paste any bank SMS in any language - AI will extract transaction details'
              : 'Paste BML or MIB transaction SMS below'
            }
          </p>
          {!geminiAvailable && (
            <p className="text-xs text-slate-500 mt-1">
              Add Gemini API key in Settings for multilingual SMS support
            </p>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <TextArea
            value={smsText}
            onChange={(e) => setSmsText(e.target.value)}
            placeholder={useGemini && geminiAvailable
              ? "Paste any bank SMS in any language..."
              : "Example: BML: Your account ending 1234 has been debited MVR 250.00 at FOODCO on 02-Jan-26. Balance: MVR 5,750.00"
            }
            rows={4}
            error={error}
            className="text-sm"
          />

          <div className="flex space-x-2 mt-3">
            <Button
              variant="primary"
              onClick={handleParse}
              disabled={!smsText.trim() || aiParsing}
              className="flex-1 text-sm"
            >
              {aiParsing ? 'AI Analyzing...' : (useGemini && geminiAvailable ? '✨ Parse with AI' : 'Parse SMS')}
            </Button>
            {onCancel && (
              <Button variant="secondary" onClick={onCancel} className="text-sm">
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {parsedData && (
        <Card className="border-2 border-green-500">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-emerald-500" size={24} />
              <CardTitle className="text-emerald-500">Transaction Parsed Successfully!</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-700 mb-1">Type</p>
                  <select
                    value={parsedData.type === 'debit' ? 'expense' : 'income'}
                    onChange={handleTypeChange}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <p className="text-xs text-gray-700 mb-1">Amount</p>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={parsedData.amount ?? ''}
                    onChange={(e) => handleFieldChange('amount', Number(e.target.value))}
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-700 mb-1">Bank</p>
                  <select
                    value={parsedData.bank || ''}
                    onChange={handleBankChange}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  >
                    {availableBanks.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-xs text-gray-700 mb-1">Account</p>
                  <select
                    value={parsedData.accountId || ''}
                    onChange={handleAccountChange}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  >
                    <option value="">Select account</option>
                    {accountsForSelectedBank.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nickname} (****{a.accountNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-xs text-gray-700 mb-1">From / Merchant</p>
                  <Input
                    type="text"
                    value={parsedData.merchant || ''}
                    onChange={(e) => handleFieldChange('merchant', e.target.value)}
                    placeholder="e.g., Fund Transfer"
                  />
                </div>

                <div className="col-span-2">
                  <p className="text-xs text-gray-700 mb-1">Category</p>
                  <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories
                      .filter(cat => {
                        const categoryType = getCategoryTypeForTx(parsedData.type);
                        return cat.type === categoryType || cat.type === 'transfer';
                      })
                      .map(cat => (
                        <option key={cat.id} value={cat.name}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-700 mt-1">
                    Auto-detected: {parsedData.category || 'None'}. You can change it above.
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-700 mb-1">Date / Time</p>
                  <Input
                    type="datetime-local"
                    value={toDatetimeLocalValue(parsedData.date)}
                    onChange={(e) => {
                      const v = e.target.value;
                      // datetime-local gives local time; convert to ISO
                      const d = new Date(v);
                      handleFieldChange('date', Number.isNaN(d.getTime()) ? parsedData.date : d.toISOString());
                    }}
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-700 mb-1">Reference No.</p>
                  <Input
                    type="text"
                    value={parsedData.referenceNumber || ''}
                    onChange={(e) => handleFieldChange('referenceNumber', e.target.value)}
                    placeholder="e.g., 122836305-67052491"
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-700 mb-1">Balance (from SMS)</p>
                  <p className="font-semibold">{formatCurrency(parsedData.balance || 0)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div>
                  <p className="text-xs text-gray-700 mb-1">Notes / Description (optional)</p>
                  <Input
                    type="text"
                    value={parsedData.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Add extra notes"
                  />
                </div>

                <Button
                  variant="success"
                  onClick={handleImport}
                  disabled={loading || !selectedCategory || !parsedData?.amount}
                  className="w-full"
                >
                  {loading ? 'Importing...' : 'Import Transaction'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Example SMS Templates */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Example SMS Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-xs">
            <div>
              <p className="font-semibold text-orange-600 mb-1">BML Example:</p>
              <p className="text-gray-800 bg-white p-2 rounded">
                BML: Your account ending 1234 has been debited MVR 250.00 at FOODCO on 02-Jan-26. Balance: MVR 5,750.00
              </p>
            </div>
            <div>
              <p className="font-semibold text-orange-600 mb-1">MIB Example (Debit):</p>
              <p className="text-gray-800 bg-white p-2 rounded">
                MIB Alert: Debit of MVR 150.50 from A/C ***5678 at STO MALE on 02/01/26. Avl Bal: MVR 8,500.00
              </p>
            </div>
            <div>
              <p className="font-semibold text-orange-600 mb-1">MIB Example (Fund Transfer - Income):</p>
              <p className="text-gray-800 bg-white p-2 rounded">
                Fund Transfer from your account 99010***72100 for MVR 110.00 was processed on 01/01/2026 11:34:47. Ref. no. 122836305-67052491
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
