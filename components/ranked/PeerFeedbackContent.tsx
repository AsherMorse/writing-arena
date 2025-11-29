'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
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
import { getTimeColor, getTimeProgressColor } from '@/lib/utils/time-utils';
import { SCORING, getDefaultScore, TIMING } from '@/lib/constants/scoring';
import { getPhaseTimeColor } from '@/lib/utils/phase-colors';
import { usePastePrevention } from '@/lib/hooks/usePastePrevention';
import { retryWithBackoff } from '@/lib/utils/retry';
import { isFormComplete } from '@/lib/utils/validation';
import { useModals } from '@/lib/hooks/useModals';
import { useAsyncData } from '@/lib/hooks/useAsyncData';
import { LoadingState } from '@/components/shared/LoadingState';
import { Modal } from '@/components/shared/Modal';
import { MOCK_PEER_WRITINGS } from '@/lib/utils/mock-data';
import { useBatchRankingSubmission } from '@/lib/hooks/useBatchRankingSubmission';
import { validateFeedbackSubmission } from '@/lib/utils/submission-validation';
import { PeerFeedbackRankingModal } from './peer-feedback/PeerFeedbackRankingModal';
import { PeerFeedbackHeader } from './peer-feedback/PeerFeedbackHeader';
import { PeerWritingCard } from './peer-feedback/PeerWritingCard';
import { FeedbackFormCard } from './peer-feedback/FeedbackFormCard';
import { isEmpty } from '@/lib/utils/array-utils';
import { safeStringifyJSON, parseJSONResponse } from '@/lib/utils/json-utils';
import { useComponentMountTime } from '@/lib/hooks/useComponentMountTime';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { useTimeWarnings } from '@/lib/hooks/useTimeWarnings';
import { getSessionStorage } from '@/lib/utils/session-storage';
import { TimeWarningNotification } from '@/components/shared/TimeWarningNotification';

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

  const [aiFeedbackGenerated, setAiFeedbackGenerated] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showRubric, setShowRubric] = useState(true);
  const [showExamples, setShowExamples] = useState(true);
  
  // Auto-save feedback responses
  const feedbackKey = sessionId ? `feedback-${sessionId}` : '';
  const [responses, setResponses] = useState(() => {
    if (!sessionId || typeof window === 'undefined') return { mainIdea: '', strength: '', suggestion: '' };
    const restored = getSessionStorage<{ mainIdea: string; strength: string; suggestion: string }>(`draft-${feedbackKey}`);
    return restored || { mainIdea: '', strength: '', suggestion: '' };
  });
  
  // Auto-save feedback responses
  useAutoSave({
    key: feedbackKey,
    content: JSON.stringify(responses),
    enabled: !!sessionId && !hasSubmitted,
  });
  
  // Time warnings
  const timeWarning = useTimeWarnings({
    timeRemaining,
    thresholds: { info: 60, warning: 30, urgent: 15 },
  });
  
  const { showTipsModal, setShowTipsModal, showRankingModal, setShowRankingModal } = useModals();

  // Use useAsyncData for loading peer writing
  const { data: currentPeer, loading: loadingPeer } = useAsyncData(
    async () => {
      if (!user || !matchId) return MOCK_PEER_WRITINGS[0];
      
      const assignedPeer = await retryWithBackoff(
        async () => await getAssignedPeer(matchId, user.uid),
        { maxAttempts: 5, delayMs: 1500, onRetry: () => {} }
      );
      
      if (assignedPeer) {
        // Get peer's Phase 1 score from session data
        const peerPhase1Score = sessionPlayers?.[assignedPeer.userId]?.phases?.phase1?.score;
        const peerRank = sessionPlayers?.[assignedPeer.userId]?.rank || 'Silver III';
        
        return {
          id: assignedPeer.userId,
          author: assignedPeer.displayName,
          avatar: '📝',
          rank: peerRank,
          content: assignedPeer.writing,
          wordCount: assignedPeer.wordCount,
          phase1Score: peerPhase1Score,
        };
      }
      
      return MOCK_PEER_WRITINGS[0];
    },
    [user?.uid, matchId, sessionPlayers],
    { immediate: true }
  );

  useEffect(() => {
    const generateAIFeedback = async () => {
      if (!matchId || !user || aiFeedbackGenerated) return;
      setAiFeedbackGenerated(true);
      
      try {
        const { getMatchState, updateMatchStateArray } = await import('@/lib/utils/firestore-match-state');
        const matchState = await getMatchState(matchId);
        if (!matchState) return;
        
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
            body: safeStringifyJSON({ peerWriting, rank: aiPlayer.rank, playerName: aiPlayer.displayName }) || '',
          });
          
          const data = await parseJSONResponse<{ responses: any[] }>(response);
          return { playerId: aiPlayer.userId, playerName: aiPlayer.displayName, responses: data.responses, peerWriting, isAI: true, rank: aiPlayer.rank };
        });
        
        const aiFeedbacks = (await Promise.all(aiFeedbackPromises)).filter(f => f !== null);
        await updateMatchStateArray(matchId, 'aiFeedbacks.phase2', aiFeedbacks);
      } catch (error) {
        console.error('❌ PEER FEEDBACK - Failed to generate AI feedback:', error);
      }
    };
    
    generateAIFeedback();
  }, [matchId, user, aiFeedbackGenerated]);

  const { handlePaste, handleCut, handleCopy } = usePastePrevention({ showWarning: false });

  const { submit: handleBatchSubmit, isSubmitting: isBatchSubmitting } = useBatchRankingSubmission({
    phase: 2,
    matchId: matchId || '',
    sessionId: activeSessionId || sessionId,
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
        body: safeStringifyJSON({ responses, peerWriting: currentPeer?.content || '' }) || '',
      });
      const data = await parseJSONResponse<{ score: number }>(response);
      return data.score || getDefaultScore(2);
    },
  });
  
      
  const handleSubmit = async () => {
    setIsEvaluating(true);
    setShowRankingModal(true);
    try {
      await handleBatchSubmit();
    } finally {
      setIsEvaluating(false);
      setTimeout(() => setShowRankingModal(false), TIMING.MODAL_CLOSE_DELAY);
    }
  };

  const { getTimeSinceMount } = useComponentMountTime();

  useEffect(() => {
    const timeSinceMount = getTimeSinceMount();
    const minPhaseAge = TIMING.MIN_PHASE_AGE;
    
    if (timeRemaining === 0 && !hasSubmitted() && timeSinceMount >= minPhaseAge) {
      setShowRankingModal(true);
    } else if (!isBatchSubmitting && !isEvaluating) {
      setShowRankingModal(false);
    }
  }, [timeRemaining, hasSubmitted, isBatchSubmitting, isEvaluating, setShowRankingModal, getTimeSinceMount]);

  useAutoSubmit({ timeRemaining, hasSubmitted, onSubmit: handleSubmit, minPhaseAge: TIMING.MIN_PHASE_AGE });

  useEffect(() => { if (process.env.NODE_ENV === 'development') {} }, [timeRemaining]);

  if (isReconnecting || !session) {
    return <LoadingState message="Loading feedback phase..." variant={isReconnecting ? 'reconnecting' : 'default'} />;
  }

  const progressPercent = (timeRemaining / SCORING.PHASE2_DURATION) * 100;
  const timeColor = getPhaseTimeColor(2, timeRemaining);

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <TimeWarningNotification warning={timeWarning} />
      <PeerFeedbackRankingModal
        isOpen={showRankingModal || isEvaluating || isBatchSubmitting}
        timeRemaining={timeRemaining}
        isEvaluating={isEvaluating}
        isBatchSubmitting={isBatchSubmitting}
      />

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

      <PeerFeedbackHeader
        timeRemaining={timeRemaining}
        timeColor={timeColor}
        progressPercent={progressPercent}
      />

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
          <PeerWritingCard peer={currentPeer} loading={loadingPeer} />

          <FeedbackFormCard
            responses={responses}
            timeRemaining={timeRemaining}
            onChange={setResponses}
            onPaste={handlePaste}
            onCopy={handleCopy}
            onCut={handleCut}
          />
        </div>
      </main>
    </div>
  );
}
