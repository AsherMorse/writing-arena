'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { useAsyncStateWithStringError } from '@/lib/hooks/useAsyncState';
import { FantasyLogo } from './FantasyLogo';

export function FantasyAuthContent() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { isLoading: loading, error, execute: executeAuth, setError } = useAsyncStateWithStringError();

  useEffect(() => {
    if (user) {
      const redirectParam = searchParams.get('redirect');
      const storedRedirect = typeof window !== 'undefined' ? sessionStorage.getItem('authRedirect') : null;
      const redirectTo = redirectParam
        ? decodeURIComponent(redirectParam)
        : storedRedirect
          ? decodeURIComponent(storedRedirect)
          : '/fantasy/home';

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('authRedirect');
      }
      router.push(redirectTo);
    }
  }, [user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeAuth(async () => {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    }).catch(() => {});
  };

  const handleGoogleSignIn = async () => {
    await executeAuth(async () => {
      await signInWithGoogle();
    }).catch(() => {});
  };

  const inputClassName = `
    w-full px-4 py-3 rounded-md
    bg-[#1a0f08] border border-[rgba(201,168,76,0.3)]
    text-[#f5e6b8] placeholder-[rgba(245,230,184,0.3)]
    outline-none transition-all
    focus:border-[rgba(201,168,76,0.6)] focus:shadow-[0_0_12px_rgba(201,168,76,0.15)]
  `;

  const labelClassName = "block mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[rgba(245,230,184,0.5)]";

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Image
        src="/images/backgrounds/bg.webp"
        alt=""
        fill
        className="object-cover"
        priority
        quality={90}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)',
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center px-4">
        <Link
          href="/fantasy"
          className="absolute top-6 right-6 text-xs font-semibold uppercase tracking-[0.1em] text-[#f5e6b8] opacity-50 hover:opacity-100 transition-opacity z-20"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
        >
          ← Back
        </Link>

        <FantasyLogo width={200} className="mt-4 md:mt-6" />

        <div className="flex-1 flex items-center justify-center w-full py-8">
          <div
            className="w-full max-w-md p-8 rounded-lg"
            style={{
              background: 'linear-gradient(180deg, rgba(42,26,15,0.95) 0%, rgba(30,18,10,0.98) 100%)',
              border: '1px solid rgba(201,168,76,0.3)',
              boxShadow: `
                0 8px 32px rgba(0,0,0,0.6),
                inset 0 1px 0 rgba(201,168,76,0.1)
              `,
            }}
          >
            <div className="text-center mb-8">
              <h1
                className="font-dutch809 text-3xl mb-2"
                style={{
                  background: 'linear-gradient(to bottom, #f8e8b0 0%, #f6d493 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {isSignUp ? 'Join the Guild' : 'Welcome Back'}
              </h1>
              <p className="text-sm text-[rgba(245,230,184,0.5)]">
                {isSignUp ? 'Begin your writing quest' : 'Continue your journey'}
              </p>
            </div>

            <div className="flex gap-1 p-1 mb-6 rounded-md bg-[#1a0f08] border border-[rgba(201,168,76,0.2)]">
              <button
                onClick={() => { setIsSignUp(false); setError(''); }}
                className={`flex-1 py-2 text-xs font-semibold uppercase tracking-[0.08em] rounded transition-all ${
                  !isSignUp
                    ? 'bg-[rgba(201,168,76,0.15)] text-[#f5e6b8]'
                    : 'text-[rgba(245,230,184,0.4)]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsSignUp(true); setError(''); }}
                className={`flex-1 py-2 text-xs font-semibold uppercase tracking-[0.08em] rounded transition-all ${
                  isSignUp
                    ? 'bg-[rgba(201,168,76,0.15)] text-[#f5e6b8]'
                    : 'text-[rgba(245,230,184,0.4)]'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClassName}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className={labelClassName}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClassName}
                  required
                  minLength={6}
                />
                {isSignUp && (
                  <p className="mt-1 text-xs text-[rgba(245,230,184,0.3)]">At least 6 characters</p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-md bg-[rgba(180,80,60,0.2)] border border-[rgba(180,80,60,0.4)]">
                  <div className="h-2 w-2 rounded-full bg-[#b4503c]" />
                  <span className="text-sm text-[#e8a090]">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 rounded-md font-semibold uppercase tracking-[0.08em] text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: '#2a1a0f',
                  border: '1px solid rgba(201, 168, 76, 0.75)',
                  color: '#f5e6b8',
                  boxShadow: 'inset 0 0 15px rgba(201, 168, 76, 0.15), inset 0 1px 0 rgba(201, 168, 76, 0.3), 0 4px 12px rgba(0, 0, 0, 0.5)',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                }}
              >
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[rgba(201,168,76,0.2)]" />
              <span className="text-xs text-[rgba(245,230,184,0.4)]">or continue with</span>
              <div className="h-px flex-1 bg-[rgba(201,168,76,0.2)]" />
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 px-4 py-3 rounded-md bg-white text-[#1a0f08] text-xs font-semibold uppercase tracking-[0.08em] transition-all hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
