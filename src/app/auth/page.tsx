'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Dumbbell } from 'lucide-react';

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
            if (isLogin) { await signIn(email, password); } else { await signUp(email, password); }
            router.push('/');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Something went wrong';
            if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
                setError('Incorrect email or password.');
            } else if (msg.includes('email-already-in-use')) {
                setError('This email is already registered. Try logging in.');
            } else if (msg.includes('weak-password')) {
                setError('Password must be at least 6 characters.');
            } else { setError(msg); }
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0c0f1a 0%, #1e1b4b 50%, #0c0f1a 100%)',
            fontFamily: '"Plus Jakarta Sans", Inter, sans-serif',
        }}>
            <div style={{
                background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
                padding: '48px', width: '100%', maxWidth: '400px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <div style={{
                        width: '56px', height: '56px',
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                    }}>
                        <span style={{ color: '#fff', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>FT</span>
                    </div>
                    <h1 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>FitTrack Pro</h1>
                    <p style={{ color: 'rgba(148, 163, 184, 0.8)', marginTop: '8px', fontSize: '13px' }}>
                        {isLogin ? 'Welcome back. Sign in to continue.' : 'Create your account to get started.'}
                    </p>
                </div>

                {/* Toggle */}
                <div style={{
                    display: 'flex', background: 'rgba(255,255,255,0.04)',
                    borderRadius: '14px', padding: '3px', marginBottom: '28px',
                }}>
                    {['Login', 'Sign Up'].map((label, i) => (
                        <button key={label} onClick={() => { setIsLogin(i === 0); setError(''); }}
                            style={{
                                flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                                borderRadius: '12px', fontSize: '13px', fontWeight: 700, transition: 'all 0.2s',
                                background: (isLogin && i === 0) || (!isLogin && i === 1)
                                    ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent',
                                color: (isLogin && i === 0) || (!isLogin && i === 1) ? '#fff' : 'rgba(148, 163, 184, 0.6)',
                                letterSpacing: '-0.01em',
                            }}
                        >{label}</button>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                            style={{
                                width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                                color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(79, 70, 229, 0.5)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 6 characters"
                            style={{
                                width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                                color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(79, 70, 229, 0.5)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)',
                            borderRadius: '12px', padding: '12px 16px', color: '#fca5a5',
                            fontSize: '12px', marginBottom: '16px', fontWeight: 500,
                        }}>{error}</div>
                    )}

                    <button type="submit" disabled={loading}
                        style={{
                            width: '100%', padding: '13px',
                            background: loading ? 'rgba(79, 70, 229, 0.4)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            border: 'none', borderRadius: '12px', color: '#fff',
                            fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'opacity 0.2s', letterSpacing: '-0.01em',
                            boxShadow: loading ? 'none' : '0 4px 12px rgba(79, 70, 229, 0.3)',
                        }}
                    >{loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}</button>
                </form>
            </div>
        </div>
    );
}
