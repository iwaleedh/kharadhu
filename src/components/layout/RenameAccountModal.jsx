import { useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const RenameAccountModal = ({ isOpen, onClose, initialName, onRename, loading, error }) => {
  const [name, setName] = useState(initialName || '');

  const canSave = useMemo(() => name.trim().length > 0 && name.trim() !== (initialName || '').trim(), [name, initialName]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename account" size="sm">
      <div className="space-y-3">
        {error ? (
          <div className="text-sm text-red-600 bg-coral-50 border border-coral-200 p-2 rounded">
            {error}
          </div>
        ) : null}

        <div>
          <label className="text-sm text-gray-800">New name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={!canSave || loading}
            onClick={async () => {
              const ok = await onRename(name);
              if (ok) onClose();
            }}
          >
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
