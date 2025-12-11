import { UserProfile } from '@/lib/types';
import { COLOR_CLASSES } from '@/lib/constants/colors';
import { roundScore } from '@/lib/utils/math-utils';
import { getRankDisplayName } from '@/lib/utils/score-calculator';
import { TIER_LP_CAP } from '@/lib/utils/rank-constants';

interface DashboardStatsProps {
  userProfile: UserProfile;
}

export function DashboardStats({ userProfile }: DashboardStatsProps) {
  const totalMatches = (userProfile.stats.rankedMatches || 0) + (userProfile.stats.practiceMatches || 0);
  const winRate = totalMatches > 0
    ? roundScore((userProfile.stats.wins / totalMatches) * 100)
    : 0;

  // New skill-based rank system (defaults to Scribe III, 65 LP)
  const skillLevel = userProfile.skillLevel ?? 'scribe';
  const skillTier = userProfile.skillTier ?? 3;
  const tierLP = userProfile.tierLP ?? 65;
  const rankDisplay = getRankDisplayName(skillLevel, skillTier);

  return (
    <section className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-4">
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
          Rank
        </div>
        <div className={`font-mono text-2xl font-medium leading-none ${COLOR_CLASSES.phase1.text}`}>
          {rankDisplay}
        </div>
        <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">{tierLP}/{TIER_LP_CAP} LP</div>
      </div>
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.04)]">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
          Total LP
        </div>
        <div className={`font-mono text-4xl font-medium leading-none ${COLOR_CLASSES.phase2.text}`}>
          {userProfile.totalLP?.toLocaleString() || '0'}
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
        <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">{totalMatches} matches</div>
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

