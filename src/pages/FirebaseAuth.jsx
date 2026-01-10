/**
 * Firebase Authentication Page
 * Email/Password authentication with Firebase
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useFirebaseAuthStore } from '../store/firebaseAuthStore';
import { Waves, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export const FirebaseAuth = () => {
    const { signIn, signUp, loading, error, clearError, init } = useFirebaseAuthStore();

    const [mode, setMode] = useState('signin'); // signin | signup
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        init();
    }, [init]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();

        if (mode === 'signup') {
            await signUp({ email, password, displayName });
        } else {
            await signIn({ email, password });
        }
    };

    const switchMode = () => {
        setMode(mode === 'signin' ? 'signup' : 'signin');
        setEmail('');
        setPassword('');
        setDisplayName('');
        clearError();
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: '#0F172A' }}>
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="text-center space-y-3">
                    <div
                        className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center shadow-lg"
                        style={{
                            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
                        }}
                    >
                        <Waves size={48} className="text-white" />
                    </div>
                    <h1
                        className="text-3xl font-bold"
                        style={{
                            background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Aamdhanee
                    </h1>
                    <p className="text-slate-400">Personal Finance Tracker</p>
                </div>

                {/* Auth Card */}
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white">
                                {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                            </CardTitle>
                            <button
                                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                onClick={switchMode}
                            >
                                {mode === 'signin' ? 'Create Account' : 'Sign In'}
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="text-sm text-white bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
                                    {error}
                                </div>
                            )}

                            {mode === 'signup' && (
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400 font-medium flex items-center gap-2">
                                        <User size={16} />
                                        Display Name
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Your name"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm text-slate-400 font-medium flex items-center gap-2">
                                    <Mail size={16} />
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-slate-400 font-medium flex items-center gap-2">
                                    <Lock size={16} />
                                    Password
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-3.5"
                                disabled={loading}
                            >
                                {loading
                                    ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                                    : (mode === 'signin' ? 'Sign In' : 'Create Account')
                                }
                            </Button>
                        </form>

                        {mode === 'signin' && (
                            <p className="text-sm text-slate-400 text-center">
                                Forgot your password?{' '}
                                <button className="text-blue-400 hover:text-blue-300">
                                    Reset
                                </button>
                            </p>
                        )}
                    </CardContent>
                </Card>

                <p className="text-xs text-slate-500 text-center">
                    Your data is securely stored in the cloud
                </p>
            </div>
        </div>
    );
};
