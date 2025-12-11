import { UserProfile } from '@/lib/types';
import { COLOR_CLASSES } from '@/lib/constants/colors';

interface DashboardSidebarStatsProps {
  userProfile: UserProfile;
}

export function DashboardSidebarStats({ userProfile }: DashboardSidebarStatsProps) {
  const totalMatches = (userProfile.stats.rankedMatches || 0) + (userProfile.stats.practiceMatches || 0);
  
  return (
    <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
      <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
        Stats
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[rgba(255,255,255,0.4)]">Total Matches</span>
          <span className={`font-mono text-lg ${COLOR_CLASSES.phase1.text}`}>{totalMatches}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[rgba(255,255,255,0.4)]">Wins</span>
          <span className={`font-mono text-lg ${COLOR_CLASSES.phase3.text}`}>{userProfile.stats.wins}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[rgba(255,255,255,0.4)]">Words Written</span>
          <span className={`font-mono text-lg ${COLOR_CLASSES.phase2.text}`}>{userProfile.stats.totalWords.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[rgba(255,255,255,0.4)]">Best Streak</span>
          <span className={`font-mono text-lg ${COLOR_CLASSES.orange.text}`}>{userProfile.stats.currentStreak || 0} days</span>
        </div>
      </div>
    </div>
  );
}

