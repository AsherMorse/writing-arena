'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

function MatchmakingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait');

  const [players, setPlayers] = useState<Array<{name: string, avatar: string, isAI: boolean}>>([
    { name: 'You', avatar: '🌿', isAI: false }
  ]);
  const [searchingDots, setSearchingDots] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setSearchingDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Simulate matchmaking
  useEffect(() => {
    const aiPlayers = [
      { name: 'WriteBot', avatar: '🤖', isAI: true },
      { name: 'PenPal AI', avatar: '✍️', isAI: true },
      { name: 'WordSmith', avatar: '📝', isAI: true },
      { name: 'QuillMaster', avatar: '🖋️', isAI: true },
      { name: 'InkWizard', avatar: '🧙', isAI: true },
    ];

    // Add players one by one
    const timeouts: NodeJS.Timeout[] = [];
    
    [1000, 1800, 2400, 3200].forEach((delay, index) => {
      const timeout = setTimeout(() => {
        setPlayers(prev => [...prev, aiPlayers[index]]);
      }, delay);
      timeouts.push(timeout);
    });

    // Start countdown
    const countdownTimeout = setTimeout(() => {
      setCountdown(3);
    }, 4000);
    timeouts.push(countdownTimeout);

    return () => timeouts.forEach(clearTimeout);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Navigate to match
      const randomPromptType = ['narrative', 'descriptive', 'informational', 'argumentative'][Math.floor(Math.random() * 4)];
      router.push(`/quick-match/session?trait=${trait}&promptType=${randomPromptType}`);
    }
  }, [countdown, router, trait]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">✍️</span>
              </div>
              <span className="text-xl font-bold text-white">Writing Arena</span>
            </div>
            <Link 
              href="/quick-match"
              className="text-white/60 hover:text-white transition-colors text-sm"
            >
              ← Cancel
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          {countdown === null ? (
            <>
              {/* Searching Animation */}
              <div className="text-center mb-12">
                <div className="inline-block animate-spin text-6xl mb-6">⚡</div>
                <h1 className="text-4xl font-bold text-white mb-3">
                  Finding Players{searchingDots}
                </h1>
                <p className="text-white/60 text-lg">Building your writing party</p>
              </div>

              {/* Player Grid */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[...Array(6)].map((_, index) => {
                  const player = players[index];
                  return (
                    <div
                      key={index}
                      className={`relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border-2 transition-all duration-500 ${
                        player 
                          ? 'border-orange-400/50 scale-100 opacity-100' 
                          : 'border-white/10 scale-95 opacity-50'
                      }`}
                    >
                      {player ? (
                        <div className="text-center animate-in fade-in zoom-in duration-300">
                          <div className="text-5xl mb-3">{player.avatar}</div>
                          <div className="text-white font-semibold mb-1">{player.name}</div>
                          {player.isAI ? (
                            <div className="text-orange-400 text-xs">AI Player</div>
                          ) : (
                            <div className="text-green-400 text-xs">You</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-4xl text-white/20 mb-3">👤</div>
                          <div className="text-white/40 text-sm">Searching...</div>
                        </div>
                      )}
                      
                      {/* Player position indicator */}
                      <div className="absolute top-2 right-2 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-white/60 text-xs">
                        {index + 1}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Party Size */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-full border border-white/20">
                  <span className="text-white/60">Party Size:</span>
                  <span className="text-white font-bold">{players.length}/6</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Match Found - Countdown */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-2xl shadow-green-500/50">
                  <span className="text-6xl font-bold text-white">{countdown}</span>
                </div>
                <h1 className="text-5xl font-bold text-white mb-4">Match Found!</h1>
                <p className="text-white/70 text-xl mb-8">Starting battle in {countdown}...</p>

                {/* Final Party */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 max-w-2xl mx-auto">
                  <h3 className="text-white font-bold mb-4">Your Writing Party</h3>
                  <div className="grid grid-cols-6 gap-3">
                    {players.map((player, index) => (
                      <div key={index} className="text-center">
                        <div className="text-3xl mb-1">{player.avatar}</div>
                        <div className="text-white text-xs font-semibold truncate">{player.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function MatchmakingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <MatchmakingContent />
    </Suspense>
  );
}

