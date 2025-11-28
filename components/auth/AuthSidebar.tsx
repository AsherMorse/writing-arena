'use client';

import { COLOR_CLASSES, getPhaseColor } from '@/lib/constants/colors';

export function AuthSidebar() {
  return (
    <div className="hidden lg:block">
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
          Platform Stats
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4">
            <span className="text-sm text-[rgba(255,255,255,0.4)]">Active Writers</span>
            <span className={`font-mono text-lg ${COLOR_CLASSES.phase1.text}`}>2,847</span>
          </div>
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4">
            <span className="text-sm text-[rgba(255,255,255,0.4)]">Matches Today</span>
            <span className={`font-mono text-lg ${COLOR_CLASSES.phase2.text}`}>1,234</span>
          </div>
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4">
            <span className="text-sm text-[rgba(255,255,255,0.4)]">Words Written</span>
            <span className={`font-mono text-lg ${COLOR_CLASSES.orange.text}`}>4.2M</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[rgba(255,255,255,0.4)]">Avg Improvement</span>
            <span className={`font-mono text-lg ${COLOR_CLASSES.phase3.text}`}>+18%</span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
          Recent Activity
        </div>
        <div className="space-y-4">
          {[
            { event: 'New user joined', time: '2 min ago', phase: 3 },
            { event: 'Match completed', time: '5 min ago', phase: 1 },
            { event: 'Rank achieved', time: '12 min ago', phase: null },
            { event: 'Feedback given', time: '18 min ago', phase: 2 },
          ].map((item, i) => {
            const color = item.phase && (item.phase === 1 || item.phase === 2 || item.phase === 3) ? getPhaseColor(item.phase) : '#ff9030';
            return (
            <div key={i} className="flex items-start gap-3">
              <div 
                className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                style={{ background: color }}
              />
              <div className="flex-1">
                <div className="text-sm">{item.event}</div>
                <div className="text-xs text-[rgba(255,255,255,0.22)]">{item.time}</div>
              </div>
            </div>
          );
          })}
        </div>
      </div>
    </div>
  );
}

