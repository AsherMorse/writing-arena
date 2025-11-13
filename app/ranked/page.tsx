'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function RankedPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [selectedTrait, setSelectedTrait] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-[#101820] flex items-center justify-center">
        <div className="text-white/70 text-sm">Loading ranked setup...</div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-[#101820] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400/20 text-xl text-emerald-200">
              ✶
            </div>
            <span className="text-xl font-semibold tracking-wide">Ranked Arena</span>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14 space-y-10">
        <section className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-6 lg:w-2/3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20 text-2xl text-emerald-200">
                  🏆
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/50">Ranked briefing</div>
                  <h1 className="mt-2 text-3xl font-semibold">Hold your position</h1>
                </div>
              </div>
              <p className="text-sm text-white/60">
                Queue into a three-phase battle where LP is on the line. Performance across draft, feedback, and revision decides your climb.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[{
                  title: 'Matchmaking',
                  subtitle: 'Tier-weighted',
                  note: 'Queues within your LP band',
                  icon: '⚖️'
                }, {
                  title: 'Risk/Reward',
                  subtitle: '± LP swings',
                  note: 'Wins +15~30 / losses -10~20',
                  icon: '📈'
                }, {
                  title: 'Rewards',
                  subtitle: '2x payout',
                  note: 'Boosted XP and points',
                  icon: '💎'
                }].map(card => (
                  <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs uppercase text-white/40">{card.title}</div>
                      <span className="text-lg">{card.icon}</span>
                    </div>
                    <div className="mt-2 text-sm font-semibold">{card.subtitle}</div>
                    <p className="mt-1 text-xs text-white/50">{card.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 lg:w-1/3">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/50">Current rank</div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-semibold">{userProfile.currentRank}</div>
                    <p className="mt-1 text-xs text-white/50">{100 - (userProfile.rankLP % 100)} LP until promotion</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#141e27] text-2xl">🥈</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>LP progress</span>
                  <span>{userProfile.rankLP % 100} / 100</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${userProfile.rankLP % 100}%` }}
                  />
                </div>
                <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                  Rank at stake. Queue prepared to avoid steep LP swings.
                </div>
              </div>
              <button
                onClick={handleStartMatch}
                className="mt-auto w-full rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-[#0c141c] transition hover:bg-emerald-300"
              >
                Start ranked match
              </button>
              <p className="text-center text-[11px] text-white/50">Searching for opponents in your tier...</p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.4fr,1fr]">
          <div className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/50">Trait focus</div>
                  <h2 className="mt-2 text-xl font-semibold">Choose emphasis</h2>
                  <p className="mt-2 text-xs text-white/50">All traits queue is active during this playtest. Solo focus queues arrive soon.</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/20 text-lg text-emerald-200">
                  🎯
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {traits.map(trait => {
                  const disabled = trait.id !== 'all';
                  const selected = selectedTrait === trait.id;
                  return (
                    <button
                      key={trait.id}
                      onClick={() => !disabled && setSelectedTrait(trait.id)}
                      disabled={disabled}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        selected
                          ? 'border-emerald-300 bg-emerald-400/15'
                          : disabled
                          ? 'cursor-not-allowed border-white/10 bg-white/5 opacity-40'
                          : 'border-white/10 bg-white/5 hover:border-emerald-200/40 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <span className="text-lg text-white">{trait.icon}</span>
                        {selected && <span className="text-[10px] text-emerald-200">Selected</span>}
                        {disabled && !selected && <span className="text-[10px]">Soon</span>}
                      </div>
                      <div className="mt-3 text-sm font-semibold text-white">{trait.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Phase timeline</div>
              <div className="mt-6 space-y-6">
                {[{
                  phase: 'Phase 1 · Draft',
                  description: '4 minutes to respond to the prompt. Push clarity while managing speed.'
                }, {
                  phase: 'Phase 2 · Feedback',
                  description: 'Score a peer submission. Precision ratings amplify LP gains.'
                }, {
                  phase: 'Phase 3 · Revision',
                  description: 'Refine your draft using insight from feedback before the final tally.'
                }].map((item, index) => (
                  <div key={item.phase} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-300 text-sm text-emerald-200">
                        {index + 1}
                      </div>
                      {index < 2 && <div className="mt-2 h-full w-px flex-1 bg-white/10" />}
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                      <div className="text-sm font-semibold text-white">{item.phase}</div>
                      <p className="mt-2 text-xs text-white/50">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Queue checklist</div>
              <ul className="mt-4 space-y-3 text-xs text-white/60">
                <li className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Warm-up drill complete</span>
                  <span className="text-emerald-200 font-semibold">Ready</span>
                </li>
                <li className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Focus mode enabled</span>
                  <span className="text-white/40">Check</span>
                </li>
                <li className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Feedback mindset</span>
                  <span className="text-emerald-200 font-semibold">On</span>
                </li>
                <li className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Playlist locked</span>
                  <span className="text-white/40">Optional</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Rank ladder</div>
              <p className="mt-3 text-xs text-white/60">Seven tiers chronicle your climb. Finish splits to earn seasonal ornaments.</p>
              <div className="mt-6 grid gap-3">
                {[
                  { name: 'Bronze', emoji: '🥉' },
                  { name: 'Silver', emoji: '🥈' },
                  { name: 'Gold', emoji: '🥇' },
                  { name: 'Platinum', emoji: '💎' },
                  { name: 'Diamond', emoji: '💠' },
                  { name: 'Master', emoji: '⭐' },
                  { name: 'Grandmaster', emoji: '👑' },
                ].map(tier => (
                  <div key={tier.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{tier.emoji}</span>
                      <span className="text-sm font-semibold text-white">{tier.name}</span>
                    </div>
                    <span className="text-[10px] text-white/40">LP 100</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

