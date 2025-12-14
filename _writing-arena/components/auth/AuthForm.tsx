'use client';

import { COLOR_CLASSES } from '@/lib/constants/colors';

interface AuthFormProps {
  isSignUp: boolean;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  fullName: string;
  setFullName: (name: string) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AuthForm({
  isSignUp,
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  error,
  loading,
  onSubmit,
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {isSignUp && (
        <>
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3 font-mono text-sm text-[rgba(255,255,255,0.8)] outline-none transition-colors placeholder:text-[rgba(255,255,255,0.22)] focus:border-[#00e5e5]"
              required
            />
          </div>
        </>
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
        <div className={`flex items-center gap-3 rounded-[10px] border ${COLOR_CLASSES.phase2.borderOpacity(0.3)} ${COLOR_CLASSES.phase2.bgOpacity(0.1)} px-4 py-3`}>
          <div className={`h-2 w-2 rounded-full ${COLOR_CLASSES.phase2.bg}`} />
          <span className={`text-sm ${COLOR_CLASSES.phase2.text}`}>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full rounded-[10px] border ${COLOR_CLASSES.phase1.border} ${COLOR_CLASSES.phase1.bg} px-4 py-3 text-xs font-medium uppercase tracking-[0.04em] text-[#101012] transition-all hover:bg-[#33ebeb] disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
      </button>
    </form>
  );
}
