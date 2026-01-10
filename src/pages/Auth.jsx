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
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: '#0F172A' }}>
      <div className="w-full max-w-md space-y-8">
        {/* Logo - Modern Blue Icon */}
        <div className="text-center space-y-3">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-5xl">💰</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Kharadhu</h1>
          <p className="text-slate-400">Personal Expense Tracker</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">{mode === 'signin' ? 'Welcome Back' : 'Get Started'}</CardTitle>
              <button
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
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
          <CardContent className="space-y-5">
            {error ? (
              <div className="text-sm text-white bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
                {mode === 'signin' ? 'Wrong username or password' : error}
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
                  <label className="text-sm text-slate-400 font-medium">Account</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => {
                      setSelectedUserId(e.target.value);
                      setPin('');
                    }}
                    autoComplete="off"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                  <label className="text-sm text-slate-400 font-medium">PIN</label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    placeholder="Enter your PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                <Button
                  className="w-full py-3.5"
                  disabled={!canSignIn || loading}
                  onClick={() => signIn({ userId: selectedUserId, pin })}
                >
                  {loading ? 'Signing in…' : (cooldownText ? `Sign In (${cooldownText})` : 'Sign In')}
                </Button>

                <button
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  disabled={!selectedUserId}
                  onClick={() => setShowForgot(true)}
                >
                  Forgot PIN?
                </button>

                {users.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center">No accounts yet — create one above.</p>
                ) : null}
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400 font-medium">Your Name</label>
                  <Input
                    placeholder="e.g., Ibrahim"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400 font-medium">Create PIN</label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    placeholder="4+ digits"
                    value={pin2}
                    onChange={(e) => setPin2(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full py-3.5"
                  disabled={!canSignUp || loading}
                  onClick={() => signUp({ name, pin: pin2 })}
                >
                  {loading ? 'Creating…' : 'Create Account'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-slate-500 text-center">
          All data is stored securely on your device
        </p>
      </div>
    </div>
  );
};
