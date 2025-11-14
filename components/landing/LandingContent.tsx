import Link from 'next/link';

const modes = [
  {
    label: 'Quick Match',
    headline: 'Four-minute duels',
    copy: 'Drop into a lightning round with auto-filled parties and instant scoring.',
    cta: 'Preview queue',
    href: '/quick-match',
    emoji: '⚡',
  },
  {
    label: 'Ranked Circuit',
    headline: 'Climb the ladder',
    copy: 'Face skill-matched rivals across draft, feedback, and revision phases.',
    cta: 'View dossier',
    href: '/ranked',
    emoji: '🏆',
  },
  {
    label: 'Solo Training',
    headline: 'Calibrate traits',
    copy: 'Run focused drills with Claude guidance and track your deltas over time.',
    cta: 'Open practice',
    href: '/practice',
    emoji: '🛠️',
  },
];

const stagePipeline = [
  { id: '01', title: 'Join arena', detail: 'Create a free profile and choose your writer avatar.' },
  { id: '02', title: 'Select mode', detail: 'Queue for quick, ranked, or solo to sharpen specific traits.' },
  { id: '03', title: 'Compete & learn', detail: 'Use AI feedback, phase scores, and streaks to level up.' },
];

export default function LandingContent() {
  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400/20 text-xl text-emerald-200">
              ✶
            </div>
            <span className="text-xl font-semibold tracking-wide">Writing Arena</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/auth"
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2 font-semibold text-white transition hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16 space-y-16">
        <section className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-emerald-200/80">
              Competitive writing platform
            </div>
            <div>
              <h1 className="text-4xl font-semibold md:text-5xl">
                Build writing instincts under pressure
              </h1>
              <p className="mt-4 text-base text-white/60 md:text-lg">
                Writing Arena blends live competition with Claude-powered coaching. Sprint through
                four-minute drafts, provide peer feedback, and evolve your writer tree from Seedling to
                Redwood.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth"
                className="rounded-full bg-emerald-400 px-8 py-3 text-center text-sm font-semibold text-[#0c141d] transition hover:bg-emerald-300"
              >
                Enter the arena
              </Link>
              <Link
                href="/ranked"
                className="rounded-full border border-white/15 bg-white/5 px-8 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore ranked circuit
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-xs text-white/60">
              <div>
                Avg match: <span className="text-white font-semibold">4 minutes</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-white/30" />
              <div>
                Traits tracked: <span className="text-white font-semibold">5</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-white/30" />
              <div>
                Mastery tiers: <span className="text-white font-semibold">6</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">How it works</div>
              <ol className="mt-6 space-y-4">
                {stagePipeline.map((stage) => (
                  <li key={stage.id} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300 text-sm font-semibold text-emerald-200">
                      {stage.id}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{stage.title}</div>
                      <p className="text-xs text-white/60">{stage.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-6 space-y-4">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Rank path</div>
              <div className="flex flex-wrap gap-3 text-sm">
                {[
                  '🌱 Seedling',
                  '🌿 Sapling',
                  '🌳 Young Oak',
                  '🌲 Mature Oak',
                  '🌴 Ancient Oak',
                  '🏔️ Legendary Redwood',
                ].map((stage) => (
                  <div
                    key={stage}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/60"
                  >
                    {stage}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Choose your lane</div>
              <h2 className="mt-2 text-2xl font-semibold">Game modes built for different reps</h2>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {modes.map((mode) => (
              <div
                key={mode.label}
                className="group flex flex-col gap-6 rounded-3xl border border-white/10 bg-[#141e27] p-6 transition hover:border-emerald-200/40"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
                  {mode.label}
                  <span className="text-lg">{mode.emoji}</span>
                </div>
                <div>
                  <div className="text-xl font-semibold">{mode.headline}</div>
                  <p className="mt-2 text-sm text-white/60">{mode.copy}</p>
                </div>
                <Link
                  href={mode.href}
                  className="inline-flex w-max items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition group-hover:border-emerald-200/40 group-hover:text-emerald-200"
                >
                  {mode.cta}
                  <span>→</span>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 rounded-3xl border border-white/10 bg-[#141e27] p-10 lg:grid-cols-[0.8fr,1.2fr]">
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">Why writers stay</div>
            <p className="text-sm text-white/60">
              Every match ends with AI breakdowns, trait deltas, and next-step suggestions. Streaks
              unlock avatar evolutions, seasonal titles, and access to ranked scrims. The faster you
              loop, the sharper you get.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              Try the demo account
              <span>↗</span>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: 'Claude-powered critiques',
                detail:
                  'Phase-by-phase commentary that highlights strengths, gaps, and suggested drills.',
              },
              {
                title: 'Live trait analytics',
                detail:
                  'Momentum graphs track how your content, organization, grammar, vocabulary, and mechanics evolve.',
              },
              {
                title: 'Seasonal ladders',
                detail:
                  'Ranked splits reset each term with new rewards and calibrated LP adjustments.',
              },
              {
                title: 'Party backfill AI',
                detail:
                  'Queue at any hour—synthetic teammates keep matches flowing while humans join.',
              },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <div className="text-sm font-semibold text-white">{card.title}</div>
                <p className="mt-2 text-xs text-white/60">{card.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <span>© 2025 Writing Arena. Match, iterate, and grow.</span>
          <div className="flex items-center gap-4">
            <Link href="/ranked" className="hover:text-white">
              Ranked
            </Link>
            <Link href="/quick-match" className="hover:text-white">
              Quick Match
            </Link>
            <Link href="/practice" className="hover:text-white">
              Practice
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

