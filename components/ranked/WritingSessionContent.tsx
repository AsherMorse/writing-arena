'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/lib/hooks/useSession';
import { useSessionData } from '@/lib/hooks/useSessionData';
import { useAutoSubmit } from '@/lib/hooks/useAutoSubmit';
import { getPromptById } from '@/lib/utils/prompts';
import WritingTipsModal from '@/components/shared/WritingTipsModal';
import WaitingForPlayers from '@/components/shared/WaitingForPlayers';
import PhaseInstructions from '@/components/shared/PhaseInstructions';
import TWRPlanningPhase, { PlanningData } from '@/components/shared/TWRPlanningPhase';
import TWRSentenceStarters from '@/components/shared/TWRSentenceStarters';
import { Modal } from '@/components/shared/Modal';
import { db } from '@/lib/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { SCORING, getDefaultScore, clampScore, TIMING } from '@/lib/constants/scoring';
import { countWords } from '@/lib/utils/text-utils';
import { useModals } from '@/lib/hooks/useModals';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useBatchRankingSubmission } from '@/lib/hooks/useBatchRankingSubmission';
import { validateWritingSubmission } from '@/lib/utils/submission-validation';
import { useComponentMountTime } from '@/lib/hooks/useComponentMountTime';
import { scheduleAISubmission } from '@/lib/utils/ai-submission-delay';
import WritingTimer from './WritingTimer';
import WritingEditor from './WritingEditor';
import WritingTipsCarousel from './WritingTipsCarousel';
import AIGenerationProgress from './AIGenerationProgress';

export default function WritingSessionContent() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const { user, userProfile } = useAuth();
  
  const {
    session,
    isReconnecting,
    error,
    timeRemaining,
    submitPhase,
    hasSubmitted,
    submissionCount,
  } = useSession(sessionId);
  
  const [writingContent, setWritingContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showPlanningPhase, setShowPlanningPhase] = useState(true);
  const [planningData, setPlanningData] = useState<PlanningData | null>(null);
  
  const { showTipsModal, setShowTipsModal, showRankingModal, setShowRankingModal } = useModals();
  
  const [aiWritingsGenerated, setAiWritingsGenerated] = useState(false);
  const [aiWordCounts, setAiWordCounts] = useState<number[]>([0, 0, 0, 0]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiGenerationProgress, setAiGenerationProgress] = useState(0);

  const {
    matchId: sessionMatchId,
    sessionId: activeSessionId,
    coordination: sessionCoordination,
    config: sessionConfig,
    players: sessionPlayers,
    allPlayers,
  } = useSessionData(session);
  
  const sessionCreatedAt = session?.createdAt;
  const prompt = sessionConfig ? getPromptById(sessionConfig.promptId) : null;
  const trait = sessionConfig?.trait || 'all';
  const players = useMemo(() => allPlayers, [allPlayers]);
  const { submitted, total } = submissionCount();
  const aiTargetCountsRef = useRef<number[]>([]);

  useEffect(() => {
    if (!session || aiWritingsGenerated || !user || !prompt) return;
    
    const generateAIWritings = async () => {
      try {
        const matchRef = doc(db, 'matchStates', sessionMatchId || sessionId);
        const matchDoc = await getDoc(matchRef);
        
        if (matchDoc.exists()) {
          const matchState = matchDoc.data();
          const existingWritings = matchState?.aiWritings?.phase1;
          
          if (existingWritings && existingWritings.length > 0) {
            aiTargetCountsRef.current = existingWritings.map((w: any) => w.wordCount);
            setAiWritingsGenerated(true);
            return;
          }
        } else {
          const { setDoc } = await import('firebase/firestore');
          await setDoc(matchRef, {
            matchId: sessionMatchId || sessionId,
            sessionId: activeSessionId || sessionId,
            players: Object.values(sessionPlayers || {}).map(p => ({
              userId: p.userId,
              displayName: p.displayName,
              avatar: p.avatar,
              rank: p.rank,
              isAI: p.isAI,
            })),
            phase: 1,
            createdAt: sessionCreatedAt,
          });
        }
        
        const aiPlayers = players.filter(p => p.isAI);
        setGeneratingAI(true);
        setAiWritingsGenerated(true);
        
        const aiWritingPromises = aiPlayers.map(async (aiPlayer, index) => {
          const response = await fetch('/api/generate-ai-writing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: prompt.description,
              promptType: prompt.type,
              rank: aiPlayer.rank,
              playerName: aiPlayer.displayName,
            }),
          });
          
          const data = await response.json();
          setAiGenerationProgress(((index + 1) / aiPlayers.length) * 100);
          
          return {
            playerId: aiPlayer.userId,
            playerName: aiPlayer.displayName,
            content: data.content,
            wordCount: data.wordCount,
            isAI: true,
            rank: aiPlayer.rank,
          };
        });
        
        const aiWritings = await Promise.all(aiWritingPromises);
        aiTargetCountsRef.current = aiWritings.map(w => w.wordCount);
        setGeneratingAI(false);
        setAiGenerationProgress(100);
        
        try {
          const { setDoc, doc } = await import('firebase/firestore');
          const matchRef = doc(db, 'matchStates', sessionMatchId || sessionId);
          const matchDoc = await getDoc(matchRef);
          
          if (matchDoc.exists()) {
            const currentData = matchDoc.data();
            const currentPhase1 = currentData.aiWritings?.phase1 || [];
            const mergedWritings = [...currentPhase1];
            
            for (const newWriting of aiWritings) {
              if (!mergedWritings.some((w: any) => w.playerId === newWriting.playerId)) {
                mergedWritings.push(newWriting);
              }
            }
            
            await setDoc(matchRef, { aiWritings: { phase1: mergedWritings } }, { merge: true });
          } else {
            await setDoc(matchRef, { matchId: sessionMatchId || sessionId, aiWritings: { phase1: aiWritings } }, { merge: true });
          }
        } catch (saveError) {
          console.error('❌ WRITING SESSION - Failed to save AI writings to Firestore:', saveError);
        }
        
        aiPlayers.forEach((aiPlayer) => {
          scheduleAISubmission(
            aiPlayer,
            async () => {
              const aiWriting = aiWritings.find(w => w.playerId === aiPlayer.userId);
              if (!aiWriting) return;
              
              const { updateDoc, doc, serverTimestamp } = await import('firebase/firestore');
              const sessionRef = doc(db, 'sessions', activeSessionId || sessionId);
              
              await updateDoc(sessionRef, {
                [`players.${aiPlayer.userId}.phases.phase1`]: {
                  submitted: true,
                  submittedAt: serverTimestamp(),
                  content: aiWriting.content,
                  wordCount: aiWriting.wordCount,
                  score: clampScore(60 + Math.random() * 30),
                },
                updatedAt: serverTimestamp(),
              });
            },
            5000,
            15000
          );
        });
        
      } catch (error) {
        aiTargetCountsRef.current = [40, 55, 48, 62];
        setAiWritingsGenerated(true);
      }
    };
    
    generateAIWritings();
  }, [session, aiWritingsGenerated, user, prompt]);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      setAiWordCounts(prevCounts => {
        const aiPlayers = players.filter(p => p.isAI);
        if (prevCounts.length !== aiPlayers.length) return new Array(aiPlayers.length).fill(0);
        return prevCounts.map((currentCount, index) => {
          const target = aiTargetCountsRef.current[index] || 100;
          if (currentCount >= target) return target;
          const increment = 0.5 + Math.random();
          return Math.min(target, currentCount + increment);
        });
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [session, players]);
      
  const debouncedContent = useDebounce(writingContent, 300);
  useEffect(() => {
    setWordCount(countWords(debouncedContent));
  }, [debouncedContent]);

  const { submit: handleBatchSubmit, isSubmitting: isBatchSubmitting } = useBatchRankingSubmission({
    phase: 1,
    matchId: sessionMatchId || sessionId,
    sessionId: activeSessionId || sessionId,
    userId: user?.uid || '',
    endpoint: '/api/batch-rank-writings',
    firestoreKey: 'aiWritings.phase1',
    rankingsKey: 'rankings.phase1',
    prepareUserSubmission: () => ({
      playerId: user?.uid || '',
      playerName: userProfile?.displayName || 'You',
      content: writingContent,
      wordCount: wordCount,
      isAI: false,
      rank: userProfile?.currentRank || 'Silver III',
    }),
    prepareSubmissionData: (score: number) => ({
      content: writingContent,
      wordCount: wordCount,
      score: score,
    }),
    submitPhase: async (phase, data) => {
      await submitPhase(phase, data);
    },
    validateSubmission: () => validateWritingSubmission(writingContent, wordCount),
    onEmptySubmission: async (isEmpty) => {
      if (isEmpty) {
        await submitPhase(1, { content: '', wordCount: 0, score: 0 });
      }
    },
    fallbackEvaluation: async () => {
      const response = await fetch('/api/analyze-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: writingContent, trait: trait, promptType: prompt?.type }),
      });
      const data = await response.json();
      return data.overallScore ?? getDefaultScore(1);
    },
  });

  const handleSubmit = useCallback(async () => {
    if (hasSubmitted() || !user || !userProfile || !session || !prompt || !sessionId) return;
    await handleBatchSubmit();
  }, [hasSubmitted, user, userProfile, session, prompt, sessionId, handleBatchSubmit]);


  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleForceSubmit = () => { void handleSubmit(); };
    window.addEventListener('debug-force-submit', handleForceSubmit);
    return () => { window.removeEventListener('debug-force-submit', handleForceSubmit); };
  }, [handleSubmit]);

  useAutoSubmit({
    timeRemaining,
    hasSubmitted,
    onSubmit: handleSubmit,
    minPhaseAge: 5000,
    isSessionReady: () => !!(session && sessionId && user?.uid),
  });

  const { getTimeSinceMount } = useComponentMountTime();

  useEffect(() => {
    const timeSinceMount = getTimeSinceMount();
    const minPhaseAge = TIMING.MIN_PHASE_AGE;
    
    if (isBatchSubmitting) {
      setShowRankingModal(true);
    } else if (timeRemaining === 0 && !hasSubmitted() && timeSinceMount >= minPhaseAge) {
      setShowRankingModal(true);
    } else if (hasSubmitted() && !isBatchSubmitting) {
      const timer = setTimeout(() => setShowRankingModal(false), 500);
      return () => clearTimeout(timer);
    } else {
      setShowRankingModal(false);
    }
  }, [timeRemaining, isBatchSubmitting, hasSubmitted, setShowRankingModal, getTimeSinceMount]);

  if (isReconnecting || !session || !prompt) {
    return <LoadingState message={isReconnecting ? 'Reconnecting to session...' : 'Loading session...'} variant={isReconnecting ? 'reconnecting' : 'default'} />;
  }
  
  if (error) {
    return <ErrorState error={error} title="Session Error" />;
  }
  
  const membersWithCounts = players.map((player, index) => {
    const isYou = player.userId === user?.uid;
    const aiIndex = players.filter((p, i) => i < index && p.isAI).length;
    return {
      name: player.displayName,
      avatar: player.avatar,
      rank: player.rank,
      userId: player.userId,
      isYou,
      isAI: player.isAI,
      wordCount: isYou ? wordCount : (player.isAI ? aiWordCounts[aiIndex] || 0 : 0),
    };
  });

  if (hasSubmitted()) {
    const partyMembers = players.map(p => ({
      name: p.displayName,
      userId: p.userId,
      avatar: p.avatar,
      rank: p.rank,
      isAI: p.isAI,
      isYou: p.userId === user?.uid,
    }));
    const submittedPlayerIds = players.filter(p => p.phases.phase1?.submitted).map(p => p.userId);
    return (
      <WaitingForPlayers 
        phase={1}
        playersReady={submitted}
        totalPlayers={total}
        timeRemaining={timeRemaining}
        partyMembers={partyMembers}
        submittedPlayerIds={submittedPlayerIds}
      />
    );
  }
 

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <Modal isOpen={showRankingModal} onClose={() => {}} variant="ranking" showCloseButton={false}>
        <div className="text-center">
          <div className="mb-4 text-5xl animate-bounce">📊</div>
          <h2 className="text-xl font-semibold">{timeRemaining === 0 ? "Time's Up!" : "Calculating..."}</h2>
          <p className="mt-2 text-sm text-[rgba(255,255,255,0.4)]">
            {isBatchSubmitting ? "Evaluating writing quality..." : "Preparing results..."}
          </p>
          <p className="mt-2 text-xs text-[#00e5e5]">⏱️ Usually takes 1-2 minutes</p>
          
          <div className="mt-6">
            <WritingTipsCarousel autoPlay={showRankingModal} />
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#00e5e5]" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#00e5e5]" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#00e5e5]" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </Modal>
      
      <WritingTipsModal isOpen={showTipsModal} onClose={() => setShowTipsModal(false)} promptType={prompt.type} />

      <header className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.05)] bg-[#101012]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4">
          <WritingTimer timeRemaining={timeRemaining} phase={1} />
          <div className="flex items-center gap-3">
            <div className="rounded-[20px] bg-[rgba(255,255,255,0.025)] px-3 py-1.5">
              <span className="font-mono text-sm text-[#00e5e5]">{wordCount}</span>
              <span className="ml-1 text-xs text-[rgba(255,255,255,0.4)]">words</span>
            </div>
            <button
              onClick={() => setShowTipsModal(true)}
              className="rounded-[10px] border border-[rgba(255,255,255,0.05)] px-4 py-2 text-xs font-medium uppercase tracking-[0.04em] text-[rgba(255,255,255,0.4)] transition-all hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
            >
              Tips
            </button>
          </div>
        </div>
      </header>

      {showPlanningPhase && prompt && (
        <TWRPlanningPhase
          prompt={{
            title: prompt.title,
            description: prompt.description,
            type: prompt.type || 'narrative',
          }}
          userRank={userProfile?.currentRank}
          onComplete={(plan) => {
            setPlanningData(plan);
            setShowPlanningPhase(false);
          }}
          onSkip={() => setShowPlanningPhase(false)}
        />
      )}

      <main className="mx-auto max-w-[1200px] px-8 py-8">
        {planningData && (
          <div className="mb-4 rounded-[10px] border border-[#00e5e530] bg-[#00e5e508] p-3 text-xs text-[rgba(255,255,255,0.6)]">
            <strong className="text-[#00e5e5]">📋 Your Plan:</strong>{' '}
            {planningData.mainIdea && <span>{planningData.mainIdea}</span>}
            {planningData.becauseButSo && <span className="ml-2">• {planningData.becauseButSo.substring(0, 50)}...</span>}
          </div>
        )}
        <AIGenerationProgress progress={aiGenerationProgress} isGenerating={generatingAI} />
        
        <PhaseInstructions 
          phase={1} 
          userRank={userProfile?.currentRank} 
          showRankGuidance={true} 
        />
        <TWRSentenceStarters 
          userRank={userProfile?.currentRank} 
          promptType={prompt?.type}
        />
        
        <div className="grid gap-6 lg:grid-cols-[280px,1fr,240px]">
          <div className="space-y-4">
            <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5">
              <div className="flex gap-4">
                <div className="text-4xl">{prompt.image}</div>
                <div>
                  <div className="text-[10px] uppercase text-[rgba(255,255,255,0.22)]">{prompt.type}</div>
                  <h2 className="mt-1 text-base font-semibold">{prompt.title}</h2>
                </div>
              </div>
              <p className="mt-3 text-sm text-[rgba(255,255,255,0.5)] leading-relaxed">{prompt.description}</p>
            </div>

            <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">Tips</div>
              <div className="space-y-2 text-xs text-[rgba(255,255,255,0.4)]">
                <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-2">Aim for 60+ words in 2 min</div>
                <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-2">Start with your main idea</div>
                <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-2">Save 20s for proofreading</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-white p-6 text-[#101012]">
              <div className="flex items-center justify-between text-xs text-[#101012]/50">
                <span>Draft</span>
                <span>{wordCount} words</span>
              </div>
              <WritingEditor
                content={writingContent}
                onChange={setWritingContent}
                placeholder="Start writing..."
                autoFocus
              />
            </div>
            
            <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-4 text-center">
              <div className="text-sm text-[rgba(255,255,255,0.4)]">
                ⏱️ Auto-submits in <span className="font-mono text-[#00e5e5]">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="mt-1 text-xs text-[rgba(255,255,255,0.22)]">Write until the timer expires</div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5">
              <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">Squad</div>
              <div className="space-y-3">
                {membersWithCounts.map((member, index) => (
                  <div key={member.userId} className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-xl">{member.avatar}</div>
                        <div>
                          <div className="text-xs font-medium">{member.name}</div>
                          <div className="text-[10px] text-[rgba(255,255,255,0.4)]">{member.rank}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm" style={{ color: member.isYou ? '#00e5e5' : 'rgba(255,255,255,0.6)' }}>
                          {Math.floor(member.wordCount)}
                        </div>
                        <div className="text-[10px] text-[rgba(255,255,255,0.22)]">words</div>
                      </div>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min((member.wordCount / 100) * 100, 100)}%`, background: member.isYou ? '#00e5e5' : 'rgba(255,255,255,0.2)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
