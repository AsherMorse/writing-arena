'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/lib/hooks/useSession';
import { useSessionData } from '@/lib/hooks/useSessionData';
import { usePhaseTransition } from '@/lib/hooks/usePhaseTransition';
import { useAutoSubmit } from '@/lib/hooks/useAutoSubmit';
import { getPromptById } from '@/lib/utils/prompts';
import WritingTipsModal from '@/components/shared/WritingTipsModal';
import WaitingForPlayers from '@/components/shared/WaitingForPlayers';
import PhaseInstructions from '@/components/shared/PhaseInstructions';
import { Modal } from '@/components/shared/Modal';
import { db } from '@/lib/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { formatTime, getTimeColor } from '@/lib/utils/time-utils';
import { SCORING, getDefaultScore, clampScore } from '@/lib/constants/scoring';
import { countWords } from '@/lib/utils/text-utils';
import { usePastePrevention } from '@/lib/hooks/usePastePrevention';
import { useModals } from '@/lib/hooks/useModals';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useBatchRankingSubmission } from '@/lib/hooks/useBatchRankingSubmission';
import { validateWritingSubmission } from '@/lib/utils/submission-validation';

/**
 * WritingSessionContent - Migrated to new session architecture
 * 
 * CHANGES:
 * ✅ No more searchParams or URL-based state
 * ✅ No more sessionStorage scattered everywhere
 * ✅ Uses useSession hook for all state management
 * ✅ Clean navigation without URL params
 * ✅ Automatic reconnection support
 * ✅ Real-time synchronization
 */
export default function WritingSessionContent() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const { user, userProfile } = useAuth();
  
  // NEW: Single hook handles all session management
  const {
    session,
    isReconnecting,
    error,
    timeRemaining,
    submitPhase,
    hasSubmitted,
    submissionCount,
  } = useSession(sessionId);
  
  // UI state only (not persisted)
  const [writingContent, setWritingContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  
  // Use hooks for paste prevention and modals
  const { showPasteWarning, handlePaste, handleCut, handleCopy, setShowPasteWarning } = usePastePrevention();
  const { showTipsModal, setShowTipsModal, showRankingModal, setShowRankingModal } = useModals();
  const [aiWritingsGenerated, setAiWritingsGenerated] = useState(false);
  const [aiWordCounts, setAiWordCounts] = useState<number[]>([0, 0, 0, 0]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiGenerationProgress, setAiGenerationProgress] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Extract session data using hook
  const {
    matchId: sessionMatchId,
    sessionId: activeSessionId,
    coordination: sessionCoordination,
    config: sessionConfig,
    players: sessionPlayers,
    allPlayers,
  } = useSessionData(session);
  
  // Get createdAt from session directly (not exposed by hook)
  const sessionCreatedAt = session?.createdAt;
  
  const prompt = sessionConfig ? getPromptById(sessionConfig.promptId) : null;
  const trait = sessionConfig?.trait || 'all';

  // Calculate players list from session
  const players = useMemo(
    () => allPlayers,
    [allPlayers],
  );
  
  
  // Get submission tracking
  const { submitted, total } = submissionCount();

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS

  // Ref to store the final target word counts for AI players
  const aiTargetCountsRef = useRef<number[]>([]);

  // Generate AI writings once when session initializes
  useEffect(() => {
    if (!session || aiWritingsGenerated || !user || !prompt) return;
    
    const generateAIWritings = async () => {
      console.log('[ST] Checking for existing AI writings...');
      
      try {
        // Check if AI writings already exist in matchStates (backward compatibility)
        const matchRef = doc(db, 'matchStates', sessionMatchId || sessionId);
        const matchDoc = await getDoc(matchRef);
        
        if (matchDoc.exists()) {
          const matchState = matchDoc.data();
          const existingWritings = matchState?.aiWritings?.phase1;
          
          if (existingWritings && existingWritings.length > 0) {
            console.log('[ST] Found existing AI writings:', existingWritings.length);
            // STORE TARGETS, NOT IMMEDIATE STATE
            aiTargetCountsRef.current = existingWritings.map((w: any) => w.wordCount);
            console.log('[ST] Set targets from existing:', aiTargetCountsRef.current);
            setAiWritingsGenerated(true);
            return;
          }
        } else {
          // Create matchStates document for backward compatibility
          console.log('[ST] Creating matchStates document for backward compatibility');
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
        
        // Generate new AI writings
        console.log('[ST] Generating new AI writings for prompt:', prompt.id);
        
        // Get AI players
        const aiPlayers = players.filter(p => p.isAI);
        
        // Show loading state
        setGeneratingAI(true);
        console.log(`[ST] Generating ${aiPlayers.length} AI writings`);
        setAiWritingsGenerated(true);
        
        // Generate writing for each AI player in parallel
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
          console.log(`[ST] Generated writing for ${aiPlayer.displayName}:`, data.wordCount);
          
          // Update progress
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
        
        // Store AI writings in matchStates for backward compatibility
        // Use setDoc with merge to create if doesn't exist
        const { setDoc } = await import('firebase/firestore');
        await setDoc(matchRef, {
          aiWritings: {
            phase1: aiWritings,
          },
        }, { merge: true });
        
        // Update AI word counts for UI
        // STORE TARGETS
        aiTargetCountsRef.current = aiWritings.map(w => w.wordCount);
        console.log('[ST] Set targets from generated:', aiTargetCountsRef.current);
        setGeneratingAI(false);
        setAiGenerationProgress(100);
        
        console.log('[ST] Stored AI writings for match');
        
        // AUTO-SUBMIT AI PLAYERS (they've "finished writing")
        // Submit each AI player's work to the session after a short delay (5-15 seconds)
        aiPlayers.forEach((aiPlayer, index) => {
          const delay = 5000 + Math.random() * 10000; // 5-15 seconds
          
          setTimeout(async () => {
            try {
              const aiWriting = aiWritings.find(w => w.playerId === aiPlayer.userId);
              if (!aiWriting) return;
              
              console.log(`[ST] Auto-submitting AI player ${aiPlayer.displayName} after delay ${delay}`);
              
              // Submit directly to sessions collection
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
              
              console.log(`[ST] AI player ${aiPlayer.displayName} submission saved`);
            } catch (error) {
              console.error(`❌ SESSION - Failed to auto-submit AI player ${aiPlayer.displayName}:`, error);
            }
          }, delay);
        });
        
      } catch (error) {
        console.error('[ST] Failed to generate AI writings:', error);
        // Continue with fallback word counts
        aiTargetCountsRef.current = [40, 55, 48, 62];
        console.log('[ST] Set fallback targets:', aiTargetCountsRef.current);
        setAiWritingsGenerated(true);
      }
    };
    
    generateAIWritings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, aiWritingsGenerated, user, prompt]);

  // ANIMATION EFFECT - SIMPLIFIED
  // Just increment word counts slowly towards the target
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      setAiWordCounts(prevCounts => {
        const aiPlayers = players.filter(p => p.isAI);
        if (prevCounts.length !== aiPlayers.length) {
          return new Array(aiPlayers.length).fill(0);
        }

        return prevCounts.map((currentCount, index) => {
          const target = aiTargetCountsRef.current[index] || 100;
          
          // If we reached the target, stop
          if (currentCount >= target) return target;

          // Simple random increment: 0.5 to 1.5 words per tick (every 1s)
          // This simulates a writing speed of ~60 words/min which is realistic
          const increment = 0.5 + Math.random();
          
          return Math.min(target, currentCount + increment);
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session, players]);
      
  // Update word count when content changes (debounced for performance)
  const debouncedContent = useDebounce(writingContent, 300);
  useEffect(() => {
    setWordCount(countWords(debouncedContent));
  }, [debouncedContent]);


  // Batch ranking submission hook
  const { submit: handleBatchSubmit, isSubmitting: isBatchSubmitting } = useBatchRankingSubmission({
    phase: 1,
    matchId: sessionMatchId || sessionId,
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
      // Submit phase first
      await submitPhase(phase, data);
      
      // Don't navigate - stay on session page and let it handle phase transitions
      // The session page will automatically show the next phase when Firestore updates
    },
    validateSubmission: () => validateWritingSubmission(writingContent, wordCount),
    onEmptySubmission: async (isEmpty) => {
      if (isEmpty) {
        console.warn('⚠️ SESSION - Empty submission detected, scoring as 0');
        await submitPhase(1, {
          content: '',
          wordCount: 0,
          score: 0,
        });
        console.log('✅ SESSION - Empty submission recorded');
      }
    },
    fallbackEvaluation: async () => {
      // Fallback to individual evaluation
      const response = await fetch('/api/analyze-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: writingContent,
          trait: trait,
          promptType: prompt?.type,
        }),
      });
      
      const data = await response.json();
      return data.overallScore ?? getDefaultScore(1);
    },
  });

  const handleSubmit = useCallback(async () => {
    if (hasSubmitted() || !user || !userProfile || !session || !prompt) return;
    await handleBatchSubmit();
  }, [hasSubmitted, user, userProfile, session, prompt, handleBatchSubmit]);

  // Paste prevention handlers from usePastePrevention hook (already defined above)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleDebugPaste = async () => {
      try {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const clipboardText = await navigator.clipboard.readText();
        if (!clipboardText) return;

        const { selectionStart, selectionEnd, value } = textarea;
        const before = value.slice(0, selectionStart ?? value.length);
        const after = value.slice(selectionEnd ?? value.length);
        const nextValue = `${before}${clipboardText}${after}`;

        setShowPasteWarning(false);
        setWritingContent(nextValue);

        const cursorPosition = (selectionStart ?? value.length) + clipboardText.length;
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(cursorPosition, cursorPosition);
        });
      } catch (error) {
        console.error('❌ DEBUG - Failed to paste from clipboard:', error);
      }
    };

    const handler = () => {
      void handleDebugPaste();
    };

    window.addEventListener('debug-paste-clipboard', handler);
    return () => {
      window.removeEventListener('debug-paste-clipboard', handler);
    };
  }, [setShowPasteWarning]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleForceSubmit = () => {
      void handleSubmit();
    };
    window.addEventListener('debug-force-submit', handleForceSubmit);
    return () => {
      window.removeEventListener('debug-force-submit', handleForceSubmit);
    };
  }, [handleSubmit]);

  // Auto-submit when time runs out
  useAutoSubmit({
    timeRemaining,
    hasSubmitted,
    onSubmit: handleSubmit,
    minPhaseAge: 5000, // 5 seconds for Phase 1
  });

  // Note: Phase transitions now happen via rankings page countdown
  // No need to navigate directly here - rankings page handles it

  // Track when component mounted and phase start time to prevent immediate modal on load
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
    
    // Only show if:
    // 1. Timer expired (timeRemaining === 0)
    // 2. User hasn't submitted
    // 3. Component has been mounted for at least minPhaseAge (prevents immediate show on load)
    // 4. OR batch ranking is in progress
    if (isBatchSubmitting) {
      // Batch ranking in progress - always show modal
      setShowRankingModal(true);
    } else if (timeRemaining === 0 && !hasSubmitted() && timeSinceMount >= minPhaseAge) {
      // Timer expired but not submitted yet - show calculating modal
      setShowRankingModal(true);
    } else if (hasSubmitted() && !isBatchSubmitting) {
      // Submission complete - close modal after brief delay
      const timer = setTimeout(() => {
        setShowRankingModal(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // Ensure modal is closed if none of the conditions are met
      setShowRankingModal(false);
    }
  }, [timeRemaining, isBatchSubmitting, hasSubmitted, setShowRankingModal]);

  // Prepare members list with word counts
  // CONDITIONAL RENDERS AFTER ALL HOOKS
  
  // Loading state
  if (isReconnecting || !session || !prompt) {
    return <LoadingState 
      message={isReconnecting ? 'Reconnecting to session...' : 'Loading session...'}
      variant={isReconnecting ? 'reconnecting' : 'default'}
    />;
  }
  
  // Error state
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

  // Show waiting screen if user has submitted
  if (hasSubmitted()) {
    // Convert session players to WaitingForPlayers format
    const partyMembers = players.map(p => ({
      name: p.displayName,
      userId: p.userId,
      avatar: p.avatar,
      rank: p.rank,
      isAI: p.isAI,
      isYou: p.userId === user?.uid,
    }));
    
    // Get list of players who have submitted
    const submittedPlayerIds = players
      .filter(p => p.phases.phase1?.submitted)
      .map(p => p.userId);
    
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
    <div className="min-h-screen bg-[#0c141d] text-white">
      {/* Calculating Scores Modal - Shows when timer expires and scores are being calculated */}
      <Modal
        isOpen={showRankingModal}
        onClose={() => {}} // Don't allow closing during calculation
        variant="ranking"
        showCloseButton={false}
      >
        <div className="text-6xl mb-6 animate-bounce">📊</div>
        <h2 className="text-3xl font-bold text-white mb-3">
          {timeRemaining === 0 ? "Time's Up!" : "Calculating Scores..."}
        </h2>
        <p className="text-white/70 text-lg mb-6">
          {isBatchSubmitting 
            ? "Evaluating writing quality and ranking responses..."
            : "Preparing your results..."}
        </p>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>
      </Modal>
      
      <WritingTipsModal
        isOpen={showTipsModal}
        onClose={() => setShowTipsModal(false)}
        promptType={prompt.type}
      />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0c141d]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#141e27] text-xl font-semibold">
              {formatTime(timeRemaining)}
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Phase 1 · Draft</div>
              <div className={`text-sm font-semibold ${timeRemaining > 0 ? getTimeColor(timeRemaining, { green: SCORING.TIME_PHASE1_GREEN, yellow: SCORING.TIME_GREEN_THRESHOLD }) : 'text-red-400'}`}>
                {timeRemaining > 0 ? 'Time remaining' : 'Time expired'}
              </div>
            </div>
            <div className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              Ranked circuit
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/60">
              <span className="font-semibold text-white">{wordCount}</span> words
            </div>
            <button
              onClick={() => setShowTipsModal(true)}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 font-semibold text-white transition hover:bg-white/10"
            >
              Writing tips
            </button>
          </div>
        </div>
        <div className="mx-auto h-1.5 max-w-6xl rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${timeRemaining > SCORING.TIME_PHASE1_GREEN ? 'bg-emerald-400' : timeRemaining > SCORING.TIME_GREEN_THRESHOLD ? 'bg-yellow-400' : 'bg-red-400'}`}
            style={{ width: `${(timeRemaining / SCORING.PHASE1_DURATION) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <PhaseInstructions phase={1} />
        
        <div className="grid gap-6 lg:grid-cols-[0.9fr,1.4fr,0.7fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-6">
              <div className="flex items-start gap-4">
                <div className="text-5xl">{prompt.image}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{prompt.title}</h2>
                    <span className="text-[11px] uppercase text-white/40">{prompt.type}</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">{prompt.description}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-6 space-y-4 text-sm text-white/60">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Phase reminders</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                Aim for 60+ words in 2 minutes. Quality over quantity—focus on clarity.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                Start with your main idea, then add one supporting detail quickly.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                Save 20 seconds for a quick proofread—catch obvious mistakes.
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative rounded-3xl border border-white/10 bg-white p-6 text-[#1b1f24] shadow-xl">
              <div className="flex items-center justify-between text-xs text-[#1b1f24]/60">
                <span>Draft in progress</span>
                <span>{wordCount} words</span>
              </div>
              <textarea
                value={writingContent}
                onChange={(e) => setWritingContent(e.target.value)}
                onPaste={handlePaste}
                onCopy={handleCut}
                onCut={handleCut}
                ref={textareaRef}
                placeholder="Start writing your response..."
                className="mt-4 h-[420px] w-full resize-none bg-transparent text-base leading-relaxed focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                autoFocus
                disabled={timeRemaining === 0}
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
                spellCheck="true"
              />
              {showPasteWarning && (
                <div className="absolute inset-x-0 top-6 mx-auto w-max rounded-full border border-red-500/40 bg-red-500/15 px-4 py-2 text-xs font-semibold text-red-200 shadow-lg">
                  Paste disabled during ranked drafts
                </div>
              )}
            </div>
            
            {/* No manual submit button - auto-submits when time expires */}
            <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center">
              <div className="text-white/60 text-sm mb-2">⏱️ Time-based submission</div>
              <div className="text-white font-semibold">
                {hasSubmitted() ? '✅ Submitted' : `Auto-submits in ${formatTime(timeRemaining)}`}
              </div>
              <div className="text-white/40 text-xs mt-2">
                Write until the timer expires. Your work will be automatically submitted.
                </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Squad tracker</div>
              <div className="mt-5 space-y-4">
                {membersWithCounts.map((member, index) => (
                  <div key={member.userId} className="space-y-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0c141d] text-xl">
                          {member.avatar}
                        </div>
                        <div>
                          <div className={`text-sm font-semibold ${member.isYou ? 'text-white' : 'text-white/80'}`}>{member.name}</div>
                          <div className="text-[11px] text-white/50">{member.rank}</div>
                        </div>
                      </div>
                      <div className="text-right text-sm font-semibold text-white">
                        {Math.floor(member.wordCount)}
                        <span className="ml-1 text-xs text-white/50">w</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div
                        className={`${member.isYou ? 'bg-emerald-300' : 'bg-white/40'} h-full rounded-full`}
                        style={{ width: `${Math.min((member.wordCount / 100) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-[10px] uppercase text-white/40">Slot {index + 1}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Removed useless submissions card per user feedback */}
          </aside>
        </div>
      </main>
    </div>
  );
}
