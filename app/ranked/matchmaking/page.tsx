'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

function RankedMatchmakingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait');
  const { userProfile } = useAuth();

  // Ensure avatar is a string (old profiles had it as an object)
  const userAvatar = typeof userProfile?.avatar === 'string' ? userProfile.avatar : '🌿';
  const userRank = userProfile?.currentRank || 'Silver III';

  const [players, setPlayers] = useState<Array<{name: string, avatar: string, rank: string}>>([
    { 
      name: 'You', 
      avatar: userAvatar, 
      rank: userRank 
    }
  ]);
  const [searchingDots, setSearchingDots] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSearchingDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const rankedPlayers = [
      { name: 'ProWriter99', avatar: '🎯', rank: 'Silver II' },
      { name: 'WordMaster', avatar: '📖', rank: 'Silver III' },
      { name: 'EliteScribe', avatar: '✨', rank: 'Silver II' },
      { name: 'PenChampion', avatar: '🏅', rank: 'Silver IV' },
    ];

    const timeouts: NodeJS.Timeout[] = [];
    
    [1200, 2000, 2800, 3600].forEach((delay, index) => {
      const timeout = setTimeout(() => {
        setPlayers(prev => [...prev, rankedPlayers[index]]);
      }, delay);
      timeouts.push(timeout);
    });

    const countdownTimeout = setTimeout(() => {
      setCountdown(3);
    }, 4500);
    timeouts.push(countdownTimeout);

    return () => timeouts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const randomPromptType = ['narrative', 'descriptive', 'informational', 'argumentative'][Math.floor(Math.random() * 4)];
      router.push(`/ranked/session?trait=${trait}&promptType=${randomPromptType}`);
    }
  }, [countdown, router, trait]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
              href="/ranked"
              className="text-white/60 hover:text-white transition-colors text-sm"
            >
              ← Cancel
            </Link>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          {countdown === null ? (
            <>
              <div className="text-center mb-12">
                <div className="inline-block animate-spin text-6xl mb-6">🏆</div>
                <h1 className="text-4xl font-bold text-white mb-3">
                  Finding Ranked Match{searchingDots}
                </h1>
                <p className="text-white/60 text-lg">Matching with similar skill level</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[...Array(5)].map((_, index) => {
                  const player = players[index];
                  return (
                    <div
                      key={index}
                      className={`relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border-2 transition-all duration-500 ${
                        player 
                          ? 'border-purple-400/50 scale-100 opacity-100' 
                          : 'border-white/10 scale-95 opacity-50'
                      }`}
                    >
                      {player ? (
                        <div className="text-center animate-in fade-in zoom-in duration-300">
                          <div className="text-5xl mb-3">{player.avatar}</div>
                          <div className="text-white font-semibold mb-1">{player.name}</div>
                          <div className="text-purple-400 text-xs">{player.rank}</div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-4xl text-white/20 mb-3">👤</div>
                          <div className="text-white/40 text-sm">Matching...</div>
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-white/60 text-xs">
                        {index + 1}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-full border border-white/20">
                  <span className="text-white/60">Party Size:</span>
                  <span className="text-white font-bold">{players.length}/5</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full mb-6 shadow-2xl shadow-purple-500/50">
                  <span className="text-6xl font-bold text-white">{countdown}</span>
                </div>
                <h1 className="text-5xl font-bold text-white mb-4">Ranked Match Found!</h1>
                <p className="text-white/70 text-xl mb-8">Starting in {countdown}...</p>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30 max-w-2xl mx-auto">
                  <h3 className="text-white font-bold mb-4">Your Ranked Party</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {players.map((player, index) => (
                      <div key={index} className="text-center">
                        <div className="text-3xl mb-1">{player.avatar}</div>
                        <div className="text-white text-xs font-semibold truncate">{player.name}</div>
                        <div className="text-purple-400 text-[10px]">{player.rank}</div>
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

export default function RankedMatchmakingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <RankedMatchmakingContent />
    </Suspense>
  );
}

