import Link from 'next/link';

const modes = [
  {
    label: 'Quick Match',
    headline: 'Four-minute duels',
    copy: 'Drop into a lightning round with auto-filled parties and instant scoring.',
    cta: 'Preview queue',
    href: '/quick-match',
    emoji: '⚡',
    color: 'cyan',
  },
  {
    label: 'Ranked Circuit',
    headline: 'Climb the ladder',
    copy: 'Face skill-matched rivals across draft, feedback, and revision phases.',
    cta: 'View dossier',
    href: '/ranked',
    emoji: '🏆',
    color: 'pink',
  },
  {
    label: 'Solo Training',
    headline: 'Calibrate traits',
    copy: 'Run focused drills with Claude guidance and track your deltas over time.',
    cta: 'Open practice',
    href: '/practice',
    emoji: '🛠️',
    color: 'orange',
  },
];

/**
 * Game modes table component for landing page
 * Displays available game modes in a table format
 */
export function LandingModesTable() {
  const colorMap: Record<string, string> = { cyan: '#00e5e5', pink: '#ff5f8f', orange: '#ff9030' };
  const bgMap: Record<string, string> = { cyan: 'rgba(0,229,229,0.12)', pink: 'rgba(255,95,143,0.12)', orange: 'rgba(255,144,48,0.12)' };

  return (
    <section className="mb-12">
      <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(255,255,255,0.22)]">
        Game Modes
      </div>
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-0">
        <div className="grid grid-cols-[2fr_1fr_1fr_100px] border-b border-[rgba(255,255,255,0.05)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
          <span>Mode</span>
          <span>Duration</span>
          <span>Players</span>
          <span></span>
        </div>
        {modes.map((mode) => (
          <div 
            key={mode.label}
            className="grid grid-cols-[2fr_1fr_1fr_100px] items-center border-b border-[rgba(255,255,255,0.05)] px-4 py-4 transition-colors last:border-0 hover:bg-[rgba(255,255,255,0.04)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(255,255,255,0.04)] text-sm">
                {mode.emoji}
              </div>
              <div>
                <div className="text-sm font-medium">{mode.label}</div>
                <div className="text-xs text-[rgba(255,255,255,0.4)]">{mode.headline}</div>
              </div>
            </div>
            <span className="font-mono text-sm" style={{ color: colorMap[mode.color] }}>4 min</span>
            <span 
              className="inline-flex w-fit items-center rounded-[20px] px-2 py-1 text-[11px] font-medium uppercase tracking-[0.04em]"
              style={{ background: bgMap[mode.color], color: colorMap[mode.color] }}
            >
              {mode.label === 'Solo Training' ? 'Solo' : '2-4'}
            </span>
            <div className="flex justify-end">
              <Link
                href={mode.href}
                className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-transparent px-3 py-2 text-[11px] font-medium uppercase tracking-[0.04em] text-[rgba(255,255,255,0.4)] transition-all hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
              >
                Enter
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

