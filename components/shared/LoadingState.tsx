'use client';

interface LoadingStateProps {
  message?: string;
  variant?: 'default' | 'analyzing' | 'reconnecting';
}

export function LoadingState({ message, variant = 'default' }: LoadingStateProps) {
  if (variant === 'analyzing') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#101012] text-[rgba(255,255,255,0.8)]">
        <div className="text-center">
          <div className="mb-6 inline-block animate-spin text-6xl">🏆</div>
          <h2 className="mb-3 text-2xl font-semibold">Analyzing Complete Battle...</h2>
          <p className="mb-6 text-sm text-[rgba(255,255,255,0.4)]">Calculating scores across all 3 phases</p>
          <div className="flex justify-center gap-2">
            <div className="h-2 w-2 animate-bounce rounded-full bg-[#00e5e5]" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-[#00e5e5]" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-[#00e5e5]" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'reconnecting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#101012] text-[rgba(255,255,255,0.8)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[rgba(255,255,255,0.1)] border-t-[#00e5e5]" />
          <p className="text-lg">Reconnecting to session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[rgba(255,255,255,0.1)] border-t-[#00e5e5]" />
        <p className="text-lg">{message || 'Loading...'}</p>
      </div>
    </div>
  );
}
