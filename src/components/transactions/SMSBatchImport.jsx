import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { parseSMS } from '../../lib/smsParser';

// Split clipboard text into likely individual SMS messages.
const splitMessages = (text) => {
  const t = (text || '').trim();
  if (!t) return [];

  // Common separators: blank lines, "----", "\n\n"
  const parts = t
    .split(/\n\s*\n|\n-{3,}\n|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // If it didn't split, attempt by bank markers.
  if (parts.length <= 1) {
    const lines = t.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    // Group lines into chunks beginning with known identifiers
    const chunks = [];
    let current = [];
    const isStart = (l) => /^(BML:|MIB\b|Your POS PURCHASE|Your E-COMMERCE TRX|Favara Transfer|Fund Transfer)/i.test(l);
    for (const line of lines) {
      if (isStart(line) && current.length) {
        chunks.push(current.join(' '));
        current = [line];
      } else {
        current.push(line);
      }
    }
    if (current.length) chunks.push(current.join(' '));
    return chunks;
  }

  return parts;
};

export const SMSBatchImport = ({ text, onCancel, onImportMany }) => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const msgs = splitMessages(text);
      const parsed = msgs.map((m, idx) => {
        try {
          return { id: idx, raw: m, parsed: parseSMS(m), ok: true, selected: true };
        } catch (e) {
          return { id: idx, raw: m, parsed: null, ok: false, selected: false, err: e?.message || 'Parse failed' };
        }
      });
      setItems(parsed);
    } catch (e) {
      setError(e?.message || 'Failed to split messages');
    }
  }, [text]);

  const summary = useMemo(() => {
    const ok = items.filter((i) => i.ok).length;
    const selected = items.filter((i) => i.ok && i.selected).length;
    const failed = items.filter((i) => !i.ok).length;
    return { ok, selected, failed };
  }, [items]);

  const toggle = (id) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)));
  };

  const importSelected = async () => {
    setLoading(true);
    setError('');
    try {
      const selected = items.filter((i) => i.ok && i.selected).map((i) => i.parsed);
      if (!selected.length) {
        setError('No parsed messages selected');
        return;
      }
      await onImportMany(selected);
    } catch (e) {
      setError(e?.message || 'Failed to import');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error ? (
        <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 p-3 rounded-lg">{error}</div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Batch Import ({summary.selected}/{summary.ok} selected)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border ${item.ok ? 'border-gray-800 bg-black/30' : 'border-red-900/40 bg-red-950/20'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {item.ok ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <AlertCircle size={16} className="text-red-400" />
                      )}
                      <div className="text-sm font-semibold text-gray-100 truncate">
                        {item.ok ? `${item.parsed.bank} • ${item.parsed.type === 'credit' ? 'Income' : 'Expense'} • MVR ${item.parsed.amount}` : 'Unrecognized SMS'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1 truncate">
                      {item.ok ? (item.parsed.merchant || item.parsed.description || '—') : item.err}
                    </div>
                  </div>

                  {item.ok ? (
                    <label className="flex items-center gap-2 text-xs text-gray-300">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggle(item.id)}
                      />
                      Select
                    </label>
                  ) : null}
                </div>

                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer">Show SMS</summary>
                  <div className="mt-2 text-xs text-gray-300 whitespace-pre-wrap">{item.raw}</div>
                </details>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-3">
            <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
            <Button variant="success" onClick={importSelected} disabled={loading} className="flex-1">
              {loading ? 'Importing…' : 'Import Selected'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
