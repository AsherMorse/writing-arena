'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useMemo } from 'react';
import WritingTipsModal from '@/components/shared/WritingTipsModal';
import PhaseInstructions from '@/components/shared/PhaseInstructions';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/lib/hooks/useSession';
import { useSessionData } from '@/lib/hooks/useSessionData';
import { usePhaseTransition } from '@/lib/hooks/usePhaseTransition';
import { useAutoSubmit } from '@/lib/hooks/useAutoSubmit';
import { getPeerFeedbackResponses } from '@/lib/services/match-sync';
import { useCarousel } from '@/lib/hooks/useCarousel';
import { formatTime, getTimeColor, getTimeProgressColor } from '@/lib/utils/time-utils';
import { SCORING, getDefaultScore } from '@/lib/constants/scoring';
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
  const { user } = useAuth();
  
  // NEW: Use session hook
  const {
    session,
    isReconnecting,
    error,
    timeRemaining,
    submitPhase,
    hasSubmitted,
  } = useSession(sessionId);
  
  // Extract session data using hook
  const {
    matchId,
    config: sessionConfig,
    players: sessionPlayers,
    state: sessionState,
    sessionId: activeSessionId,
  } = useSessionData(session);
  
  const trait = sessionConfig?.trait || 'all';
  const promptId = sessionConfig?.promptId || '';
  const promptType = sessionConfig?.promptType || 'narrative';
  
  // Get original content from session player data
  const originalContent = user && sessionPlayers ? (sessionPlayers[user.uid]?.phases.phase1?.content || '') : '';
  const yourScore = user && sessionPlayers ? (sessionPlayers[user.uid]?.phases.phase1?.score || getDefaultScore(1)) : getDefaultScore(1);
  const feedbackScore = user && sessionPlayers ? (sessionPlayers[user.uid]?.phases.phase2?.score || getDefaultScore(2)) : getDefaultScore(2);
  const wordCount = user && sessionPlayers ? (sessionPlayers[user.uid]?.phases.phase1?.wordCount || 0) : 0;
  const aiScores = ''; // TODO: Extract from session data
  
  const [revisedContent, setRevisedContent] = useState(originalContent);
  useEffect(() => {
    setRevisedContent(originalContent);
  }, [originalContent]);
  const [wordCountRevised, setWordCountRevised] = useState(0);
  const [showFeedback, setShowFeedback] = useState(true);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(MOCK_AI_FEEDBACK);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [realPeerFeedback, setRealPeerFeedback] = useState<any>(null);
  const [loadingPeerFeedback, setLoadingPeerFeedback] = useState(true);
  const [aiRevisionsGenerated, setAiRevisionsGenerated] = useState(false);
  
  // Writing tips carousel for calculating modal
  const writingTips = useMemo(() => [
    {
      name: 'Sentence Expansion',
      tip: 'Use because, but, or so to show why things happen.',
      example: 'She opened the door because she heard a strange noise.',
      icon: '🔗',
    },
    {
      name: 'Appositives',
      tip: 'Add description using commas to provide extra information.',
      example: 'Sarah, a curious ten-year-old, pushed open the rusty gate.',
      icon: '✏️',
    },
    {
      name: 'Five Senses',
      tip: 'Include what you see, hear, smell, taste, and feel.',
      example: 'The salty air stung my eyes while waves crashed loudly below.',
      icon: '👁️',
    },
    {
      name: 'Show, Don\'t Tell',
      tip: 'Use specific details instead of general statements.',
      example: 'Her hands trembled as she reached for the handle.',
      icon: '🎭',
    },
    {
      name: 'Transition Words',
      tip: 'Use signal words to connect ideas smoothly.',
      example: 'First, Then, However, Therefore, For example',
      icon: '➡️',
    },
    {
      name: 'Strong Conclusions',
      tip: 'End with a final thought that ties everything together.',
      example: 'For these reasons, it is clear that...',
      icon: '🎯',
    },
  ], []);
  
  // Fetch real peer feedback from Phase 2
  useEffect(() => {
    const fetchPeerFeedback = async () => {
      if (!user || !matchId) {
        setLoadingPeerFeedback(false);
        return;
      }
      
      try {
        const peerFeedbackData = await getPeerFeedbackResponses(matchId, user.uid);
        
        if (peerFeedbackData) {
          setRealPeerFeedback(peerFeedbackData);
        } else {
        }
      } catch (error) {
      } finally {
        setLoadingPeerFeedback(false);
      }
    };
    
    fetchPeerFeedback();
  }, [user, matchId]);

  // Generate REAL AI feedback for user's writing
  useEffect(() => {
    if (!originalContent || !session || loadingFeedback === false) return;
    
    const generateRealFeedback = async () => {
      
      try {
        // Call the generate-feedback API with YOUR actual writing
        const response = await fetch('/api/generate-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: originalContent,
            promptType,
          }),
        });
        
        const feedback = await response.json();
        
        setAiFeedback({
          strengths: feedback.strengths || [],
          improvements: feedback.improvements || [],
          score: feedback.score || getDefaultScore(2),
        });
      } catch (error) {
        setAiFeedback(MOCK_AI_FEEDBACK);
      } finally {
        setLoadingFeedback(false);
      }
    };
    
    generateRealFeedback();
  }, [originalContent, promptType, session, loadingFeedback]);

  // Generate AI revisions when phase starts
  useEffect(() => {
    const generateAIRevisions = async () => {
      if (!matchId || !user || aiRevisionsGenerated) return;
      
      setAiRevisionsGenerated(true);
      
      try {
        const { getDoc, doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/config/firebase');
        
        // Get match state to find AI players and their writings/feedback
        const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
        if (!matchDoc.exists()) return;
        
        const matchState = matchDoc.data();
        const players = matchState.players || [];
        const aiPlayers = players.filter((p: any) => p.isAI);
        const phase1Writings = matchState.aiWritings?.phase1 || [];
        
        // Get Phase 1 rankings to use the feedback that was already generated
        const phase1Rankings = matchState.rankings?.phase1 || [];
        
        // Generate revisions for each AI player
        const aiRevisionPromises = aiPlayers.map(async (aiPlayer: any) => {
          // Get AI's original writing
          const aiWriting = phase1Writings.find((w: any) => w.playerId === aiPlayer.userId);
          if (!aiWriting) return null;
          
          // Get AI's feedback from Phase 1 rankings (already generated)
          const aiRanking = phase1Rankings.find((r: any) => r.playerId === aiPlayer.userId);
          const feedbackData = {
            strengths: aiRanking?.strengths || ['Good attempt at addressing the prompt'],
            improvements: aiRanking?.improvements || ['Could add more detail'],
            score: aiRanking?.score || 70,
          };
          
          
          // Generate revision
          const revisionResponse = await fetch('/api/generate-ai-revision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              originalContent: aiWriting.content,
              feedback: feedbackData,
              rank: aiPlayer.rank,
              playerName: aiPlayer.displayName,
            }),
          });
          
          const revisionData = await revisionResponse.json();
          
          return {
            playerId: aiPlayer.userId,
            playerName: aiPlayer.displayName,
            originalContent: aiWriting.content,
            revisedContent: revisionData.content,
            wordCount: revisionData.wordCount,
            isAI: true,
            rank: aiPlayer.rank,
          };
        });
        
        const aiRevisions = (await Promise.all(aiRevisionPromises)).filter(r => r !== null);
        
        // Store AI revisions in Firestore
        const matchRef = doc(db, 'matchStates', matchId);
        await updateDoc(matchRef, {
          'aiRevisions.phase3': aiRevisions,
        });
        
      } catch (error) {
      }
    };
    
    generateAIRevisions();
  }, [matchId, user, aiRevisionsGenerated]);


  useEffect(() => {
    setWordCountRevised(countWords(revisedContent));
  }, [revisedContent]);

  // Batch ranking submission hook
  const { submit: handleBatchSubmit, isSubmitting: isBatchSubmitting } = useBatchRankingSubmission({
    phase: 3,
    matchId: matchId || '',
    userId: user?.uid || '',
    endpoint: '/api/batch-rank-revisions',
    firestoreKey: 'aiRevisions.phase3',
    rankingsKey: 'rankings.phase3',
    prepareUserSubmission: () => ({
          playerId: user?.uid || '',
          playerName: 'You',
          originalContent,
          revisedContent,
          feedback: aiFeedback,
          wordCount: wordCountRevised,
          isAI: false,
    }),
    prepareSubmissionData: (score: number) => ({
      revisedContent,
      wordCount: wordCountRevised,
      score: score,
    }),
    submitPhase: async (phase, data) => {
      // Submit phase first
      await submitPhase(phase, data);
      
      // After submission, navigate to results
      const yourRanking = await getRankingFromStorage();
      const revisionScore = yourRanking?.score || data.score || getDefaultScore(3);
      
      setSessionStorage(`${matchId}-phase3-feedback`, yourRanking || data);
      
      router.push(
        buildResultsURL({
          matchId,
          trait,
          promptId,
          promptType,
          originalContent,
          revisedContent,
          wordCount,
          revisedWordCount: wordCountRevised,
          writingScore: yourScore,
          feedbackScore,
          revisionScore,
          aiScores,
        })
      );
    },
    validateSubmission: () => validateRevisionSubmission(originalContent, revisedContent, wordCountRevised),
    onEmptySubmission: async (isEmpty, unchanged) => {
      if (isEmpty || unchanged) {
        const score = isEmpty ? SCORING.MIN_SCORE : 40;
        await submitPhase(3, {
          revisedContent: revisedContent || originalContent,
          wordCount: wordCountRevised,
          score,
          });
        
        // Navigate to results even for empty submission
        router.push(
          buildResultsURL({
            matchId,
            trait,
            promptId,
            promptType,
            originalContent,
            revisedContent,
            wordCount,
            revisedWordCount: wordCountRevised,
            writingScore: yourScore,
            feedbackScore,
            revisionScore: score,
            aiScores,
          })
        );
      }
    },
    fallbackEvaluation: async () => {
      const response = await fetch('/api/evaluate-revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalContent,
          revisedContent,
          feedback: aiFeedback,
        }),
      });
      
      const data = await response.json();
      return data.score || getDefaultScore(3);
    },
  });
  
  // Writing tips carousel for calculating modal (after batch submission hook)
  const { currentIndex: currentTipIndex, goTo: goToTip } = useCarousel({
    items: writingTips,
    interval: 5000, // Rotate every 5 seconds
    autoPlay: showRankingModal || isEvaluating || isBatchSubmitting, // Only auto-play when modal is open
  });

  // Helper to get ranking from Firestore after submission
  const getRankingFromStorage = async () => {
    try {
      const { getDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/config/firebase');
      const matchDoc = await getDoc(doc(db, 'matchStates', matchId || ''));
      if (matchDoc.exists()) {
        const rankings = matchDoc.data()?.rankings?.phase3 || [];
        return rankings.find((r: any) => r.playerId === user?.uid);
      }
    } catch (error) {
    }
    return null;
  };

  const handleSubmit = async () => {
    setIsEvaluating(true);
    setShowRankingModal(true); // Show calculating modal
    try {
      await handleBatchSubmit();
    } finally {
      setIsEvaluating(false);
      // Keep modal open briefly after submission completes
      setTimeout(() => {
        setShowRankingModal(false);
      }, 500);
    }
  };

  // Auto-submit when time runs out
  useAutoSubmit({
    timeRemaining,
    hasSubmitted,
    onSubmit: handleSubmit,
    minPhaseAge: 3000,
  });

  // Phase transition monitoring (for Phase 3 completion)
  usePhaseTransition({
    session,
    currentPhase: 3,
    hasSubmitted,
    sessionId: activeSessionId || sessionId,
    onTransition: (nextPhase) => {
      if (session?.state === 'completed') {
        router.push(`/ranked/results?sessionId=${activeSessionId || sessionId}`);
      }
    },
  });

  // Also listen for session completion
  useEffect(() => {
    if (!session || !hasSubmitted()) return;
    
    if (session.state === 'completed') {
      router.push(`/ranked/results/${activeSessionId || sessionId}`);
    }
  }, [session, hasSubmitted, router, activeSessionId, sessionId]);

  // Paste prevention handlers
  const { handlePaste, handleCut, handleCopy } = usePastePrevention({ showWarning: false });

  // Track when component mounted to prevent immediate modal on load
  const componentMountedTimeRef = useRef<number | null>(null);
  useEffect(() => {
    if (componentMountedTimeRef.current === null) {
      componentMountedTimeRef.current = Date.now();
    }
  }, []);

  // Show calculating modal when timer expires
  useEffect(() => {
    // Don't show modal immediately on load - wait at least 3 seconds after mount
    const timeSinceMount = componentMountedTimeRef.current 
      ? Date.now() - componentMountedTimeRef.current 
      : Infinity;
    
    const minPhaseAge = 3000; // 3 seconds minimum before showing modal
    
    // Only show if timer expired AND component has been mounted for at least minPhaseAge
    if (timeRemaining === 0 && !hasSubmitted() && timeSinceMount >= minPhaseAge) {
      setShowRankingModal(true);
    } else if (!isEvaluating && !isBatchSubmitting) {
      // Ensure modal is closed if not evaluating/submitting
      setShowRankingModal(false);
    }
  }, [timeRemaining, hasSubmitted, isEvaluating, isBatchSubmitting, setShowRankingModal]);

  const hasRevised = revisedContent !== originalContent;

  if (isReconnecting || !session) {
    return <LoadingState message="Loading revision phase..." />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error} 
        title="Session Error"
        retryLabel="Return to Dashboard"
        onRetry={() => router.push('/dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      {/* Calculating Scores Modal */}
      <Modal
        isOpen={showRankingModal || isEvaluating || isBatchSubmitting}
        onClose={() => {}} // Don't allow closing during calculation
        variant="tips"
        showCloseButton={false}
      >
        <div className="text-6xl mb-6 animate-bounce">✨</div>
        <h2 className="text-3xl font-bold text-white mb-3">
          {timeRemaining === 0 ? "Time's Up!" : "Calculating Scores..."}
        </h2>
        <p className="text-white/70 text-lg mb-4">
          {(isEvaluating || isBatchSubmitting)
            ? "Evaluating revisions and calculating final scores..."
            : "Preparing your results..."}
        </p>
        <p className="text-purple-400 text-sm mb-8 font-semibold">
          ⏱️ This usually takes 1-2 minutes
        </p>
        
        {/* Writing Tips Carousel */}
        <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-400/30 max-w-md mx-auto mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="text-2xl mr-2">{writingTips[currentTipIndex].icon}</div>
            <h3 className="text-lg font-bold text-white">
              {writingTips[currentTipIndex].name}
            </h3>
          </div>
          
          <p className="text-white/90 text-sm text-center mb-4 leading-relaxed">
            {writingTips[currentTipIndex].tip}
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-purple-300 text-xs font-semibold mb-1 text-center">Example:</div>
            <p className="text-white text-xs italic text-center leading-relaxed">
              {writingTips[currentTipIndex].example}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center space-x-1.5 mt-4">
            {writingTips.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTip(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentTipIndex 
                    ? 'bg-purple-400 w-6' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to tip ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>
      </Modal>

      {/* Revision Tips Modal */}
      <WritingTipsModal 
        isOpen={showTipsModal}
        onClose={() => setShowTipsModal(false)}
        promptType={promptType || 'narrative'}
      />

      {/* Floating Tips Button */}
      <button
        onClick={() => setShowTipsModal(true)}
        className="fixed bottom-8 right-8 z-40 group"
        title="Revision Tips"
      >
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-200 border-2 border-white/20">
            <span className="text-2xl">✏️</span>
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs">✨</span>
          </div>
          <div className="absolute -bottom-12 right-0 bg-black/80 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Revision Tips
          </div>
        </div>
      </button>

      <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`text-3xl font-bold ${getTimeColor(timeRemaining)}`}>
                {formatTime(timeRemaining)}
              </div>
              <div className="text-white/60">
                {timeRemaining > 0 ? 'Time remaining' : 'Time\'s up!'}
              </div>
              <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full">
                <span className="text-emerald-400 text-sm font-semibold">✏️ PHASE 3: REVISION</span>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-white/60">
                <span className="font-semibold text-white">{wordCountRevised}</span> words
                {hasRevised && (
                  <span className="ml-2 text-emerald-400">
                    ({wordCountRevised > wordCount ? '+' : ''}{wordCountRevised - wordCount})
                  </span>
                )}
              </div>
              <div className="px-6 py-2 text-white/60 text-sm">
                ⏱️ Submit automatically at 0:00
              </div>
            </div>
          </div>

          <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${getTimeProgressColor(timeRemaining)}`}
              style={{ width: `${(timeRemaining / SCORING.PHASE3_DURATION) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        <div className="mb-6 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Revise Your Writing</h1>
          <p className="text-white/80">
            Use the feedback from your peer and AI to improve your writing. Make meaningful changes!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {/* Left sidebar - Feedback */}
          <div className="lg:col-span-1 space-y-4">
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className="w-full lg:hidden px-4 py-2 bg-white/10 text-white rounded-lg"
            >
              {showFeedback ? 'Hide' : 'Show'} Feedback
            </button>

            <div className={`space-y-4 ${showFeedback ? 'block' : 'hidden lg:block'}`}>
              {/* AI Feedback */}
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-400/30">
                <h3 className="text-white font-bold mb-3 flex items-center space-x-2">
                  <span>🤖</span>
                  <span>AI Feedback</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-emerald-400 text-sm font-semibold mb-2">✨ Strengths</div>
                    {loadingFeedback ? (
                    <div className="text-white/60 text-sm">Loading AI feedback...</div>
                  ) : (
                    <ul className="space-y-1">
                      {aiFeedback.strengths.map((strength, i) => (
                        <li key={i} className="text-white/80 text-sm leading-relaxed">
                          • {strength}
                        </li>
                      ))}
                    </ul>
                  )}
                  </div>

                  <div>
                    <div className="text-yellow-400 text-sm font-semibold mb-2">💡 Suggestions</div>
                    {loadingFeedback ? (
                      <div className="text-white/60 text-sm">Loading AI feedback...</div>
                    ) : (
                      <ul className="space-y-1">
                        {aiFeedback.improvements.map((improvement, i) => (
                          <li key={i} className="text-white/80 text-sm leading-relaxed">
                            • {improvement}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Peer Feedback - REAL */}
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30">
                <h3 className="text-white font-bold mb-3 flex items-center space-x-2">
                  <span>👥</span>
                  <span>Peer Feedback</span>
                  {realPeerFeedback && (
                    <span className="text-xs text-emerald-400 ml-auto">from {realPeerFeedback.reviewerName}</span>
                  )}
                </h3>
                
                {loadingPeerFeedback ? (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-2 animate-spin">📝</div>
                    <div className="text-white/60 text-sm">Loading peer feedback...</div>
                  </div>
                ) : realPeerFeedback ? (
                  <div className="space-y-3">
                    <div>
                      <div className="text-blue-400 text-xs font-semibold mb-1">Main Idea Clarity:</div>
                      <p className="text-white/80 text-sm leading-relaxed break-words">
                        {realPeerFeedback.responses.clarity}
                      </p>
                    </div>

                    <div>
                      <div className="text-emerald-400 text-xs font-semibold mb-1">Strengths noted:</div>
                      <p className="text-white/80 text-sm leading-relaxed break-words">
                        {realPeerFeedback.responses.strengths}
                      </p>
                    </div>

                    <div>
                      <div className="text-yellow-400 text-xs font-semibold mb-1">Suggestions:</div>
                      <p className="text-white/80 text-sm leading-relaxed break-words">
                        {realPeerFeedback.responses.improvements}
                      </p>
                    </div>

                    <div>
                      <div className="text-purple-400 text-xs font-semibold mb-1">Organization:</div>
                      <p className="text-white/80 text-sm leading-relaxed break-words">
                        {realPeerFeedback.responses.organization}
                      </p>
                    </div>

                    <div>
                      <div className="text-cyan-400 text-xs font-semibold mb-1">Engagement:</div>
                      <p className="text-white/80 text-sm leading-relaxed break-words">
                        {realPeerFeedback.responses.engagement}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-white/40 text-sm">No peer feedback available</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Editor */}
          <div className="lg:col-span-2 space-y-4">
            {/* Original Writing */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <h3 className="text-white font-bold mb-3 flex items-center justify-between">
                <span>📄 Your Original Writing</span>
                <span className="text-white/60 text-sm">{wordCount} words</span>
              </h3>
              <div className="bg-white/10 rounded-lg p-4 max-h-[200px] overflow-y-auto">
                <p className="text-white/80 text-sm leading-relaxed font-serif whitespace-pre-wrap">
                  {originalContent}
                </p>
              </div>
            </div>

            {/* Revision Editor */}
            <div className="bg-white rounded-xl p-6 shadow-2xl min-h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-800 font-bold text-lg">✏️ Your Revision</h3>
                {hasRevised && (
                  <span className="text-emerald-600 text-sm font-semibold animate-pulse">
                    Changes detected!
                  </span>
                )}
              </div>
              <textarea
                value={revisedContent}
                onChange={(e) => setRevisedContent(e.target.value)}
                onPaste={handlePaste}
                onCopy={handleCopy}
                onCut={handleCut}
                placeholder="Revise your writing based on the feedback..."
                className="w-full h-full min-h-[450px] text-lg leading-relaxed resize-none focus:outline-none text-gray-800 font-serif"
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
                spellCheck="true"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

