'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function AuthContent() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (user) {
      setLoading(false);
      const redirectParam = searchParams.get('redirect');
      const storedRedirect = typeof window !== 'undefined' ? sessionStorage.getItem('authRedirect') : null;
      const redirectTo = redirectParam 
        ? decodeURIComponent(redirectParam)
        : storedRedirect 
          ? decodeURIComponent(storedRedirect)
          : '/dashboard';
      
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('authRedirect');
      }
      router.push(redirectTo);
    }
  }, [user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          throw new Error('Please enter your name');
        }
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  const handleDemoAccount = async () => {
    setError('');
    setLoading(true);

    try {
      try {
        await signUp('demo@writingarena.app', 'demo123456', 'Demo Student');
      } catch (signUpError: any) {
        if (signUpError.message.includes('already')) {
          await signIn('demo@writingarena.app', 'demo123456');
        } else {
          throw signUpError;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Demo account failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <header className="border-b border-[rgba(255,255,255,0.05)]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-5">
          <Link href="/" className="text-base font-semibold tracking-wide">
            Writing Arena
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-transparent px-4 py-2 text-xs font-medium uppercase tracking-[0.04em] text-[rgba(255,255,255,0.4)] transition-all hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
          >
            ← Back
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1200px] flex-col items-center px-8 py-12">
        <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-[1fr,1.2fr]">
          <div className="hidden lg:block">
            <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
              <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
                Platform Stats
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4">
                  <span className="text-sm text-[rgba(255,255,255,0.4)]">Active Writers</span>
                  <span className="font-mono text-lg text-[#00e5e5]">2,847</span>
                </div>
                <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4">
                  <span className="text-sm text-[rgba(255,255,255,0.4)]">Matches Today</span>
                  <span className="font-mono text-lg text-[#ff5f8f]">1,234</span>
                </div>
                <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4">
                  <span className="text-sm text-[rgba(255,255,255,0.4)]">Words Written</span>
                  <span className="font-mono text-lg text-[#ff9030]">4.2M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[rgba(255,255,255,0.4)]">Avg Improvement</span>
                  <span className="font-mono text-lg text-[#00d492]">+18%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
              <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
                Recent Activity
              </div>
              <div className="space-y-4">
                {[
                  { event: 'New user joined', time: '2 min ago', color: '#00d492' },
                  { event: 'Match completed', time: '5 min ago', color: '#00e5e5' },
                  { event: 'Rank achieved', time: '12 min ago', color: '#ff9030' },
                  { event: 'Feedback given', time: '18 min ago', color: '#ff5f8f' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div 
                      className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ background: item.color }}
                    />
                    <div className="flex-1">
                      <div className="text-sm">{item.event}</div>
                      <div className="text-xs text-[rgba(255,255,255,0.22)]">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8">
            <div className="mb-6 flex items-center gap-4 border-b border-[rgba(255,255,255,0.05)] pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[rgba(0,229,229,0.12)] text-xl text-[#00e5e5]">
                {isSignUp ? '🌱' : '✶'}
              </div>
              <div>
                <h1 className="text-xl font-semibold">
                  {isSignUp ? 'Create account' : 'Welcome back'}
                </h1>
                <p className="text-sm text-[rgba(255,255,255,0.4)]">
                  {isSignUp ? 'Set up your profile' : 'Sign in to continue'}
                </p>
              </div>
            </div>

            <div className="mb-6 flex gap-1 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-1">
              <button
                onClick={() => { setIsSignUp(false); setError(''); }}
                className={`flex-1 rounded-[6px] py-2 text-xs font-medium transition-all ${
                  !isSignUp 
                    ? 'bg-[rgba(255,255,255,0.025)] text-[#00e5e5]' 
                    : 'text-[rgba(255,255,255,0.22)]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsSignUp(true); setError(''); }}
                className={`flex-1 rounded-[6px] py-2 text-xs font-medium transition-all ${
                  isSignUp 
                    ? 'bg-[rgba(255,255,255,0.025)] text-[#00e5e5]' 
                    : 'text-[rgba(255,255,255,0.22)]'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
                    Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3 font-mono text-sm text-[rgba(255,255,255,0.8)] outline-none transition-colors placeholder:text-[rgba(255,255,255,0.22)] focus:border-[#00e5e5]"
                    required={isSignUp}
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3 font-mono text-sm text-[rgba(255,255,255,0.8)] outline-none transition-colors placeholder:text-[rgba(255,255,255,0.22)] focus:border-[#00e5e5]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3 font-mono text-sm text-[rgba(255,255,255,0.8)] outline-none transition-colors placeholder:text-[rgba(255,255,255,0.22)] focus:border-[#00e5e5]"
                  required
                  minLength={6}
                />
                {isSignUp && (
                  <p className="mt-1 text-xs text-[rgba(255,255,255,0.22)]">At least 6 characters</p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-3 rounded-[10px] border border-[rgba(255,95,143,0.3)] bg-[rgba(255,95,143,0.1)] px-4 py-3">
                  <div className="h-2 w-2 rounded-full bg-[#ff5f8f]" />
                  <span className="text-sm text-[#ff5f8f]">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-4 py-3 text-xs font-medium uppercase tracking-[0.04em] text-[#101012] transition-all hover:bg-[#33ebeb] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[rgba(255,255,255,0.05)]" />
              <span className="text-xs text-[rgba(255,255,255,0.22)]">or continue with</span>
              <div className="h-px flex-1 bg-[rgba(255,255,255,0.05)]" />
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-white px-4 py-3 text-xs font-medium uppercase tracking-[0.04em] text-[#101012] transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>

            <div className="mt-6 border-t border-[rgba(255,255,255,0.05)] pt-6">
              <p className="mb-3 text-center text-xs text-[rgba(255,255,255,0.22)]">
                Preview the experience without signing up
              </p>
              <button
                onClick={handleDemoAccount}
                disabled={loading}
                className="w-full rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-transparent px-4 py-3 text-xs font-medium uppercase tracking-[0.04em] text-[rgba(255,255,255,0.4)] transition-all hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Please wait...' : 'Launch demo account'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
