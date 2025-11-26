'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { joinQueue, leaveQueue, listenToQueue, QueueEntry, createMatchLobby } from '@/lib/services/matchmaking-queue';
import { getRandomPromptForRank } from '@/lib/utils/prompts';
import { getRandomAIStudents } from '@/lib/services/ai-students';
import { useCreateSession } from '@/lib/hooks/useSession';
import { SCORING } from '@/lib/constants/scoring';
import { normalizePlayerAvatar, getPlayerDisplayName, getPlayerRank } from '@/lib/utils/player-utils';
import MatchmakingStartModal from './MatchmakingStartModal';
import MatchmakingLobby from './MatchmakingLobby';

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

  useEffect(() => {
    const interval = setInterval(() => {
      setSearchingDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

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
        <MatchmakingStartModal onChoice={handleStartChoice} />
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
          <MatchmakingLobby
            players={displayPlayers}
            finalPlayers={finalPlayersRef.current.length > 0 ? finalPlayersRef.current : displayPlayers}
            searchingDots={searchingDots}
            countdown={countdown}
            hasFilledWithAI={hasFilledWithAI}
            onFillWithAI={() => fillLobbyWithAI()}
            startChoice={startModalChoiceRef.current}
          />
        </div>
      </main>
    </div>
  );
}
