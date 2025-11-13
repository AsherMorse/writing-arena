'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { joinQueue, leaveQueue, listenToQueue, generateAIPlayer, QueueEntry } from '@/lib/matchmaking-queue';
import { getRandomPrompt } from '@/lib/prompts';

function RankedMatchmakingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait') || 'all';
  const { user, userProfile } = useAuth();

  // Ensure avatar is a string (old profiles had it as an object)
  const userAvatar = typeof userProfile?.avatar === 'string' ? userProfile.avatar : '🌿';
  const userRank = userProfile?.currentRank || 'Silver III';
  const userName = userProfile?.displayName || 'You';
  const userId = user?.uid || 'temp-user';

  const [players, setPlayers] = useState<Array<{
    userId: string;
    name: string;
    avatar: string;
    rank: string;
    isAI: boolean;
  }>>([
    { 
      userId: userId,
      name: 'You', 
      avatar: userAvatar, 
      rank: userRank,
      isAI: false
    }
  ]);
  const [searchingDots, setSearchingDots] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const aiBackfillIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasJoinedQueueRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSearchingDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Join queue and listen for players
  useEffect(() => {
    if (!user || !userProfile || hasJoinedQueueRef.current) return;

    console.log('🎮 MATCHMAKING - Starting matchmaking for:', userName);
    hasJoinedQueueRef.current = true;

    let unsubscribeQueue: (() => void) | null = null;

    const startMatchmaking = async () => {
      try {
        // Join the queue
        await joinQueue(userId, userName, userAvatar, userRank, userProfile.rankLP || 0, trait);
        console.log('✅ MATCHMAKING - In queue, listening for others...');

        // Listen for other players in queue
        unsubscribeQueue = listenToQueue(trait, userId, (queuePlayers: QueueEntry[]) => {
          console.log('📥 MATCHMAKING - Queue update, players found:', queuePlayers.length);
          
          // Convert queue entries to player format
          const realPlayers = queuePlayers.map(p => ({
            userId: p.userId,
            name: p.userId === userId ? 'You' : p.displayName,
            avatar: p.avatar,
            rank: p.rank,
            isAI: false,
          }));

          setPlayers(realPlayers);
        });

        // Start AI backfill timer - add AI every 5 seconds
        let aiIndex = 0;
        aiBackfillIntervalRef.current = setInterval(() => {
          setPlayers(prev => {
            if (prev.length >= 5) {
              console.log('🎮 MATCHMAKING - Party full, stopping AI backfill');
              if (aiBackfillIntervalRef.current) {
                clearInterval(aiBackfillIntervalRef.current);
              }
              return prev;
            }

            console.log('🤖 MATCHMAKING - Adding AI player', aiIndex + 1);
            const aiPlayer = generateAIPlayer(userRank, aiIndex);
            aiIndex++;
            return [...prev, aiPlayer];
          });
        }, 5000); // Every 5 seconds

      } catch (error) {
        console.error('❌ MATCHMAKING - Error:', error);
      }
    };

    startMatchmaking();

    // Cleanup on unmount
    return () => {
      console.log('🧹 MATCHMAKING - Cleanup');
      if (unsubscribeQueue) {
        unsubscribeQueue();
      }
      if (aiBackfillIntervalRef.current) {
        clearInterval(aiBackfillIntervalRef.current);
      }
      if (hasJoinedQueueRef.current && user) {
        leaveQueue(userId).catch(err => 
          console.error('Error leaving queue:', err)
        );
      }
    };
  }, [user, userProfile, userId, userName, userAvatar, userRank, trait]);

  // Start match when 5 players
  useEffect(() => {
    if (players.length >= 5 && countdown === null) {
      console.log('🎉 MATCHMAKING - Party full! Starting countdown...');
      
      // Stop AI backfill
      if (aiBackfillIntervalRef.current) {
        clearInterval(aiBackfillIntervalRef.current);
      }
      
      // Leave queue
      if (user) {
        leaveQueue(userId).catch(err => console.error('Error leaving queue:', err));
      }
      
      setCountdown(3);
    }
  }, [players.length, countdown, userId, user]);

  // Countdown and start match
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      console.log('🚀 MATCHMAKING - Starting match!');
      // Get a truly random prompt from the library
      const randomPrompt = getRandomPrompt();
      console.log('📝 MATCHMAKING - Selected prompt:', randomPrompt.id, randomPrompt.title);
      router.push(`/ranked/session?trait=${trait}&promptId=${randomPrompt.id}`);
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
                          ? player.isAI
                            ? 'border-blue-400/30 scale-100 opacity-100'
                            : 'border-purple-400/50 scale-100 opacity-100'
                          : 'border-white/10 scale-95 opacity-50'
                      }`}
                    >
                      {player ? (
                        <div className="text-center animate-in fade-in zoom-in duration-300">
                          <div className="text-5xl mb-3">{player.avatar}</div>
                          <div className="text-white font-semibold mb-1">{player.name}</div>
                          <div className={`text-xs flex items-center justify-center gap-1 ${player.isAI ? 'text-blue-400' : 'text-purple-400'}`}>
                            {player.isAI && <span className="text-[10px]">🤖</span>}
                            <span>{player.rank}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-4xl text-white/20 mb-3">👤</div>
                          <div className="text-white/40 text-sm">Searching...</div>
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
                        <div className={`text-[10px] ${player.isAI ? 'text-blue-400' : 'text-purple-400'}`}>
                          {player.isAI && '🤖 '}
                          {player.rank}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 text-center">
                    <div className="text-white/60 text-xs">
                      {players.filter(p => !p.isAI).length} Real Player{players.filter(p => !p.isAI).length !== 1 ? 's' : ''} • {players.filter(p => p.isAI).length} AI
                    </div>
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

