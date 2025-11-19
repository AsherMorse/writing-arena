'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import WritingTipsModal from '@/components/shared/WritingTipsModal';
import PhaseInstructions from '@/components/shared/PhaseInstructions';
import FeedbackValidator from '@/components/shared/FeedbackValidator';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/lib/hooks/useSession';
import { useSessionData } from '@/lib/hooks/useSessionData';
import { usePhaseTransition } from '@/lib/hooks/usePhaseTransition';
import { useAutoSubmit } from '@/lib/hooks/useAutoSubmit';
import { getAssignedPeer } from '@/lib/services/match-sync';
import { formatTime, getTimeColor, getTimeProgressColor } from '@/lib/utils/time-utils';
import { SCORING, getDefaultScore } from '@/lib/constants/scoring';
import { usePastePrevention } from '@/lib/hooks/usePastePrevention';
import { retryWithBackoff } from '@/lib/utils/retry';
import { isFormComplete } from '@/lib/utils/validation';
import { LoadingState } from '@/components/shared/LoadingState';
import { Modal } from '@/components/shared/Modal';
import { MOCK_PEER_WRITINGS } from '@/lib/utils/mock-data';
import { useBatchRankingSubmission } from '@/lib/hooks/useBatchRankingSubmission';
import { validateFeedbackSubmission } from '@/lib/utils/submission-validation';

export default function PeerFeedbackContent() {
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
    coordination: sessionCoordination,
    sessionId: activeSessionId,
  } = useSessionData(session);
  const [currentPeer, setCurrentPeer] = useState<any>(null);
  const [loadingPeer, setLoadingPeer] = useState(true);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiFeedbackGenerated, setAiFeedbackGenerated] = useState(false);
  
  // Feedback questions and responses
  const [responses, setResponses] = useState({
    clarity: '',
    strengths: '',
    improvements: '',
    organization: '',
    engagement: ''
  });

  // Generate AI peer feedback when phase starts
  useEffect(() => {
    const generateAIFeedback = async () => {
      if (!matchId || !user || aiFeedbackGenerated) return;
      
      console.log('🤖 PEER FEEDBACK - Generating AI peer feedback...');
      setAiFeedbackGenerated(true);
      
      try {
        const { getDoc, doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/config/firebase');
        
        // Get match state to find AI players and their assigned peers
        const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
        if (!matchDoc.exists()) return;
        
        const matchState = matchDoc.data();
        const players = matchState.players || [];
        const aiPlayers = players.filter((p: any) => p.isAI);
        const writings = matchState.aiWritings?.phase1 || [];
        
        // Generate feedback for each AI player
        const aiFeedbackPromises = aiPlayers.map(async (aiPlayer: any, idx: number) => {
          // Get AI's assigned peer (round-robin)
          const aiIndex = players.findIndex((p: any) => p.userId === aiPlayer.userId);
          const peerIndex = (aiIndex + 1) % players.length;
          const peer = players[peerIndex];
          
          // Get peer's writing
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
          
          // Generate AI feedback
          const response = await fetch('/api/generate-ai-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              peerWriting,
              rank: aiPlayer.rank,
              playerName: aiPlayer.displayName,
            }),
          });
          
          const data = await response.json();
          console.log(`✅ Generated feedback from ${aiPlayer.displayName}`);
          
          return {
            playerId: aiPlayer.userId,
            playerName: aiPlayer.displayName,
            responses: data.responses,
            peerWriting,
            isAI: true,
            rank: aiPlayer.rank,
          };
        });
        
        const aiFeedbacks = (await Promise.all(aiFeedbackPromises)).filter(f => f !== null);
        
        // Store AI feedback in Firestore
        const matchRef = doc(db, 'matchStates', matchId);
        await updateDoc(matchRef, {
          'aiFeedbacks.phase2': aiFeedbacks,
        });
        
        console.log('✅ PEER FEEDBACK - All AI feedback generated and stored');
      } catch (error) {
        console.error('❌ PEER FEEDBACK - Failed to generate AI feedback:', error);
      }
    };
    
    generateAIFeedback();
  }, [matchId, user, aiFeedbackGenerated]);

  // Load assigned peer's writing with retries (AI writes may take a moment to store)
  useEffect(() => {
    let cancelled = false;

    const loadPeerWriting = async () => {
      if (!user || !matchId) {
        setLoadingPeer(false);
        return;
      }
      
      console.log('[AIR] Loading assigned peer writing...');
      try {
        const assignedPeer = await retryWithBackoff(
          async () => {
            const peer = await getAssignedPeer(matchId, user.uid);
            if (peer) {
              console.log(`[AIR] Peer writing ready:`, peer.displayName);
            }
            return peer;
          },
          {
            maxAttempts: 5,
            delayMs: 1500,
            onRetry: (attempt) => {
              console.log(`[AIR] Peer writing not ready (attempt ${attempt}/5), retrying...`);
            },
          }
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
          console.warn('[AIR] No assigned peer found after retries, using fallback');
          setCurrentPeer(MOCK_PEER_WRITINGS[0]);
        }
      } catch (error) {
        console.error('❌ PEER FEEDBACK - Error loading peer:', error);
        if (!cancelled) {
          setCurrentPeer(MOCK_PEER_WRITINGS[0]);
        }
      } finally {
        if (!cancelled) {
          setLoadingPeer(false);
        }
      }
    };
    
    loadPeerWriting();
    
    return () => {
      cancelled = true;
    };
  }, [user, user?.uid, matchId]);

  // Paste prevention handlers
  const { handlePaste, handleCut, handleCopy } = usePastePrevention({ showWarning: false });

  // Batch ranking submission hook
  const { submit: handleBatchSubmit, isSubmitting: isBatchSubmitting } = useBatchRankingSubmission({
    phase: 2,
    matchId: matchId || '',
    userId: user?.uid || '',
    endpoint: '/api/batch-rank-feedback',
    firestoreKey: 'aiFeedbacks.phase2',
    rankingsKey: 'rankings.phase2',
    prepareUserSubmission: () => ({
      playerId: user?.uid || '',
      playerName: 'You',
      responses,
      peerWriting: currentPeer?.content || '',
      isAI: false,
    }),
    prepareSubmissionData: (score: number) => ({
      responses,
      score: score,
    }),
    submitPhase: async (phase, data) => {
      // Submit phase first
      await submitPhase(phase, data);
      
      // Don't navigate - stay on session page and let it handle phase transitions
      // The session page will automatically show the next phase when Firestore updates
    },
    validateSubmission: () => validateFeedbackSubmission(responses),
    onEmptySubmission: async (isEmpty) => {
      if (isEmpty) {
        console.warn('⚠️ PEER FEEDBACK - Incomplete submission, scoring as 0');
        await submitPhase(2, {
          responses,
          score: 0,
        });
        console.log('✅ PEER FEEDBACK - Empty submission recorded');
      }
    },
    fallbackEvaluation: async () => {
      const response = await fetch('/api/evaluate-peer-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          peerWriting: currentPeer?.content || '',
        }),
      });
      
      const data = await response.json();
      return data.score || getDefaultScore(2);
    },
  });

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

  // Track when component mounted to prevent immediate modal on load
  const componentMountedTimeRef = useRef<number | null>(null);
  useEffect(() => {
    if (componentMountedTimeRef.current === null) {
      componentMountedTimeRef.current = Date.now();
    }
  }, []);

  // Show calculating modal when timer expires or batch ranking is in progress
  useEffect(() => {
    // Don't show modal immediately on load - wait at least 3 seconds after mount
    const timeSinceMount = componentMountedTimeRef.current 
      ? Date.now() - componentMountedTimeRef.current 
      : Infinity;
    
    const minPhaseAge = 3000; // 3 seconds minimum before showing modal
    
    // Only show if timer expired AND component has been mounted for at least minPhaseAge
    if (timeRemaining === 0 && !hasSubmitted() && timeSinceMount >= minPhaseAge) {
      setShowRankingModal(true);
    } else if (!isBatchSubmitting && !isEvaluating) {
      // Ensure modal is closed if not submitting/evaluating
      setShowRankingModal(false);
    }
  }, [timeRemaining, hasSubmitted, isBatchSubmitting, isEvaluating, setShowRankingModal]);

  // Auto-submit when time runs out
  useAutoSubmit({
    timeRemaining,
    hasSubmitted,
    onSubmit: handleSubmit,
    minPhaseAge: 3000,
  });

  // Note: Phase transitions now happen via rankings page countdown
  // No need to navigate directly here - rankings page handles it

  // Debug time remaining
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('⏱️ PEER FEEDBACK - Time remaining:', timeRemaining, 'Duration:', SCORING.PHASE2_DURATION);
    }
  }, [timeRemaining]);

  // Loading state
  if (isReconnecting || !session) {
    return <LoadingState message="Loading feedback phase..." variant={isReconnecting ? 'reconnecting' : 'default'} />;
  }

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      {/* Calculating Scores Modal */}
      <Modal
        isOpen={showRankingModal || isEvaluating || isBatchSubmitting}
        onClose={() => {}} // Don't allow closing during calculation
        variant="ranking"
        showCloseButton={false}
      >
        <div className="text-6xl mb-6 animate-bounce">📊</div>
        <h2 className="text-3xl font-bold text-white mb-3">
          {timeRemaining === 0 ? "Time's Up!" : "Calculating Scores..."}
        </h2>
        <p className="text-white/70 text-lg mb-6">
          {(isEvaluating || isBatchSubmitting)
            ? "Evaluating feedback quality and ranking responses..."
            : "Preparing your results..."}
        </p>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>
      </Modal>

      {/* Peer Feedback Tips Modal - using 'informational' type for evaluation guidance */}
      <WritingTipsModal 
        isOpen={showTipsModal}
        onClose={() => setShowTipsModal(false)}
        promptType="informational"
      />

      {/* Floating Tips Button */}
      <button
        onClick={() => setShowTipsModal(true)}
        className="fixed bottom-8 right-8 z-40 group"
        title="Feedback Tips"
      >
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-200 border-2 border-white/20">
            <span className="text-2xl">🔍</span>
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs">✨</span>
          </div>
          <div className="absolute -bottom-12 right-0 bg-black/80 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Feedback Tips
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
              <div className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full">
                <span className="text-blue-400 text-sm font-semibold">📝 PHASE 2: PEER FEEDBACK</span>
              </div>
            </div>

            <div className="px-6 py-2 text-white/60 text-sm">
              ⏱️ Submit automatically at 0:00
            </div>
          </div>

          <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${getTimeProgressColor(timeRemaining)}`}
              style={{ width: `${Math.min(100, Math.max(0, (timeRemaining / SCORING.PHASE2_DURATION) * 100))}%` }}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <PhaseInstructions phase={2} />

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left side - Peer's writing */}
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              {loadingPeer || !currentPeer ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3 animate-spin">📖</div>
                  <div className="text-white/60">Loading peer&apos;s writing...</div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl">{currentPeer.avatar}</span>
                    <div>
                      <div className="text-white font-bold">{currentPeer.author}</div>
                      <div className="text-white/60 text-sm">{currentPeer.rank} &bull; {currentPeer.wordCount} words</div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 max-h-[600px] overflow-y-auto">
                    <p className="text-gray-800 leading-relaxed font-serif whitespace-pre-wrap">
                      {currentPeer.content}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right side - Feedback questions */}
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-bold text-lg mb-4">Provide Detailed Feedback</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    1. What is the main idea or message? Is it clear?
                  </label>
                  <textarea
                    value={responses.clarity}
                    onChange={(e) => setResponses({...responses, clarity: e.target.value})}
                    onPaste={handlePaste}
                    onCopy={handleCopy}
                    onCut={handleCut}
                    placeholder="Explain what the writing is about and whether it's easy to understand..."
                    className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={timeRemaining === 0}
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                    spellCheck="true"
                  />
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    2. What are the strongest parts of this writing?
                  </label>
                  <textarea
                    value={responses.strengths}
                    onChange={(e) => setResponses({...responses, strengths: e.target.value})}
                    placeholder="Point out specific examples of what works well..."
                    className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={timeRemaining === 0}
                  />
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    3. What could be improved? Be specific.
                  </label>
                  <textarea
                    value={responses.improvements}
                    onChange={(e) => setResponses({...responses, improvements: e.target.value})}
                    placeholder="Give constructive suggestions for improvement..."
                    className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={timeRemaining === 0}
                  />
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    4. How well is the writing organized?
                  </label>
                  <textarea
                    value={responses.organization}
                    onChange={(e) => setResponses({...responses, organization: e.target.value})}
                    placeholder="Comment on the structure, flow, and logical order..."
                    className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={timeRemaining === 0}
                  />
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    5. How engaging is this piece? Does it hold your attention?
                  </label>
                  <textarea
                    value={responses.engagement}
                    onChange={(e) => setResponses({...responses, engagement: e.target.value})}
                    placeholder="Describe how the writing makes you feel and why..."
                    className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={timeRemaining === 0}
                  />
                </div>
              </div>
              
              {/* Feedback Quality Validator */}
              <FeedbackValidator responses={responses} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
