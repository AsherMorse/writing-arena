import { getMedalEmoji } from '@/lib/utils/rank-utils';

interface ResultsRewardsProps {
  yourRank: number;
  totalPlayers: number;
  xpEarned: number;
  pointsEarned: number;
  isVictory: boolean;
}

export function ResultsRewards({ yourRank, totalPlayers, xpEarned, pointsEarned, isVictory }: ResultsRewardsProps) {
  return (
    <div className="mb-8 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
      <h2 className="mb-5 text-center text-lg font-semibold">Match Rewards</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4 text-center">
          <div className="mb-1 text-xs text-[rgba(255,255,255,0.4)]">Placement</div>
          <div className="font-mono text-3xl">{getMedalEmoji(yourRank)}</div>
          <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">of {totalPlayers}</div>
        </div>
        <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4 text-center">
          <div className="mb-1 text-xs text-[rgba(255,255,255,0.4)]">XP Earned</div>
          <div className="font-mono text-3xl text-[#ff9030]">+{xpEarned}</div>
          <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">2.5x ranked</div>
        </div>
        <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4 text-center">
          <div className="mb-1 text-xs text-[rgba(255,255,255,0.4)]">Points</div>
          <div className="font-mono text-3xl">+{pointsEarned}</div>
          <div className="mt-1 text-xs">
            {isVictory && <span className="text-[#ff9030]">+30 Victory!</span>}
            {yourRank === 2 && <span className="text-[rgba(255,255,255,0.4)]">+15 Runner-up!</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

