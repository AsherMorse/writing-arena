'use client';

import { getMedalEmoji } from '@/lib/utils/rank-utils';
import { getPlayerAvatar } from '@/lib/utils/player-utils';

interface PlayerCardProps {
  player: {
    name: string;
    avatar?: string;
    score?: number;
    compositeScore?: number;
    wordCount?: number;
    rank?: string | number;
    position?: number;
    isYou?: boolean;
    isAI?: boolean;
    userId?: string;
  };
  variant?: 'default' | 'compact' | 'ranking' | 'waiting';
  showRank?: boolean;
  showWordCount?: boolean;
  showScore?: boolean;
  showPosition?: boolean;
  isSubmitted?: boolean;
}

/**
 * Reusable player card component
 * Displays player information consistently across the app
 */
export function PlayerCard({ 
  player, 
  variant = 'default',
  showRank = false,
  showWordCount = true,
  showScore = true,
  showPosition = false,
  isSubmitted = false,
}: PlayerCardProps) {
  const avatar = getPlayerAvatar(player.avatar, player.isAI || false);
  const displayRank = player.position || player.rank || '';
  const displayScore = player.compositeScore || player.score || 0;
  
  // Waiting variant (for WaitingForPlayers component)
  if (variant === 'waiting') {
    return (
      <div
        className={`rounded-2xl border px-3 py-4 text-center text-xs font-semibold transition ${
          isSubmitted
            ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
            : 'border-white/10 bg-white/5 text-white/40'
        }`}
      >
        <div className="text-2xl mb-2">
          {isSubmitted ? '✅' : avatar}
        </div>
        <div className="truncate text-sm text-white/80">
          {player.name}
        </div>
        {showRank && displayRank && (
          <div className="text-[11px] text-white/40">{displayRank}</div>
        )}
      </div>
    );
  }
  
  // Compact variant (for matchmaking)
  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
          player.isYou || isSubmitted
            ? 'border-emerald-300/40 bg-emerald-400/10'
            : 'border-white/10 bg-white/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0c141d] text-lg">
            {avatar}
          </span>
          <div>
            <div className={`text-sm font-semibold ${player.isYou ? 'text-white' : 'text-white/40'}`}>
              {player.name}
            </div>
            {player.isAI !== undefined && (
              <div className="text-[11px] uppercase text-white/40">
                {player.isAI ? 'AI support' : 'You'}
              </div>
            )}
          </div>
        </div>
        {showPosition && typeof displayRank === 'number' && (
          <span className="text-[10px] text-white/40">#{displayRank}</span>
        )}
      </div>
    );
  }
  
  // Ranking variant (for results pages)
  if (variant === 'ranking') {
    const position = typeof displayRank === 'number' ? displayRank : parseInt(String(displayRank)) || 0;
    
    return (
      <div
        className={`rounded-2xl border px-5 py-4 transition ${
          player.isYou
            ? 'border-emerald-300/40 bg-emerald-400/10'
            : 'border-white/10 bg-white/5'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showPosition && (
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-semibold ${
                position === 1
                  ? 'bg-yellow-400 text-[#0c141d]'
                  : position === 2
                  ? 'bg-white/80 text-[#0c141d]'
                  : position === 3
                  ? 'bg-orange-300 text-[#0c141d]'
                  : 'bg-white/10 text-white/60'
              }`}>
                {getMedalEmoji(position)}
              </span>
            )}
            <div className="flex items-center gap-3">
              <span className="text-3xl">{avatar}</span>
              <div>
                <div className={`text-sm font-semibold ${player.isYou ? 'text-emerald-200' : 'text-white'}`}>
                  {player.name}
                </div>
                {showWordCount && player.wordCount !== undefined && (
                  <div className="text-xs text-white/50">{player.wordCount} words</div>
                )}
                {showRank && displayRank && typeof displayRank === 'string' && (
                  <div className="text-xs text-white/50">{displayRank}</div>
                )}
              </div>
            </div>
          </div>
          {showScore && (
            <div className="text-right">
              <div className={`text-2xl font-semibold ${player.isYou ? 'text-emerald-200' : 'text-white'}`}>
                {displayScore}
              </div>
              <div className="text-xs text-white/50">score</div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Default variant (for ranked results with composite scores)
  return (
    <div
      className={`p-5 rounded-xl transition-all ${
        player.isYou
          ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400 scale-105'
          : 'bg-white/5 border border-white/10'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          {showPosition && typeof displayRank === 'number' && (
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
              displayRank === 1 ? 'bg-yellow-500 text-yellow-900' :
              displayRank === 2 ? 'bg-gray-300 text-gray-700' :
              displayRank === 3 ? 'bg-orange-400 text-orange-900' :
              'bg-white/10 text-white/60'
            }`}>
              {getMedalEmoji(displayRank)}
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{avatar}</span>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`font-bold ${player.isYou ? 'text-purple-400' : 'text-white'}`}>
                  {player.name}
                </span>
                {player.isYou && (
                  <span className="text-xs px-2 py-1 bg-purple-500 text-white rounded-full">You</span>
                )}
              </div>
              {showRank && displayRank && typeof displayRank === 'string' && (
                <div className="text-white/60 text-sm">{displayRank}</div>
              )}
            </div>
          </div>
        </div>
        
        {showScore && (
          <div className="text-right">
            <div className={`text-3xl font-bold ${player.isYou ? 'text-purple-400' : 'text-white'}`}>
              {displayScore}
            </div>
            <div className="text-white/60 text-sm">composite</div>
          </div>
        )}
      </div>
    </div>
  );
}

