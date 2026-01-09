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
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-telegram">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Title - Telegram style */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto bg-telegram-blue rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">💰</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Kharadhu</h1>
          <p className="text-telegram-secondary">Personal Expense Tracker</p>
        </div>

        {/* Login Card - Telegram style */}
        <Card className="bg-telegram-card border-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">{mode === 'signin' ? 'Sign In' : 'Create Account'}</CardTitle>
              <button
                className="text-sm text-telegram-blue hover:underline font-medium"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setPin('');
                  setPin2('');
                  setName('');
                }}
              >
                {mode === 'signin' ? 'Create Account' : 'Sign In'}
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <div className="text-sm text-white bg-red-500/20 border border-red-500/50 p-3 rounded-lg">
                Wrong username or password
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

                <div className="space-y-2">
                  <label className="text-sm text-telegram-secondary">Account</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => {
                      setSelectedUserId(e.target.value);
                      setPin('');
                    }}
                    autoComplete="off"
                    className="w-full px-4 py-3 bg-telegram-surface border border-telegram rounded-lg text-white focus:border-telegram-blue transition-colors"
                  >
                    <option value="">Select an account</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-telegram-secondary">PIN</label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    placeholder="Enter your 4+ digit PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    autoComplete="new-password"
                    className="bg-telegram-surface border-telegram text-white placeholder-telegram-secondary"
                  />
                </div>

                <Button
                  className="w-full bg-telegram-blue hover:bg-telegram-blue-hover text-white py-3"
                  disabled={!canSignIn || loading}
                  onClick={() => signIn({ userId: selectedUserId, pin })}
                >
                  {loading ? 'Signing in…' : (cooldownText ? `Sign In (${cooldownText})` : 'Sign In')}
                </Button>

                <button
                  className="text-sm text-telegram-blue hover:underline"
                  disabled={!selectedUserId}
                  onClick={() => setShowForgot(true)}
                >
                  Forgot PIN?
                </button>

                {users.length === 0 ? (
                  <p className="text-sm text-telegram-secondary text-center">No accounts yet — create one above.</p>
                ) : null}
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm text-telegram-secondary">Your Name</label>
                  <Input
                    placeholder="e.g., Ibrahim"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-telegram-surface border-telegram text-white placeholder-telegram-secondary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-telegram-secondary">Create PIN</label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    placeholder="4+ digits"
                    value={pin2}
                    onChange={(e) => setPin2(e.target.value)}
                    className="bg-telegram-surface border-telegram text-white placeholder-telegram-secondary"
                  />
                </div>

                <Button
                  className="w-full bg-telegram-blue hover:bg-telegram-blue-hover text-white py-3"
                  disabled={!canSignUp || loading}
                  onClick={() => signUp({ name, pin: pin2 })}
                >
                  {loading ? 'Creating…' : 'Create Account'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-telegram-secondary text-center">
          All data is stored locally on your device
        </p>
      </div>
    </div>
  );
};
