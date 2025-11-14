'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

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
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
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
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo account failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400/20 text-xl text-emerald-200">
              ✶
            </div>
            <span className="text-xl font-semibold tracking-wide">Writing Arena</span>
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Return home
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col items-center px-6 py-16">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#141e27] p-10">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-xl text-emerald-200">
              {isSignUp ? '🌱' : '✶'}
            </div>
            <h1 className="mt-6 text-3xl font-semibold">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="mt-2 text-sm text-white/60">
              {isSignUp ? 'Set up your profile and enter the arena.' : 'Sign in to keep your streak alive.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-semibold">Name</label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-emerald-300"
                  required={isSignUp}
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-emerald-300"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-emerald-300"
                required
                minLength={6}
              />
              {isSignUp && <p className="text-xs text-white/50">At least 6 characters</p>}
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-[#0c141c] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="my-8 flex items-center gap-3 text-xs text-white/40">
            <div className="h-px flex-1 bg-white/10" />
            Or
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white px-6 py-3 text-sm font-semibold text-[#1b1f24] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <div className="mt-6 text-center text-sm text-white/60">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="font-semibold text-emerald-200 transition hover:text-emerald-100"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Need an account? Create one"}
            </button>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-white/40">Preview the experience without signing up</p>
            <button
              onClick={handleDemoAccount}
              disabled={loading}
              className="mt-4 w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Please wait...' : 'Launch demo account'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

