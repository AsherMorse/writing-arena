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
import { getPromptById } from '@/lib/utils/prompts';
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
import { logger, LOG_CONTEXTS } from '@/lib/utils/logger';
import { useAIFeedbackGeneration } from '@/lib/hooks/useAIFeedbackGeneration';
import { TipsButton } from '@/components/shared/TipsButton';

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

  const prompt = sessionConfig ? getPromptById(sessionConfig.promptId) : null;
  
  const sessionPlayersRef = useRef(sessionPlayers);
  useEffect(() => {
    if (sessionPlayers && Object.keys(sessionPlayers).length > 0) {
      sessionPlayersRef.current = sessionPlayers;
    }
  }, [sessionPlayers]);

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

  // Use AI feedback generation hook
  useAIFeedbackGeneration({
    matchId,
    userId: user?.uid,
    enabled: !!matchId && !!user,
  });

  // Use useAsyncData for loading peer writing
  const { data: currentPeer, loading: loadingPeer } = useAsyncData(
    async () => {
      if (!user || !matchId) return MOCK_PEER_WRITINGS[0];
      
      const assignedPeer = await retryWithBackoff(
        async () => await getAssignedPeer(matchId, user.uid, sessionPlayersRef.current),
        { maxAttempts: 5, delayMs: 1500, onRetry: () => {} }
      );
      
      if (assignedPeer) {
        return {
          id: assignedPeer.userId,
          author: assignedPeer.displayName,
          avatar: '📝',
          rank: 'Silver III',
          content: assignedPeer.writing,
          wordCount: assignedPeer.wordCount,
        };
      }
      
      return MOCK_PEER_WRITINGS[0];
    },
    [user?.uid, matchId],
    { immediate: true }
  );

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
    emptyPenaltyScore: 0,
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

  // Debug force submit listener (development only)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const handleForceSubmit = () => { void handleSubmit(); };
    window.addEventListener('debug-force-submit', handleForceSubmit);
    return () => { window.removeEventListener('debug-force-submit', handleForceSubmit); };
  }, [handleSubmit]);

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

  usePhaseTransition({
    session,
    currentPhase: 2,
    hasSubmitted,
    sessionId: activeSessionId || sessionId,
    onTransition: () => {
      router.push(`/ranked/revision?sessionId=${activeSessionId || sessionId}`);
    },
  });

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

      <TipsButton onOpen={() => setShowTipsModal(true)} phase={2} />

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
          <PeerWritingCard peer={currentPeer} loading={loadingPeer} prompt={prompt} />

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
