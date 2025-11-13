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
  const queueKey = userId.slice(0, 6).toUpperCase();
 
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

  const humanCount = players.filter(player => !player.isAI).length;
  const aiCount = players.filter(player => player.isAI).length;
  const slots = Array.from({ length: 5 }, (_, index) => players[index]);
  const traitLabel = trait === 'all' ? 'All traits' : trait;
  const queueMessages = [
    `queue ${queueKey} awaiting full party`,
    `${humanCount} human teammate${humanCount === 1 ? '' : 's'} secured`,
    `${aiCount > 0 ? aiCount : 'No'} AI on standby`,
    `lp window ${userProfile?.rankLP ? userProfile.rankLP % 100 : 0}/100`
  ];

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
      const matchId = `match-${userId}-${Date.now()}`;
      console.log('📝 MATCHMAKING - Selected prompt:', randomPrompt.id, randomPrompt.title);
      console.log('🎮 MATCHMAKING - Match ID:', matchId);
      router.push(`/ranked/session?trait=${trait}&promptId=${randomPrompt.id}&matchId=${matchId}`);
    }
  }, [countdown, router, trait]);

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/ranked" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400/20 text-xl text-emerald-200">
              ✶
            </div>
            <span className="text-xl font-semibold tracking-wide">Ranked matchmaking</span>
          </Link>
          <Link
            href="/ranked"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Cancel search
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16 space-y-12">
        {countdown === null ? (
          <>
            <section className="grid gap-8 lg:grid-cols-[auto,1fr] lg:items-center">
              <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-[#141e27] px-10 py-8 text-center lg:text-left">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300 text-3xl text-emerald-200">🏆</div>
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/50">Queue status</div>
                  <h1 className="mt-3 text-3xl font-semibold">Queue {queueKey}{searchingDots}</h1>
                  <p className="mt-2 text-sm text-white/60">Pairing teammates in your LP window while AI reserves stretch.</p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                  <div className="space-y-2 border-b border-white/10 pb-3">
                    <dt className="text-xs uppercase text-white/50">Trait pool</dt>
                    <dd className="font-semibold">{traitLabel}</dd>
                    <p className="text-xs text-white/50">Current queue configuration</p>
                  </div>
                  <div className="space-y-2 border-b border-white/10 pb-3">
                    <dt className="text-xs uppercase text-white/50">Your rank</dt>
                    <dd className="font-semibold">{userRank}</dd>
                    <p className="text-xs text-white/50">{100 - (userProfile?.rankLP ? userProfile.rankLP % 100 : 0)} LP until promotion</p>
                  </div>
                  <div className="space-y-2 border-b border-white/10 pb-3">
                    <dt className="text-xs uppercase text-white/50">Party fill</dt>
                    <dd className="font-semibold">{players.length} / 5 slots</dd>
                    <p className="text-xs text-white/50">{humanCount} human - {aiCount} AI</p>
                  </div>
                  <div className="space-y-2 border-b border-white/10 pb-3">
                    <dt className="text-xs uppercase text-white/50">Next AI join</dt>
                    <dd className="font-semibold">Every 5 seconds</dd>
                    <p className="text-xs text-white/50">Backfill only if needed</p>
                  </div>
                </dl>

                <div className="mt-6">
                  <div className="text-xs uppercase tracking-[0.3em] text-white/50">Queue progress</div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(players.length / 5) * 100}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-white/50">Countdown begins once all five slots are occupied.</p>
                </div>

                <div className="mt-6 grid gap-3 font-mono text-[11px] text-white/60">
                  {queueMessages.map(message => (
                    <div key={message} className="rounded-lg border border-white/5 bg-[#101820] px-3 py-2">{message}</div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
              <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.3em] text-white/50">Lobby slots</div>
                    <p className="mt-2 text-xs text-white/50">Rows update in real time as teammates lock in.</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/40">Live</span>
                </div>
                <ol className="mt-6 space-y-3">
                  {slots.map((player, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0c141d] text-2xl">
                        {player ? player.avatar : '👤'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold ${player ? 'text-white' : 'text-white/40'}`}>
                            {player ? (player.isAI ? `${player.name} · AI` : player.name) : 'Searching...'}
                          </span>
                          <span className="text-[11px] text-white/40">Slot {index + 1}</span>
                        </div>
                        <div className="mt-1 text-[11px] text-white/50">
                          {player ? (player.isAI ? 'Reserve operator' : player.rank) : 'Matching within LP window'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <aside className="space-y-8">
                <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
                  <div className="text-xs uppercase tracking-[0.3em] text-white/50">Queue telemetry</div>
                  <dl className="mt-5 space-y-4 text-sm">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <dt className="text-white/60">Median wait</dt>
                      <dd className="text-emerald-200 font-semibold">18 seconds</dd>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <dt className="text-white/60">Live humans</dt>
                      <dd className="text-emerald-200 font-semibold">{humanCount}</dd>
                    </div>
                    <div className="flex items-center justify-between pb-3">
                      <dt className="text-white/60">AI standby</dt>
                      <dd className="text-white/40">{Math.max(0, 5 - humanCount)}</dd>
                    </div>
                  </dl>
                  <Link
                    href="/ranked"
                    className="mt-6 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Exit queue
                  </Link>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8 text-xs text-white/50">
                  <div className="text-xs uppercase tracking-[0.3em] text-white/50">Briefing</div>
                  <p className="mt-3">- Keep your draft space ready; countdown triggers instantly once all slots fill.</p>
                  <p className="mt-3">- AI reserves only appear if humans are unavailable. Expect a mix when queue is quiet.</p>
                  <p className="mt-3">- Cancel now if you need a break; leaving during countdown costs LP.</p>
                </div>
              </aside>
            </section>
          </>
        ) : (
          <section className="grid gap-8 lg:grid-cols-[1fr,1.15fr]">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-10 text-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-emerald-300 bg-emerald-400/20 text-5xl font-semibold text-emerald-200">
                {countdown}
              </div>
              <div className="mt-6">
                <div className="text-xs uppercase tracking-[0.3em] text-white/50">Match secured</div>
                <h2 className="mt-3 text-4xl font-semibold">Prompt loading</h2>
                <p className="mt-2 text-sm text-white/60">Draft phase opens the moment this timer reaches zero.</p>
              </div>
              <div className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-left text-xs text-white/60">
                <div className="text-white/50">Final checks</div>
                <ul className="mt-3 space-y-2">
                  <li>- Prompt drawn from ranked pool</li>
                  <li>- AI reserves synced to your party</li>
                  <li>- LP adjustments active</li>
                </ul>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Party roster</div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {players.map((player, index) => (
                  <div key={index} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify_center rounded-xl bg-[#0c141d] text-2xl">
                        {player.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{player.name}</div>
                        <div className={`text-[11px] ${player.isAI ? 'text-emerald-200' : 'text-white/60'}`}>
                          {player.isAI ? 'AI support' : player.rank}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[11px] text-white/40">
                      <span>Slot {index + 1}</span>
                      <span>{player.isAI ? 'Backup ready' : 'Human teammate'}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/40">
                <span>{humanCount} real teammates</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>{aiCount} AI reserves</span>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default function RankedMatchmakingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#101820] flex items-center justify-center text-white/60 text-sm">
        Loading ranked matchmaking...
      </div>
    }>
      <RankedMatchmakingContent />
    </Suspense>
  );
}

