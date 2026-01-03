import { useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const CreateAccountModal = ({ isOpen, onClose, onCreate, loading, error }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');

  const canCreate = useMemo(() => name.trim().length > 0 && pin.trim().length >= 4, [name, pin]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create account" size="sm">
      <div className="space-y-3">
        {error ? (
          <div className="text-sm text-coral-600 bg-coral-50 border border-coral-200 p-2 rounded">
            {error}
          </div>
        ) : null}

        <div>
          <label className="text-sm text-gray-300">Name</label>
          <Input
            placeholder="e.g., Ibrahim"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-gray-300">PIN</label>
          <Input
            type="password"
            inputMode="numeric"
            placeholder="4+ digits"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={!canCreate || loading}
            onClick={async () => {
              const ok = await onCreate({ name, pin });
              if (ok) {
                setName('');
                setPin('');
              }
            }}
          >
            {loading ? 'Creating…' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
