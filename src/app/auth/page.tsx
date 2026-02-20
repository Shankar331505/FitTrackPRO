'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password);
            }
            router.push('/');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Something went wrong';
            // Make Firebase error messages friendlier
            if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
                setError('Incorrect email or password.');
            } else if (msg.includes('email-already-in-use')) {
                setError('This email is already registered. Try logging in.');
            } else if (msg.includes('weak-password')) {
                setError('Password must be at least 6 characters.');
            } else {
                setError(msg);
            }
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            fontFamily: 'Inter, sans-serif',
        }}>
            <div style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                padding: '48px',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}>
                {/* Logo / Title */}
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <div style={{
                        width: '64px', height: '64px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '28px',
                    }}>💪</div>
                    <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 700, margin: 0 }}>FitTrack Pro</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '8px', fontSize: '14px' }}>
                        {isLogin ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
                    </p>
                </div>

                {/* Toggle */}
                <div style={{
                    display: 'flex', background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px', padding: '4px', marginBottom: '28px',
                }}>
                    {['Login', 'Sign Up'].map((label, i) => (
                        <button
                            key={label}
                            onClick={() => { setIsLogin(i === 0); setError(''); }}
                            style={{
                                flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                                borderRadius: '10px', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s',
                                background: (isLogin && i === 0) || (!isLogin && i === 1)
                                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                                color: '#fff',
                            }}
                        >{label}</button>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            style={{
                                width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px',
                                color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder="Min. 6 characters"
                            style={{
                                width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px',
                                color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                            borderRadius: '10px', padding: '12px 16px', color: '#fca5a5',
                            fontSize: '13px', marginBottom: '16px',
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '14px',
                            background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: 'none', borderRadius: '12px', color: '#fff',
                            fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'opacity 0.2s',
                        }}
                    >
                        {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}
