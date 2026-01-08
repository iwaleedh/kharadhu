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
import { Trash2, Plus, Edit2, Check, X } from 'lucide-react';

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
  const m = text.match(/(\d{2}[/-]\d{2}[/-]\d{4})/);
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
  const re = /(TOTAL|AMOUNT|GRAND\s*TOTAL)\s*[:-]?\s*(?:MVR\s*)?([0-9]+(?:[.,][0-9]{2})?)/gi;
  let match;
  while ((match = re.exec(text)) !== null) {
    const raw = match[2].replace(',', '.');
    const val = Number(raw);
    if (Number.isFinite(val)) candidates.push(val);
  }

  // If no explicit TOTAL found, pick largest money-like number
  if (candidates.length === 0) {
    const nums = (text.match(/(?:MVR\s*)?([0-9]+(?:[.,][0-9]{2}))/gi) || [])
      .map((s) => s.replace(/MVR\s*/i, '').replace(',', '.'))
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n));
    if (nums.length === 0) return null;
    return Math.max(...nums);
  }

  return candidates[candidates.length - 1];
};

// NEW: Extract individual line items from receipt text
const extractLineItems = (text) => {
  const lines = text.split('\n');
  const items = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Skip headers, totals, tax lines, etc.
    if (/^(total|subtotal|sub-total|tax|vat|gst|change|cash|card|balance|amount|payment|thank|receipt|invoice|date|time|tel|phone|address)/i.test(trimmed)) continue;
    if (/^\d{2}[/-]\d{2}[/-]\d{4}/.test(trimmed)) continue; // Skip date lines
    if (/^\d{2}:\d{2}/.test(trimmed)) continue; // Skip time lines

    // Match patterns:
    // 1. "Item Name    12.50" or "Item Name MVR 12.50"
    // 2. "2x Item Name    25.00" or "Item Name x2    25.00"
    // 3. "Item Name @ 12.50    25.00"

    // Pattern: text followed by price at end
    const priceMatch = trimmed.match(/^(.+?)\s+(?:MVR\s*)?(\d+(?:[.,]\d{2})?)\s*$/);
    if (priceMatch) {
      let itemName = priceMatch[1].trim();
      const price = parseFloat(priceMatch[2].replace(',', '.'));

      if (price > 0 && itemName.length > 1) {
        // Check for quantity prefix like "2x " or "2 x "
        let quantity = 1;
        const qtyMatch = itemName.match(/^(\d+)\s*[xX]\s*(.+)/);
        if (qtyMatch) {
          quantity = parseInt(qtyMatch[1], 10);
          itemName = qtyMatch[2].trim();
        }

        // Check for quantity suffix like " x2"
        const qtySuffixMatch = itemName.match(/(.+?)\s*[xX]\s*(\d+)$/);
        if (qtySuffixMatch) {
          itemName = qtySuffixMatch[1].trim();
          quantity = parseInt(qtySuffixMatch[2], 10);
        }

        items.push({
          id: Date.now() + Math.random(),
          name: itemName,
          price: price,
          category: '',
          quantity: quantity || 1,
        });
      }
    }
  }

  return items;
};

// NEW: Auto-categorize items based on keywords
const CATEGORY_KEYWORDS = {
  'Food & Dining': ['rice', 'fish', 'chicken', 'meat', 'vegetable', 'fruit', 'bread', 'milk', 'coffee', 'tea', 'juice', 'water', 'snack', 'biscuit', 'noodle', 'pasta', 'egg', 'cheese', 'butter', 'sugar', 'salt', 'oil', 'sauce', 'curry', 'roshi', 'mas', 'garudhiya', 'hedhika', 'bajiya', 'gulha', 'rihaakuru', 'pizza', 'burger', 'sandwich', 'salad', 'soup', 'meal', 'lunch', 'dinner', 'breakfast'],
  'Groceries': ['soap', 'shampoo', 'detergent', 'tissue', 'toothpaste', 'cleaning', 'bleach', 'dishwash', 'laundry', 'conditioner', 'lotion', 'cream', 'deodorant'],
  'Beverages': ['cola', 'pepsi', 'sprite', 'fanta', 'redbull', 'monster', 'soda', 'drink', 'iced tea', 'mineral'],
  'Transport': ['fuel', 'petrol', 'diesel', 'taxi', 'ferry', 'speedboat', 'dhoni', 'gas'],
  'Healthcare': ['medicine', 'panadol', 'vitamin', 'bandage', 'tablet', 'syrup', 'capsule', 'aspirin', 'paracetamol'],
  'Electronics': ['battery', 'cable', 'charger', 'adapter', 'usb', 'phone', 'earphone', 'headphone'],
  'Clothing': ['shirt', 'pants', 'dress', 'shoes', 'sandal', 'socks', 'underwear', 'bra'],
  'Entertainment': ['movie', 'game', 'ticket', 'subscription'],
  'Baby & Kids': ['diaper', 'nappy', 'baby', 'formula', 'milk powder', 'pacifier'],
  'Stationery': ['pen', 'pencil', 'paper', 'notebook', 'book', 'eraser', 'ruler'],
};

const autoCategorize = (itemName, availableCategories) => {
  const lower = itemName.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      // Check if this category exists in user's categories
      const found = availableCategories.find(c =>
        c.name.toLowerCase() === category.toLowerCase()
      );
      return found ? found.name : category;
    }
  }

  return 'Groceries'; // Default category for receipt items
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

  // Single transaction mode state
  const [type, setType] = useState('debit');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString());
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');

  // NEW: Multi-item mode state
  const [parsedItems, setParsedItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'items'
  const [savingItems, setSavingItems] = useState(false);

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
    setParsedItems([]);
    setViewMode('single');

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

      // Heuristic extraction for single transaction
      const m = extractMerchant(text);
      const d = extractDate(text);
      const t = extractTotal(text);

      if (m) setMerchant(m);
      if (d) setDate(d);
      if (t !== null) setAmount(String(t));

      // Suggest category if Transfer detected
      if (/transfer/i.test(text) && !category) setCategory('Transfer');

      // NEW: Extract line items
      const items = extractLineItems(text);
      if (items.length > 0) {
        // Auto-categorize each item
        const categorizedItems = items.map(item => ({
          ...item,
          category: autoCategorize(item.name, categories),
        }));
        setParsedItems(categorizedItems);

        // If multiple items found, suggest items view
        if (items.length > 1) {
          setViewMode('items');
        }
      }

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

  // Single transaction import
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

  // NEW: Item editing functions
  const handleUpdateItem = (itemId, field, value) => {
    setParsedItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const handleDeleteItem = (itemId) => {
    setParsedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now() + Math.random(),
      name: 'New Item',
      price: 0,
      category: 'Groceries',
      quantity: 1,
    };
    setParsedItems(prev => [...prev, newItem]);
    setEditingItemId(newItem.id);
  };

  // NEW: Save all items as separate transactions
  const handleSaveAllItems = async () => {
    setError('');

    if (parsedItems.length === 0) {
      setError('No items to save');
      return;
    }
    if (!accountId) {
      setError('Please select an account');
      return;
    }

    const acc = accounts.find((a) => String(a.id) === String(accountId));
    setSavingItems(true);

    try {
      for (const item of parsedItems) {
        if (item.price <= 0) continue;

        const tx = {
          type: 'debit',
          amount: item.price * item.quantity,
          date: new Date(toDateInput(date)).toISOString(),
          category: item.category || 'Groceries',
          merchant: merchant || 'Receipt Purchase',
          accountId: Number(accountId),
          bank: acc?.bankName || 'Unknown',
          accountNumber: acc?.accountNumber || '',
          description: `${item.quantity > 1 ? `${item.quantity}x ` : ''}${item.name}`,
          receiptText: ocrText,
          receiptFileName: file?.name || '',
        };

        await onImport(tx);
      }
    } catch (e) {
      setError('Failed to save some items');
      console.error(e);
    } finally {
      setSavingItems(false);
    }
  };

  // Calculate items total
  const itemsTotal = useMemo(() => {
    return parsedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [parsedItems]);

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Scan Receipt (Offline OCR)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {error ? (
              <div className="text-sm text-red-900 bg-red-950/30 border border-red-200/50 p-3 rounded-lg">{error}</div>
            ) : null}

            <div>
              <p className="text-xs text-gray-700 mb-2">Choose a clear receipt photo</p>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="mt-3 w-full rounded-lg border border-gray-200"
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
              <div className="text-xs text-gray-700 bg-white border border-gray-200 p-3 rounded-lg max-h-40 overflow-auto">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-700">Extracted Text (saved with transaction)</p>
                  {confidence != null ? (
                    <span className={`text-xs font-semibold ${confidence >= 80 ? 'text-emerald-500' : confidence >= 60 ? 'text-yellow-400' : 'text-red-900'}`}>
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

      {/* View Mode Toggle - only show if items found */}
      {parsedItems.length > 0 && (
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setViewMode('single')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${viewMode === 'single'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Single Transaction
          </button>
          <button
            onClick={() => setViewMode('items')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${viewMode === 'items'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Item List ({parsedItems.length})
          </button>
        </div>
      )}

      {/* Items List View */}
      {viewMode === 'items' && parsedItems.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Parsed Items</CardTitle>
              <Button variant="secondary" onClick={handleAddItem} className="text-xs py-1 px-2">
                <Plus size={14} className="mr-1" /> Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {parsedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {editingItemId === item.id ? (
                    // Editing mode
                    <div className="space-y-2">
                      <Input
                        value={item.name}
                        onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                        placeholder="Item name"
                        className="text-sm"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value, 10) || 1)}
                          placeholder="Qty"
                          className="text-sm"
                        />
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="Price"
                          step="0.01"
                          className="text-sm"
                        />
                        <select
                          value={item.category}
                          onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded-lg bg-white"
                        >
                          {availableCategories.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingItemId(null)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.quantity > 1 && <span className="text-orange-600">{item.quantity}x </span>}
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-bold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => setEditingItemId(item.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Items Total */}
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-800">Total ({parsedItems.length} items)</span>
                <span className="text-lg font-bold text-orange-600">{formatCurrency(itemsTotal)}</span>
              </div>
            </div>

            {/* Common fields for items */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-700">Merchant / Shop</label>
                  <Input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="e.g., STO, FOODCO" />
                </div>
                <div>
                  <label className="text-xs text-gray-700">Date</label>
                  <Input type="date" value={toDateInput(date)} onChange={(e) => setDate(new Date(e.target.value).toISOString())} />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-700">Account</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="">Select</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nickname} ({a.bankName} ****{a.accountNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  variant="success"
                  onClick={handleSaveAllItems}
                  disabled={savingItems || parsedItems.length === 0}
                  className="flex-1"
                >
                  {savingItems ? 'Saving...' : `Save ${parsedItems.length} Items`}
                </Button>
                <Button variant="secondary" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Single Transaction View */}
      {viewMode === 'single' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Confirm Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-700">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                  >
                    <option value="debit">Expense</option>
                    <option value="credit">Income</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-700">Amount (MVR)</label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  {amount ? (
                    <p className="text-xs text-gray-700 mt-1">{formatCurrency(Number(amount) || 0)}</p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-700">Merchant / Shop</label>
                <Input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="e.g., STO, FOODCO" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-700">Date</label>
                  <Input type="date" value={toDateInput(date)} onChange={(e) => setDate(new Date(e.target.value).toISOString())} />
                </div>

                <div>
                  <label className="text-xs text-gray-700">Account</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
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
                <label className="text-xs text-gray-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
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
      )}
    </div>
  );
};
