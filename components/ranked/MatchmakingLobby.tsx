'use client';

import { WRITING_TIPS } from '@/lib/constants/writing-tips';
import { useCarousel } from '@/lib/hooks/useCarousel';
import { TIMING } from '@/lib/constants/scoring';

interface Player {
  userId: string;
  name: string;
  avatar: string;
  rank: string;
  isAI: boolean;
}

interface MatchmakingLobbyProps {
  players: Player[];
  finalPlayers: Player[];
  searchingDots: string;
  countdown: number | null;
  hasFilledWithAI: boolean;
  onFillWithAI: () => void;
  startChoice: 'wait' | 'ai' | null;
}

export default function MatchmakingLobby({
  players,
  finalPlayers,
  searchingDots,
  countdown,
  hasFilledWithAI,
  onFillWithAI,
  startChoice,
}: MatchmakingLobbyProps) {
  const { currentIndex: currentTipIndex, goTo: goToTip } = useCarousel({
    items: WRITING_TIPS,
    interval: TIMING.CAROUSEL_INTERVAL,
    autoPlay: countdown === null,
  });

  const displayPlayers = [...Array(5)].map((_, index) => players[index] || null);

  if (countdown !== null) {
    return (
      <div className="text-center">
        <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#00e5e5] bg-[rgba(0,229,229,0.1)]">
          <span className="font-mono text-5xl font-medium text-[#00e5e5]">{countdown}</span>
        </div>
        <h1 className="text-2xl font-semibold">Match Found!</h1>
        <p className="mt-2 text-sm text-[rgba(255,255,255,0.4)]">Starting in {countdown}...</p>

        <div className="mt-8 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
          <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
            Your Party
          </div>
          <div className="grid grid-cols-5 gap-3">
            {finalPlayers.map((player, index) => (
              <div key={index} className="text-center">
                <div className="mb-1 text-2xl">{player.avatar}</div>
                <div className="truncate text-xs font-medium">{player.name}</div>
                <div className="text-[10px]" style={{ color: player.isAI ? '#00e5e5' : '#ff5f8f' }}>
                  {player.isAI && '🤖 '}
                  {player.rank}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-[rgba(255,255,255,0.05)] pt-4 text-center text-xs text-[rgba(255,255,255,0.4)]">
            {finalPlayers.filter(p => !p.isAI).length} Real • {finalPlayers.filter(p => p.isAI).length} AI
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <div className="mb-4 inline-block animate-spin text-5xl">🏆</div>
        <h1 className="text-2xl font-semibold">
          Finding Match{searchingDots}
        </h1>
        <p className="mt-2 text-sm text-[rgba(255,255,255,0.4)]">Matching with similar skill level</p>
      </div>

      <div className="mb-8">
        <div className="rounded-[14px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.05)] p-6">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="text-2xl">{WRITING_TIPS[currentTipIndex].icon}</span>
            <span className="text-lg font-semibold">{WRITING_TIPS[currentTipIndex].name}</span>
          </div>
          
          <p className="mb-4 text-center text-sm text-[rgba(255,255,255,0.6)]">
            {WRITING_TIPS[currentTipIndex].tip}
          </p>
          
          <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
            <div className="mb-1 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#00e5e5]">
              Example
            </div>
            <p className="text-center text-sm italic text-[rgba(255,255,255,0.6)]">
              {WRITING_TIPS[currentTipIndex].example}
            </p>
          </div>

          <div className="mt-4 flex justify-center gap-1">
            {WRITING_TIPS.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTip(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentTipIndex 
                    ? 'w-6 bg-[#00e5e5]' 
                    : 'w-1.5 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-5 gap-3">
        {displayPlayers.map((player, index) => (
          <div
            key={index}
            className={`relative rounded-[14px] border p-4 transition-all ${
              player 
                ? player.isAI
                  ? 'border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.05)]'
                  : 'border-[rgba(255,95,143,0.2)] bg-[rgba(255,95,143,0.05)]'
                : 'border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] opacity-50'
            }`}
          >
            {player ? (
              <div className="text-center">
                <div className="mb-2 text-3xl">{player.avatar}</div>
                <div className="text-sm font-medium">{player.name}</div>
                <div className="mt-1 flex items-center justify-center gap-1 text-xs" style={{ color: player.isAI ? '#00e5e5' : '#ff5f8f' }}>
                  {player.isAI && <span className="text-[10px]">🤖</span>}
                  <span>{player.rank}</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-2 text-2xl text-[rgba(255,255,255,0.1)]">👤</div>
                <div className="text-xs text-[rgba(255,255,255,0.22)]">Searching</div>
              </div>
            )}
            
            <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)] font-mono text-[10px] text-[rgba(255,255,255,0.4)]">
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 rounded-[20px] bg-[rgba(255,255,255,0.025)] px-4 py-2">
          <span className="text-xs text-[rgba(255,255,255,0.4)]">Party:</span>
          <span className="font-mono text-sm text-[#00e5e5]">{players.length}/5</span>
        </div>
        
        {players.length < 5 && !hasFilledWithAI && startChoice === 'wait' && (
          <div>
            <button
              onClick={onFillWithAI}
              className="inline-flex items-center gap-2 rounded-[10px] border border-[#00e5e5] bg-transparent px-4 py-2 text-xs font-medium uppercase tracking-[0.04em] text-[#00e5e5] transition-all hover:bg-[rgba(0,229,229,0.1)]"
            >
              <span>🤖</span>
              <span>Play Against AI Now</span>
            </button>
            <p className="mt-2 text-xs text-[rgba(255,255,255,0.22)]">
              Skip waiting and start immediately
            </p>
          </div>
        )}
      </div>
    </>
  );
}

