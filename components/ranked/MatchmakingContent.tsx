'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { joinQueue, leaveQueue, listenToQueue, QueueEntry } from '@/lib/services/matchmaking-queue';
import { getRandomAIStudents } from '@/lib/services/ai-students';
import { useCreateSession } from '@/lib/hooks/useSession';
import { normalizePlayerAvatar, getPlayerDisplayName, getPlayerRank } from '@/lib/utils/player-utils';
import { useMatchmakingCountdown } from '@/lib/hooks/useMatchmakingCountdown';
import { useMatchmakingSession } from '@/lib/hooks/useMatchmakingSession';
import { useInterval } from '@/lib/hooks/useInterval';
import MatchmakingStartModal from './MatchmakingStartModal';
import MatchmakingLobby from './MatchmakingLobby';
import { MatchmakingHeader } from './matchmaking/MatchmakingHeader';
import { ConditionalRender } from '@/components/shared/ConditionalRender';

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
  const aiBackfillIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasJoinedQueueRef = useRef(false);
  const finalPlayersRef = useRef<any[]>([]);
  const [selectedAIStudents, setSelectedAIStudents] = useState<any[]>([]);
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

  useInterval(() => {
    setSearchingDots(prev => prev.length >= 3 ? '' : prev + '.');
  }, 500, []);

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
          
          // Note: partyLockedRef is managed by useMatchmakingCountdown hook
          if (!currentSessionId) {
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

  const handleCountdownStart = useCallback(() => {
    finalPlayersRef.current = [...players];
    
    if (aiBackfillIntervalRef.current) {
      clearInterval(aiBackfillIntervalRef.current);
    }
    
    if (user) {
      leaveQueue(userId).catch(() => {});
    }
  }, [players, userId, user]);

  const { handleSessionStart } = useMatchmakingSession({
    userId,
    userName,
    userRank,
    userProfile,
    trait,
    currentSessionId,
    players,
    queueSnapshot,
    startSession,
  });

  const handleCountdownComplete = useCallback(async () => {
    const finalPlayers = finalPlayersRef.current.length > 0 ? finalPlayersRef.current : players;
    await handleSessionStart(finalPlayers);
  }, [handleSessionStart, players]);

  const { countdown } = useMatchmakingCountdown({
    playersCount: players.length,
    maxPlayers: 5,
    onCountdownStart: handleCountdownStart,
    onCountdownComplete: handleCountdownComplete,
  });

  const handleStartChoice = async (choice: 'wait' | 'ai') => {
    startModalChoiceRef.current = choice;
    setShowStartModal(false);
  };

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <ConditionalRender condition={showStartModal}>
        <MatchmakingStartModal onChoice={handleStartChoice} />
      </ConditionalRender>

      <MatchmakingHeader />

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
