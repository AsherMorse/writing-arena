import { formatTime } from '@/lib/utils/time-utils';

interface RevisionHeaderProps {
  timeRemaining: number;
  timeColor: string;
  progressPercent: number;
  wordCountRevised: number;
  wordCount: number;
  hasRevised: boolean;
}

export function RevisionHeader({ 
  timeRemaining, 
  timeColor, 
  progressPercent, 
  wordCountRevised, 
  wordCount, 
  hasRevised 
}: RevisionHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.05)] bg-[#101012]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] font-mono text-xl font-medium" style={{ color: timeColor }}>
            {formatTime(timeRemaining)}
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">Phase 3 · Revision</div>
            <div className="text-sm font-medium" style={{ color: timeColor }}>
              {timeRemaining > 0 ? 'Time remaining' : "Time's up!"}
            </div>
          </div>
          <span className="rounded-[20px] bg-[rgba(0,212,146,0.12)] px-2 py-1 text-[10px] font-medium uppercase text-[#00d492]">
            Final Draft
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.025)] px-3 py-1.5">
            <span className="font-mono text-sm text-[#00d492]">{wordCountRevised}</span>
            <span className="ml-1 text-xs text-[rgba(255,255,255,0.4)]">words</span>
            {hasRevised && <span className="ml-2 text-xs text-[#00d492]">({wordCountRevised > wordCount ? '+' : ''}{wordCountRevised - wordCount})</span>}
          </div>
          <div className="text-xs text-[rgba(255,255,255,0.4)]">⏱️ Auto-submits at 0:00</div>
        </div>
      </div>
      <div className="mx-auto h-1 max-w-[1200px] rounded-full bg-[rgba(255,255,255,0.05)]">
        <div className="h-full rounded-full transition-all" style={{ width: `${progressPercent}%`, background: timeColor }} />
      </div>
    </header>
  );
}

