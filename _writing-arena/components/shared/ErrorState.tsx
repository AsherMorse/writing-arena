'use client';

import { useRouter } from 'next/navigation';

interface ErrorStateProps {
  error: Error | string;
  title?: string;
  retryLabel?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorState({ 
  error, 
  title = 'Error',
  retryLabel = 'Return to Dashboard',
  onRetry,
  showRetry = true,
}: ErrorStateProps) {
  const router = useRouter();
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.push('/dashboard');
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <div className="max-w-md rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8 text-center">
        <div className="mb-4 text-5xl">❌</div>
        <h1 className="mb-2 text-xl font-semibold">{title}</h1>
        <p className="mb-6 text-sm text-[rgba(255,255,255,0.5)]">{errorMessage}</p>
        {showRetry && (
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-6 py-2 text-sm font-medium transition hover:bg-[rgba(255,255,255,0.04)]"
          >
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
