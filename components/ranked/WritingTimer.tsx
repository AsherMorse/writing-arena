'use client';

import { formatTime, getTimeColor } from '@/lib/utils/time-utils';
import { getPhaseTimeColor } from '@/lib/utils/phase-colors';
import { SCORING } from '@/lib/constants/scoring';

interface WritingTimerProps {
  timeRemaining: number;
  phase: 1 | 2 | 3;
}

export default function WritingTimer({ timeRemaining, phase }: WritingTimerProps) {
  const progressPercent = (timeRemaining / SCORING.PHASE1_DURATION) * 100;
  const timeColor = getPhaseTimeColor(phase, timeRemaining);

  return (
    <>
      <div className="flex items-center gap-4">
        <div 
          className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] font-mono text-xl font-medium" 
          style={{ color: timeColor }}
        >
          {formatTime(timeRemaining)}
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
            Phase {phase} · Draft
          </div>
          <div className="text-sm font-medium" style={{ color: timeColor }}>
            {timeRemaining > 0 ? 'Time remaining' : 'Time expired'}
          </div>
        </div>
        <span className="rounded-[20px] bg-[rgba(0,229,229,0.12)] px-2 py-1 text-[10px] font-medium uppercase text-[#00e5e5]">
          Ranked
        </span>
      </div>
      <div className="mx-auto h-1 max-w-[1200px] rounded-full bg-[rgba(255,255,255,0.05)]">
        <div 
          className="h-full rounded-full transition-all" 
          style={{ width: `${progressPercent}%`, background: timeColor }} 
        />
      </div>
    </>
  );
}

