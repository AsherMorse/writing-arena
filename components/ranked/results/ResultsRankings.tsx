interface Player {
  name: string;
  avatar: string;
  rank: string;
  position: number;
  compositeScore: number;
  phase1: number;
  phase2: number;
  phase3: number;
  isYou?: boolean;
}

interface ResultsRankingsProps {
  rankings: Player[];
}

export function ResultsRankings({ rankings }: ResultsRankingsProps) {
  return (
    <div className="mb-8 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
        <span>🏆</span><span>Final Rankings</span>
      </h2>
      
      <div className="space-y-3">
        {rankings.map((player) => (
          <div key={player.name} className={`rounded-[10px] p-4 transition-all ${player.isYou ? 'border-2 border-[#00e5e5] bg-[rgba(0,229,229,0.1)] scale-[1.02]' : 'border border-[rgba(255,255,255,0.05)] bg-[#101012]'}`}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold ${player.position === 1 ? 'bg-[#ff9030] text-[#101012]' : player.position === 2 ? 'bg-[rgba(255,255,255,0.3)] text-[#101012]' : player.position === 3 ? 'bg-[#ff9030]/60 text-[#101012]' : 'bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)]'}`}>
                  {player.position === 1 ? '🥇' : player.position === 2 ? '🥈' : player.position === 3 ? '🥉' : player.position}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{player.avatar}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${player.isYou ? 'text-[#00e5e5]' : ''}`}>{player.name}</span>
                      {player.isYou && <span className="rounded-[20px] bg-[#00e5e5] px-2 py-0.5 text-[10px] font-medium text-[#101012]">You</span>}
                    </div>
                    <div className="text-xs text-[rgba(255,255,255,0.4)]">{player.rank}</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-mono text-2xl font-medium ${player.isYou ? 'text-[#00e5e5]' : ''}`}>{player.compositeScore}</div>
                <div className="text-xs text-[rgba(255,255,255,0.4)]">composite</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-[rgba(255,255,255,0.05)] pt-3">
              <div className="text-center">
                <div className="text-[10px] text-[rgba(255,255,255,0.4)]">Writing</div>
                <div className="font-mono text-sm">{player.phase1}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-[rgba(255,255,255,0.4)]">Feedback</div>
                <div className="font-mono text-sm">{player.phase2}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-[rgba(255,255,255,0.4)]">Revision</div>
                <div className="font-mono text-sm">{player.phase3}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

