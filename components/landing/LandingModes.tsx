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

const colorMap: Record<string, string> = {
  cyan: '#00e5e5',
  pink: '#ff5f8f',
  orange: '#ff9030',
};

export function LandingModes() {
  return (
    <section className="mx-auto max-w-[1200px] px-8 py-16">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-semibold">Choose Your Mode</h2>
        <p className="text-sm text-[rgba(255,255,255,0.4)]">
          Three ways to level up your writing
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {modes.map((mode) => (
          <div
            key={mode.label}
            className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6 transition-all hover:bg-[rgba(255,255,255,0.04)]"
          >
            <div className="mb-4 text-4xl">{mode.emoji}</div>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
              {mode.label}
            </div>
            <h3 className="mb-2 text-lg font-semibold">{mode.headline}</h3>
            <p className="mb-4 text-sm text-[rgba(255,255,255,0.4)]">{mode.copy}</p>
            <Link
              href={mode.href}
              className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.04em] transition-colors"
              style={{ color: colorMap[mode.color] }}
            >
              {mode.cta} →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

