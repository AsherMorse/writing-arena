'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useAsyncStateWithStringError } from '@/lib/hooks/useAsyncState';
import { AuthForm } from './AuthForm';
import { AuthSocialButtons } from './AuthSocialButtons';
import { AuthSidebar } from './AuthSidebar';

export default function AuthContent() {
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
          : '/dashboard';
      
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
    }).catch(() => {
      // Error already handled by hook
    });
  };

  const handleGoogleSignIn = async () => {
    await executeAuth(async () => {
      await signInWithGoogle();
    }).catch(() => {
      // Error already handled by hook
    });
  };

  const handleDemoAccount = async () => {
    await executeAuth(async () => {
      try {
        await signUp('demo@writingarena.app', 'demo123456');
      } catch (signUpError: unknown) {
        const errorMessage = signUpError instanceof Error ? signUpError.message : '';
        if (errorMessage.includes('already')) {
          await signIn('demo@writingarena.app', 'demo123456');
        } else {
          throw signUpError;
        }
      }
    }).catch(() => {
      // Error already handled by hook
    });
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
          <AuthSidebar />

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
                  {isSignUp ? 'Join the arena' : 'Sign in to continue'}
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

            <AuthForm
              isSignUp={isSignUp}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              error={error}
              loading={loading}
              onSubmit={handleSubmit}
            />

            <AuthSocialButtons
              loading={loading}
              onGoogleSignIn={handleGoogleSignIn}
              onDemoAccount={handleDemoAccount}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
