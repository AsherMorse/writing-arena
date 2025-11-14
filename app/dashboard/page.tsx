'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, userProfile, loading, signOut } = useAuth();
  const router = useRouter();
  const [showMatchModal, setShowMatchModal] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const traitCards = useMemo(() => (
    userProfile ? [
      { name: 'Content', level: userProfile.traits.content, icon: '📚' },
      { name: 'Organization', level: userProfile.traits.organization, icon: '🗂️' },
      { name: 'Grammar', level: userProfile.traits.grammar, icon: '✏️' },
      { name: 'Vocabulary', level: userProfile.traits.vocabulary, icon: '📖' },
      { name: 'Mechanics', level: userProfile.traits.mechanics, icon: '⚙️' },
    ] : []
  ), [userProfile]);

  const objectives = [
    { title: 'Complete a warm-up session', detail: 'Run one focused drill before queueing.', type: 'Warm-up' },
    { title: 'Review build notes', detail: 'Glance at last feedback before a ranked match.', type: 'Review' },
    { title: "Plan tonight's run", detail: 'Pick mode and set a match goal.', type: 'Planning' },
  ];

  const readinessChecklist = useMemo(() => (
    userProfile ? [
      { label: 'Profile info current', ready: true },
      { label: 'Trait balance solid', ready: Object.values(userProfile.traits).every(level => level >= 6) },
      { label: 'Focus trait chosen', ready: true },
      { label: 'Streak bonus active', ready: userProfile.stats.currentStreak > 0 },
    ] : []
  ), [userProfile]);

  const warmupPrompts = [
    { title: 'Organization Drill', trait: 'Organization', duration: '4 min' },
    { title: 'Vocabulary Burst', trait: 'Vocabulary', duration: '4 min' },
    { title: 'Grammar Sprint', trait: 'Grammar', duration: '4 min' },
  ];

  const upcomingMatches = [
    { mode: 'Ranked', eta: 'Today · 7:00 PM', teammates: ['Nova', 'Lumen'], route: '/ranked' },
    { mode: 'Quick Match', eta: 'Tomorrow · 4:30 PM', teammates: ['AutoFill'], route: '/quick-match' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c141d] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full border border-white/10 flex items-center justify-center text-2xl text-emerald-300">✶</div>
          <h2 className="text-2xl font-semibold text-white">Preparing your dashboard</h2>
          <p className="text-white/50 text-sm">Syncing profile</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#0c141d] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4 text-sm text-white/60">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 text-xl text-emerald-300">🙈</div>
          <div className="text-lg font-semibold text-white">Profile unavailable</div>
          <p>We couldn’t load your Writing Arena profile. Try signing out and back in, or contact support if it keeps happening.</p>
          <button
            onClick={signOut}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      {showMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-4xl rounded-3xl bg-[#141e27] p-10 shadow-xl border border-white/10 relative">
            <button
              onClick={() => setShowMatchModal(false)}
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-xl text-white transition hover:bg-white/10"
            >
              ×
            </button>
            <div className="mb-10 text-center space-y-3">
              <div className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">Start a session</div>
              <h2 className="text-4xl font-semibold">Choose how you want to write today</h2>
              <p className="text-white/60 text-sm">Pick a mode to enter the arena. You can always change later.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { label: 'Quick Match', icon: '⚡', summary: 'Jump into a four minute duel with instant party fill.', route: '/quick-match' },
                { label: 'Ranked', icon: '🏆', summary: 'Fight for leaderboard glory with three competitive phases.', route: '/ranked' },
                { label: 'Practice', icon: '📝', summary: 'Solo training with guided prompts and instant AI feedback.', route: '/practice' },
              ].map(option => (
                <button
                  key={option.label}
                  onClick={() => {
                    setShowMatchModal(false);
                    router.push(option.route);
                  }}
                  className="group rounded-2xl bg-[#192430] p-7 border border-white/10 text-left transition hover:border-emerald-300/40"
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-emerald-200/70">
                      {option.label}
                      <span className="text-base text-emerald-200">{option.icon}</span>
                    </div>
                    <p className="text-base text-white/80">{option.summary}</p>
                    <div className="flex items-center justify-between pt-2 text-sm text-emerald-200">
                      Enter
                      <span className="transition group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c141d]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/20 text-xl text-emerald-200">✶</div>
              <span className="text-base font-semibold tracking-wide">Writing Arena</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-emerald-200">
              <span>{userProfile.totalPoints.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right text-sm lg:block">
                <div className="font-medium text-white">{userProfile.displayName}</div>
                <div className="text-white/50 text-xs">Level {userProfile.characterLevel} • Sapling</div>
              </div>
              <button
                onClick={signOut}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20 text-lg text-emerald-200 transition hover:bg-emerald-400/30"
              >
                {userProfile.avatar}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="grid gap-8 lg:grid-cols-[1.4fr,1fr]">
          <div className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/50">Match readiness</div>
                  <h2 className="mt-2 text-2xl font-semibold">Level {userProfile.characterLevel} Sapling</h2>
                  <p className="mt-3 text-sm text-white/60">Keep momentum to reach Young Oak. Complete prep steps before queueing.</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 text-2xl text-emerald-200">{userProfile.avatar}</div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <button
                  onClick={() => router.push('/ranked')}
                  className="rounded-xl border border-emerald-400/40 bg-emerald-500 px-4 py-3 text-left text-sm font-semibold text-[#0c141d] transition hover:bg-emerald-400"
                >
                  Join Ranked Queue
                  <div className="mt-1 text-xs font-normal text-[#0c141d]/80">Recommended for today</div>
                </button>
                <button
                  onClick={() => router.push('/quick-match')}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/70 transition hover:bg-white/10"
                >
                  Quick Match Warm-up
                  <div className="mt-1 text-xs text-white/50">4 min blitz to sharpen pacing</div>
                </button>
                <button
                  onClick={() => router.push('/practice')}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/70 transition hover:bg-white/10"
                >
                  Practice Drill
                  <div className="mt-1 text-xs text-white/50">Organization focus suggested</div>
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/50">Today&apos;s objectives</div>
                  <h2 className="mt-2 text-2xl font-semibold">Stay focused before queueing</h2>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">Match prep</span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {objectives.map(item => (
                  <div key={item.title} className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-5">
                    <div>
                      <div className="text-xs uppercase tracking-[0.3em] text-white/40">{item.type}</div>
                      <div className="mt-2 text-sm font-semibold text-white">{item.title}</div>
                      <p className="mt-2 text-xs text-white/60">{item.detail}</p>
                    </div>
                    <button
                      onClick={() => router.push('/practice')}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-emerald-200 transition hover:border-emerald-200"
                    >
                      Mark complete
                      <span>→</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/50">Trait readiness</div>
                  <h2 className="mt-2 text-2xl font-semibold">Strengths snapshot</h2>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {traitCards.map(trait => (
                  <div key={trait.name} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{trait.icon}</span>
                      <span className="text-xs uppercase tracking-[0.3em] text-white/40">Lvl {trait.level}</span>
                    </div>
                    <div className="mt-3 text-sm font-semibold text-white">{trait.name}</div>
                    <div className="mt-2 text-xs text-emerald-200">{trait.level >= 8 ? 'Match-ready' : 'Warm-up recommended'}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/50">Upcoming sessions</div>
                  <h2 className="mt-2 text-2xl font-semibold">Lock in your schedule</h2>
                </div>
                <button className="text-sm text-emerald-200 transition hover:text-emerald-100">Manage</button>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {upcomingMatches.map(match => (
                  <div key={match.mode + match.eta} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.3em] text-white/40">{match.mode}</div>
                    <div className="mt-2 text-sm font-semibold text-white">{match.eta}</div>
                    <div className="mt-3 text-xs text-white/50">With {match.teammates.join(', ')}</div>
                    <button
                      onClick={() => router.push(match.route)}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-emerald-200 transition hover:border-emerald-200"
                    >
                      Open lobby
                      <span>→</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Pre-match checklist</div>
              <ul className="mt-6 space-y-3 text-sm text-white/70">
                {readinessChecklist.map(item => (
                  <li key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <span>{item.label}</span>
                    <span className={item.ready ? 'text-emerald-200 font-semibold' : 'text-white/40'}>
                      {item.ready ? 'Ready' : 'Warm-up recommended'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Warm-up prompts</div>
              <div className="mt-6 space-y-4">
                {warmupPrompts.map(prompt => (
                  <div key={prompt.title} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70">
                    <div className="text-sm font-semibold text-white">{prompt.title}</div>
                    <div className="mt-1 text-xs text-white/50">{prompt.trait} · {prompt.duration}</div>
                    <button
                      onClick={() => router.push('/practice')}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-emerald-200 transition hover:border-emerald-200"
                    >
                      Launch drill
                      <span>→</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Match stats snapshot</div>
              <div className="mt-6 space-y-3 text-sm text-white/70">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Total matches</span>
                  <span className="text-emerald-200 font-semibold">{userProfile.stats.totalMatches}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Win rate</span>
                  <span className="text-emerald-200 font-semibold">{Math.round((userProfile.stats.wins / userProfile.stats.totalMatches) * 100)}%</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Current streak</span>
                  <span className="text-emerald-200 font-semibold">{userProfile.stats.currentStreak} days</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Words written</span>
                  <span className="text-emerald-200 font-semibold">{userProfile.stats.totalWords.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
