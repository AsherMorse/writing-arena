import { UserProfile } from '@/lib/types';
import { COLOR_CLASSES } from '@/lib/constants/colors';
import { roundScore } from '@/lib/utils/math-utils';

interface DashboardStatsProps {
  userProfile: UserProfile;
}

export function DashboardStats({ userProfile }: DashboardStatsProps) {
  const winRate = userProfile.stats.totalMatches > 0
    ? roundScore((userProfile.stats.wins / userProfile.stats.totalMatches) * 100)
    : 0;

  return (
    <section className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-4">
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
          Level
        </div>
        <div className={`font-mono text-4xl font-medium leading-none ${COLOR_CLASSES.phase1.text}`}>
          {userProfile.characterLevel}
        </div>
        <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">Sapling</div>
      </div>
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
          Total Points
        </div>
        <div className={`font-mono text-4xl font-medium leading-none ${COLOR_CLASSES.phase2.text}`}>
          {userProfile.totalPoints.toLocaleString()}
        </div>
        <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">lifetime</div>
      </div>
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
          Win Rate
        </div>
        <div className={`font-mono text-4xl font-medium leading-none ${COLOR_CLASSES.orange.text}`}>
          {winRate}%
        </div>
        <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">{userProfile.stats.totalMatches} matches</div>
      </div>
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
          Streak
        </div>
        <div className={`font-mono text-4xl font-medium leading-none ${COLOR_CLASSES.phase3.text}`}>
          {userProfile.stats.currentStreak}
        </div>
        <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">days</div>
      </div>
    </section>
  );
}

