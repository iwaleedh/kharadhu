import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';
import { ForgotPinResetModal } from '../components/auth/ForgotPinResetModal';

export const Auth = () => {
  const { users, init, signIn, signUp, updatePin, deleteUser, loading, error, nextAllowedSignInAt } = useAuthStore();
  const [showForgot, setShowForgot] = useState(false);

  const [mode, setMode] = useState('signin'); // signin | signup
  const [selectedUserId, setSelectedUserId] = useState('');
  const [pin, setPin] = useState('');

  const [name, setName] = useState('');
  const [pin2, setPin2] = useState('');

  useEffect(() => {
    init();
  }, [init]);

  const canSignIn = useMemo(() => selectedUserId && pin.trim().length >= 4, [selectedUserId, pin]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!nextAllowedSignInAt) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [nextAllowedSignInAt]);

  const cooldownText = useMemo(() => {
    if (!nextAllowedSignInAt) return '';
    const ms = nextAllowedSignInAt - now;
    if (ms <= 0) return '';
    return `${Math.ceil(ms / 1000)}s`;
  }, [nextAllowedSignInAt, now]);
  const canSignUp = useMemo(() => name.trim() && pin2.trim().length >= 4, [name, pin2]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-900">Kharadhu</h1>
          <p className="text-sm text-gray-700">Expense Tracker</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{mode === 'signin' ? 'Sign In' : 'Create Account'}</CardTitle>
              <button
                className="text-sm text-orange-600 hover:underline"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              >
                {mode === 'signin' ? 'Create' : 'Sign In'}
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {error ? (
              <div className="text-sm text-red-600 bg-coral-50 border border-coral-200 p-2 rounded">
                {error}
              </div>
            ) : null}

            {mode === 'signin' ? (
              <>
                <ForgotPinResetModal
                  isOpen={showForgot}
                  onClose={() => setShowForgot(false)}
                  accountName={users.find((u) => String(u.id) === String(selectedUserId))?.name}
                  loading={loading}
                  error={error}
                  onResetPinKeepData={async (newPin) => {
                    if (!selectedUserId) return false;
                    return await updatePin({ userId: selectedUserId, pin: newPin });
                  }}
                  onDeleteAccount={async () => {
                    if (!selectedUserId) return false;
                    const ok = await deleteUser({ userId: selectedUserId });
                    if (ok) {
                      setSelectedUserId('');
                      setPin('');
                    }
                    return ok;
                  }}
                />
                <label className="text-sm text-gray-800">Account</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                >
                  <option value="">Select an account</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>

                <label className="text-sm text-gray-800">PIN</label>
                <Input
                  type="password"
                  inputMode="numeric"
                  placeholder="4+ digits"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />

                <Button
                  className="w-full"
                  disabled={!canSignIn || loading}
                  onClick={() => signIn({ userId: selectedUserId, pin })}
                >
                  {loading ? 'Signing in…' : (cooldownText ? `Sign In (${cooldownText})` : 'Sign In')}
                </Button>

                <button
                  className="text-sm text-orange-600 hover:underline text-left"
                  disabled={!selectedUserId}
                  onClick={() => setShowForgot(true)}
                >
                  Forgot PIN?
                </button>

                {users.length === 0 ? (
                  <p className="text-sm text-gray-700">No accounts yet — create one.</p>
                ) : null}
              </>
            ) : (
              <>
                <label className="text-sm text-gray-800">Name</label>
                <Input placeholder="e.g., Ibrahim" value={name} onChange={(e) => setName(e.target.value)} />

                <label className="text-sm text-gray-800">New PIN</label>
                <Input
                  type="password"
                  inputMode="numeric"
                  placeholder="4+ digits"
                  value={pin2}
                  onChange={(e) => setPin2(e.target.value)}
                />

                <Button
                  className="w-full"
                  disabled={!canSignUp || loading}
                  onClick={() => signUp({ name, pin: pin2 })}
                >
                  {loading ? 'Creating…' : 'Create Account'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-gray-700 text-center">
          Accounts are stored locally on this device.
        </p>
      </div>
    </div>
  );
};
