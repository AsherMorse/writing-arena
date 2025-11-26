'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useMemo } from 'react';
import WritingTipsModal from '@/components/shared/WritingTipsModal';
import PhaseInstructions from '@/components/shared/PhaseInstructions';
import FeedbackValidator from '@/components/shared/FeedbackValidator';
import FeedbackRubric from '@/components/shared/FeedbackRubric';
import FeedbackExamples from '@/components/shared/FeedbackExamples';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/lib/hooks/useSession';
import { useSessionData } from '@/lib/hooks/useSessionData';
import { usePhaseTransition } from '@/lib/hooks/usePhaseTransition';
import { useAutoSubmit } from '@/lib/hooks/useAutoSubmit';
import { getAssignedPeer } from '@/lib/services/match-sync';
import { formatTime, getTimeColor, getTimeProgressColor } from '@/lib/utils/time-utils';
import { SCORING, getDefaultScore, TIMING } from '@/lib/constants/scoring';
import { getPhaseTimeColor } from '@/lib/utils/phase-colors';
import { usePastePrevention } from '@/lib/hooks/usePastePrevention';
import { retryWithBackoff } from '@/lib/utils/retry';
import { isFormComplete } from '@/lib/utils/validation';
import { LoadingState } from '@/components/shared/LoadingState';
import { Modal } from '@/components/shared/Modal';
import { useCarousel } from '@/lib/hooks/useCarousel';
import { MOCK_PEER_WRITINGS } from '@/lib/utils/mock-data';
import { useBatchRankingSubmission } from '@/lib/hooks/useBatchRankingSubmission';
import { validateFeedbackSubmission } from '@/lib/utils/submission-validation';

export default function PeerFeedbackContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = (params?.sessionId || searchParams?.get('sessionId')) as string;
  const { user, userProfile } = useAuth();
  
  const {
    session,
    isReconnecting,
    error,
    timeRemaining,
    submitPhase,
    hasSubmitted,
  } = useSession(sessionId);

  const {
    matchId,
    config: sessionConfig,
    players: sessionPlayers,
    coordination: sessionCoordination,
    sessionId: activeSessionId,
  } = useSessionData(session);

  const [currentPeer, setCurrentPeer] = useState<any>(null);
  const [loadingPeer, setLoadingPeer] = useState(true);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiFeedbackGenerated, setAiFeedbackGenerated] = useState(false);
  
  const writingTips = useMemo(() => [
    { name: 'Sentence Expansion', tip: 'Use because, but, or so to show why things happen.', example: 'She opened the door because she heard a strange noise.', icon: '🔗' },
    { name: 'Appositives', tip: 'Add description using commas to provide extra information.', example: 'Sarah, a curious ten-year-old, pushed open the rusty gate.', icon: '✏️' },
    { name: 'Five Senses', tip: 'Include what you see, hear, smell, taste, and feel.', example: 'The salty air stung my eyes while waves crashed loudly below.', icon: '👁️' },
    { name: 'Show, Don\'t Tell', tip: 'Use specific details instead of general statements.', example: 'Her hands trembled as she reached for the handle.', icon: '🎭' },
    { name: 'Transition Words', tip: 'Use signal words to connect ideas smoothly.', example: 'First, Then, However, Therefore, For example', icon: '➡️' },
    { name: 'Strong Conclusions', tip: 'End with a final thought that ties everything together.', example: 'For these reasons, it is clear that...', icon: '🎯' },
  ], []);
  
  const [responses, setResponses] = useState({ mainIdea: '', strength: '', suggestion: '' });
  const [showRubric, setShowRubric] = useState(true);
  const [showExamples, setShowExamples] = useState(true);

  useEffect(() => {
    const generateAIFeedback = async () => {
      if (!matchId || !user || aiFeedbackGenerated) return;
      setAiFeedbackGenerated(true);
      
      try {
        const { getDoc, doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/config/firebase');
        
        const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
        if (!matchDoc.exists()) return;
        
        const matchState = matchDoc.data();
        const players = matchState.players || [];
        const aiPlayers = players.filter((p: any) => p.isAI);
        const writings = matchState.aiWritings?.phase1 || [];
        
        const aiFeedbackPromises = aiPlayers.map(async (aiPlayer: any, idx: number) => {
          const aiIndex = players.findIndex((p: any) => p.userId === aiPlayer.userId);
          const peerIndex = (aiIndex + 1) % players.length;
          const peer = players[peerIndex];
          
          let peerWriting = '';
          if (peer.isAI) {
            const aiWriting = writings.find((w: any) => w.playerId === peer.userId);
            peerWriting = aiWriting?.content || '';
          } else {
            const rankings = matchState.rankings?.phase1 || [];
            const peerRanking = rankings.find((r: any) => r.playerId === peer.userId);
            peerWriting = peerRanking?.content || '';
          }
          
          if (!peerWriting) return null;
          
          const response = await fetch('/api/generate-ai-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ peerWriting, rank: aiPlayer.rank, playerName: aiPlayer.displayName }),
          });
          
          const data = await response.json();
          return { playerId: aiPlayer.userId, playerName: aiPlayer.displayName, responses: data.responses, peerWriting, isAI: true, rank: aiPlayer.rank };
        });
        
        const aiFeedbacks = (await Promise.all(aiFeedbackPromises)).filter(f => f !== null);
        const matchRef = doc(db, 'matchStates', matchId);
        await updateDoc(matchRef, { 'aiFeedbacks.phase2': aiFeedbacks });
      } catch (error) {}
    };
    
    generateAIFeedback();
  }, [matchId, user, aiFeedbackGenerated]);

  useEffect(() => {
    let cancelled = false;
    const loadPeerWriting = async () => {
      if (!user || !matchId) { setLoadingPeer(false); return; }
      
      try {
        const assignedPeer = await retryWithBackoff(
          async () => await getAssignedPeer(matchId, user.uid),
          { maxAttempts: 5, delayMs: 1500, onRetry: () => {} }
        );
        
        if (assignedPeer && !cancelled) {
          setCurrentPeer({
            id: assignedPeer.userId,
            author: assignedPeer.displayName,
            avatar: '📝',
            rank: 'Silver III',
            content: assignedPeer.writing,
            wordCount: assignedPeer.wordCount,
          });
        } else if (!cancelled) {
          setCurrentPeer(MOCK_PEER_WRITINGS[0]);
        }
      } catch (error) {
        if (!cancelled) setCurrentPeer(MOCK_PEER_WRITINGS[0]);
      } finally {
        if (!cancelled) setLoadingPeer(false);
      }
    };
    
    loadPeerWriting();
    return () => { cancelled = true; };
  }, [user, user?.uid, matchId]);

  const { handlePaste, handleCut, handleCopy } = usePastePrevention({ showWarning: false });

  const { submit: handleBatchSubmit, isSubmitting: isBatchSubmitting } = useBatchRankingSubmission({
    phase: 2,
    matchId: matchId || '',
    userId: user?.uid || '',
    endpoint: '/api/batch-rank-feedback',
    firestoreKey: 'aiFeedbacks.phase2',
    rankingsKey: 'rankings.phase2',
    prepareUserSubmission: () => ({ playerId: user?.uid || '', playerName: 'You', responses, peerWriting: currentPeer?.content || '', isAI: false }),
    prepareSubmissionData: (score: number) => ({ responses, score }),
    submitPhase: async (phase, data) => { await submitPhase(phase, data); },
    validateSubmission: () => validateFeedbackSubmission(responses),
    onEmptySubmission: async (isEmpty) => { if (isEmpty) await submitPhase(2, { responses, score: 0 }); },
    fallbackEvaluation: async () => {
      const response = await fetch('/api/evaluate-peer-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, peerWriting: currentPeer?.content || '' }),
      });
      const data = await response.json();
      return data.score || getDefaultScore(2);
    },
  });
  
  const { currentIndex: currentTipIndex, goTo: goToTip } = useCarousel({
    items: writingTips,
    interval: 5000,
    autoPlay: showRankingModal || isEvaluating || isBatchSubmitting,
  });
      
  const handleSubmit = async () => {
    setIsEvaluating(true);
    setShowRankingModal(true);
    try {
      await handleBatchSubmit();
    } finally {
      setIsEvaluating(false);
      setTimeout(() => setShowRankingModal(false), 500);
    }
  };

  const componentMountedTimeRef = useRef<number | null>(null);
  useEffect(() => { if (componentMountedTimeRef.current === null) componentMountedTimeRef.current = Date.now(); }, []);

  useEffect(() => {
    const timeSinceMount = componentMountedTimeRef.current ? Date.now() - componentMountedTimeRef.current : Infinity;
    const minPhaseAge = TIMING.MIN_PHASE_AGE;
    
    if (timeRemaining === 0 && !hasSubmitted() && timeSinceMount >= minPhaseAge) {
      setShowRankingModal(true);
    } else if (!isBatchSubmitting && !isEvaluating) {
      setShowRankingModal(false);
    }
  }, [timeRemaining, hasSubmitted, isBatchSubmitting, isEvaluating, setShowRankingModal]);

  useAutoSubmit({ timeRemaining, hasSubmitted, onSubmit: handleSubmit, minPhaseAge: TIMING.MIN_PHASE_AGE });

  useEffect(() => { if (process.env.NODE_ENV === 'development') {} }, [timeRemaining]);

  if (isReconnecting || !session) {
    return <LoadingState message="Loading feedback phase..." variant={isReconnecting ? 'reconnecting' : 'default'} />;
  }

  const progressPercent = (timeRemaining / SCORING.PHASE2_DURATION) * 100;
  const timeColor = getPhaseTimeColor(2, timeRemaining);

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <Modal isOpen={showRankingModal || isEvaluating || isBatchSubmitting} onClose={() => {}} variant="ranking" showCloseButton={false}>
        <div className="text-center">
          <div className="mb-4 text-5xl animate-bounce">📊</div>
          <h2 className="text-xl font-semibold">{timeRemaining === 0 ? "Time's Up!" : "Calculating..."}</h2>
          <p className="mt-2 text-sm text-[rgba(255,255,255,0.4)]">
            {(isEvaluating || isBatchSubmitting) ? "Evaluating feedback quality..." : "Preparing results..."}
          </p>
          <p className="mt-2 text-xs text-[#ff5f8f]">⏱️ Usually takes 1-2 minutes</p>
          
          <div className="mt-6 rounded-[14px] border border-[rgba(255,95,143,0.2)] bg-[rgba(255,95,143,0.05)] p-4">
            <div className="mb-2 flex items-center justify-center gap-2">
              <span className="text-lg">{writingTips[currentTipIndex].icon}</span>
              <span className="font-medium">{writingTips[currentTipIndex].name}</span>
            </div>
            <p className="text-sm text-[rgba(255,255,255,0.6)]">{writingTips[currentTipIndex].tip}</p>
            <div className="mt-3 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3">
              <div className="mb-1 text-[10px] uppercase text-[#ff5f8f]">Example</div>
              <p className="text-xs italic text-[rgba(255,255,255,0.6)]">{writingTips[currentTipIndex].example}</p>
            </div>
            <div className="mt-3 flex justify-center gap-1">
              {writingTips.map((_, index) => (
                <button key={index} onClick={() => goToTip(index)} className={`h-1.5 rounded-full transition-all ${index === currentTipIndex ? 'w-6 bg-[#ff5f8f]' : 'w-1.5 bg-[rgba(255,255,255,0.1)]'}`} />
              ))}
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#ff5f8f]" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#ff5f8f]" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#ff5f8f]" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </Modal>

      <WritingTipsModal isOpen={showTipsModal} onClose={() => setShowTipsModal(false)} promptType="informational" />

      <button onClick={() => setShowTipsModal(true)} className="fixed bottom-8 right-8 z-40 group" title="Feedback Tips">
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#ff5f8f] bg-[rgba(255,95,143,0.1)] shadow-lg transition-all hover:scale-110 hover:bg-[rgba(255,95,143,0.2)]">
            <span className="text-2xl">🔍</span>
          </div>
          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff9030] text-[10px] animate-pulse">✨</div>
          <div className="absolute -bottom-10 right-0 rounded-[6px] bg-[rgba(255,255,255,0.025)] px-2 py-1 text-[10px] text-[rgba(255,255,255,0.4)] opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap border border-[rgba(255,255,255,0.05)]">Tips</div>
        </div>
      </button>

      <header className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.05)] bg-[#101012]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] font-mono text-xl font-medium" style={{ color: timeColor }}>
              {formatTime(timeRemaining)}
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">Phase 2 · Feedback</div>
              <div className="text-sm font-medium" style={{ color: timeColor }}>
                {timeRemaining > 0 ? 'Time remaining' : "Time's up!"}
              </div>
            </div>
            <span className="rounded-[20px] bg-[rgba(255,95,143,0.12)] px-2 py-1 text-[10px] font-medium uppercase text-[#ff5f8f]">
              Peer Review
            </span>
          </div>
          <div className="text-xs text-[rgba(255,255,255,0.4)]">⏱️ Auto-submits at 0:00</div>
        </div>
        <div className="mx-auto h-1 max-w-[1200px] rounded-full bg-[rgba(255,255,255,0.05)]">
          <div className="h-full rounded-full transition-all" style={{ width: `${progressPercent}%`, background: timeColor }} />
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-8 py-8">
        <PhaseInstructions 
          phase={2} 
          userRank={userProfile?.currentRank} 
          showRankGuidance={true} 
        />
        {showRubric && (
          <FeedbackRubric onClose={() => setShowRubric(false)} />
        )}
        {showExamples && (
          <FeedbackExamples onClose={() => setShowExamples(false)} />
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5">
            {loadingPeer || !currentPeer ? (
              <div className="py-16 text-center">
                <div className="mb-3 text-4xl animate-spin">📖</div>
                <div className="text-[rgba(255,255,255,0.4)]">Loading peer&apos;s writing...</div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-3xl">{currentPeer.avatar}</span>
                  <div>
                    <div className="font-semibold">{currentPeer.author}</div>
                    <div className="text-xs text-[rgba(255,255,255,0.4)]">{currentPeer.rank} · {currentPeer.wordCount} words</div>
                  </div>
                </div>
                
                <div className="rounded-[10px] bg-white p-5 max-h-[500px] overflow-y-auto">
                  <p className="text-[#101012] leading-relaxed whitespace-pre-wrap">{currentPeer.content}</p>
                </div>
              </>
            )}
          </div>

          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-5">
            <h3 className="mb-4 text-base font-semibold">Provide Feedback</h3>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">1. What is the main idea?</label>
                <p className="mb-2 text-xs text-[rgba(255,255,255,0.4)]">Identify the central point or message.</p>
                <textarea
                  value={responses.mainIdea}
                  onChange={(e) => setResponses({...responses, mainIdea: e.target.value})}
                  onPaste={handlePaste}
                  onCopy={handleCopy}
                  onCut={handleCut}
                  placeholder="The main idea is..."
                  className="h-24 w-full resize-none rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3 text-sm placeholder-[rgba(255,255,255,0.22)] focus:border-[#ff5f8f] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={timeRemaining === 0}
                  spellCheck="true"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">2. What is one strength?</label>
                <p className="mb-2 text-xs text-[rgba(255,255,255,0.4)]">Point out something specific done well. Quote the text!</p>
                <textarea
                  value={responses.strength}
                  onChange={(e) => setResponses({...responses, strength: e.target.value})}
                  onPaste={handlePaste}
                  onCopy={handleCopy}
                  onCut={handleCut}
                  placeholder='One strength is "..." because...'
                  className="h-24 w-full resize-none rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3 text-sm placeholder-[rgba(255,255,255,0.22)] focus:border-[#ff5f8f] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={timeRemaining === 0}
                  spellCheck="true"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">3. What is one suggestion?</label>
                <p className="mb-2 text-xs text-[rgba(255,255,255,0.4)]">Give one concrete improvement.</p>
                <textarea
                  value={responses.suggestion}
                  onChange={(e) => setResponses({...responses, suggestion: e.target.value})}
                  onPaste={handlePaste}
                  onCopy={handleCopy}
                  onCut={handleCut}
                  placeholder="Try adding... / Consider using..."
                  className="h-24 w-full resize-none rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3 text-sm placeholder-[rgba(255,255,255,0.22)] focus:border-[#ff5f8f] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={timeRemaining === 0}
                  spellCheck="true"
                />
              </div>
            </div>
            
            <FeedbackValidator responses={responses} />
          </div>
        </div>
      </main>
    </div>
  );
}
