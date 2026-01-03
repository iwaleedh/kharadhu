import { useEffect, useMemo, useState } from 'react';
import Tesseract from 'tesseract.js';

// Simple image preprocessing to improve OCR (grayscale + contrast)
const preprocessImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        // Grayscale + increase contrast
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          let v = 0.299 * r + 0.587 * g + 0.114 * b; // grayscale
          // contrast boost
          v = (v - 128) * 1.2 + 128;
          v = Math.max(0, Math.min(255, v));
          data[i] = data[i + 1] = data[i + 2] = v;
        }
        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) {
              reject(new Error('Failed to preprocess image'));
              return;
            }
            resolve(blob);
          },
          'image/png',
          0.95
        );
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
};
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { getAccounts, getCategories } from '../../lib/database';
import { getCurrentUserId } from '../../lib/currentUser';
import { formatCurrency } from '../../lib/utils';

// Heuristic OCR parsing for Maldives receipts
const extractMerchant = (text) => {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  // Often the first non-empty line is merchant
  return lines[0]?.slice(0, 40) || '';
};

const extractDate = (text) => {
  // Try common formats: dd/MM/yyyy, dd-MM-yyyy, yyyy-MM-dd
  const m = text.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
  if (!m) return null;
  const s = m[1];
  // dd/MM/yyyy
  const parts = s.includes('/') ? s.split('/') : s.split('-');
  const [dd, mm, yyyy] = parts;
  const d = new Date(`${yyyy}-${mm}-${dd}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const extractTotal = (text) => {
  // Look for TOTAL like: TOTAL 110.00 or TOTAL: MVR 110.00
  const candidates = [];
  const re = /(TOTAL|AMOUNT|GRAND\s*TOTAL)\s*[:\-]?\s*(?:MVR\s*)?([0-9]+(?:[\.,][0-9]{2})?)/gi;
  let match;
  while ((match = re.exec(text)) !== null) {
    const raw = match[2].replace(',', '.');
    const val = Number(raw);
    if (Number.isFinite(val)) candidates.push(val);
  }

  // If no explicit TOTAL found, pick largest money-like number
  if (candidates.length === 0) {
    const nums = (text.match(/(?:MVR\s*)?([0-9]+(?:[\.,][0-9]{2}))/gi) || [])
      .map((s) => s.replace(/MVR\s*/i, '').replace(',', '.'))
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n));
    if (nums.length === 0) return null;
    return Math.max(...nums);
  }

  return candidates[candidates.length - 1];
};

export const ReceiptScan = ({ onImport, onCancel }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confidence, setConfidence] = useState(null);

  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [type, setType] = useState('debit');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString());
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');

  useEffect(() => {
    const load = async () => {
      const uid = Number(getCurrentUserId());
      if (!uid) return;
      const [a, c] = await Promise.all([getAccounts(uid), getCategories(uid)]);
      setAccounts(a);
      setCategories(c);

      const primary = a.find((x) => x.isPrimary) || a[0];
      if (primary) setAccountId(String(primary.id));
    };
    load();
  }, []);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const availableCategories = useMemo(() => {
    return categories.filter((c) => c.type === (type === 'credit' ? 'income' : 'expense') || c.type === 'transfer');
  }, [categories, type]);

  const handleRunOcr = async () => {
    setError('');
    setConfidence(null);
    if (!file) {
      setError('Please choose a receipt image first.');
      return;
    }
    setBusy(true);
    setProgress(0);
    try {
      // Preprocess image for better OCR
      const processed = await preprocessImage(file);

      const result = await Tesseract.recognize(processed, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text' && typeof m.progress === 'number') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      const text = result?.data?.text || '';
      setOcrText(text);
      if (typeof result?.data?.confidence === 'number') {
        setConfidence(result.data.confidence);
      }

      // Heuristic extraction
      const m = extractMerchant(text);
      const d = extractDate(text);
      const t = extractTotal(text);

      if (m) setMerchant(m);
      if (d) setDate(d);
      if (t !== null) setAmount(String(t));

      // Suggest category if Transfer detected
      if (/transfer/i.test(text) && !category) setCategory('Transfer');
    } catch (e) {
      console.error(e);
      setError('OCR failed. Try a clearer photo with good lighting.');
    } finally {
      setBusy(false);
    }
  };

  const toDateInput = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  const handleImport = async () => {
    setError('');
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setError('Amount is required and must be > 0');
      return;
    }
    if (!category) {
      setError('Please select a category');
      return;
    }
    if (!accountId) {
      setError('Please select an account');
      return;
    }

    const acc = accounts.find((a) => String(a.id) === String(accountId));

    const tx = {
      type,
      amount: amt,
      date: new Date(toDateInput(date)).toISOString(),
      category,
      merchant,
      accountId: Number(accountId),
      bank: acc?.bankName || 'Unknown',
      accountNumber: acc?.accountNumber || '',
      description: 'Receipt scan',
      receiptText: ocrText,
      receiptFileName: file?.name || '',
    };

    await onImport(tx);
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Scan Receipt (Offline OCR)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {error ? (
              <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 p-3 rounded-lg">{error}</div>
            ) : null}

            <div>
              <p className="text-xs text-gray-400 mb-2">Choose a clear receipt photo</p>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="mt-3 w-full rounded-lg border border-gray-800"
                />
              ) : null}
            </div>

            <Button
              variant="primary"
              onClick={handleRunOcr}
              disabled={busy || !file}
              className="w-full"
            >
              {busy ? `Scanning... ${progress}%` : 'Run OCR Scan'}
            </Button>

            {ocrText ? (
              <div className="text-xs text-gray-400 bg-black/30 border border-gray-800 p-3 rounded-lg max-h-40 overflow-auto">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-200">Extracted Text (saved with transaction)</p>
                  {confidence != null ? (
                    <span className={`text-xs font-semibold ${confidence >= 80 ? 'text-green-400' : confidence >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      Confidence: {Math.round(confidence)}%
                    </span>
                  ) : null}
                </div>
                <pre className="whitespace-pre-wrap">{ocrText}</pre>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Confirm Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100"
                >
                  <option value="debit">Expense</option>
                  <option value="credit">Income</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400">Amount (MVR)</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {amount ? (
                  <p className="text-xs text-gray-500 mt-1">{formatCurrency(Number(amount) || 0)}</p>
                ) : null}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400">Merchant / Shop</label>
              <Input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="e.g., STO, FOODCO" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">Date</label>
                <Input type="date" value={toDateInput(date)} onChange={(e) => setDate(new Date(e.target.value).toISOString())} />
              </div>

              <div>
                <label className="text-xs text-gray-400">Account</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100"
                >
                  <option value="">Select</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nickname} ({a.bankName} ****{a.accountNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100"
              >
                <option value="">Select a category</option>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2 pt-2">
              <Button variant="success" onClick={handleImport} className="flex-1">
                Save Transaction
              </Button>
              <Button variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
