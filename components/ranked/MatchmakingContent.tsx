'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { joinQueue, leaveQueue, listenToQueue, QueueEntry, createMatchLobby } from '@/lib/services/matchmaking-queue';
import { getRandomPrompt, getRandomPromptForRank } from '@/lib/utils/prompts';
import { getRandomAIStudents } from '@/lib/services/ai-students';
import { useCreateSession } from '@/lib/hooks/useSession';
import { SCORING, TIMING } from '@/lib/constants/scoring';
import { useCarousel } from '@/lib/hooks/useCarousel';
import { normalizePlayerAvatar, getPlayerDisplayName, getPlayerRank } from '@/lib/utils/player-utils';

export default function MatchmakingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait') || 'all';
  const { user, userProfile } = useAuth();
  
  const { findOrJoinSession, addPlayerToSession, startSession } = useCreateSession();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

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
  const partyLockedRef = useRef(false);
  const [selectedAIStudents, setSelectedAIStudents] = useState<any[]>([]);
  const finalPlayersRef = useRef<any[]>([]);
  const [queueSnapshot, setQueueSnapshot] = useState<QueueEntry[]>([]);
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

  const fillLobbyWithAI = useCallback(async (sessionIdOverride?: string) => {
    const sessionId = sessionIdOverride || currentSessionId;
    
    if (!sessionId) {
      setHasFilledWithAI(false);
      return;
    }
    
    setHasFilledWithAI(true);
    
    if (aiBackfillIntervalRef.current) {
      clearInterval(aiBackfillIntervalRef.current);
      aiBackfillIntervalRef.current = null;
    }
    
    let aiStudents = selectedAIStudents;
    if (aiStudents.length === 0) {
      aiStudents = await getRandomAIStudents(userRank, 4);
      if (aiStudents.length > 0) {
        setSelectedAIStudents(aiStudents);
      }
    }
    
    if (aiStudents.length === 0) {
      setHasFilledWithAI(false);
      return;
    }
    
    if (user) {
      leaveQueue(userId).catch(() => {});
    }
    
    const currentPlayerCount = players.length;
    const slotsRemaining = 5 - currentPlayerCount;
    if (slotsRemaining <= 0) {
      setHasFilledWithAI(false);
      return;
    }
      
    const aiToAdd = aiStudents
      .slice(0, slotsRemaining)
      .map(ai => buildAIPlayer(ai));
    
    try {
      await Promise.all(
        aiToAdd.map((aiPlayer, index) => {
          const aiStudent = aiStudents[index];
          if (aiStudent) {
            return addPlayerToSession(
              sessionId,
              aiPlayer.userId,
              {
                displayName: aiStudent.displayName || 'AI Player',
                avatar: aiStudent.avatar || '🤖',
                rank: aiStudent.currentRank || 'Silver III',
              },
              true
            );
          }
          return Promise.resolve();
        })
      );
    } catch (error) {
      setHasFilledWithAI(false);
      return;
    }
    
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

  const { currentIndex: currentTipIndex, goTo: goToTip } = useCarousel({
    items: writingConcepts,
    interval: TIMING.CAROUSEL_INTERVAL,
    autoPlay: countdown === null,
  });

  useEffect(() => {
    if (!user || !userProfile || showStartModal || startModalChoiceRef.current !== 'ai' || hasJoinedQueueRef.current) return;
    
    const startAIMatch = async () => {
      hasJoinedQueueRef.current = true;
      
      try {
        const playerInfo = {
          displayName: userName,
          avatar: userAvatar,
          rank: userRank,
        };
        
        const session = await findOrJoinSession(userId, playerInfo, trait);
        if (!session || !session.sessionId) {
          return;
        }
        setCurrentSessionId(session.sessionId);
        
        setPlayers(prev => {
          const hasUser = prev.some(p => p.userId === userId);
          if (!hasUser) {
            return [{
              userId: userId,
              name: 'You',
              avatar: userAvatar,
              rank: userRank,
              isAI: false,
            }, ...prev];
          }
          return prev;
        });
        
        await fillLobbyWithAI(session.sessionId);
      } catch (error) {
        // Silent fail
      }
    };
    
    startAIMatch();
  }, [user, userProfile, showStartModal, userId, userName, userAvatar, userRank, trait, findOrJoinSession, fillLobbyWithAI]);

  useEffect(() => {
    if (!user || !userProfile || hasJoinedQueueRef.current || showStartModal || startModalChoiceRef.current !== 'wait') return;

    hasJoinedQueueRef.current = true;

    let unsubscribeQueue: (() => void) | null = null;

    const startMatchmaking = async () => {
      try {
        await joinQueue(userId, userName, userAvatar, userRank, userProfile.rankLP || 0, trait);

        const playerInfo = {
          displayName: userName,
          avatar: userAvatar,
          rank: userRank,
        };
        
        const session = await findOrJoinSession(userId, playerInfo, trait);
        if (!session || !session.sessionId) {
          return;
        }
        setCurrentSessionId(session.sessionId);

        unsubscribeQueue = listenToQueue(trait, userId, (queuePlayers: QueueEntry[]) => {
          setQueueSnapshot(queuePlayers);
          
          if (partyLockedRef.current || !currentSessionId) {
            return;
          }
          
          (async () => {
            for (const queuePlayer of queuePlayers) {
              if (queuePlayer.userId !== userId && currentSessionId) {
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
                    // Silent fail
                  }
                }
              }
            }
          })();
          
          const realPlayers = queuePlayers.map(p => ({
            userId: p.userId,
            name: p.userId === userId ? 'You' : p.displayName,
            avatar: p.avatar,
            rank: p.rank,
            isAI: false,
          }));

          setPlayers(prev => {
            if (prev.length >= 5) {
              return prev;
            }
            
            const existingAI = prev.filter(p => p.isAI);
            return [...realPlayers, ...existingAI].slice(0, 5);
          });
        });

        const fetchAndAddAIStudents = async () => {
          const aiStudents = await getRandomAIStudents(userRank, 4);
          
          if (aiStudents.length === 0) {
            return;
          }
          
          setSelectedAIStudents(aiStudents);
          
          setTimeout(() => {
            let aiIndex = 0;
            
            (async () => {
              setPlayers((prev) => {
                const currentCount = prev.length;
                if (currentCount >= 5 || aiIndex >= aiStudents.length) return prev;
              
              const aiStudent = aiStudents[aiIndex];
              const aiPlayer = buildAIPlayer(aiStudent);
              
                if (currentSessionId) {
                  addPlayerToSession(
                    currentSessionId,
                    aiPlayer.userId,
                    {
                      displayName: aiStudent.displayName || 'AI Player',
                      avatar: aiStudent.avatar || '🤖',
                      rank: aiStudent.currentRank || 'Silver III',
                    },
                    true
                  ).catch(() => {});
                }
              aiIndex++;
              return [...prev, aiPlayer];
            });
            })();
            
            aiBackfillIntervalRef.current = setInterval(() => {
              setPlayers((prev) => {
                if (prev.length >= 5 || aiIndex >= aiStudents.length) {
                  if (aiBackfillIntervalRef.current) {
                    clearInterval(aiBackfillIntervalRef.current);
                  }
                  return prev;
                }
                
                const realPlayerCount = prev.filter(p => !p.isAI).length;
                if (realPlayerCount >= 2 && prev.length < 4) {
                  return prev;
                }

                const aiStudent = aiStudents[aiIndex];
                const aiPlayer = buildAIPlayer(aiStudent);
                
                if (currentSessionId) {
                  addPlayerToSession(
                    currentSessionId,
                    aiPlayer.userId,
                    {
                      displayName: aiStudent.displayName || 'AI Player',
                      avatar: aiStudent.avatar || '🤖',
                      rank: aiStudent.currentRank || 'Silver III',
                    },
                    true
                  ).catch(() => {});
                }
                
                aiIndex++;
                return [...prev, aiPlayer];
              });
            }, 5000);
          }, 15000);
        };
        
        fetchAndAddAIStudents();

      } catch (error) {
        // Silent fail
      }
    };

    startMatchmaking();

    return () => {
      if (unsubscribeQueue) {
        unsubscribeQueue();
      }
      if (aiBackfillIntervalRef.current) {
        clearInterval(aiBackfillIntervalRef.current);
      }
      if (hasJoinedQueueRef.current && user) {
        leaveQueue(userId).catch(() => {});
      }
    };
  }, [user, userProfile, userId, userName, userAvatar, userRank, trait, buildAIPlayer, findOrJoinSession, addPlayerToSession, currentSessionId, players, showStartModal, fillLobbyWithAI]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handler = () => {
      void fillLobbyWithAI();
    };

    window.addEventListener('debug-fill-lobby-ai', handler);
    return () => {
      window.removeEventListener('debug-fill-lobby-ai', handler);
    };
  }, [fillLobbyWithAI]);

  useEffect(() => {
    if (players.length >= 5 && countdown === null && !partyLockedRef.current) {
      partyLockedRef.current = true;
      
      finalPlayersRef.current = [...players];
      
      if (aiBackfillIntervalRef.current) {
        clearInterval(aiBackfillIntervalRef.current);
      }
      
      if (user) {
        leaveQueue(userId).catch(() => {});
      }
      
      setCountdown(3);
    }
  }, [players, countdown, userId, user]);

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      (async () => {
      const realPlayersInQueue = queueSnapshot.filter(p => finalPlayersRef.current.some(fp => fp.userId === p.userId));
      const isMultiPlayer = realPlayersInQueue.length >= 2;
      
      // Use rank-based prompt filtering for appropriate complexity
      const randomPrompt = getRandomPromptForRank(userProfile?.currentRank);
      
      let matchId: string;
      let amILeader = false;
      
      if (isMultiPlayer) {
        const sortedPlayers = [...realPlayersInQueue].sort((a, b) => {
          const aTime = a.joinedAt?.toMillis() || 0;
          const bTime = b.joinedAt?.toMillis() || 0;
          return aTime - bTime;
        });
        const leaderId = sortedPlayers[0].userId;
        const leaderJoinTime = sortedPlayers[0].joinedAt?.toMillis() || Date.now();
        matchId = `match-${leaderId}-${leaderJoinTime}`;
        amILeader = leaderId === userId;
      } else {
        matchId = `match-${userId}-${Date.now()}`;
        amILeader = true;
        }
        
        if (!currentSessionId) {
          return;
      }
      
        try {
          await startSession(
            currentSessionId,
            randomPrompt.id,
            randomPrompt.type,
            SCORING.PHASE1_DURATION,
            userRank
          );
          
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
            createMatchLobby(matchId, lobbyPlayers, trait, randomPrompt.id).catch(() => {});
          }
          
          router.push(`/session/${currentSessionId}`);
        } catch (err) {
          // Silent fail
        }
      })();
    }
  }, [countdown, router, trait, userId, userName, players, queueSnapshot, startSession, currentSessionId, userRank]);

  const handleStartChoice = async (choice: 'wait' | 'ai') => {
    startModalChoiceRef.current = choice;
    setShowStartModal(false);
  };

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-2xl rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-8">
            <div className="mb-6 text-center">
              <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">
                Start Ranked Match
              </div>
              <h2 className="mt-2 text-2xl font-semibold">Choose how you want to play</h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <button
                onClick={() => handleStartChoice('wait')}
                className="group rounded-[14px] border border-[rgba(255,95,143,0.2)] bg-[rgba(255,95,143,0.05)] p-6 text-left transition-all hover:border-[rgba(255,95,143,0.4)] hover:bg-[rgba(255,95,143,0.1)]"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[10px] bg-[rgba(255,95,143,0.12)] text-2xl">
                  ⏳
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#ff5f8f]">
                  Wait for Players
                </div>
                <p className="mt-2 text-sm text-[rgba(255,255,255,0.4)]">
                  Match with real players for competitive ranked
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#ff5f8f]">
                  Start matchmaking
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </button>
              
              <button
                onClick={() => handleStartChoice('ai')}
                className="group rounded-[14px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.05)] p-6 text-left transition-all hover:border-[rgba(0,229,229,0.4)] hover:bg-[rgba(0,229,229,0.1)]"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[10px] bg-[rgba(0,229,229,0.12)] text-2xl">
                  🤖
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#00e5e5]">
                  Compete Against AI
                </div>
                <p className="mt-2 text-sm text-[rgba(255,255,255,0.4)]">
                  Start immediately with AI opponents
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#00e5e5]">
                  Start now
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-[rgba(255,255,255,0.05)]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-5">
          <Link href="/ranked" className="text-base font-semibold tracking-wide">
            Matchmaking
          </Link>
          <Link 
            href="/ranked"
            className="rounded-[10px] border border-[rgba(255,255,255,0.05)] px-4 py-2 text-xs font-medium uppercase tracking-[0.04em] text-[rgba(255,255,255,0.4)] transition-all hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
          >
            ← Cancel
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-8 py-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-4xl">
          {countdown === null ? (
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
                    <span className="text-2xl">{writingConcepts[currentTipIndex].icon}</span>
                    <span className="text-lg font-semibold">{writingConcepts[currentTipIndex].name}</span>
                  </div>
                  
                  <p className="mb-4 text-center text-sm text-[rgba(255,255,255,0.6)]">
                    {writingConcepts[currentTipIndex].tip}
                  </p>
                  
                  <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
                    <div className="mb-1 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#00e5e5]">
                      Example
                    </div>
                    <p className="text-center text-sm italic text-[rgba(255,255,255,0.6)]">
                      {writingConcepts[currentTipIndex].example}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-center gap-1">
                    {writingConcepts.map((_, index) => (
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
                {[...Array(5)].map((_, index) => {
                  const player = displayPlayers[index];
                  return (
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
                  );
                })}
              </div>

              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-3 rounded-[20px] bg-[rgba(255,255,255,0.025)] px-4 py-2">
                  <span className="text-xs text-[rgba(255,255,255,0.4)]">Party:</span>
                  <span className="font-mono text-sm text-[#00e5e5]">{displayPlayers.length}/5</span>
                </div>
                
                {displayPlayers.length < 5 && !hasFilledWithAI && startModalChoiceRef.current === 'wait' && (
                  <div>
                    <button
                      onClick={() => fillLobbyWithAI()}
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
          ) : (
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
                  {finalPlayersRef.current.map((player, index) => (
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
                  {finalPlayersRef.current.filter(p => !p.isAI).length} Real • {finalPlayersRef.current.filter(p => p.isAI).length} AI
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
