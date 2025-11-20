'use client';

import Link from 'next/link';
import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/lib/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { countCompletedRankedMatches } from '@/lib/services/firestore';

interface DashboardContentProps {
  userProfile: UserProfile;
}

export default function DashboardContent({ userProfile }: DashboardContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [completedMatches, setCompletedMatches] = useState<number | null>(null);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchMatchCount = async () => {
        try {
          const count = await countCompletedRankedMatches(user.uid);
          setCompletedMatches(count);
        } catch (error) {
          console.error('Error fetching match count:', error);
          setCompletedMatches(0);
        } finally {
          setLoadingMatches(false);
        }
      };
      fetchMatchCount();
    }
  }, [user]);

  const hasEnoughMatches = completedMatches !== null && completedMatches >= 5;
  const matchesRemaining = completedMatches !== null ? Math.max(0, 5 - completedMatches) : 0;

  const traitCards = useMemo(
    () => [
      { name: 'Content', level: userProfile.traits.content, icon: '📚' },
      { name: 'Organization', level: userProfile.traits.organization, icon: '🗂️' },
      { name: 'Grammar', level: userProfile.traits.grammar, icon: '✏️' },
      { name: 'Vocabulary', level: userProfile.traits.vocabulary, icon: '📖' },
      { name: 'Mechanics', level: userProfile.traits.mechanics, icon: '⚙️' },
    ],
    [userProfile.traits]
  );

  const objectives = [
    {
      title: 'Complete a warm-up session',
      detail: 'Run one focused drill before queueing.',
      type: 'Warm-up',
    },
    {
      title: 'Review build notes',
      detail: 'Glance at last feedback before a ranked match.',
      type: 'Review',
    },
    {
      title: "Plan tonight's run",
      detail: 'Pick mode and set a match goal.',
      type: 'Planning',
    },
  ];

  const readinessChecklist = useMemo(
    () => [
      { label: 'Profile info current', ready: true },
      {
        label: 'Trait balance solid',
        ready: Object.values(userProfile.traits).every((level) => level >= 6),
      },
      { label: 'Focus trait chosen', ready: true },
      { label: 'Streak bonus active', ready: userProfile.stats.currentStreak > 0 },
    ],
    [userProfile.traits, userProfile.stats.currentStreak]
  );

  const warmupPrompts = [
    { title: 'Organization Drill', trait: 'Organization', duration: '4 min' },
    { title: 'Vocabulary Burst', trait: 'Vocabulary', duration: '4 min' },
    { title: 'Grammar Sprint', trait: 'Grammar', duration: '4 min' },
  ];

  const upcomingMatches = [
    { mode: 'Ranked', eta: 'Today · 7:00 PM', teammates: ['Nova', 'Lumen'], route: '/ranked' },
    {
      mode: 'Quick Match',
      eta: 'Tomorrow · 4:30 PM',
      teammates: ['AutoFill'],
      route: '/quick-match',
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      {/* Quick Access Buttons */}
      <section className="mb-10">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Ranked Button */}
          <button
            onClick={() => router.push('/ranked')}
            className="group relative rounded-2xl border-2 border-emerald-400/40 bg-emerald-500/20 p-6 text-left transition-all hover:border-emerald-400 hover:bg-emerald-500/30"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🏆</span>
              <span className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Ranked</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Ranked Circuit</h3>
            <p className="text-sm text-white/70 mb-4">
              Compete in three-phase matches and climb the leaderboard
            </p>
            <div className="flex items-center text-emerald-200 text-sm font-medium">
              Enter ranked
              <span className="ml-2 transition group-hover:translate-x-1">→</span>
            </div>
          </button>

          {/* Improve Button */}
          <button
            onClick={() => {
              if (hasEnoughMatches) {
                router.push('/improve');
              }
            }}
            disabled={!hasEnoughMatches}
            className={`group relative rounded-2xl border-2 p-6 text-left transition-all ${
              hasEnoughMatches
                ? 'border-blue-400/40 bg-blue-500/20 hover:border-blue-400 hover:bg-blue-500/30'
                : 'border-white/10 bg-white/5 opacity-60 cursor-not-allowed'
            }`}
          >
            {!hasEnoughMatches && (
              <div className="absolute top-3 right-3 px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full">
                <span className="text-[10px] uppercase tracking-wider text-blue-300 font-semibold">
                  {loadingMatches ? 'Loading...' : `${matchesRemaining} More`}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">📈</span>
              <span className={`text-xs uppercase tracking-[0.3em] ${
                hasEnoughMatches ? 'text-blue-200/70' : 'text-white/30'
              }`}>
                Improve
              </span>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${
              hasEnoughMatches ? 'text-white' : 'text-white/50'
            }`}>
              Improve Your Writing
            </h3>
            <p className={`text-sm mb-4 ${
              hasEnoughMatches ? 'text-white/70' : 'text-white/40'
            }`}>
              {hasEnoughMatches
                ? 'Personalized exercises based on your last 5 ranked matches'
                : `Complete ${matchesRemaining} more ranked match${matchesRemaining !== 1 ? 'es' : ''} to unlock`}
            </p>
            {hasEnoughMatches && (
              <div className="flex items-center text-blue-200 text-sm font-medium">
                Start improving
                <span className="ml-2 transition group-hover:translate-x-1">→</span>
              </div>
            )}
            {!hasEnoughMatches && completedMatches !== null && (
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-blue-300 mb-2">
                  <span>Progress</span>
                  <span>{completedMatches}/5 matches</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedMatches / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </button>

          {/* AP Lang Button */}
          <button
            onClick={() => router.push('/ap-lang')}
            className="group relative rounded-2xl border-2 border-purple-400/40 bg-purple-500/20 p-6 text-left transition-all hover:border-purple-400 hover:bg-purple-500/30"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">📚</span>
              <span className="text-xs uppercase tracking-[0.3em] text-purple-200/70">AP Lang</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AP Lang Grader</h3>
            <p className="text-sm text-white/70 mb-4">
              Grade your essays or practice with authentic AP prompts and a 40-minute timer
            </p>
            <div className="flex items-center text-purple-200 text-sm font-medium">
              Open grader
              <span className="ml-2 transition group-hover:translate-x-1">→</span>
            </div>
          </button>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.4fr,1fr]">
        <div className="space-y-8">
          {/* Match Readiness */}
          <Card>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Match readiness
                </div>
                <h2 className="mt-2 text-2xl font-semibold">Level {userProfile.characterLevel} Sapling</h2>
                <p className="mt-3 text-sm text-white/60">
                  Keep momentum to reach Young Oak. Complete prep steps before queueing.
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 text-2xl text-emerald-200">
                {userProfile.avatar}
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <button
                onClick={() => router.push('/ranked')}
                className="rounded-xl border border-emerald-400/40 bg-emerald-500 px-4 py-3 text-left text-sm font-semibold text-[#0c141d] transition hover:bg-emerald-400"
              >
                Join Ranked Queue
                <div className="mt-1 text-xs font-normal text-[#0c141d]/80">
                  Recommended for today
                </div>
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
          </Card>

          {/* Today's Objectives - Coming Soon */}
          <Card variant="muted">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Today&apos;s objectives
                </div>
                <h2 className="mt-2 text-2xl font-semibold">Stay focused before queueing</h2>
              </div>
              <Badge variant="warning">Coming Soon</Badge>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {objectives.map((item) => (
                <div
                  key={item.title}
                  className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-5"
                >
                  <div>
                    <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                      {item.type}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-white">{item.title}</div>
                    <p className="mt-2 text-xs text-white/60">{item.detail}</p>
                  </div>
                  <button
                    disabled
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/40 cursor-not-allowed"
                  >
                    Mark complete
                    <span>→</span>
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Trait Readiness */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Trait readiness
                </div>
                <h2 className="mt-2 text-2xl font-semibold">Strengths snapshot</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {traitCards.map((trait) => (
                <div
                  key={trait.name}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{trait.icon}</span>
                    <span className="text-xs uppercase tracking-[0.3em] text-white/40">
                      Lvl {trait.level}
                    </span>
                  </div>
                  <div className="mt-3 text-sm font-semibold text-white">{trait.name}</div>
                  <div className="mt-2 text-xs text-emerald-200">
                    {trait.level >= 8 ? 'Match-ready' : 'Warm-up recommended'}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Sessions - Coming Soon */}
          <Card variant="muted">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Upcoming sessions
                </div>
                <h2 className="mt-2 text-2xl font-semibold">Lock in your schedule</h2>
              </div>
              <Badge variant="warning">Coming Soon</Badge>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {upcomingMatches.map((match) => (
                <div
                  key={match.mode + match.eta}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                    {match.mode}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">{match.eta}</div>
                  <div className="mt-3 text-xs text-white/50">
                    With {match.teammates.join(', ')}
                  </div>
                  <button
                    disabled
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/40 cursor-not-allowed"
                  >
                    Open lobby
                    <span>→</span>
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Pre-match Checklist */}
          <Card>
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">
              Pre-match checklist
            </div>
            <ul className="mt-6 space-y-3 text-sm text-white/70">
              {readinessChecklist.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span>{item.label}</span>
                  <span
                    className={
                      item.ready ? 'text-emerald-200 font-semibold' : 'text-white/40'
                    }
                  >
                    {item.ready ? 'Ready' : 'Warm-up recommended'}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Warm-up Prompts - Coming Soon */}
          <Card variant="muted">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">
                Warm-up prompts
              </div>
              <Badge variant="warning">Coming Soon</Badge>
            </div>
            <div className="mt-6 space-y-4">
              {warmupPrompts.map((prompt) => (
                <div
                  key={prompt.title}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70"
                >
                  <div className="text-sm font-semibold text-white">{prompt.title}</div>
                  <div className="mt-1 text-xs text-white/50">
                    {prompt.trait} · {prompt.duration}
                  </div>
                  <button
                    disabled
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/40 cursor-not-allowed"
                  >
                    Launch drill
                    <span>→</span>
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Match Stats */}
          <Card>
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">
              Match stats snapshot
            </div>
            <div className="mt-6 space-y-3 text-sm text-white/70">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span>Total matches</span>
                <span className="text-emerald-200 font-semibold">
                  {userProfile.stats.totalMatches}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span>Win rate</span>
                <span className="text-emerald-200 font-semibold">
                  {userProfile.stats.totalMatches > 0
                    ? Math.round((userProfile.stats.wins / userProfile.stats.totalMatches) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span>Current streak</span>
                <span className="text-emerald-200 font-semibold">
                  {userProfile.stats.currentStreak} days
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span>Words written</span>
                <span className="text-emerald-200 font-semibold">
                  {userProfile.stats.totalWords.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </aside>
      </section>
    </main>
  );
}

