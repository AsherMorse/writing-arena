'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useNavigation } from '@/lib/hooks/useNavigation';
import { useState, useEffect, useRef, useMemo } from 'react';
import WritingTipsModal from '@/components/shared/WritingTipsModal';
import PhaseInstructions from '@/components/shared/PhaseInstructions';
import RevisionChecklist from '@/components/shared/RevisionChecklist';
import RevisionGuidance from '@/components/shared/RevisionGuidance';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/lib/hooks/useSession';
import { useSessionData } from '@/lib/hooks/useSessionData';
import { usePhaseTransition } from '@/lib/hooks/usePhaseTransition';
import { useAutoSubmit } from '@/lib/hooks/useAutoSubmit';
import { getPeerFeedbackResponses } from '@/lib/services/match-sync';
import { getTimeColor, getTimeProgressColor } from '@/lib/utils/time-utils';
import { SCORING, getDefaultScore, TIMING } from '@/lib/constants/scoring';
import { getPhaseTimeColor } from '@/lib/utils/phase-colors';
import { countWords } from '@/lib/utils/text-utils';
import { buildResultsURL } from '@/lib/utils/navigation';
import { usePastePrevention } from '@/lib/hooks/usePastePrevention';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Modal } from '@/components/shared/Modal';
import { setSessionStorage } from '@/lib/utils/session-storage';
import { MOCK_AI_FEEDBACK } from '@/lib/utils/mock-data';
import { useBatchRankingSubmission } from '@/lib/hooks/useBatchRankingSubmission';
import { validateRevisionSubmission } from '@/lib/utils/submission-validation';
import { useModals } from '@/lib/hooks/useModals';
import { safeStringifyJSON, parseJSONResponse } from '@/lib/utils/json-utils';
import { useComponentMountTime } from '@/lib/hooks/useComponentMountTime';
import { RevisionRankingModal } from './revision/RevisionRankingModal';
import { RevisionHeader } from './revision/RevisionHeader';
import { RevisionTitleBanner } from './revision/RevisionTitleBanner';
import { FeedbackSidebar } from './revision/FeedbackSidebar';
import { RevisionEditorSection } from './revision/RevisionEditorSection';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { useTimeWarnings } from '@/lib/hooks/useTimeWarnings';
import { getSessionStorage } from '@/lib/utils/session-storage';
import { TimeWarningNotification } from '@/components/shared/TimeWarningNotification';
import { logger, LOG_CONTEXTS } from '@/lib/utils/logger';

export default function RevisionContent() {
  const router = useRouter();
  const { navigateToResults, navigateToRankedResults, navigateToDashboard } = useNavigation();
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = (params?.sessionId || searchParams?.get('sessionId')) as string;
  const { user, userProfile } = useAuth();
  
  const { session, isReconnecting, error, timeRemaining, submitPhase, hasSubmitted } = useSession(sessionId);
  const { matchId, config: sessionConfig, players: sessionPlayers, state: sessionState, sessionId: activeSessionId } = useSessionData(session);
  
  const trait = sessionConfig?.trait || 'all';
  const promptId = sessionConfig?.promptId || '';
  const promptType = sessionConfig?.promptType || 'narrative';
  
  const originalContent = user && sessionPlayers ? (sessionPlayers[user.uid]?.phases.phase1?.content || '') : '';
  const yourScore = user && sessionPlayers ? (sessionPlayers[user.uid]?.phases.phase1?.score || getDefaultScore(1)) : getDefaultScore(1);
  const feedbackScore = user && sessionPlayers ? (sessionPlayers[user.uid]?.phases.phase2?.score || getDefaultScore(2)) : getDefaultScore(2);
  const wordCount = user && sessionPlayers ? (sessionPlayers[user.uid]?.phases.phase1?.wordCount || 0) : 0;
  const aiScores = '';
  
  // Auto-save revision content
  const revisionKey = sessionId ? `revision-${sessionId}` : '';
  const [revisedContent, setRevisedContent] = useState(() => {
    if (!sessionId || typeof window === 'undefined') return originalContent;
    const restored = getSessionStorage<string>(`draft-${revisionKey}`);
    return restored || originalContent;
  });
  useEffect(() => { 
    // Only update if no restored draft exists
    if (!sessionId || typeof window === 'undefined') {
      setRevisedContent(originalContent);
    }
  }, [originalContent, sessionId]);
  
  // Auto-save revision
  useAutoSave({
    key: revisionKey,
    content: revisedContent,
    enabled: !!sessionId && !hasSubmitted,
  });
  
  // Time warnings
  const timeWarning = useTimeWarnings({
    timeRemaining,
    thresholds: { info: 60, warning: 30, urgent: 15 },
  });
  
  const [wordCountRevised, setWordCountRevised] = useState(0);
  const [showFeedback, setShowFeedback] = useState(true);
  const { showTipsModal, setShowTipsModal, showRankingModal, setShowRankingModal } = useModals();
  const [showRevisionGuidance, setShowRevisionGuidance] = useState(true);
  const [aiFeedback, setAiFeedback] = useState(MOCK_AI_FEEDBACK);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [realPeerFeedback, setRealPeerFeedback] = useState<any>(null);
  const [loadingPeerFeedback, setLoadingPeerFeedback] = useState(true);
  const [aiRevisionsGenerated, setAiRevisionsGenerated] = useState(false);
  
  const peerFeedbackFetchedRef = useRef(false);
  useEffect(() => {
    if (peerFeedbackFetchedRef.current) return;
    const fetchPeerFeedback = async () => {
      if (!user || !matchId) { setLoadingPeerFeedback(false); return; }
      peerFeedbackFetchedRef.current = true;
      try {
        const peerFeedbackData = await getPeerFeedbackResponses(matchId, user.uid);
        if (peerFeedbackData) setRealPeerFeedback(peerFeedbackData);
      } catch (error) {
        logger.error(LOG_CONTEXTS.REVISION, 'Failed to fetch peer feedback', error);
      } finally { setLoadingPeerFeedback(false); }
    };
    fetchPeerFeedback();
  }, [user, matchId]);

  const feedbackGeneratedRef = useRef<string | null>(null);
  useEffect(() => {
    const contentKey = `${originalContent}-${promptType}`;
    if (!originalContent || !session || loadingFeedback === false || feedbackGeneratedRef.current === contentKey) return;
    
    const generateRealFeedback = async () => {
      feedbackGeneratedRef.current = contentKey;
      try {
        const response = await fetch('/api/generate-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: safeStringifyJSON({ content: originalContent, promptType }) || '',
        });
        const feedback = await parseJSONResponse<{ strengths?: string[]; improvements?: string[]; score?: number }>(response);
        setAiFeedback({ strengths: feedback.strengths || [], improvements: feedback.improvements || [], score: feedback.score || getDefaultScore(2) });
      } catch (error) {
        setAiFeedback(MOCK_AI_FEEDBACK);
      } finally {
        setLoadingFeedback(false);
      }
    };
    generateRealFeedback();
  }, [originalContent, promptType]);

  useEffect(() => {
    const generateAIRevisions = async () => {
      if (!matchId || !user || aiRevisionsGenerated) return;
      setAiRevisionsGenerated(true);
      try {
        const { getMatchState, updateMatchStateArray } = await import('@/lib/utils/firestore-match-state');
        const matchState = await getMatchState(matchId);
        if (!matchState) return;
        
        const players = matchState.players || [];
        const aiPlayers = players.filter((p: any) => p.isAI);
        const phase1Writings = matchState.aiWritings?.phase1 || [];
        const phase1Rankings = matchState.rankings?.phase1 || [];
        
        const aiRevisionPromises = aiPlayers.map(async (aiPlayer: any) => {
          const aiWriting = phase1Writings.find((w: any) => w.playerId === aiPlayer.userId);
          if (!aiWriting) return null;
          
          const aiRanking = phase1Rankings.find((r: any) => r.playerId === aiPlayer.userId);
          const feedbackData = { strengths: aiRanking?.strengths || ['Good attempt at addressing the prompt'], improvements: aiRanking?.improvements || ['Could add more detail'], score: aiRanking?.score || 70 };
          
          const revisionResponse = await fetch('/api/generate-ai-revision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: safeStringifyJSON({ originalContent: aiWriting.content, feedback: feedbackData, rank: aiPlayer.rank, playerName: aiPlayer.displayName }) || '',
          });
          
          const revisionData = await parseJSONResponse<{ content: string; wordCount: number }>(revisionResponse);
          return { playerId: aiPlayer.userId, playerName: aiPlayer.displayName, originalContent: aiWriting.content, revisedContent: revisionData.content, wordCount: revisionData.wordCount, isAI: true, rank: aiPlayer.rank };
        });
        
        const aiRevisions = (await Promise.all(aiRevisionPromises)).filter(r => r !== null);
        await updateMatchStateArray(matchId, 'aiRevisions.phase3', aiRevisions);
      } catch (error) {
        logger.error(LOG_CONTEXTS.REVISION, 'Failed to generate AI revisions', error);
      }
    };
    generateAIRevisions();
  }, [matchId, user, aiRevisionsGenerated]);

  useEffect(() => { setWordCountRevised(countWords(revisedContent)); }, [revisedContent]);

  const { submit: handleBatchSubmit, isSubmitting: isBatchSubmitting } = useBatchRankingSubmission({
    phase: 3,
    matchId: matchId || '',
    sessionId: activeSessionId || sessionId,
    userId: user?.uid || '',
    endpoint: '/api/batch-rank-revisions',
    firestoreKey: 'aiRevisions.phase3',
    rankingsKey: 'rankings.phase3',
    prepareUserSubmission: () => ({ playerId: user?.uid || '', playerName: 'You', originalContent, revisedContent, feedback: aiFeedback, wordCount: wordCountRevised, isAI: false }),
    prepareSubmissionData: (score: number) => ({ revisedContent, wordCount: wordCountRevised, score }),
    submitPhase: async (phase, data) => {
      await submitPhase(phase, data);
      const yourRanking = await getRankingFromStorage();
      const revisionScore = yourRanking?.score || data.score || getDefaultScore(3);
      setSessionStorage(`${matchId}-phase3-feedback`, yourRanking || data);
      navigateToResults({ matchId, trait, promptId, promptType, originalContent, revisedContent, wordCount, revisedWordCount: wordCountRevised, writingScore: yourScore, feedbackScore, revisionScore, aiScores });
    },
    validateSubmission: () => validateRevisionSubmission(originalContent, revisedContent, wordCountRevised),
    onEmptySubmission: async (isEmpty, unchanged) => {
      if (isEmpty || unchanged) {
        const score = isEmpty ? SCORING.MIN_SCORE : 40;
        await submitPhase(3, { revisedContent: revisedContent || originalContent, wordCount: wordCountRevised, score });
        router.push(buildResultsURL({ matchId, trait, promptId, promptType, originalContent, revisedContent, wordCount, revisedWordCount: wordCountRevised, writingScore: yourScore, feedbackScore, revisionScore: score, aiScores }));
      }
    },
    fallbackEvaluation: async () => {
      const response = await fetch('/api/evaluate-revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: safeStringifyJSON({ originalContent, revisedContent, feedback: aiFeedback }) || '',
      });
      const data = await parseJSONResponse<{ score: number }>(response);
      return data.score || getDefaultScore(3);
    },
  });
  

  const getRankingFromStorage = async () => {
    try {
      const { getMatchRankings } = await import('@/lib/utils/firestore-match-state');
      if (!matchId) return null;
      const rankings = await getMatchRankings(matchId, 3);
      return rankings.find((r: any) => r.playerId === user?.uid) || null;
    } catch (error) {
      logger.error(LOG_CONTEXTS.REVISION, 'Failed to get user ranking', error);
    }
    return null;
  };

  const handleSubmit = async () => {
    setIsEvaluating(true);
    setShowRankingModal(true);
    try { await handleBatchSubmit(); }
    finally {
      setIsEvaluating(false);
      setTimeout(() => setShowRankingModal(false), TIMING.MODAL_CLOSE_DELAY);
    }
  };

  // Debug force submit listener
  useEffect(() => {
    const handleForceSubmit = () => { void handleSubmit(); };
    window.addEventListener('debug-force-submit', handleForceSubmit);
    return () => { window.removeEventListener('debug-force-submit', handleForceSubmit); };
  }, [handleSubmit]);

  useAutoSubmit({ timeRemaining, hasSubmitted, onSubmit: handleSubmit, minPhaseAge: TIMING.MIN_PHASE_AGE });

  usePhaseTransition({
    session, currentPhase: 3, hasSubmitted, sessionId: activeSessionId || sessionId,
    onTransition: (nextPhase) => { if (session?.state === 'completed') navigateToRankedResults(activeSessionId || sessionId); },
  });

  useEffect(() => {
    if (!session || !hasSubmitted()) return;
    if (session.state === 'completed') navigateToRankedResults(activeSessionId || sessionId);
  }, [session, hasSubmitted, router, activeSessionId, sessionId]);

  const { handlePaste, handleCut, handleCopy } = usePastePrevention({ showWarning: false });

  const { getTimeSinceMount } = useComponentMountTime();

  useEffect(() => {
    const timeSinceMount = getTimeSinceMount();
    const minPhaseAge = TIMING.MIN_PHASE_AGE;
    if (timeRemaining === 0 && !hasSubmitted() && timeSinceMount >= minPhaseAge) setShowRankingModal(true);
    else if (!isEvaluating && !isBatchSubmitting) setShowRankingModal(false);
  }, [timeRemaining, hasSubmitted, isEvaluating, isBatchSubmitting, setShowRankingModal, getTimeSinceMount]);

  const hasRevised = revisedContent !== originalContent;
  const strengthsList = useMemo(() => aiFeedback.strengths || [], [aiFeedback.strengths]);
  const improvementsList = useMemo(() => aiFeedback.improvements || [], [aiFeedback.improvements]);

  if (isReconnecting || !session) return <LoadingState message="Loading revision phase..." />;
  if (error) return <ErrorState error={error} title="Session Error" retryLabel="Return to Dashboard" onRetry={navigateToDashboard} />;

  const progressPercent = (timeRemaining / SCORING.PHASE3_DURATION) * 100;
  const timeColor = getPhaseTimeColor(3, timeRemaining);

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <TimeWarningNotification warning={timeWarning} />
      <RevisionRankingModal 
        isOpen={showRankingModal || isEvaluating || isBatchSubmitting} 
        timeRemaining={timeRemaining}
        isEvaluating={isEvaluating}
        isBatchSubmitting={isBatchSubmitting}
      />

      <WritingTipsModal isOpen={showTipsModal} onClose={() => setShowTipsModal(false)} promptType={promptType || 'narrative'} />

      <button onClick={() => setShowTipsModal(true)} className="fixed bottom-8 right-8 z-40 group" title="Revision Tips">
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#00d492] bg-[rgba(0,212,146,0.1)] shadow-lg transition-all hover:scale-110 hover:bg-[rgba(0,212,146,0.2)]">
            <span className="text-2xl">✏️</span>
          </div>
          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff9030] text-[10px] animate-pulse">✨</div>
          <div className="absolute -bottom-10 right-0 rounded-[6px] bg-[rgba(255,255,255,0.025)] px-2 py-1 text-[10px] text-[rgba(255,255,255,0.4)] opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap border border-[rgba(255,255,255,0.05)]">Tips</div>
        </div>
      </button>

      <RevisionHeader
        timeRemaining={timeRemaining}
        timeColor={timeColor}
        progressPercent={progressPercent}
        wordCountRevised={wordCountRevised}
        wordCount={wordCount}
        hasRevised={hasRevised}
      />

      <main className="mx-auto max-w-[1200px] px-8 py-6">
        <PhaseInstructions 
          phase={3} 
          userRank={userProfile?.currentRank} 
          showRankGuidance={true} 
        />
        {showRevisionGuidance && (
          <RevisionGuidance onClose={() => setShowRevisionGuidance(false)} />
        )}
        <RevisionChecklist />
        <RevisionTitleBanner />

        <div className="grid gap-5 lg:grid-cols-3">
          <FeedbackSidebar
            showFeedback={showFeedback}
            onToggleFeedback={() => setShowFeedback(!showFeedback)}
            strengths={strengthsList}
            improvements={improvementsList}
            loadingFeedback={loadingFeedback}
            peerFeedback={realPeerFeedback}
            loadingPeerFeedback={loadingPeerFeedback}
          />

          <RevisionEditorSection
            originalContent={originalContent}
            wordCount={wordCount}
            revisedContent={revisedContent}
            hasRevised={hasRevised}
            onChange={setRevisedContent}
            onPaste={handlePaste}
            onCopy={handleCopy}
            onCut={handleCut}
          />
        </div>
      </main>
    </div>
  );
}
