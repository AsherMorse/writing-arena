'use client';

interface AnalyzingStateProps {
  message?: string;
  subtitle?: string;
  icon?: string;
}

export function AnalyzingState({ 
  message = 'Analyzing...', 
  subtitle = 'AI is evaluating your response and preparing feedback.',
  icon = '🤖'
}: AnalyzingStateProps) {
  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] text-3xl">
          {icon}
        </div>
        <h2 className="text-xl font-semibold">{message}</h2>
        <p className="text-sm text-[rgba(255,255,255,0.4)]">{subtitle}</p>
        <div className="flex gap-2">
          {[0, 150, 300].map(delay => (
            <span 
              key={delay} 
              className="h-2 w-2 animate-bounce rounded-full bg-[#00e5e5]" 
              style={{ animationDelay: `${delay}ms` }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
