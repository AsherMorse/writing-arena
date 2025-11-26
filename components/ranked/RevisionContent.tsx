'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
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
import { useCarousel } from '@/lib/hooks/useCarousel';
import { formatTime, getTimeColor, getTimeProgressColor } from '@/lib/utils/time-utils';
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

export default function RevisionContent() {
  const router = useRouter();
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
  
  const [revisedContent, setRevisedContent] = useState(originalContent);
  useEffect(() => { setRevisedContent(originalContent); }, [originalContent]);
  const [wordCountRevised, setWordCountRevised] = useState(0);
  const [showFeedback, setShowFeedback] = useState(true);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [showRevisionGuidance, setShowRevisionGuidance] = useState(true);
  const [aiFeedback, setAiFeedback] = useState(MOCK_AI_FEEDBACK);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [realPeerFeedback, setRealPeerFeedback] = useState<any>(null);
  const [loadingPeerFeedback, setLoadingPeerFeedback] = useState(true);
  const [aiRevisionsGenerated, setAiRevisionsGenerated] = useState(false);
  
  const writingTips = useMemo(() => [
    { name: 'Sentence Expansion', tip: 'Use because, but, or so to show why things happen.', example: 'She opened the door because she heard a strange noise.', icon: '🔗' },
    { name: 'Appositives', tip: 'Add description using commas to provide extra information.', example: 'Sarah, a curious ten-year-old, pushed open the rusty gate.', icon: '✏️' },
    { name: 'Five Senses', tip: 'Include what you see, hear, smell, taste, and feel.', example: 'The salty air stung my eyes while waves crashed loudly below.', icon: '👁️' },
    { name: 'Show, Don\'t Tell', tip: 'Use specific details instead of general statements.', example: 'Her hands trembled as she reached for the handle.', icon: '🎭' },
    { name: 'Transition Words', tip: 'Use signal words to connect ideas smoothly.', example: 'First, Then, However, Therefore, For example', icon: '➡️' },
    { name: 'Strong Conclusions', tip: 'End with a final thought that ties everything together.', example: 'For these reasons, it is clear that...', icon: '🎯' },
  ], []);
  
  const peerFeedbackFetchedRef = useRef(false);
  useEffect(() => {
    if (peerFeedbackFetchedRef.current) return;
    const fetchPeerFeedback = async () => {
      if (!user || !matchId) { setLoadingPeerFeedback(false); return; }
      peerFeedbackFetchedRef.current = true;
      try {
        const peerFeedbackData = await getPeerFeedbackResponses(matchId, user.uid);
        if (peerFeedbackData) setRealPeerFeedback(peerFeedbackData);
      } catch (error) {}
      finally { setLoadingPeerFeedback(false); }
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
          body: JSON.stringify({ content: originalContent, promptType }),
        });
        const feedback = await response.json();
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
        const { getDoc, doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/config/firebase');
        const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
        if (!matchDoc.exists()) return;
        
        const matchState = matchDoc.data();
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
            body: JSON.stringify({ originalContent: aiWriting.content, feedback: feedbackData, rank: aiPlayer.rank, playerName: aiPlayer.displayName }),
          });
          
          const revisionData = await revisionResponse.json();
          return { playerId: aiPlayer.userId, playerName: aiPlayer.displayName, originalContent: aiWriting.content, revisedContent: revisionData.content, wordCount: revisionData.wordCount, isAI: true, rank: aiPlayer.rank };
        });
        
        const aiRevisions = (await Promise.all(aiRevisionPromises)).filter(r => r !== null);
        const matchRef = doc(db, 'matchStates', matchId);
        await updateDoc(matchRef, { 'aiRevisions.phase3': aiRevisions });
      } catch (error) {}
    };
    generateAIRevisions();
  }, [matchId, user, aiRevisionsGenerated]);

  useEffect(() => { setWordCountRevised(countWords(revisedContent)); }, [revisedContent]);

  const { submit: handleBatchSubmit, isSubmitting: isBatchSubmitting } = useBatchRankingSubmission({
    phase: 3,
    matchId: matchId || '',
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
      router.push(buildResultsURL({ matchId, trait, promptId, promptType, originalContent, revisedContent, wordCount, revisedWordCount: wordCountRevised, writingScore: yourScore, feedbackScore, revisionScore, aiScores }));
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
        body: JSON.stringify({ originalContent, revisedContent, feedback: aiFeedback }),
      });
      const data = await response.json();
      return data.score || getDefaultScore(3);
    },
  });
  
  const { currentIndex: currentTipIndex, goTo: goToTip } = useCarousel({ items: writingTips, interval: 5000, autoPlay: showRankingModal || isEvaluating || isBatchSubmitting });

  const getRankingFromStorage = async () => {
    try {
      const { getDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/config/firebase');
      const matchDoc = await getDoc(doc(db, 'matchStates', matchId || ''));
      if (matchDoc.exists()) {
        const rankings = matchDoc.data()?.rankings?.phase3 || [];
        return rankings.find((r: any) => r.playerId === user?.uid);
      }
    } catch (error) {}
    return null;
  };

  const handleSubmit = async () => {
    setIsEvaluating(true);
    setShowRankingModal(true);
    try { await handleBatchSubmit(); }
    finally {
      setIsEvaluating(false);
      setTimeout(() => setShowRankingModal(false), 500);
    }
  };

  useAutoSubmit({ timeRemaining, hasSubmitted, onSubmit: handleSubmit, minPhaseAge: TIMING.MIN_PHASE_AGE });

  usePhaseTransition({
    session, currentPhase: 3, hasSubmitted, sessionId: activeSessionId || sessionId,
    onTransition: (nextPhase) => { if (session?.state === 'completed') router.push(`/ranked/results?sessionId=${activeSessionId || sessionId}`); },
  });

  useEffect(() => {
    if (!session || !hasSubmitted()) return;
    if (session.state === 'completed') router.push(`/ranked/results/${activeSessionId || sessionId}`);
  }, [session, hasSubmitted, router, activeSessionId, sessionId]);

  const { handlePaste, handleCut, handleCopy } = usePastePrevention({ showWarning: false });

  const componentMountedTimeRef = useRef<number | null>(null);
  useEffect(() => { if (componentMountedTimeRef.current === null) componentMountedTimeRef.current = Date.now(); }, []);

  useEffect(() => {
    const timeSinceMount = componentMountedTimeRef.current ? Date.now() - componentMountedTimeRef.current : Infinity;
    const minPhaseAge = TIMING.MIN_PHASE_AGE;
    if (timeRemaining === 0 && !hasSubmitted() && timeSinceMount >= minPhaseAge) setShowRankingModal(true);
    else if (!isEvaluating && !isBatchSubmitting) setShowRankingModal(false);
  }, [timeRemaining, hasSubmitted, isEvaluating, isBatchSubmitting, setShowRankingModal]);

  const hasRevised = revisedContent !== originalContent;
  const strengthsList = useMemo(() => aiFeedback.strengths || [], [aiFeedback.strengths]);
  const improvementsList = useMemo(() => aiFeedback.improvements || [], [aiFeedback.improvements]);

  if (isReconnecting || !session) return <LoadingState message="Loading revision phase..." />;
  if (error) return <ErrorState error={error} title="Session Error" retryLabel="Return to Dashboard" onRetry={() => router.push('/dashboard')} />;

  const progressPercent = (timeRemaining / SCORING.PHASE3_DURATION) * 100;
  const timeColor = getPhaseTimeColor(3, timeRemaining);

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <Modal isOpen={showRankingModal || isEvaluating || isBatchSubmitting} onClose={() => {}} variant="tips" showCloseButton={false}>
        <div className="text-center">
          <div className="mb-4 text-5xl animate-bounce">✨</div>
          <h2 className="text-xl font-semibold">{timeRemaining === 0 ? "Time's Up!" : "Calculating..."}</h2>
          <p className="mt-2 text-sm text-[rgba(255,255,255,0.4)]">
            {(isEvaluating || isBatchSubmitting) ? "Evaluating revisions..." : "Preparing results..."}
          </p>
          <p className="mt-2 text-xs text-[#00d492]">⏱️ Usually takes 1-2 minutes</p>
          
          <div className="mt-6 rounded-[14px] border border-[rgba(0,212,146,0.2)] bg-[rgba(0,212,146,0.05)] p-4">
            <div className="mb-2 flex items-center justify-center gap-2">
              <span className="text-lg">{writingTips[currentTipIndex].icon}</span>
              <span className="font-medium">{writingTips[currentTipIndex].name}</span>
            </div>
            <p className="text-sm text-[rgba(255,255,255,0.6)]">{writingTips[currentTipIndex].tip}</p>
            <div className="mt-3 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3">
              <div className="mb-1 text-[10px] uppercase text-[#00d492]">Example</div>
              <p className="text-xs italic text-[rgba(255,255,255,0.6)]">{writingTips[currentTipIndex].example}</p>
            </div>
            <div className="mt-3 flex justify-center gap-1">
              {writingTips.map((_, index) => (
                <button key={index} onClick={() => goToTip(index)} className={`h-1.5 rounded-full transition-all ${index === currentTipIndex ? 'w-6 bg-[#00d492]' : 'w-1.5 bg-[rgba(255,255,255,0.1)]'}`} />
              ))}
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#00d492]" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#00d492]" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#00d492]" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </Modal>

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

      <header className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.05)] bg-[#101012]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] font-mono text-xl font-medium" style={{ color: timeColor }}>
              {formatTime(timeRemaining)}
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(255,255,255,0.22)]">Phase 3 · Revision</div>
              <div className="text-sm font-medium" style={{ color: timeColor }}>
                {timeRemaining > 0 ? 'Time remaining' : "Time's up!"}
              </div>
            </div>
            <span className="rounded-[20px] bg-[rgba(0,212,146,0.12)] px-2 py-1 text-[10px] font-medium uppercase text-[#00d492]">
              Final Draft
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-[20px] bg-[rgba(255,255,255,0.025)] px-3 py-1.5">
              <span className="font-mono text-sm text-[#00d492]">{wordCountRevised}</span>
              <span className="ml-1 text-xs text-[rgba(255,255,255,0.4)]">words</span>
              {hasRevised && <span className="ml-2 text-xs text-[#00d492]">({wordCountRevised > wordCount ? '+' : ''}{wordCountRevised - wordCount})</span>}
            </div>
            <div className="text-xs text-[rgba(255,255,255,0.4)]">⏱️ Auto-submits at 0:00</div>
          </div>
        </div>
        <div className="mx-auto h-1 max-w-[1200px] rounded-full bg-[rgba(255,255,255,0.05)]">
          <div className="h-full rounded-full transition-all" style={{ width: `${progressPercent}%`, background: timeColor }} />
        </div>
      </header>

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
        <div className="mb-6 rounded-[14px] border border-[rgba(0,212,146,0.2)] bg-[rgba(0,212,146,0.05)] p-5">
          <h1 className="text-xl font-semibold">Revise Your Writing</h1>
          <p className="mt-1 text-sm text-[rgba(255,255,255,0.5)]">Use the feedback to improve your writing. Make meaningful changes!</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-4">
            <button onClick={() => setShowFeedback(!showFeedback)} className="w-full rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-2 text-sm lg:hidden">
              {showFeedback ? 'Hide' : 'Show'} Feedback
            </button>

            <div className={`space-y-4 ${showFeedback ? 'block' : 'hidden lg:block'}`}>
              <div className="rounded-[14px] border border-[rgba(0,212,146,0.2)] bg-[rgba(0,212,146,0.05)] p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <span>🤖</span><span>AI Feedback</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 text-xs font-semibold text-[#00d492]">✨ Strengths</div>
                    {loadingFeedback ? (
                      <div className="text-xs text-[rgba(255,255,255,0.4)]">Loading...</div>
                    ) : (
                      <ul className="space-y-1">
                        {strengthsList.map((strength, i) => (
                          <li key={`s-${i}`} className="text-xs text-[rgba(255,255,255,0.6)]">• {strength}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-semibold text-[#ff9030]">💡 Suggestions</div>
                    {loadingFeedback ? (
                      <div className="text-xs text-[rgba(255,255,255,0.4)]">Loading...</div>
                    ) : (
                      <ul className="space-y-1">
                        {improvementsList.map((imp, i) => (
                          <li key={`i-${i}`} className="text-xs text-[rgba(255,255,255,0.6)]">• {imp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[14px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.05)] p-4">
                <h3 className="mb-3 flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-2"><span>👥</span><span>Peer Feedback</span></span>
                  {realPeerFeedback && <span className="text-[10px] text-[#00e5e5]">from {realPeerFeedback.reviewerName}</span>}
                </h3>
                {loadingPeerFeedback ? (
                  <div className="py-6 text-center">
                    <div className="mb-2 text-2xl animate-spin">📝</div>
                    <div className="text-xs text-[rgba(255,255,255,0.4)]">Loading...</div>
                  </div>
                ) : realPeerFeedback ? (
                  <div className="space-y-3">
                    <div>
                      <div className="mb-1 text-[10px] font-semibold text-[#00e5e5]">Main Idea:</div>
                      <p className="text-xs text-[rgba(255,255,255,0.6)] break-words">{realPeerFeedback.responses.mainIdea || realPeerFeedback.responses.clarity}</p>
                    </div>
                    <div>
                      <div className="mb-1 text-[10px] font-semibold text-[#00d492]">Strength:</div>
                      <p className="text-xs text-[rgba(255,255,255,0.6)] break-words">{realPeerFeedback.responses.strength || realPeerFeedback.responses.strengths}</p>
                    </div>
                    <div>
                      <div className="mb-1 text-[10px] font-semibold text-[#ff9030]">Suggestion:</div>
                      <p className="text-xs text-[rgba(255,255,255,0.6)] break-words">{realPeerFeedback.responses.suggestion || realPeerFeedback.responses.improvements}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-[rgba(255,255,255,0.4)]">No peer feedback available</div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">📄 Original ({wordCount} words)</span>
              </div>
              <div className="max-h-[180px] overflow-y-auto rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3">
                <p className="text-sm text-[rgba(255,255,255,0.5)] whitespace-pre-wrap leading-relaxed">{originalContent}</p>
              </div>
            </div>

            <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-white p-5 min-h-[400px]">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-[#101012]">✏️ Your Revision</h3>
                {hasRevised && <span className="text-xs font-medium text-[#00d492] animate-pulse">Changes detected!</span>}
              </div>
              <textarea
                value={revisedContent}
                onChange={(e) => setRevisedContent(e.target.value)}
                onPaste={handlePaste}
                onCopy={handleCopy}
                onCut={handleCut}
                placeholder="Revise your writing based on the feedback..."
                className="h-full min-h-[340px] w-full resize-none text-[#101012] leading-relaxed focus:outline-none"
                spellCheck="true"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
