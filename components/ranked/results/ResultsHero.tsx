import { getMedalEmoji } from '@/lib/utils/rank-utils';

interface ResultsHeroProps {
  isVictory: boolean;
  yourRank: number;
  lpChange: number;
}

export function ResultsHero({ isVictory, yourRank, lpChange }: ResultsHeroProps) {
  return (
    <div className="mb-10 text-center">
      <div className="mb-4 text-6xl animate-bounce">
        {isVictory ? '🏆' : yourRank <= 3 ? '🎉' : lpChange >= 0 ? '💪' : '😔'}
      </div>
      <h1 className="mb-2 text-3xl font-semibold">
        {isVictory ? 'Victory!' : yourRank <= 3 ? 'Great Job!' : lpChange >= 0 ? 'Match Complete!' : 'Keep Improving!'}
      </h1>
      <p className="text-[rgba(255,255,255,0.5)]">
        You placed {getMedalEmoji(yourRank)} in your ranked party
      </p>
    </div>
  );
}

