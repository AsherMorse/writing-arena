'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { getPhaseColor } from '@/lib/constants/colors';

interface RankedLandingProps {
  userProfile: UserProfile;
}

export default function RankedLanding({ userProfile }: RankedLandingProps) {
  const router = useRouter();
  const [selectedTrait, setSelectedTrait] = useState<string>('all');

  const traits = [
    { id: 'all', name: 'All traits', icon: '✨' },
    { id: 'content', name: 'Content', icon: '📚' },
    { id: 'organization', name: 'Organization', icon: '🗂️' },
    { id: 'grammar', name: 'Grammar', icon: '✏️' },
    { id: 'vocabulary', name: 'Vocabulary', icon: '📖' },
    { id: 'mechanics', name: 'Mechanics', icon: '⚙️' },
  ];

  const handleStartMatch = () => {
    router.push(`/ranked/matchmaking?trait=${selectedTrait}`);
  };

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <header className="border-b border-[rgba(255,255,255,0.05)]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-5">
          <Link href="/dashboard" className="text-base font-semibold tracking-wide">
            Ranked Arena
          </Link>
          <Link
            href="/dashboard"
            className="rounded-[10px] border border-[rgba(255,255,255,0.05)] px-4 py-2 text-xs font-medium uppercase tracking-[0.04em] text-[rgba(255,255,255,0.4)] transition-all hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-8 py-10 space-y-8">
        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
              Current Rank
            </div>
            <div className="font-mono text-xl font-medium leading-tight text-[#00e5e5]">
              {userProfile.currentRank}
            </div>
            <div className="mt-2 text-xs text-[rgba(255,255,255,0.4)]">
              {100 - (userProfile.rankLP % 100)} LP to promo
            </div>
          </div>
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
              LP Progress
            </div>
            <div className="font-mono text-3xl font-medium leading-none text-[#ff5f8f]">
              {userProfile.rankLP % 100}
            </div>
            <div className="mt-2 h-[6px] overflow-hidden rounded-[3px] bg-[rgba(255,255,255,0.05)]">
              <div
                className="h-full rounded-[3px] bg-[#ff5f8f]"
                style={{ width: `${userProfile.rankLP % 100}%` }}
              />
            </div>
          </div>
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
              Win Reward
            </div>
            <div className="font-mono text-3xl font-medium leading-none text-[#00d492]">
              +15
            </div>
            <div className="mt-2 text-xs text-[rgba(255,255,255,0.4)]">to +30 LP</div>
          </div>
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
              Loss Risk
            </div>
            <div className="font-mono text-3xl font-medium leading-none text-[#ff9030]">
              -10
            </div>
            <div className="mt-2 text-xs text-[rgba(255,255,255,0.4)]">to -20 LP</div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr,380px]">
          <div className="space-y-6">
            <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
                  Trait Focus
                </div>
                <span className="rounded-[20px] bg-[rgba(255,144,48,0.12)] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.04em] text-[#ff9030]">
                  Beta
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {traits.map((trait) => {
                  const disabled = trait.id !== 'all';
                  const selected = selectedTrait === trait.id;
                  return (
                    <button
                      key={trait.id}
                      onClick={() => !disabled && setSelectedTrait(trait.id)}
                      disabled={disabled}
                      className={`rounded-[10px] border p-4 text-left transition-all ${
                        selected
                          ? 'border-[#00e5e5] bg-[rgba(0,229,229,0.1)]'
                          : disabled
                          ? 'cursor-not-allowed border-[rgba(255,255,255,0.03)] bg-[rgba(255,255,255,0.01)] opacity-40'
                          : 'border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] hover:bg-[rgba(255,255,255,0.04)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{trait.icon}</span>
                        {selected && (
                          <span className="rounded-[20px] bg-[rgba(0,229,229,0.12)] px-1.5 py-0.5 text-[9px] font-medium uppercase text-[#00e5e5]">
                            Active
                          </span>
                        )}
                        {disabled && !selected && (
                          <span className="text-[9px] uppercase text-[rgba(255,255,255,0.22)]">Soon</span>
                        )}
                      </div>
                      <div className="mt-2 text-sm font-medium">{trait.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
              <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
                Phase Timeline
              </div>
              <div className="space-y-3">
                {[
                  { phase: 'Draft', time: '4 min', desc: 'Respond to the prompt', color: getPhaseColor(1) },
                  { phase: 'Feedback', time: '3 min', desc: 'Score a peer submission', color: getPhaseColor(2) },
                  { phase: 'Revision', time: '2 min', desc: 'Refine your draft', color: getPhaseColor(3) },
                ].map((item, index) => (
                  <div
                    key={item.phase}
                    className="flex items-center gap-4 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4"
                  >
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-semibold"
                      style={{ borderColor: item.color, color: item.color }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.phase}</span>
                        <span className="font-mono text-xs" style={{ color: item.color }}>{item.time}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-[rgba(255,255,255,0.4)]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
              <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
                Rank Ladder
              </div>
              <div className="grid grid-cols-7 gap-2">
                {[
                  { name: 'Bronze', emoji: '🥉', color: '#cd7f32' },
                  { name: 'Silver', emoji: '🥈', color: '#c0c0c0' },
                  { name: 'Gold', emoji: '🥇', color: '#ffd700' },
                  { name: 'Plat', emoji: '💎', color: '#00e5e5' },
                  { name: 'Diamond', emoji: '💠', color: '#b9f2ff' },
                  { name: 'Master', emoji: '⭐', color: '#ff5f8f' },
                  { name: 'GM', emoji: '👑', color: '#ff9030' },
                ].map((tier) => (
                  <div
                    key={tier.name}
                    className="flex flex-col items-center rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3 text-center"
                  >
                    <span className="text-xl">{tier.emoji}</span>
                    <span className="mt-1 text-[10px] text-[rgba(255,255,255,0.4)]">{tier.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[14px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.05)] p-6">
              <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#00e5e5]">
                Ready to Queue
              </div>
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[10px] bg-[rgba(0,229,229,0.12)] text-3xl">
                  🏆
                </div>
                <div>
                  <div className="text-xl font-semibold">Ranked Match</div>
                  <div className="text-sm text-[rgba(255,255,255,0.4)]">3 phases · ~10 min</div>
                </div>
              </div>
              <button
                onClick={handleStartMatch}
                className="w-full rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] py-4 text-sm font-semibold uppercase tracking-[0.04em] text-[#101012] transition-all hover:bg-[#33ebeb]"
              >
                Start Ranked Match
              </button>
              <p className="mt-3 text-center text-xs text-[rgba(255,255,255,0.4)]">
                Matchmaking within your tier
              </p>
            </div>

            <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
              <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
                Pre-match Checklist
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Warm-up complete', ready: true },
                  { label: 'Focus mode on', ready: false },
                  { label: 'Feedback mindset', ready: true },
                  { label: 'No distractions', ready: true },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3"
                  >
                    <span className="text-sm text-[rgba(255,255,255,0.6)]">{item.label}</span>
                    {item.ready ? (
                      <span className="rounded-[20px] bg-[rgba(0,212,146,0.12)] px-2 py-0.5 text-[10px] font-medium uppercase text-[#00d492]">
                        Ready
                      </span>
                    ) : (
                      <span className="rounded-[20px] bg-[rgba(255,144,48,0.12)] px-2 py-0.5 text-[10px] font-medium uppercase text-[#ff9030]">
                        Check
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[14px] border border-[rgba(255,144,48,0.2)] bg-[rgba(255,144,48,0.05)] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#ff9030]" />
                <div>
                  <div className="text-sm font-medium text-[#ff9030]">LP at stake</div>
                  <p className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">
                    Queue prepared to avoid steep LP swings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
