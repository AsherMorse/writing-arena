'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { joinQueue, leaveQueue, listenToQueue, QueueEntry, createMatchLobby, listenToMatchLobby } from '@/lib/services/matchmaking-queue';
import { getRandomPrompt } from '@/lib/utils/prompts';
import { getRandomAIStudents } from '@/lib/services/ai-students';
import { useCreateSession } from '@/lib/hooks/useSession';
import { SCORING } from '@/lib/constants/scoring';
import { useCountdown } from '@/lib/hooks/useCountdown';
import { useCarousel } from '@/lib/hooks/useCarousel';
import { normalizePlayerAvatar, getPlayerDisplayName, getPlayerRank } from '@/lib/utils/player-utils';

export default function MatchmakingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait') || 'all';
  const { user, userProfile } = useAuth();
  
  // NEW: Session management hooks
  const { findOrJoinSession, addPlayerToSession, startSession, createSession, isCreating } = useCreateSession();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Ensure avatar is a string (old profiles had it as an object)
  const userAvatar = normalizePlayerAvatar(userProfile?.avatar);
  const userRank = getPlayerRank(userProfile?.currentRank);
  const userName = getPlayerDisplayName(userProfile?.displayName, 'You');
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
  // Carousel hook for writing concepts (already imported)
  const [selectedAIStudents, setSelectedAIStudents] = useState<any[]>([]);
  const finalPlayersRef = useRef<any[]>([]);
  const [queueSnapshot, setQueueSnapshot] = useState<QueueEntry[]>([]);
  const [isLeader, setIsLeader] = useState(false);
  const [sharedMatchId, setSharedMatchId] = useState<string | null>(null);
  const lobbyListenerRef = useRef<(() => void) | null>(null);
  const [hasFilledWithAI, setHasFilledWithAI] = useState(false);
  const [showStartModal, setShowStartModal] = useState(true);
  const startModalChoiceRef = useRef<'wait' | 'ai' | null>(null);

  const buildAIPlayer = useCallback(
    (student: any, fallbackRank: string = userRank) => ({
      userId: student.id || student.userId || `ai-${student.displayName || student.name || 'player'}`,
      name: student.displayName || student.name || 'AI Player',
      avatar: student.avatar || '🤖',
      rank: student.currentRank || student.rank || fallbackRank,
      isAI: true,
    }),
    [userRank],
  );

  // Function to fill lobby with AI players (extracted for reuse)
  const fillLobbyWithAI = useCallback(async () => {
    console.log('🚀 MATCHMAKING - Filling with AI players...');
    setHasFilledWithAI(true);
    
    // Stop AI backfill interval
    if (aiBackfillIntervalRef.current) {
      clearInterval(aiBackfillIntervalRef.current);
      aiBackfillIntervalRef.current = null;
    }
    
    // Ensure we have AI students loaded
    let aiStudents = selectedAIStudents;
    if (aiStudents.length === 0) {
      console.log('🤖 MATCHMAKING - Fetching AI students...');
      aiStudents = await getRandomAIStudents(userRank, 4);
      if (aiStudents.length > 0) {
        setSelectedAIStudents(aiStudents);
      }
    }
    
    if (aiStudents.length === 0) {
      console.warn('⚠️ MATCHMAKING - No AI students available');
      setHasFilledWithAI(false);
      return;
    }
    
    // Leave queue since we're not waiting for real players
    if (user) {
      leaveQueue(userId).catch(err => 
        console.error('Error leaving queue:', err)
      );
    }
    
    // Calculate how many AI players to add
    const currentPlayerCount = players.length;
    const slotsRemaining = 5 - currentPlayerCount;
    if (slotsRemaining <= 0) return;
      
    const aiToAdd = aiStudents
      .slice(0, slotsRemaining)
      .map(ai => buildAIPlayer(ai));
      
    // Add AI players to Firestore session FIRST (before updating local state)
    if (!currentSessionId) {
      console.error('❌ MATCHMAKING - No session ID available!');
      setHasFilledWithAI(false);
      return;
    }
    
    try {
      await Promise.all(
        aiToAdd.map((aiPlayer, index) => {
          const aiStudent = aiStudents[index];
          if (aiStudent) {
            return addPlayerToSession(
              currentSessionId,
              aiPlayer.userId,
              {
                displayName: aiStudent.displayName || 'AI Player',
                avatar: aiStudent.avatar || '🤖',
                rank: aiStudent.currentRank || 'Silver III',
              },
              true // isAI
            );
          }
          return Promise.resolve();
        })
      );
    } catch (error) {
      console.error('❌ MATCHMAKING - Failed to add AI players:', error);
      setHasFilledWithAI(false);
      return;
    }
    
    // Now update local state (this will trigger countdown)
    setPlayers(prev => {
      return [...prev, ...aiToAdd].slice(0, 5);
    });
  }, [selectedAIStudents, userRank, userId, user, players, currentSessionId, buildAIPlayer, addPlayerToSession]);

  const displayPlayers = useMemo(() => {
    const hasSelf = players.some(p => p.userId === userId);
    if (hasSelf) return players;
    const selfPlayer = {
      userId,
      name: 'You',
      avatar: userAvatar,
      rank: userRank,
      isAI: false,
    };
    return [selfPlayer, ...players].slice(0, 5);
  }, [players, userId, userAvatar, userRank]);

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

  // Rotate writing concepts every 6 seconds while searching using carousel hook
  const { currentIndex: currentTipIndex, goTo: goToTip } = useCarousel({
    items: writingConcepts,
    interval: 6000,
    autoPlay: countdown === null, // Stop auto-play when countdown starts
  });

  // Handle AI choice: create session and fill with AI (skip queue)
  useEffect(() => {
    if (!user || !userProfile || showStartModal || startModalChoiceRef.current !== 'ai' || hasJoinedQueueRef.current) return;
    
    const startAIMatch = async () => {
      hasJoinedQueueRef.current = true;
      console.log('🤖 MATCHMAKING - Starting AI match...');
      
      try {
        // Create session without joining queue
        const playerInfo = {
          displayName: userName,
          avatar: userAvatar,
          rank: userRank,
        };
        
        const session = await findOrJoinSession(userId, playerInfo, trait);
        setCurrentSessionId(session.sessionId);
        
        // Wait a moment for session to be set, then fill with AI
        setTimeout(async () => {
          await fillLobbyWithAI();
        }, 500);
      } catch (error) {
        console.error('❌ MATCHMAKING - Failed to start AI match:', error);
      }
    };
    
    startAIMatch();
  }, [user, userProfile, showStartModal, userId, userName, userAvatar, userRank, trait, findOrJoinSession, fillLobbyWithAI]);

  // Join queue and listen for players (only after modal choice to wait)
  useEffect(() => {
    if (!user || !userProfile || hasJoinedQueueRef.current || showStartModal || startModalChoiceRef.current !== 'wait') return;

    console.log('🎮 MATCHMAKING - Starting matchmaking for:', userName);
    hasJoinedQueueRef.current = true;

    let unsubscribeQueue: (() => void) | null = null;

    const startMatchmaking = async () => {
      try {
        // Join the queue
        await joinQueue(userId, userName, userAvatar, userRank, userProfile.rankLP || 0, trait);
        console.log('✅ MATCHMAKING - In queue, listening for others...');

        // IMMEDIATELY find or create session
        const playerInfo = {
          displayName: userName,
          avatar: userAvatar,
          rank: userRank,
        };
        
        const session = await findOrJoinSession(userId, playerInfo, trait);
        setCurrentSessionId(session.sessionId);

        // Listen for other players in queue
        unsubscribeQueue = listenToQueue(trait, userId, (queuePlayers: QueueEntry[]) => {
          // Save queue snapshot for match coordination
          setQueueSnapshot(queuePlayers);
          
          // If party is locked (countdown started), ignore queue updates
          if (partyLockedRef.current || !currentSessionId) {
            return;
          }
          
          // Add new real players to session (async, don't block)
          (async () => {
            for (const queuePlayer of queuePlayers) {
              if (queuePlayer.userId !== userId && currentSessionId) {
                // Check if player already in local state
                const alreadyAdded = players.some(p => p.userId === queuePlayer.userId);
                if (!alreadyAdded) {
                  try {
                    await addPlayerToSession(
                      currentSessionId,
                      queuePlayer.userId,
                      {
                        displayName: queuePlayer.displayName,
                        avatar: queuePlayer.avatar,
                        rank: queuePlayer.rank,
                      },
                      false
                    );
                  } catch (error) {
                    console.error('❌ MATCHMAKING - Failed to add player:', error);
                  }
                }
              }
            }
          })();
          
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
              return prev;
            }
            
            // Keep existing AI players
            const existingAI = prev.filter(p => p.isAI);
            // Combine real players + AI players (up to 5 total)
            return [...realPlayers, ...existingAI].slice(0, 5);
          });
        });

        // Fetch AI students from database and add them gradually
        const fetchAndAddAIStudents = async () => {
          const aiStudents = await getRandomAIStudents(userRank, 4);
          
          if (aiStudents.length === 0) {
            return;
          }
          
          setSelectedAIStudents(aiStudents);
          
          // Wait longer before adding first AI student (give real players time to join)
          setTimeout(() => {
            let aiIndex = 0;
            
            // Add first AI student
            (async () => {
              setPlayers((prev) => {
                const currentCount = prev.length;
                if (currentCount >= 5 || aiIndex >= aiStudents.length) return prev;
              
              const aiStudent = aiStudents[aiIndex];
              const aiPlayer = buildAIPlayer(aiStudent);
              
                // Add AI player to Firestore session (async, don't block)
                if (currentSessionId) {
                  addPlayerToSession(
                    currentSessionId,
                    aiPlayer.userId,
                    {
                      displayName: aiStudent.displayName || 'AI Player',
                      avatar: aiStudent.avatar || '🤖',
                      rank: aiStudent.currentRank || 'Silver III',
                    },
                    true // isAI
                  ).catch((error) => {
                    console.error('❌ MATCHMAKING - Failed to add AI player:', error);
                  });
                }
              aiIndex++;
              return [...prev, aiPlayer];
            });
            })();
            
            // Continue adding AI students gradually (one every 5 seconds)
            aiBackfillIntervalRef.current = setInterval(() => {
              setPlayers((prev) => {
                // Check if party is already full or we've added all AI students
                if (prev.length >= 5 || aiIndex >= aiStudents.length) {
                  if (aiBackfillIntervalRef.current) {
                    clearInterval(aiBackfillIntervalRef.current);
                  }
                  return prev;
                }
                
                // Check if we have 2+ real players - if so, slow down AI backfill
                const realPlayerCount = prev.filter(p => !p.isAI).length;
                if (realPlayerCount >= 2 && prev.length < 4) {
                  return prev; // Skip this AI addition cycle
                }

                const aiStudent = aiStudents[aiIndex];
                const aiPlayer = buildAIPlayer(aiStudent);
                
                // Add AI player to Firestore session (async, don't block)
                if (currentSessionId) {
                  addPlayerToSession(
                    currentSessionId,
                    aiPlayer.userId,
                    {
                      displayName: aiStudent.displayName || 'AI Player',
                      avatar: aiStudent.avatar || '🤖',
                      rank: aiStudent.currentRank || 'Silver III',
                    },
                    true // isAI
                  ).catch((error) => {
                    console.error('❌ MATCHMAKING - Failed to add AI player:', error);
                  });
                }
                
                aiIndex++;
                return [...prev, aiPlayer];
              });
            }, 5000); // Every 5 seconds
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
  }, [user, userProfile, userId, userName, userAvatar, userRank, trait, buildAIPlayer, findOrJoinSession, addPlayerToSession, currentSessionId, players, showStartModal, fillLobbyWithAI]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const fillLobbyWithAI = async () => {
      try {
        console.log('🧪 MATCHMAKING - Debug fill lobby with AI triggered');

        const ensureAIStudents = async () => {
          if (selectedAIStudents.length > 0) {
            return selectedAIStudents;
          }
          const aiStudents = await getRandomAIStudents(userRank, 4);
          if (aiStudents.length > 0) {
            setSelectedAIStudents(aiStudents);
          }
          return aiStudents;
        };

        const aiStudents = await ensureAIStudents();
        if (aiStudents.length === 0) {
          console.warn('⚠️ MATCHMAKING - No AI students available for debug fill');
          return;
        }

        const aiPlayerPool = aiStudents.map(ai => buildAIPlayer(ai, userRank));

        const selfPlayer = {
          userId,
          name: 'You',
          avatar: userAvatar,
          rank: userRank,
          isAI: false,
        };

        setPlayers(prev => {
          const otherRealPlayers = prev.filter(p => !p.isAI && p.userId !== userId);
          const baseParty = [selfPlayer, ...otherRealPlayers];
          const slotsRemaining = Math.max(0, 5 - baseParty.length);
          const aiToAdd = aiPlayerPool.slice(0, slotsRemaining);
          return [...baseParty, ...aiToAdd].slice(0, 5);
        });
      } catch (error) {
        console.error('❌ MATCHMAKING - Failed to fill lobby via debug:', error);
      }
    };

    const handler = () => {
      void fillLobbyWithAI();
    };

    window.addEventListener('debug-fill-lobby-ai', handler);
    return () => {
      window.removeEventListener('debug-fill-lobby-ai', handler);
    };
  }, [selectedAIStudents, userAvatar, userRank, userId, buildAIPlayer]);

  // Start match when 5 players
  useEffect(() => {
    if (players.length >= 5 && countdown === null && !partyLockedRef.current) {
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
      (async () => {
      // Determine if this is a multi-player match
      const realPlayersInQueue = queueSnapshot.filter(p => finalPlayersRef.current.some(fp => fp.userId === p.userId));
      const isMultiPlayer = realPlayersInQueue.length >= 2;
      
      // Get a truly random prompt from the library
      const randomPrompt = getRandomPrompt();
      
      // If multiple real players, coordinate matchId (use earliest player's ID as leader)
      let matchId: string;
      let amILeader = false;
      
      if (isMultiPlayer) {
        // Sort by join time and use earliest player as leader
        const sortedPlayers = [...realPlayersInQueue].sort((a, b) => {
          const aTime = a.joinedAt?.toMillis() || 0;
          const bTime = b.joinedAt?.toMillis() || 0;
          return aTime - bTime;
        });
        const leaderId = sortedPlayers[0].userId;
        const leaderJoinTime = sortedPlayers[0].joinedAt?.toMillis() || Date.now();
        matchId = `match-${leaderId}-${leaderJoinTime}`;
        amILeader = leaderId === userId;
        
        setIsLeader(amILeader);
        setSharedMatchId(matchId);
      } else {
        // Single player match
        matchId = `match-${userId}-${Date.now()}`;
        amILeader = true;
        }
        
        // Session already exists (created when user joined queue)
        // Now we need to start it (transition from 'forming' to 'active')
        if (!currentSessionId) {
          console.error('❌ MATCHMAKING - No session ID available!');
          return;
      }
      
        // Start the session (set prompt, phase duration, start time)
        try {
          await startSession(
            currentSessionId,
            randomPrompt.id,
            randomPrompt.type,
            SCORING.PHASE1_DURATION
          );
          
          // Create lobby for backward compatibility (if multi-player)
      if (isMultiPlayer && amILeader) {
            const playersToSave = finalPlayersRef.current.length > 0 ? finalPlayersRef.current : players;
        const lobbyPlayers = playersToSave
              .filter((p: any) => p && (p.userId || p.isYou || p.id))
          .map((p: any) => ({
            userId: p.userId || p.id || (p.isYou ? userId : `ai-${p.name}`),
          displayName: p.name === 'You' ? userName : p.name,
            avatar: p.avatar || '🤖',
                rank: p.currentRank || p.rank || 'Silver III',
            isAI: p.isAI || false,
          }));
            createMatchLobby(matchId, lobbyPlayers, trait, randomPrompt.id).catch(console.error);
          }
          
          // Navigate to session
          router.push(`/session/${currentSessionId}`);
        } catch (err) {
          console.error('❌ MATCHMAKING - Failed to start session:', err);
        }
      })();
    }
  }, [countdown, router, trait, userId, userName, players, selectedAIStudents, queueSnapshot, startSession, currentSessionId, finalPlayersRef]);

  // Handle modal choice
  const handleStartChoice = async (choice: 'wait' | 'ai') => {
    startModalChoiceRef.current = choice;
    setShowStartModal(false);
    
    // If AI chosen, we'll fill after session is created (handled in useEffect)
    // If wait chosen, normal matchmaking proceeds
  };

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      {/* Start Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="rounded-3xl border border-white/20 bg-[#141e27] p-12 shadow-2xl mx-4 max-w-2xl w-full">
            <h2 className="text-3xl font-bold text-white mb-4 text-center">Start Ranked Match</h2>
            <p className="text-white/60 text-center mb-8">
              Choose how you want to play
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => handleStartChoice('wait')}
                className="group rounded-2xl border border-purple-400/30 bg-purple-500/10 hover:bg-purple-500/20 p-8 text-left transition-all duration-200 hover:scale-105 hover:border-purple-400/50"
              >
                <div className="text-4xl mb-4">⏳</div>
                <h3 className="text-xl font-semibold text-white mb-2">Wait for Players</h3>
                <p className="text-white/70 text-sm">
                  Match with other real players for a competitive ranked experience
                </p>
                <div className="mt-4 flex items-center text-purple-300 text-sm">
                  <span>Start matchmaking</span>
                  <span className="ml-2 transition group-hover:translate-x-1">→</span>
                </div>
              </button>
              
              <button
                onClick={() => handleStartChoice('ai')}
                className="group rounded-2xl border border-emerald-400/30 bg-emerald-500/10 hover:bg-emerald-500/20 p-8 text-left transition-all duration-200 hover:scale-105 hover:border-emerald-400/50"
              >
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-white mb-2">Compete Against AI</h3>
                <p className="text-white/70 text-sm">
                  Start immediately with AI opponents - perfect for quick practice
                </p>
                <div className="mt-4 flex items-center text-emerald-300 text-sm">
                  <span>Start now</span>
                  <span className="ml-2 transition group-hover:translate-x-1">→</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

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
                          onClick={() => goToTip(index)}
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
                  const player = displayPlayers[index];
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

              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3">
                  <span className="text-white/60 text-sm">Party Size:</span>
                  <span className="text-white font-bold text-lg">{displayPlayers.length}/5</span>
                </div>
                
                {/* Fast Track Button - Only show if not full, not already filled, and user chose to wait */}
                {displayPlayers.length < 5 && !hasFilledWithAI && startModalChoiceRef.current === 'wait' && (
                  <div>
                    <button
                      onClick={fillLobbyWithAI}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-500/20 hover:bg-emerald-500/30 px-6 py-3 text-emerald-200 font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20"
                    >
                      <span className="text-xl">🤖</span>
                      <span>Play Against AI Now</span>
                    </button>
                    <p className="text-white/40 text-xs mt-2">
                      Skip waiting and start immediately with AI opponents
                    </p>
                  </div>
                )}
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

