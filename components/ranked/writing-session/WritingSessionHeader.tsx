import WritingTimer from '../WritingTimer';

interface WritingSessionHeaderProps {
  timeRemaining: number;
  wordCount: number;
  onShowTips: () => void;
}

export function WritingSessionHeader({ timeRemaining, wordCount, onShowTips }: WritingSessionHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.05)] bg-[#101012]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4">
        <WritingTimer timeRemaining={timeRemaining} phase={1} />
        <div className="flex items-center gap-3">
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.025)] px-3 py-1.5">
            <span className="font-mono text-sm text-[#00e5e5]">{wordCount}</span>
            <span className="ml-1 text-xs text-[rgba(255,255,255,0.4)]">words</span>
          </div>
          <button
            onClick={onShowTips}
            className="rounded-[10px] border border-[rgba(255,255,255,0.05)] px-4 py-2 text-xs font-medium uppercase tracking-[0.04em] text-[rgba(255,255,255,0.4)] transition-all hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
          >
            Tips
          </button>
        </div>
      </div>
    </header>
  );
}

