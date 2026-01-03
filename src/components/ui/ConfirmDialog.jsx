import { useMemo, useRef, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm,
  loading = false,
  requireText = null,
  requireTextLabel = 'Type to confirm',
  requireAcknowledge = false,
  acknowledgeLabel = 'I understand',
}) => {
  const [typed, setTyped] = useState('');
  const [ack, setAck] = useState(false);
  const [shake, setShake] = useState(false);
  const [blockedReason, setBlockedReason] = useState('');
  const inputRef = useRef(null);

  const normalizedRequired = useMemo(() => {
    if (!requireText) return null;
    return String(requireText);
  }, [requireText]);

  const normalize = (s) =>
    String(s)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');

  const isMatch = useMemo(() => {
    if (!normalizedRequired) return true;
    return normalize(typed) === normalize(normalizedRequired);
  }, [typed, normalizedRequired]);

  const triggerMismatchFeedback = () => {
    setShake(true);
    // Remove class after animation so it can retrigger.
    window.setTimeout(() => setShake(false), 260);

    // Subtle haptic feedback on supported mobile devices.
    try {
      if (navigator?.vibrate) navigator.vibrate([20, 30, 20]);
    } catch {
      // ignore
    }

    inputRef.current?.focus?.();
  };

  const canConfirm = useMemo(() => {
    if (loading) return false;
    if (!isMatch) return false;
    if (requireAcknowledge && !ack) return false;
    return true;
  }, [ack, isMatch, loading, requireAcknowledge]);

  const getBlockedReason = () => {
    if (loading) return 'Please wait…';
    if (!isMatch) {
      return normalizedRequired ? `Type: ${normalizedRequired}` : 'Confirmation text does not match';
    }
    if (requireAcknowledge && !ack) return 'Please tick the acknowledgement checkbox.';
    return '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setTyped('');
        setAck(false);
        setBlockedReason('');
        onClose();
      }}
      title={title}
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-700">{message}</p>

        {normalizedRequired ? (
          <div className={`space-y-2 ${shake ? 'shake-x' : ''}`}>
            <p className="text-xs text-gray-700">
              {requireTextLabel}:{' '}
              <span className="font-semibold text-gray-900">{normalizedRequired}</span>
            </p>
            <Input
              ref={inputRef}
              value={typed}
              onChange={(e) => {
                setTyped(e.target.value);
                setBlockedReason('');
              }}
              placeholder={normalizedRequired}
            />
            <p
              className={`text-xs ${
                typed.length === 0 ? 'text-gray-700' : isMatch ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {typed.length === 0 ? 'Not typed yet' : isMatch ? 'Matched' : 'Not matched'}
            </p>
          </div>
        ) : null}

        {requireAcknowledge ? (
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => {
                setAck(e.target.checked);
                setBlockedReason('');
              }}
              className="h-4 w-4"
            />
            {acknowledgeLabel}
          </label>
        ) : null}

        {blockedReason ? (
          <p className="text-xs text-red-400">{blockedReason}</p>
        ) : null}

        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setTyped('');
              setAck(false);
              onClose();
            }}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            className="flex-1"
            disabled={loading}
            onClick={async () => {
              if (!canConfirm) {
                const reason = getBlockedReason();
                if (reason) setBlockedReason(reason);

                // If mismatch, give shake feedback.
                if (!isMatch) triggerMismatchFeedback();
                return;
              }
              await onConfirm?.();
              setTyped('');
              setAck(false);
            }}
          >
            {loading ? 'Working…' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
