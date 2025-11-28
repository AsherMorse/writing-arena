import { formatTime } from '@/lib/utils/time-utils';

interface PeerFeedbackHeaderProps {
  timeRemaining: number;
  timeColor: string;
  progressPercent: number;
}

export function PeerFeedbackHeader({ timeRemaining, timeColor, progressPercent }: PeerFeedbackHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.05)] bg-[#101012]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] font-mono text-xl font-medium" style={{ color: timeColor }}>
            {formatTime(timeRemaining)}
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">Phase 2 · Feedback</div>
            <div className="text-sm font-medium" style={{ color: timeColor }}>
              {timeRemaining > 0 ? 'Time remaining' : "Time's up!"}
            </div>
          </div>
          <span className="rounded-[20px] bg-[rgba(255,95,143,0.12)] px-2 py-1 text-[10px] font-medium uppercase text-[#ff5f8f]">
            Peer Review
          </span>
        </div>
        <div className="text-xs text-[rgba(255,255,255,0.4)]">⏱️ Auto-submits at 0:00</div>
      </div>
      <div className="mx-auto h-1 max-w-[1200px] rounded-full bg-[rgba(255,255,255,0.05)]">
        <div className="h-full rounded-full transition-all" style={{ width: `${progressPercent}%`, background: timeColor }} />
      </div>
    </header>
  );
}

