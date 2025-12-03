'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useInterval } from '@/lib/hooks/useInterval';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/lib/hooks/useSession';
import { useSessionData } from '@/lib/hooks/useSessionData';
import { useAutoSubmit } from '@/lib/hooks/useAutoSubmit';
import { usePhaseTransition } from '@/lib/hooks/usePhaseTransition';
import { getPromptById } from '@/lib/utils/prompts';
import WritingTipsModal from '@/components/shared/WritingTipsModal';
import WaitingForPlayers from '@/components/shared/WaitingForPlayers';
import PhaseInstructions from '@/components/shared/PhaseInstructions';
import TWRPlanningPhase, { PlanningData } from '@/components/shared/TWRPlanningPhase';
import TWRSentenceStarters from '@/components/shared/TWRSentenceStarters';
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
import { mapPlayersToDisplay, mapPlayersToPartyMembers } from '@/lib/utils/player-utils';
import { safeStringifyJSON, parseJSONResponse } from '@/lib/utils/json-utils';
import { isNotEmpty } from '@/lib/utils/array-utils';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { useTimeWarnings } from '@/lib/hooks/useTimeWarnings';
import { getSessionStorage } from '@/lib/utils/session-storage';
import { logger, LOG_CONTEXTS } from '@/lib/utils/logger';
import { useAIGeneration } from '@/lib/hooks/useAIGeneration';
import WritingEditor from './WritingEditor';
import AIGenerationProgress from './AIGenerationProgress';
import { WritingSessionHeader } from './writing-session/WritingSessionHeader';
import { RankingModal } from './writing-session/RankingModal';
import { TimeWarningNotification } from '@/components/shared/TimeWarningNotification';
import { PlanningDataBanner } from './writing-session/PlanningDataBanner';
import { PromptCard } from './writing-session/PromptCard';
import { WritingTipsCard } from './writing-session/WritingTipsCard';
import { WritingEditorSection } from './writing-session/WritingEditorSection';
import { SquadSidebar } from './writing-session/SquadSidebar';

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
  
  // Auto-save draft content
  const draftKey = sessionId ? `writing-${sessionId}` : '';
  const [writingContent, setWritingContent] = useState(() => {
    if (!sessionId || typeof window === 'undefined') return '';
    const restored = getSessionStorage<string>(`draft-${draftKey}`);
    return restored || '';
  });
  const [wordCount, setWordCount] = useState(0);
  const [showPlanningPhase, setShowPlanningPhase] = useState(true);
  const [planningData, setPlanningData] = useState<PlanningData | null>(null);
  
  // Auto-save current content
  useAutoSave({ 
    key: draftKey, 
    content: writingContent, 
    enabled: !!sessionId && !hasSubmitted 
  });
  
  // Time warnings
  const timeWarning = useTimeWarnings({
    timeRemaining,
    thresholds: { info: 60, warning: 30, urgent: 15 },
  });
  
  const { showTipsModal, setShowTipsModal, showRankingModal, setShowRankingModal } = useModals();

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

  // Use AI generation hook
  const {
    aiWritingsGenerated,
    generatingAI,
    aiGenerationProgress,
    aiWordCounts,
    aiTargetCounts,
  } = useAIGeneration({
    sessionId,
    matchId: sessionMatchId,
    activeSessionId,
    sessionCreatedAt,
    players,
    sessionPlayers,
    prompt: prompt ? { description: prompt.description, type: prompt.type } : { description: '', type: '' },
    phase: 1,
    enabled: !!session && !!user && !!prompt,
  });

  // AI word counts are managed by useAIGeneration hook
  // The interval for updating AI word counts has been moved to the hook
      
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
        body: safeStringifyJSON({ content: writingContent, trait: trait, promptType: prompt?.type }),
      });
      const data = await parseJSONResponse<{ overallScore: number }>(response);
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

  usePhaseTransition({
    session,
    currentPhase: 1,
    hasSubmitted,
    sessionId: activeSessionId || sessionId,
    onTransition: () => {
      router.push(`/ranked/peer-feedback?sessionId=${activeSessionId || sessionId}`);
    },
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
  
  const membersWithCounts = mapPlayersToDisplay(players, user?.uid, wordCount, aiWordCounts);

  if (hasSubmitted()) {
    const partyMembers = mapPlayersToPartyMembers(players, user?.uid);
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
      <TimeWarningNotification warning={timeWarning} />
      
      <RankingModal 
        isOpen={showRankingModal} 
        timeRemaining={timeRemaining} 
        isBatchSubmitting={isBatchSubmitting} 
      />
      
      <WritingTipsModal isOpen={showTipsModal} onClose={() => setShowTipsModal(false)} promptType={prompt.type} />

      <WritingSessionHeader 
        timeRemaining={timeRemaining} 
        wordCount={wordCount} 
        onShowTips={() => setShowTipsModal(true)} 
      />

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
        <PlanningDataBanner planningData={planningData} />
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
            {prompt && <PromptCard prompt={prompt} />}
            <WritingTipsCard />
          </div>

          <WritingEditorSection
            content={writingContent}
            wordCount={wordCount}
            timeRemaining={timeRemaining}
            onChange={setWritingContent}
          />

          <SquadSidebar members={membersWithCounts} />
        </div>
      </main>
    </div>
  );
}
