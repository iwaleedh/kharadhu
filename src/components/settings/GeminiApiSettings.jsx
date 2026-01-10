import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Eye, EyeOff, Check, X, ExternalLink, Sparkles } from 'lucide-react';
import { getGeminiApiKey, setGeminiApiKey, testGeminiApiKey, isGeminiConfigured } from '../../lib/geminiOcr';

export const GeminiApiSettings = () => {
    const [apiKey, setApiKeyState] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const key = getGeminiApiKey();
        if (key) {
            setApiKeyState(key);
        }
    }, []);

    const handleSave = async () => {
        setTesting(true);
        setTestResult(null);
        setSaved(false);

        if (!apiKey.trim()) {
            setGeminiApiKey(null);
            setSaved(true);
            setTesting(false);
            setTestResult({ valid: true, message: 'API key removed' });
            return;
        }

        // Test the API key
        const result = await testGeminiApiKey(apiKey.trim());
        setTestResult(result);

        if (result.valid) {
            setGeminiApiKey(apiKey.trim());
            setSaved(true);
        }

        setTesting(false);
    };

    const handleClear = () => {
        setApiKeyState('');
        setGeminiApiKey(null);
        setTestResult(null);
        setSaved(true);
    };

    const isConfigured = isGeminiConfigured();

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-blue-400" size={20} />
                        <CardTitle>AI Receipt Scanner</CardTitle>
                    </div>
                    {isConfigured && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                            <Check size={12} /> Configured
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-slate-400">
                    Enable AI-powered receipt scanning with multilingual support using Google Gemini Flash 2.0.
                </p>

                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    <p className="text-sm text-blue-300 mb-2">
                        <strong>How to get a free API key:</strong>
                    </p>
                    <ol className="text-sm text-slate-400 list-decimal list-inside space-y-1">
                        <li>Visit Google AI Studio</li>
                        <li>Sign in with your Google account</li>
                        <li>Click "Get API Key"</li>
                        <li>Copy and paste it below</li>
                    </ol>
                    <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mt-2"
                    >
                        <ExternalLink size={14} />
                        Get API Key
                    </a>
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-slate-400 font-medium">Gemini API Key</label>
                    <div className="relative">
                        <Input
                            type={showKey ? 'text' : 'password'}
                            placeholder="Enter your Gemini API key"
                            value={apiKey}
                            onChange={(e) => {
                                setApiKeyState(e.target.value);
                                setSaved(false);
                                setTestResult(null);
                            }}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                        >
                            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {testResult && (
                    <div className={`text-sm p-2 rounded-lg flex items-center gap-2 ${testResult.valid
                            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}>
                        {testResult.valid ? <Check size={16} /> : <X size={16} />}
                        {testResult.valid ? (saved ? 'API key saved successfully!' : 'API key is valid!') : (testResult.error || 'Invalid API key')}
                    </div>
                )}

                <div className="flex gap-2">
                    <Button
                        onClick={handleSave}
                        disabled={testing}
                        className="flex-1"
                    >
                        {testing ? 'Testing...' : 'Save API Key'}
                    </Button>
                    {apiKey && (
                        <Button
                            variant="secondary"
                            onClick={handleClear}
                        >
                            Clear
                        </Button>
                    )}
                </div>

                <p className="text-xs text-slate-500">
                    Your API key is stored locally on your device and never sent anywhere except to Google's API.
                </p>
            </CardContent>
        </Card>
    );
};
