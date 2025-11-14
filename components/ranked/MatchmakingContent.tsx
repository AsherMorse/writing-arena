'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { joinQueue, leaveQueue, listenToQueue, QueueEntry } from '@/lib/services/matchmaking-queue';
import { getRandomPrompt } from '@/lib/utils/prompts';
import { getRandomAIStudents } from '@/lib/services/ai-students';

export default function MatchmakingContent() {
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
  const partyLockedRef = useRef(false); // Lock party once full
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [selectedAIStudents, setSelectedAIStudents] = useState<any[]>([]);
  const finalPlayersRef = useRef<any[]>([]);
  const [queueSnapshot, setQueueSnapshot] = useState<QueueEntry[]>([]);

  // Writing Revolution concepts carousel
  const writingConcepts = [
    {
      name: 'Sentence Expansion',
      tip: 'Use because, but, or so to show why things happen and add depth to your writing.',
      example: 'She opened the door because she heard a strange noise.',
      icon: '🔗',
    },
    {
      name: 'Appositives',
      tip: 'Add description using commas to provide extra information about nouns.',
      example: 'Sarah, a curious ten-year-old, pushed open the rusty gate.',
      icon: '✏️',
    },
    {
      name: 'Five Senses',
      tip: 'Include what you see, hear, smell, taste, and feel to create vivid descriptions.',
      example: 'The salty air stung my eyes while waves crashed loudly below.',
      icon: '👁️',
    },
    {
      name: 'Show, Don\'t Tell',
      tip: 'Use specific details instead of general statements to engage readers.',
      example: 'Instead of "She was scared" → "Her hands trembled as she reached for the handle."',
      icon: '🎭',
    },
    {
      name: 'Transition Words',
      tip: 'Use signal words to connect ideas and show relationships between sentences.',
      example: 'First, Then, However, Therefore, For example, In contrast',
      icon: '➡️',
    },
    {
      name: 'Topic Sentences',
      tip: 'Start paragraphs with a clear main idea, then support it with details.',
      example: 'Photosynthesis is how plants make food. First, they capture sunlight...',
      icon: '📝',
    },
    {
      name: 'Counterarguments',
      tip: 'Address opposing views to strengthen your argument and show critical thinking.',
      example: 'Some might argue that... However, this ignores the fact that...',
      icon: '⚖️',
    },
    {
      name: 'Specific Details',
      tip: 'Replace vague words with precise descriptions to paint a clearer picture.',
      example: 'Instead of "pretty flower" → "crimson rose with velvet petals"',
      icon: '🎨',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSearchingDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Rotate writing concepts every 6 seconds while searching
  useEffect(() => {
    if (countdown !== null) return; // Stop rotating when match is found
    
    const interval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % writingConcepts.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [countdown, writingConcepts.length]);

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
          
          // Save queue snapshot for match coordination
          setQueueSnapshot(queuePlayers);
          
          // If party is locked (countdown started), ignore queue updates
          if (partyLockedRef.current) {
            console.log('🔒 MATCHMAKING - Party locked, ignoring queue update');
            return;
          }
          
          // Convert queue entries to player format
          const realPlayers = queuePlayers.map(p => ({
            userId: p.userId,
            name: p.userId === userId ? 'You' : p.displayName,
            avatar: p.avatar,
            rank: p.rank,
            isAI: false,
          }));

          // Merge real players with existing AI players (don't replace!)
          setPlayers(prev => {
            // If party is full, don't update
            if (prev.length >= 5) {
              console.log('🛑 MATCHMAKING - Party full, ignoring queue update');
              return prev;
            }
            
            // Keep existing AI players
            const existingAI = prev.filter(p => p.isAI);
            // Combine real players + AI players (up to 5 total)
            const merged = [...realPlayers, ...existingAI].slice(0, 5);
            console.log('🔄 MATCHMAKING - Merged party:', merged.length, 'players (', realPlayers.length, 'real +', existingAI.length, 'AI)');
            return merged;
          });
        });

        // Fetch AI students from database and add them gradually
        const fetchAndAddAIStudents = async () => {
          console.log('🤖 MATCHMAKING - Fetching AI students from database...');
          const aiStudents = await getRandomAIStudents(userRank, 4);
          
          if (aiStudents.length === 0) {
            console.warn('⚠️ MATCHMAKING - No AI students found in database, using fallback');
            return;
          }
          
          console.log('✅ MATCHMAKING - Loaded', aiStudents.length, 'AI students:', aiStudents.map(s => s.displayName).join(', '));
          setSelectedAIStudents(aiStudents);
          
          // Wait longer before adding first AI student (give real players time to join)
          setTimeout(() => {
            let aiIndex = 0;
            
            // Add first AI student
            setPlayers(prev => {
              if (prev.length >= 5 || aiIndex >= aiStudents.length) return prev;
              
              const aiStudent = aiStudents[aiIndex];
              console.log('🤖 MATCHMAKING - Adding AI student:', aiStudent.displayName, '(party size:', prev.length + 1, ')');
              
              const aiPlayer = {
                userId: aiStudent.id,
                name: aiStudent.displayName,
                avatar: aiStudent.avatar,
                rank: aiStudent.currentRank,
                isAI: true,
              };
              
              aiIndex++;
              return [...prev, aiPlayer];
            });
            
            // Continue adding AI students gradually (one every 10 seconds)
            aiBackfillIntervalRef.current = setInterval(() => {
              setPlayers(prev => {
                // Check if party is already full or we've added all AI students
                if (prev.length >= 5 || aiIndex >= aiStudents.length) {
                  console.log('🎮 MATCHMAKING - Party full (', prev.length, '/5), stopping AI backfill');
                  if (aiBackfillIntervalRef.current) {
                    clearInterval(aiBackfillIntervalRef.current);
                  }
                  return prev;
                }
                
                // Check if we have 2+ real players - if so, slow down AI backfill
                const realPlayerCount = prev.filter(p => !p.isAI).length;
                if (realPlayerCount >= 2 && prev.length < 4) {
                  console.log('👥 MATCHMAKING - Multiple real players detected, prioritizing real player matching');
                  return prev; // Skip this AI addition cycle
                }

                const aiStudent = aiStudents[aiIndex];
                console.log('🤖 MATCHMAKING - Adding AI student:', aiStudent.displayName, '(party size:', prev.length + 1, ')');
                
                const aiPlayer = {
                  userId: aiStudent.id,
                  name: aiStudent.displayName,
                  avatar: aiStudent.avatar,
                  rank: aiStudent.currentRank,
                  isAI: true,
                };
                
                aiIndex++;
                return [...prev, aiPlayer];
              });
            }, 10000); // Every 10 seconds
          }, 15000); // Wait 15 seconds before adding first AI
        };
        
        fetchAndAddAIStudents();

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
    if (players.length >= 5 && countdown === null && !partyLockedRef.current) {
      console.log('🎉 MATCHMAKING - Party full! Starting countdown...');
      console.log('💾 MATCHMAKING - Saving final party:', players.map(p => p.name).join(', '));
      
      // Lock the party - no more updates allowed
      partyLockedRef.current = true;
      
      // Save current players array to ref BEFORE leaving queue
      finalPlayersRef.current = [...players];
      
      // Stop AI backfill
      if (aiBackfillIntervalRef.current) {
        clearInterval(aiBackfillIntervalRef.current);
      }
      
      // Leave queue (this will trigger a queue update but it will be ignored)
      if (user) {
        leaveQueue(userId).catch(err => console.error('Error leaving queue:', err));
      }
      
      setCountdown(3);
    }
  }, [players, countdown, userId, user]);

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
      
      // If multiple real players, coordinate matchId (use earliest player's ID as leader)
      let matchId: string;
      const realPlayersInQueue = queueSnapshot.filter(p => finalPlayersRef.current.some(fp => fp.userId === p.userId));
      
      if (realPlayersInQueue.length >= 2) {
        // Sort by join time and use earliest player as leader
        const sortedPlayers = [...realPlayersInQueue].sort((a, b) => {
          const aTime = a.joinedAt?.toMillis() || 0;
          const bTime = b.joinedAt?.toMillis() || 0;
          return aTime - bTime;
        });
        const leaderId = sortedPlayers[0].userId;
        const leaderJoinTime = sortedPlayers[0].joinedAt?.toMillis() || Date.now();
        matchId = `match-${leaderId}-${leaderJoinTime}`;
        console.log('👥 MATCHMAKING - Multi-player match, leader:', leaderId, 'matchId:', matchId);
      } else {
        // Single player match
        matchId = `match-${userId}-${Date.now()}`;
        console.log('👤 MATCHMAKING - Single player match, matchId:', matchId);
      }
      
      console.log('📝 MATCHMAKING - Selected prompt:', randomPrompt.id, randomPrompt.title);
      console.log('🎮 MATCHMAKING - Match ID:', matchId);
      
      // Save selected AI students to sessionStorage so session page can use them
      if (selectedAIStudents.length > 0) {
        sessionStorage.setItem(`${matchId}-ai-students`, JSON.stringify(selectedAIStudents));
        console.log('💾 MATCHMAKING - Saved', selectedAIStudents.length, 'AI students for match');
      }
      
      // Save all players for the match - use ref to get the saved party (not current state which might be empty)
      const playersToSave = finalPlayersRef.current.length > 0 ? finalPlayersRef.current : players;
      sessionStorage.setItem(`${matchId}-players`, JSON.stringify(playersToSave));
      console.log('💾 MATCHMAKING - Saved', playersToSave.length, 'players:', playersToSave.map(p => p.name).join(', '));
      
      router.push(`/ranked/session?trait=${trait}&promptId=${randomPrompt.id}&matchId=${matchId}`);
    }
  }, [countdown, router, trait, userId, players, selectedAIStudents, queueSnapshot]);

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/ranked" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400/20 text-xl text-emerald-200">
              ✶
            </div>
            <span className="text-xl font-semibold tracking-wide">Matchmaking</span>
          </Link>
          <Link 
            href="/ranked"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            ← Cancel
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-4xl">
          {countdown === null ? (
            <>
              <div className="text-center mb-8">
                <div className="inline-block animate-spin text-6xl mb-6">🏆</div>
                <h1 className="text-4xl font-bold text-white mb-3">
                  Finding Ranked Match{searchingDots}
                </h1>
                <p className="text-white/60 text-lg">Matching with similar skill level</p>
              </div>

              {/* Writing Revolution Concepts Carousel */}
              <div className="mb-8 max-w-3xl mx-auto">
                <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-4">
                      <div className="text-3xl mr-3">{writingConcepts[currentTipIndex].icon}</div>
                      <h3 className="text-2xl font-bold text-white">
                        {writingConcepts[currentTipIndex].name}
                      </h3>
                    </div>
                    
                    <p className="text-white/90 text-center mb-4 leading-relaxed">
                      {writingConcepts[currentTipIndex].tip}
                    </p>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-emerald-300 text-xs font-semibold mb-2 text-center">Example:</div>
                      <p className="text-white text-sm italic text-center leading-relaxed">
                        {writingConcepts[currentTipIndex].example}
                      </p>
                    </div>

                    {/* Progress dots */}
                    <div className="flex justify-center space-x-2 mt-4">
                      {writingConcepts.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentTipIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentTipIndex 
                              ? 'bg-emerald-400 w-8' 
                              : 'bg-white/30 hover:bg-white/50'
                          }`}
                          aria-label={`Go to tip ${index + 1}`}
                        />
                      ))}
                    </div>

                    <div className="text-center mt-3">
                      <p className="text-white/50 text-xs">
                        💡 The Writing Revolution • Tip {currentTipIndex + 1} of {writingConcepts.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4 mb-8">
                {[...Array(5)].map((_, index) => {
                  const player = players[index];
                  return (
                    <div
                      key={index}
                      className={`relative rounded-3xl border p-6 transition-all duration-500 ${
                        player 
                          ? player.isAI
                            ? 'border-emerald-400/30 bg-emerald-500/10 scale-100 opacity-100'
                            : 'border-purple-400/50 bg-purple-500/10 scale-100 opacity-100'
                          : 'border-white/10 bg-[#141e27] scale-95 opacity-50'
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
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3">
                  <span className="text-white/60 text-sm">Party Size:</span>
                  <span className="text-white font-bold text-lg">{players.length}/5</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 border-4 border-emerald-400/30 bg-emerald-500/20">
                  <span className="text-6xl font-bold text-emerald-200">{countdown}</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Ranked Match Found!</h1>
                <p className="text-white/60 text-lg mb-8">Starting in {countdown}...</p>

                <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8 max-w-2xl mx-auto">
                  <h3 className="text-white font-bold mb-4">Your Ranked Party</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {finalPlayersRef.current.map((player, index) => (
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
                      {finalPlayersRef.current.filter(p => !p.isAI).length} Real Player{finalPlayersRef.current.filter(p => !p.isAI).length !== 1 ? 's' : ''} • {finalPlayersRef.current.filter(p => p.isAI).length} AI
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

