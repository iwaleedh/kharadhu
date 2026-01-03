import { useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const ChangePinModal = ({ isOpen, onClose, onChangePin, loading, error }) => {
  const [pin, setPin] = useState('');

  const canSave = useMemo(() => pin.trim().length >= 4, [pin]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change PIN" size="sm">
      <div className="space-y-3">
        {error ? (
          <div className="text-sm text-coral-600 bg-coral-50 border border-coral-200 p-2 rounded">
            {error}
          </div>
        ) : null}

        <div>
          <label className="text-sm text-gray-300">New PIN</label>
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
            disabled={!canSave || loading}
            onClick={async () => {
              const ok = await onChangePin(pin);
              if (ok) {
                setPin('');
                onClose();
              }
            }}
          >
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
