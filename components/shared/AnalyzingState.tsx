'use client';

interface AnalyzingStateProps {
  message?: string;
  subtitle?: string;
  icon?: string;
}

/**
 * Reusable analyzing/loading state component
 * Used when AI is evaluating writing or calculating scores
 */
export function AnalyzingState({ 
  message = 'Analyzing...', 
  subtitle = 'AI is evaluating your response and preparing feedback.',
  icon = '🤖'
}: AnalyzingStateProps) {
  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#141e27] text-3xl">
          {icon}
        </div>
        <h2 className="text-2xl font-semibold">{message}</h2>
        <p className="text-sm text-white/60">{subtitle}</p>
        <div className="flex gap-2">
          {[0, 150, 300].map(delay => (
            <span 
              key={delay} 
              className="h-2 w-2 animate-bounce rounded-full bg-emerald-300" 
              style={{ animationDelay: `${delay}ms` }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

