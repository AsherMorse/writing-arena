'use client';

import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/lib/types';
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
      { name: 'Content', level: userProfile.traits.content, color: '#00e5e5' },
      { name: 'Organization', level: userProfile.traits.organization, color: '#ff5f8f' },
      { name: 'Grammar', level: userProfile.traits.grammar, color: '#ff9030' },
      { name: 'Vocabulary', level: userProfile.traits.vocabulary, color: '#00d492' },
      { name: 'Mechanics', level: userProfile.traits.mechanics, color: '#00e5e5' },
    ],
    [userProfile.traits]
  );

  const readinessChecklist = useMemo(
    () => [
      { label: 'Profile info current', ready: true },
      { label: 'Trait balance solid', ready: Object.values(userProfile.traits).every((level) => level >= 6) },
      { label: 'Focus trait chosen', ready: true },
      { label: 'Streak bonus active', ready: userProfile.stats.currentStreak > 0 },
    ],
    [userProfile.traits, userProfile.stats.currentStreak]
  );

  return (
    <main className="mx-auto max-w-[1200px] px-8 py-8">
      <section className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
            Level
          </div>
          <div className="font-mono text-4xl font-medium leading-none text-[#00e5e5]">
            {userProfile.characterLevel}
          </div>
          <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">Sapling</div>
        </div>
        <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
            Total Points
          </div>
          <div className="font-mono text-4xl font-medium leading-none text-[#ff5f8f]">
            {userProfile.totalPoints.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">lifetime</div>
        </div>
        <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
            Win Rate
          </div>
          <div className="font-mono text-4xl font-medium leading-none text-[#ff9030]">
            {userProfile.stats.totalMatches > 0
              ? Math.round((userProfile.stats.wins / userProfile.stats.totalMatches) * 100)
              : 0}%
          </div>
          <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">{userProfile.stats.totalMatches} matches</div>
        </div>
        <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
            Streak
          </div>
          <div className="font-mono text-4xl font-medium leading-none text-[#00d492]">
            {userProfile.stats.currentStreak}
          </div>
          <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">days</div>
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(255,255,255,0.22)]">
          Quick Actions
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <button
            onClick={() => router.push('/ranked')}
            className="group relative rounded-[14px] border border-[rgba(0,229,229,0.3)] bg-[rgba(0,229,229,0.08)] p-6 text-left transition-all hover:border-[rgba(0,229,229,0.5)] hover:bg-[rgba(0,229,229,0.12)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[rgba(0,229,229,0.15)] text-lg">
                🏆
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#00e5e5]">
                Ranked
              </span>
            </div>
            <div className="text-lg font-semibold text-[rgba(255,255,255,0.9)]">Ranked Circuit</div>
            <p className="mt-1 text-sm text-[rgba(255,255,255,0.5)]">
              Compete in three-phase matches and climb the leaderboard
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#00e5e5]">
              Enter ranked
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </button>

          <button
            onClick={() => hasEnoughMatches && router.push('/improve')}
            disabled={!hasEnoughMatches}
            className={`group relative rounded-[14px] border p-6 text-left transition-all ${
              hasEnoughMatches
                ? 'border-[rgba(255,95,143,0.3)] bg-[rgba(255,95,143,0.08)] hover:border-[rgba(255,95,143,0.5)] hover:bg-[rgba(255,95,143,0.12)]'
                : 'cursor-not-allowed border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] opacity-60'
            }`}
          >
            {!hasEnoughMatches && (
              <div className="absolute right-3 top-3 rounded-[20px] bg-[rgba(255,95,143,0.15)] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.04em] text-[#ff5f8f]">
                {loadingMatches ? 'Loading' : `${matchesRemaining} more`}
              </div>
            )}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[rgba(255,95,143,0.15)] text-lg">
                📈
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${hasEnoughMatches ? 'text-[#ff5f8f]' : 'text-[rgba(255,255,255,0.22)]'}`}>
                Improve
              </span>
            </div>
            <div className={`text-lg font-semibold ${hasEnoughMatches ? 'text-[rgba(255,255,255,0.9)]' : 'text-[rgba(255,255,255,0.4)]'}`}>
              Improve Writing
            </div>
            <p className={`mt-1 text-sm ${hasEnoughMatches ? 'text-[rgba(255,255,255,0.5)]' : 'text-[rgba(255,255,255,0.3)]'}`}>
              {hasEnoughMatches
                ? 'Personalized exercises based on your last 5 ranked matches'
                : `Complete ${matchesRemaining} more ranked match${matchesRemaining !== 1 ? 'es' : ''} to unlock`}
            </p>
            {!hasEnoughMatches && completedMatches !== null && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-[rgba(255,255,255,0.4)]">Progress</span>
                  <span className="font-mono text-[#ff5f8f]">{completedMatches}/5</span>
                </div>
                <div className="h-[6px] overflow-hidden rounded-[3px] bg-[rgba(255,255,255,0.05)]">
                  <div
                    className="h-full rounded-[3px] transition-all"
                    style={{ width: `${(completedMatches / 5) * 100}%`, background: '#ff5f8f' }}
                  />
                </div>
              </div>
            )}
            {hasEnoughMatches && (
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#ff5f8f]">
                Start improving
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            )}
          </button>

          <button
            onClick={() => router.push('/ap-lang')}
            className="group relative rounded-[14px] border border-[rgba(255,144,48,0.3)] bg-[rgba(255,144,48,0.08)] p-6 text-left transition-all hover:border-[rgba(255,144,48,0.5)] hover:bg-[rgba(255,144,48,0.12)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[rgba(255,144,48,0.15)] text-lg">
                📚
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#ff9030]">
                AP Lang
              </span>
            </div>
            <div className="text-lg font-semibold text-[rgba(255,255,255,0.9)]">AP Lang Grader</div>
            <p className="mt-1 text-sm text-[rgba(255,255,255,0.5)]">
              Grade essays or practice with authentic AP prompts
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#ff9030]">
              Open grader
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <div className="space-y-6">
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
                Trait Levels
              </div>
              <span className="rounded-[20px] bg-[rgba(0,212,146,0.12)] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.04em] text-[#00d492]">
                {Object.values(userProfile.traits).filter(l => l >= 8).length}/5 ready
              </span>
            </div>
            <div className="space-y-3">
              {traitCards.map((trait) => (
                <div
                  key={trait.name}
                  className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ background: trait.color }}
                    />
                    <span className="text-sm text-[rgba(255,255,255,0.8)]">{trait.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-[6px] w-24 overflow-hidden rounded-[3px] bg-[rgba(255,255,255,0.05)]">
                      <div
                        className="h-full rounded-[3px]"
                        style={{ width: `${(trait.level / 10) * 100}%`, background: trait.color }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-sm" style={{ color: trait.color }}>
                      {trait.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
                Match Readiness
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                onClick={() => router.push('/ranked')}
                className="rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-4 py-3 text-left transition-all hover:bg-[#33ebeb]"
              >
                <div className="text-sm font-semibold text-[#101012]">Join Ranked</div>
                <div className="mt-1 text-xs text-[#101012]/70">Recommended</div>
              </button>
              <button
                onClick={() => router.push('/quick-match')}
                className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-3 text-left transition-all hover:bg-[rgba(255,255,255,0.04)]"
              >
                <div className="text-sm font-medium text-[rgba(255,255,255,0.8)]">Quick Match</div>
                <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">4 min warmup</div>
              </button>
              <button
                onClick={() => router.push('/practice')}
                className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-3 text-left transition-all hover:bg-[rgba(255,255,255,0.04)]"
              >
                <div className="text-sm font-medium text-[rgba(255,255,255,0.8)]">Practice</div>
                <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">Solo drills</div>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
            <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
              Pre-match Checklist
            </div>
            <div className="space-y-2">
              {readinessChecklist.map((item) => (
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
                      Pending
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
            <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
              Stats
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[rgba(255,255,255,0.4)]">Total Matches</span>
                <span className="font-mono text-lg text-[#00e5e5]">{userProfile.stats.totalMatches}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[rgba(255,255,255,0.4)]">Wins</span>
                <span className="font-mono text-lg text-[#00d492]">{userProfile.stats.wins}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[rgba(255,255,255,0.4)]">Words Written</span>
                <span className="font-mono text-lg text-[#ff5f8f]">{userProfile.stats.totalWords.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[rgba(255,255,255,0.4)]">Best Streak</span>
                <span className="font-mono text-lg text-[#ff9030]">{userProfile.stats.currentStreak || 0} days</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
