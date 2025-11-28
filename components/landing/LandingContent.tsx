'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { LandingModes } from './LandingModes';
import { LandingFeatures } from './LandingFeatures';
import { LandingRanks } from './LandingRanks';

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

const features = [
  {
    title: 'Claude-powered critiques',
    detail: 'Phase-by-phase commentary that highlights strengths, gaps, and suggested drills.',
    color: 'cyan',
  },
  {
    title: 'Live trait analytics',
    detail: 'Momentum graphs track how your content, organization, grammar, vocabulary, and mechanics evolve.',
    color: 'pink',
  },
  {
    title: 'Seasonal ladders',
    detail: 'Ranked splits reset each term with new rewards and calibrated LP adjustments.',
    color: 'orange',
  },
  {
    title: 'Party backfill AI',
    detail: 'Queue at any hour—synthetic teammates keep matches flowing while humans join.',
    color: 'green',
  },
];

const ranks = [
  { name: 'Seedling', emoji: '🌱', progress: 100 },
  { name: 'Sapling', emoji: '🌿', progress: 100 },
  { name: 'Young Oak', emoji: '🌳', progress: 65 },
  { name: 'Mature Oak', emoji: '🌲', progress: 0 },
  { name: 'Ancient Oak', emoji: '🌴', progress: 0 },
  { name: 'Redwood', emoji: '🏔️', progress: 0 },
];

export default function LandingContent() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const headerCtaHref = isLoggedIn ? '/dashboard' : '/auth';
  const headerCtaLabel = isLoggedIn ? 'Dashboard' : 'Sign in';
  const heroCtaHref = isLoggedIn ? '/dashboard' : '/auth';
  const heroCtaLabel = isLoggedIn ? 'Resume writing' : 'Enter the arena';

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <LandingHeader headerCtaHref={headerCtaHref} headerCtaLabel={headerCtaLabel} />

      <main className="mx-auto max-w-[1200px] px-8 py-12">
        <section className="mb-12">
          <div className="inline-flex items-center rounded-[20px] bg-[rgba(0,229,229,0.12)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.04em] text-[#00e5e5]">
            Competitive writing platform
          </div>
          <h1 className="mt-4 text-[28px] font-semibold leading-tight">
            Build writing instincts under pressure
          </h1>
          <p className="mt-2 text-sm text-[rgba(255,255,255,0.4)]">
            Sprint through four-minute drafts, provide peer feedback, and evolve your writer tree from Seedling to Redwood.
          </p>
        </section>

        <section className="mb-12 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
              Avg Match
            </div>
            <div className="font-mono text-4xl font-medium leading-none text-[#00e5e5]">4</div>
            <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">minutes</div>
          </div>
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
              Traits Tracked
            </div>
            <div className="font-mono text-4xl font-medium leading-none text-[#ff5f8f]">5</div>
            <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">categories</div>
          </div>
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
              Mastery Tiers
            </div>
            <div className="font-mono text-4xl font-medium leading-none text-[#ff9030]">5</div>
            <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">levels</div>
          </div>
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
              AI Coach
            </div>
            <div className="font-mono text-4xl font-medium leading-none text-[#00d492]">24/7</div>
            <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">available</div>
          </div>
        </section>

        <section className="mb-12 grid gap-3 lg:grid-cols-2">
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
                How it works
              </div>
              <div className="flex gap-1">
                <button className="rounded-[6px] bg-[rgba(255,255,255,0.025)] px-3 py-1 text-xs text-[#00e5e5]">
                  1
                </button>
                <button className="rounded-[6px] px-3 py-1 text-xs text-[rgba(255,255,255,0.22)]">
                  2
                </button>
                <button className="rounded-[6px] px-3 py-1 text-xs text-[rgba(255,255,255,0.22)]">
                  3
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { id: '01', title: 'Join arena', detail: 'Create a free profile and choose your writer avatar.', color: '#00e5e5' },
                { id: '02', title: 'Select mode', detail: 'Queue for quick, ranked, or solo to sharpen specific traits.', color: '#ff5f8f' },
                { id: '03', title: 'Compete & learn', detail: 'Use AI feedback, phase scores, and streaks to level up.', color: '#00d492' },
              ].map((step) => (
                <div key={step.id} className="flex items-start gap-4 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
                  <div 
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-semibold"
                    style={{ borderColor: step.color, color: step.color }}
                  >
                    {step.id}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{step.title}</div>
                    <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">{step.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5">
            <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
              Rank Progression
            </div>
            <div className="space-y-3">
              {ranks.map((rank) => (
                <div key={rank.name} className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{rank.emoji}</span>
                    <span className="text-sm text-[rgba(255,255,255,0.8)]">{rank.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-[6px] w-24 overflow-hidden rounded-[3px] bg-[rgba(255,255,255,0.05)]">
                      <div 
                        className="h-full rounded-[3px] transition-all"
                        style={{ 
                          width: `${rank.progress}%`,
                          background: rank.progress === 100 ? '#00d492' : rank.progress > 0 ? '#00e5e5' : 'transparent'
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs" style={{ color: rank.progress === 100 ? '#00d492' : rank.progress > 0 ? '#00e5e5' : 'rgba(255,255,255,0.22)' }}>
                      {rank.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

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
            {modes.map((mode) => {
              const colorMap: Record<string, string> = { cyan: '#00e5e5', pink: '#ff5f8f', orange: '#ff9030' };
              const bgMap: Record<string, string> = { cyan: 'rgba(0,229,229,0.12)', pink: 'rgba(255,95,143,0.12)', orange: 'rgba(255,144,48,0.12)' };
              return (
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
              );
            })}
          </div>
        </section>

        <section className="mb-12 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const colorMap: Record<string, string> = { cyan: '#00e5e5', pink: '#ff5f8f', orange: '#ff9030', green: '#00d492' };
            return (
              <div 
                key={feature.title}
                className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
              >
                <div 
                  className="mb-2 inline-flex h-2 w-2 rounded-full"
                  style={{ background: colorMap[feature.color] }}
                />
                <div className="text-sm font-semibold">{feature.title}</div>
                <p className="mt-2 text-xs text-[rgba(255,255,255,0.4)]">{feature.detail}</p>
              </div>
            );
          })}
        </section>

        <section className="mb-12">
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.025)] text-2xl text-[rgba(255,255,255,0.22)]">
              ✶
            </div>
            <h2 className="text-xl font-semibold">Ready to start writing?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[rgba(255,255,255,0.4)]">
              Join the arena and transform your writing through competitive matches and AI-powered feedback.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={heroCtaHref}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-6 py-3 text-xs font-medium uppercase tracking-[0.04em] text-[#101012] transition-all hover:bg-[#33ebeb]"
              >
                {heroCtaLabel}
              </Link>
              <Link
                href="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-transparent px-6 py-3 text-xs font-medium uppercase tracking-[0.04em] text-[rgba(255,255,255,0.4)] transition-all hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
              >
                Try demo account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgba(255,255,255,0.05)]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-8 py-8 text-sm text-[rgba(255,255,255,0.22)] md:flex-row md:items-center md:justify-between">
          <span>© 2025 Writing Arena. Match, iterate, and grow.</span>
          <div className="flex items-center gap-6">
            <Link href="/ranked" className="transition-colors hover:text-[rgba(255,255,255,0.8)]">
              Ranked
            </Link>
            <Link href="/quick-match" className="transition-colors hover:text-[rgba(255,255,255,0.8)]">
              Quick Match
            </Link>
            <Link href="/practice" className="transition-colors hover:text-[rgba(255,255,255,0.8)]">
              Practice
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
