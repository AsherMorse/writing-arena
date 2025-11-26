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
  
  if (variant === 'waiting') {
    return (
      <div className={`rounded-[10px] border px-3 py-4 text-center text-xs font-medium transition ${
        isSubmitted
          ? 'border-[rgba(0,212,146,0.3)] bg-[rgba(0,212,146,0.1)] text-[#00d492]'
          : 'border-[rgba(255,255,255,0.05)] bg-[#101012] text-[rgba(255,255,255,0.4)]'
      }`}>
        <div className="mb-2 text-2xl">{isSubmitted ? '✅' : avatar}</div>
        <div className="truncate text-sm">{player.name}</div>
        {showRank && displayRank && <div className="text-[10px] text-[rgba(255,255,255,0.3)]">{displayRank}</div>}
      </div>
    );
  }
  
  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between rounded-[10px] border px-4 py-3 transition ${
        player.isYou || isSubmitted
          ? 'border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.08)]'
          : 'border-[rgba(255,255,255,0.05)] bg-[#101012]'
      }`}>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-[rgba(255,255,255,0.025)] text-lg">{avatar}</span>
          <div>
            <div className={`text-sm font-medium ${player.isYou ? '' : 'text-[rgba(255,255,255,0.4)]'}`}>{player.name}</div>
            {player.isAI !== undefined && (
              <div className="text-[10px] uppercase text-[rgba(255,255,255,0.3)]">{player.isAI ? 'AI support' : 'You'}</div>
            )}
          </div>
        </div>
        {showPosition && typeof displayRank === 'number' && (
          <span className="text-[10px] text-[rgba(255,255,255,0.3)]">#{displayRank}</span>
        )}
      </div>
    );
  }
  
  if (variant === 'ranking') {
    const position = typeof displayRank === 'number' ? displayRank : parseInt(String(displayRank)) || 0;
    
    return (
      <div className={`rounded-[10px] border px-5 py-4 transition ${
        player.isYou
          ? 'border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.08)]'
          : 'border-[rgba(255,255,255,0.05)] bg-[#101012]'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showPosition && (
              <span className={`flex h-10 w-10 items-center justify-center rounded-[10px] text-base font-semibold ${
                position === 1 ? 'bg-[#ff9030] text-[#101012]' :
                position === 2 ? 'bg-[rgba(255,255,255,0.3)] text-[#101012]' :
                position === 3 ? 'bg-[#ff9030]/60 text-[#101012]' :
                'bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)]'
              }`}>
                {getMedalEmoji(position)}
              </span>
            )}
            <div className="flex items-center gap-3">
              <span className="text-3xl">{avatar}</span>
              <div>
                <div className={`text-sm font-medium ${player.isYou ? 'text-[#00e5e5]' : ''}`}>{player.name}</div>
                {showWordCount && player.wordCount !== undefined && <div className="text-xs text-[rgba(255,255,255,0.4)]">{player.wordCount} words</div>}
                {showRank && displayRank && typeof displayRank === 'string' && <div className="text-xs text-[rgba(255,255,255,0.4)]">{displayRank}</div>}
              </div>
            </div>
          </div>
          {showScore && (
            <div className="text-right">
              <div className={`font-mono text-2xl font-medium ${player.isYou ? 'text-[#00e5e5]' : ''}`}>{displayScore}</div>
              <div className="text-xs text-[rgba(255,255,255,0.4)]">score</div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`rounded-[10px] p-5 transition-all ${
      player.isYou
        ? 'border-2 border-[#00e5e5] bg-[rgba(0,229,229,0.1)] scale-[1.02]'
        : 'border border-[rgba(255,255,255,0.05)] bg-[#101012]'
    }`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showPosition && typeof displayRank === 'number' && (
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold ${
              displayRank === 1 ? 'bg-[#ff9030] text-[#101012]' :
              displayRank === 2 ? 'bg-[rgba(255,255,255,0.3)] text-[#101012]' :
              displayRank === 3 ? 'bg-[#ff9030]/60 text-[#101012]' :
              'bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)]'
            }`}>
              {getMedalEmoji(displayRank)}
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <span className="text-3xl">{avatar}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${player.isYou ? 'text-[#00e5e5]' : ''}`}>{player.name}</span>
                {player.isYou && <span className="rounded-[20px] bg-[#00e5e5] px-2 py-0.5 text-[10px] font-medium text-[#101012]">You</span>}
              </div>
              {showRank && displayRank && typeof displayRank === 'string' && <div className="text-sm text-[rgba(255,255,255,0.4)]">{displayRank}</div>}
            </div>
          </div>
        </div>
        
        {showScore && (
          <div className="text-right">
            <div className={`font-mono text-2xl font-medium ${player.isYou ? 'text-[#00e5e5]' : ''}`}>{displayScore}</div>
            <div className="text-sm text-[rgba(255,255,255,0.4)]">composite</div>
          </div>
        )}
      </div>
    </div>
  );
}
