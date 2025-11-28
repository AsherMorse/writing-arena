'use client';

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
            <span className="font-mono text-lg text-[#00e5e5]">2,847</span>
          </div>
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4">
            <span className="text-sm text-[rgba(255,255,255,0.4)]">Matches Today</span>
            <span className="font-mono text-lg text-[#ff5f8f]">1,234</span>
          </div>
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4">
            <span className="text-sm text-[rgba(255,255,255,0.4)]">Words Written</span>
            <span className="font-mono text-lg text-[#ff9030]">4.2M</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[rgba(255,255,255,0.4)]">Avg Improvement</span>
            <span className="font-mono text-lg text-[#00d492]">+18%</span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
          Recent Activity
        </div>
        <div className="space-y-4">
          {[
            { event: 'New user joined', time: '2 min ago', color: '#00d492' },
            { event: 'Match completed', time: '5 min ago', color: '#00e5e5' },
            { event: 'Rank achieved', time: '12 min ago', color: '#ff9030' },
            { event: 'Feedback given', time: '18 min ago', color: '#ff5f8f' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div 
                className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                style={{ background: item.color }}
              />
              <div className="flex-1">
                <div className="text-sm">{item.event}</div>
                <div className="text-xs text-[rgba(255,255,255,0.22)]">{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

