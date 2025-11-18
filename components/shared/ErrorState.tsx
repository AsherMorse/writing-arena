'use client';

import { useRouter } from 'next/navigation';

interface ErrorStateProps {
  error: Error | string;
  title?: string;
  retryLabel?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

/**
 * Reusable error state component
 */
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
    <div className="min-h-screen bg-[#0c141d] text-white flex items-center justify-center">
      <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-md">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-white text-2xl font-bold mb-2">{title}</h1>
        <p className="text-white/70 mb-6">{errorMessage}</p>
        {showRetry && (
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}

