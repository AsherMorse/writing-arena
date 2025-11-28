'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LandingHeader } from './LandingHeader';
import { LandingIntro } from './LandingIntro';
import { LandingStats } from './LandingStats';
import { LandingHowItWorks } from './LandingHowItWorks';
import { LandingRanks } from './LandingRanks';
import { LandingModesTable } from './LandingModesTable';
import { LandingFeatures } from './LandingFeatures';
import { LandingCTA } from './LandingCTA';
import { LandingFooter } from './LandingFooter';

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
        <LandingIntro />
        <LandingStats />

        <section className="mb-12 grid gap-3 lg:grid-cols-2">
          <LandingHowItWorks />
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5">
            <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
              Rank Progression
            </div>
            <div className="space-y-3">
              {[
                { name: 'Seedling', emoji: '🌱', progress: 100 },
                { name: 'Sapling', emoji: '🌿', progress: 100 },
                { name: 'Young Oak', emoji: '🌳', progress: 65 },
                { name: 'Mature Oak', emoji: '🌲', progress: 0 },
                { name: 'Ancient Oak', emoji: '🌴', progress: 0 },
                { name: 'Redwood', emoji: '🏔️', progress: 0 },
              ].map((rank) => (
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

        <LandingModesTable />
        <LandingFeatures />
        <LandingCTA heroCtaHref={heroCtaHref} heroCtaLabel={heroCtaLabel} />
      </main>

      <LandingFooter />
    </div>
  );
}
