'use client';

interface LoadingStateProps {
  message?: string;
  variant?: 'default' | 'analyzing' | 'reconnecting';
}

/**
 * Reusable loading state component
 */
export function LoadingState({ message, variant = 'default' }: LoadingStateProps) {
  if (variant === 'analyzing') {
    return (
      <div className="min-h-screen bg-[#0c141d] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin text-7xl mb-6">🏆</div>
          <h2 className="text-3xl font-bold text-white mb-3">Analyzing Complete Battle...</h2>
          <p className="text-white/60 text-lg mb-6">Calculating scores across all 3 phases</p>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'reconnecting') {
    return (
      <div className="min-h-screen bg-[#0c141d] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Reconnecting to session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c141d] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-xl">{message || 'Loading...'}</p>
      </div>
    </div>
  );
}

