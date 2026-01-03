import { useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export const ForgotPinResetModal = ({
  isOpen,
  onClose,
  accountName,
  onResetPinKeepData,
  onDeleteAccount,
  loading,
  error,
}) => {
  const [newPin, setNewPin] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canReset = useMemo(() => newPin.trim().length >= 4, [newPin]);

  return (
    <>
      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete account?"
        message={`Delete account "${accountName}"? This will permanently remove all its data on this device.`}
        confirmText="Delete"
        destructive
        requireText={accountName || ''}
        requireTextLabel="Type account name"
        requireAcknowledge
        acknowledgeLabel="I understand this will permanently remove this account's data."
        loading={loading}
        onConfirm={async () => {
          const done = await onDeleteAccount();
          if (done) {
            setConfirmDelete(false);
            onClose();
          }
        }}
      />

      <Modal isOpen={isOpen} onClose={onClose} title="Forgot PIN" size="sm">
      <div className="space-y-3">
        <p className="text-sm text-gray-800">
          Account: <span className="font-semibold text-gray-900">{accountName || '—'}</span>
        </p>

        {error ? (
          <div className="text-sm text-red-600 bg-coral-50 border border-coral-200 p-2 rounded">
            {error}
          </div>
        ) : null}

        <div className="rounded-lg border border-gray-200 p-3 bg-blue-50">
          <div className="text-sm font-semibold text-gray-900 mb-2">Option A: Reset PIN (keeps data)</div>
          <label className="text-sm text-gray-800">New PIN</label>
          <Input
            type="password"
            inputMode="numeric"
            placeholder="4+ digits"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
          />
          <Button
            className="w-full mt-2"
            disabled={!canReset || loading}
            onClick={async () => {
              const ok = await onResetPinKeepData(newPin);
              if (ok) {
                setNewPin('');
                onClose();
              }
            }}
          >
            {loading ? 'Working…' : 'Reset PIN'}
          </Button>
          <p className="text-xs text-gray-700 mt-2">
            This is less secure: anyone with device access can take over the account.
          </p>
        </div>

        <div className="rounded-lg border border-red-200/30 p-3 bg-red-950/20">
          <div className="text-sm font-semibold text-gray-900 mb-2">Option B: Delete account (wipes data)</div>
          <Button
            variant="danger"
            className="w-full"
            disabled={loading}
            onClick={() => setConfirmDelete(true)}
          >
            {loading ? 'Working…' : 'Delete account + data'}
          </Button>
        </div>

        <Button variant="outline" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
      </Modal>
    </>
  );
};
