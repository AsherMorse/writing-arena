'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/shared/LoadingState';
import { Timer } from '../_components/Timer';
import { WritingEditor } from '../_components/WritingEditor';
import { PromptCard } from '../_components/PromptCard';
import { 
  FeedbackProvider,
  WritingCard,
  ExpandableScoreBreakdown,
} from '../_components/FeedbackDisplay';
import { FeedbackSidebar } from '../_components/FeedbackSidebar';
import { LoadingOverlay } from '../_components/LoadingOverlay';
import { Leaderboard } from '../_components/Leaderboard';
import { WinningSubmissions } from '../_components/WinningSubmissions';
import { RecommendedLessons } from '../_components/RecommendedLessons';
import { ScrollShadow } from '../_components/ScrollShadow';
import { ParchmentCard } from '../_components/ParchmentCard';
import { ParchmentButton } from '../_components/ParchmentButton';
import { ParchmentAccordion } from '../_components/ParchmentAccordion';
import { getParchmentTextStyle } from '../_components/parchment-styles';
import { RankedResultsModal } from '../_components/RankedResultsModal';
import { Top3CelebrationModal } from '../_components/Top3CelebrationModal';
import { getLeaderboard } from '@/lib/services/ranked-leaderboard';
import { getNextPromptForUser, formatDateString, getPromptById } from '@/lib/services/ranked-prompts';
import { getDebugDate, setDebugPromptId } from '@/lib/utils/debug-date';
import {
  createRankedSubmission,
  updateRankedSubmission,
  getUserSubmissionsForDate,
} from '@/lib/services/ranked-submissions';
import { checkBlockStatus, updateSkillGaps } from '@/lib/services/skill-gap-tracker';
import { getLessonDisplayName } from '@/lib/constants/lesson-display-names';
import { updateRankAfterRankedSubmission, getUserProfile, RankUpdateResult } from '@/lib/services/user-profile';
import { calculateRankedLP, getRequiredMode, getRankDisplayName } from '@/lib/utils/score-calculator';
import type { GradeResponse } from '../_lib/grading';
import type { RankedPrompt, RankedSubmission, BlockCheckResult, SkillLevel, SkillTier, SubmissionLevel, PromptOptions } from '@/lib/types';

type Phase = 'loading' | 'prompt' | 'selection' | 'write' | 'feedback' | 'revise' | 'results' | 'no_prompt' | 'blocked' | 'history';

const PARAGRAPH_WRITE_TIME = 7 * 60;
const PARAGRAPH_REVISE_TIME = 2 * 60;
const ESSAY_WRITE_TIME = 10 * 60;
const ESSAY_REVISE_TIME = 3 * 60;

export default function RankedPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [phase, setPhase] = useState<Phase>('loading');
  const [currentPrompt, setCurrentPrompt] = useState<RankedPrompt | null>(null);
  const [todayString, setTodayString] = useState('');
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [originalResponse, setOriginalResponse] = useState<GradeResponse | null>(null);
  const [response, setResponse] = useState<GradeResponse | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [blockStatus, setBlockStatus] = useState<BlockCheckResult | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [pastSubmissions, setPastSubmissions] = useState<RankedSubmission[]>([]);
  /** Prompt texts keyed by promptId for displaying in history view */
  const [promptTexts, setPromptTexts] = useState<Record<string, string>>({});
  /** Which accordion panel is currently open (exclusive - only one at a time) */
  const [openPanel, setOpenPanel] = useState<'hints' | 'fixes' | null>(null);
  /** Generated background info for inspiration */
  const [inspirationContent, setInspirationContent] = useState<string | null>(null);
  /** Loading state for inspiration generation */
  const [isLoadingInspiration, setIsLoadingInspiration] = useState(false);
  /** Track rank changes for UI feedback */
  const [rankUpdate, setRankUpdate] = useState<RankUpdateResult | null>(null);
  /** User's current skill level for mode locking */
  const [userSkillLevel, setUserSkillLevel] = useState<SkillLevel>('scribe');
  const [userSkillTier, setUserSkillTier] = useState<SkillTier>(3);
  /** The submission level/mode for this ranked session (based on skill level) */
  const [submissionMode, setSubmissionMode] = useState<SubmissionLevel>('paragraph');
  /** Modal visibility states */
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  /** User's placement in the leaderboard */
  const [userPlacement, setUserPlacement] = useState<number | null>(null);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  /** Selection phase state */
  const [promptOptions, setPromptOptions] = useState<PromptOptions | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [isLoadingSelection, setIsLoadingSelection] = useState(false);

  const fetchTodaysPrompt = useCallback(async () => {
    if (!user) return;

    setPhase('loading');
    setSubmissionId(null);
    setBlockStatus(null);

    try {
      const today = getDebugDate();
      setTodayString(formatDateString(today));

      // Get user's skill level to determine which mode they're locked to
      const profile = await getUserProfile(user.uid);
      const skillLevel = profile?.skillLevel ?? 'scribe';
      const skillTier = profile?.skillTier ?? 3;
      setUserSkillLevel(skillLevel);
      setUserSkillTier(skillTier);
      
      // Determine the required mode based on skill level
      const requiredMode = getRequiredMode(skillLevel);
      setSubmissionMode(requiredMode);
      
      // For now, only paragraph prompts are supported
      // essay_passage mode shows a coming soon message
      if (requiredMode === 'essay_passage') {
        setCurrentPrompt(null);
        setPhase('no_prompt');
        return;
      }

      // Check if user is blocked from ranked
      const blockResult = await checkBlockStatus(user.uid);
      if (blockResult.blocked) {
        setBlockStatus(blockResult);
        
        // Still fetch past submissions so user can view their history
        const submissions = await getUserSubmissionsForDate(user.uid, formatDateString(today), 'paragraph');
        if (submissions.length > 0) {
          setPastSubmissions(submissions);
          setCompletedCount(submissions.length);
          
          // Fetch prompt texts for past submissions
          const promptPromises = submissions.map((s) => getPromptById(s.promptId));
          const prompts = await Promise.all(promptPromises);
          const texts: Record<string, string> = {};
          prompts.forEach((p) => {
            if (p) texts[p.id] = p.promptText;
          });
          setPromptTexts(texts);
        }
        
        setPhase('blocked');
        return;
      }

      if (blockResult.warnings?.length) {
        setBlockStatus(blockResult);
      }

      const result = await getNextPromptForUser(user.uid, 'paragraph');

      if (!result.prompt) {
        setCurrentPrompt(null);
        setPhase('no_prompt');
        return;
      }

      setCurrentPrompt(result.prompt);
      setPromptIndex(result.promptIndex);
      setCompletedCount(result.completedCount);
      
      if (result.completedCount > 0) {
        const submissions = await getUserSubmissionsForDate(user.uid, formatDateString(today), 'paragraph');
        setPastSubmissions(submissions);
        
        // Fetch prompt texts for past submissions
        const promptPromises = submissions.map((s) => getPromptById(s.promptId));
        const prompts = await Promise.all(promptPromises);
        const texts: Record<string, string> = {};
        prompts.forEach((p) => {
          if (p) texts[p.id] = p.promptText;
        });
        setPromptTexts(texts);
      }
      
      setPhase('prompt');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompt');
      setPhase('prompt');
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/fantasy/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (currentPrompt) {
      setDebugPromptId(currentPrompt.id);
    }
    return () => {
      setDebugPromptId(undefined);
    };
  }, [currentPrompt]);

  // Generate and persist inspiration if missing from prompt
  useEffect(() => {
    async function generateMissingInspiration() {
      if (!currentPrompt || currentPrompt.inspirationText) return;

      setIsLoadingInspiration(true);
      try {
        const response = await fetch('/fantasy/api/generate-inspiration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: currentPrompt.promptText }),
        });

        if (!response.ok) return;
        const { backgroundInfo } = await response.json();
        if (!backgroundInfo) return;

        // Save to Firestore for future users
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/config/firebase');
        await updateDoc(doc(db, 'rankedPrompts', currentPrompt.id), {
          inspirationText: backgroundInfo,
        });

        // Update local state
        setCurrentPrompt(prev => prev ? { ...prev, inspirationText: backgroundInfo } : null);
      } catch (error) {
        console.error('Failed to generate inspiration:', error);
      } finally {
        setIsLoadingInspiration(false);
      }
    }

    generateMissingInspiration();
  }, [currentPrompt?.id, currentPrompt?.inspirationText, currentPrompt?.promptText]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchTodaysPrompt();
    }
  }, [user, authLoading, fetchTodaysPrompt]);

  const handleBack = useCallback(() => {
    const hasUnsavedWork = phase === 'write' || phase === 'revise';
    if (hasUnsavedWork) {
      if (window.confirm('You have unsaved work. Are you sure you want to leave?')) {
        router.push('/fantasy/home');
      }
    } else {
      router.push('/fantasy/home');
    }
  }, [phase, router]);

  /** Start selection phase - fetch options from API */
  const beginSelection = useCallback(async () => {
    if (!currentPrompt) return;
    
    setIsLoadingSelection(true);
    setSelectionError(null);
    setCustomInput('');
    
    try {
      // Get topic and angle from the current prompt
      const topic = currentPrompt.topic || 'Writing';
      // Use a default angle or extract from prompt context
      const angle = 'Focus on why people find this topic interesting or enjoyable';
      
      const response = await fetch('/fantasy/api/daily-prompt/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, angle }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to load options');
      }
      
      const options: PromptOptions = await response.json();
      setPromptOptions(options);
      setPhase('selection');
    } catch (err) {
      // Fallback: skip selection and go directly to writing
      console.error('Failed to fetch options:', err);
      setPhase('write');
    } finally {
      setIsLoadingSelection(false);
    }
  }, [currentPrompt]);

  /** Handle selection of a topic option */
  const handleSelection = useCallback(async (selection: string) => {
    if (!promptOptions || !currentPrompt) return;
    
    // Client-side quick filter for obviously inappropriate input
    const blockedPatterns = [
      /\b(fuck|shit|ass|damn|bitch|sex|porn|kill|murder|gun|drug)\b/i,
    ];
    if (blockedPatterns.some(pattern => pattern.test(selection))) {
      setSelectionError("Let's pick something else!");
      return;
    }
    
    setIsLoadingSelection(true);
    setSelectionError(null);
    
    try {
      const response = await fetch('/fantasy/api/daily-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: promptOptions.topic,
          angle: promptOptions.angle,
          question: promptOptions.question,
          selection,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }
      
      const data = await response.json();
      
      if (data.valid === false) {
        setSelectionError(data.reason || 'Please try a different selection.');
        setIsLoadingSelection(false);
        return;
      }
      
      // Update prompt with personalized text (clear old inspiration)
      setCurrentPrompt(prev => prev ? { 
        ...prev, 
        promptText: data.promptText,
        inspirationText: undefined, // Clear so it regenerates for personalized prompt
      } : null);
      
      // Generate inspiration for the personalized prompt (non-blocking)
      setIsLoadingInspiration(true);
      fetch('/fantasy/api/generate-inspiration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: data.promptText }),
      })
        .then(res => res.ok ? res.json() : null)
        .then(inspData => {
          if (inspData?.backgroundInfo) {
            setCurrentPrompt(prev => prev ? { 
              ...prev, 
              inspirationText: inspData.backgroundInfo 
            } : null);
          }
        })
        .catch(() => {}) // Silently fail - inspiration is optional
        .finally(() => setIsLoadingInspiration(false));
      
      setPhase('write');
    } catch (err) {
      setSelectionError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoadingSelection(false);
    }
  }, [promptOptions, currentPrompt]);

  const beginWriting = useCallback(() => {
    setContent('');
    setOriginalContent('');
    setOriginalResponse(null);
    setResponse(null);
    setError(null);
    setPhase('write');
  }, []);

  const getPromptText = (): string => {
    return currentPrompt?.promptText || '';
  };

  const submitWriting = useCallback(async () => {
    if (!content.trim() || !currentPrompt || !user) return;

    setIsGrading(true);
    setError(null);
    setRankUpdate(null);

    // Generate a unique ID for gap tracking (will be used as reference)
    const gapTrackingId = crypto.randomUUID();

    try {
      const res = await fetch('/fantasy/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          prompt: getPromptText(),
          type: submissionMode,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Grading failed');
      }

      const data: GradeResponse = await res.json();

      // Note: LP is NOT awarded yet - user must complete revision to earn LP
      // Submission record created with lpEarned = 0 (will be updated after revision)
      const newSubmissionId = await createRankedSubmission(
        user.uid,
        currentPrompt.id,
        submissionMode,
        content,
        data.result.scores.percentage,
        data.result as unknown as Record<string, unknown>,
        0, // LP awarded after revision
        currentPrompt.promptText // Store the user's personalized prompt
      );
      setSubmissionId(newSubmissionId);

      // Track skill gaps client-side (has auth context)
      if (data.gaps.length > 0) {
        try {
          await updateSkillGaps(user.uid, data.gaps, 'ranked', gapTrackingId);
        } catch (gapErr) {
          console.error('Failed to track skill gaps:', gapErr);
        }
      }

      setOriginalContent(content);
      setOriginalResponse(data);
      setResponse(data);
      setPhase('feedback');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGrading(false);
    }
  }, [content, currentPrompt, user, submissionMode]);

  const submitRevision = useCallback(async () => {
    if (!originalResponse || !content.trim() || !currentPrompt || !submissionId || !user) return;

    setIsGrading(true);
    setError(null);

    const gapTrackingId = crypto.randomUUID();

    try {
      const res = await fetch('/fantasy/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          prompt: getPromptText(),
          type: submissionMode,
          previousResult: originalResponse.result,
          previousContent: originalContent,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Grading failed');
      }

      const data: GradeResponse = await res.json();
      const wordCount = originalContent.split(/\s+/).length;

      // Award tier LP using effective score (90% original + 10% revised)
      // This is the only time LP is awarded for this submission
      const rankResult = await updateRankAfterRankedSubmission(
        user.uid,
        originalResponse.result.scores.percentage,
        data.result.scores.percentage,
        wordCount
      );
      setRankUpdate(rankResult);

      // Use LP earned for submission record (for leaderboard tracking)
      const lpEarned = rankResult?.lpChange ?? calculateRankedLP(data.result.scores.percentage);

      // Update submission with revised score and LP
      await updateRankedSubmission(
        submissionId,
        content,
        data.result.scores.percentage,
        data.result as unknown as Record<string, unknown>,
        Math.max(0, lpEarned) // Store positive LP for leaderboard
      );

      if (data.gaps.length > 0) {
        try {
          await updateSkillGaps(user.uid, data.gaps, 'ranked', gapTrackingId);
        } catch (gapErr) {
          console.error('Failed to track skill gaps:', gapErr);
        }
      }

      setResponse(data);

      // Fetch leaderboard to get user's placement
      try {
        const leaderboardData = await getLeaderboard(currentPrompt.id, user.uid);
        setUserPlacement(leaderboardData.userRank);
        setTotalSubmissions(leaderboardData.totalSubmissions);
      } catch (leaderboardErr) {
        console.error('Failed to fetch leaderboard:', leaderboardErr);
        setUserPlacement(null);
        setTotalSubmissions(0);
      }

      // Show results modal before transitioning to results phase
      setShowResultsModal(true);
      setPhase('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGrading(false);
    }
  }, [content, originalResponse, originalContent, currentPrompt, submissionId, user, submissionMode]);

  const handleTimerComplete = useCallback(() => {
    if (!content.trim()) {
      setError(`Time's up! You need to write something to submit. Click "Start Over" to try again.`);
      return;
    }
    if (phase === 'write') {
      submitWriting();
    } else if (phase === 'revise') {
      submitRevision();
    }
  }, [content, phase, submitWriting, submitRevision]);

  const startRevision = useCallback(() => {
    setPhase('revise');
    setOpenPanel('fixes'); // Things to Fix expanded by default in revision
  }, []);

  const reset = useCallback(() => {
    setContent('');
    setOriginalContent('');
    setOriginalResponse(null);
    setResponse(null);
    setError(null);
    setPhase('prompt');
    setOpenPanel(null);
    setRankUpdate(null);
    setShowResultsModal(false);
    setShowCelebrationModal(false);
    setUserPlacement(null);
    setTotalSubmissions(0);
    setPromptOptions(null);
    setCustomInput('');
    setSelectionError(null);
  }, []);

  const continueToNextChallenge = useCallback(() => {
    setContent('');
    setOriginalContent('');
    setOriginalResponse(null);
    setResponse(null);
    setError(null);
    setOpenPanel(null);
    setRankUpdate(null);
    setShowResultsModal(false);
    setShowCelebrationModal(false);
    setUserPlacement(null);
    setTotalSubmissions(0);
    setPromptOptions(null);
    setCustomInput('');
    setSelectionError(null);
    fetchTodaysPrompt();
  }, [fetchTodaysPrompt]);

  const viewHistory = useCallback(() => {
    setPhase('history');
  }, []);

  const backToPrompt = useCallback(() => {
    setPhase('prompt');
  }, []);

  const handleInspirationToggle = useCallback(() => {
    setOpenPanel(prev => prev === 'hints' ? null : 'hints');
  }, []);

  /** Handle closing the results modal - show celebration if top 3 */
  const handleResultsModalClose = useCallback(() => {
    setShowResultsModal(false);
    // Show celebration modal if user placed in top 3
    if (userPlacement !== null && userPlacement <= 3) {
      setShowCelebrationModal(true);
    }
  }, [userPlacement]);

  /** Handle closing the celebration modal */
  const handleCelebrationModalClose = useCallback(() => {
    setShowCelebrationModal(false);
  }, []);

  useEffect(() => {
    const handleFillEditor = () => {
      setContent('This is sample text filled by the debug menu for testing purposes. It contains enough content to submit and test the grading flow without having to type manually.');
    };

    const handlePasteClipboard = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail) {
        setContent(customEvent.detail);
      }
    };

    const handleForceSubmit = () => {
      if (phase === 'write') {
        submitWriting();
      } else if (phase === 'revise') {
        submitRevision();
      }
    };

    const handleSkipToResults = () => {
      if (originalResponse && response) {
        setPhase('results');
      }
    };

    window.addEventListener('debug-fill-editor', handleFillEditor);
    window.addEventListener('debug-paste-clipboard', handlePasteClipboard);
    window.addEventListener('debug-force-submit', handleForceSubmit);
    window.addEventListener('debug-skip-to-results', handleSkipToResults);

    return () => {
      window.removeEventListener('debug-fill-editor', handleFillEditor);
      window.removeEventListener('debug-paste-clipboard', handlePasteClipboard);
      window.removeEventListener('debug-force-submit', handleForceSubmit);
      window.removeEventListener('debug-skip-to-results', handleSkipToResults);
    };
  }, [phase, originalResponse, response, submitWriting, submitRevision]);

  if (authLoading || phase === 'loading') {
    return <LoadingState message="Preparing your challenge..." />;
  }

  if (!user) {
    return null;
  }

  const canSubmit = content.trim().length > 0 && !isGrading;
  const promptText = getPromptText();

  return (
    <div className="relative min-h-screen">
      {isGrading && <LoadingOverlay />}

      <Image
        src="/images/backgrounds/battle.webp"
        alt=""
        fill
        className="object-cover"
        priority
      />

      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="p-4">
          <button
            onClick={handleBack}
            className="font-memento text-sm uppercase tracking-wider"
            style={{ color: 'rgba(245, 230, 184, 0.6)' }}
          >
            ← Back
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
          {phase === 'no_prompt' && (
            <div className="w-full max-w-2xl text-center space-y-8">
              <div>
                {submissionMode === 'essay_passage' ? (
                  <>
                    <h1
                      className="font-dutch809 text-4xl mb-2"
                      style={{
                        color: '#f6d493',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                      }}
                    >
                      Coming Soon
                    </h1>
                    <p
                      className="font-avenir text-lg"
                      style={{ color: 'rgba(245, 230, 184, 0.7)' }}
                    >
                      Essay + Passage challenges are not yet available.
                    </p>
                    <p
                      className="font-avenir text-base mt-4"
                      style={{ color: 'rgba(245, 230, 184, 0.5)' }}
                    >
                      As a {getRankDisplayName(userSkillLevel, userSkillTier)}, you&apos;ve unlocked the highest tier!
                      <br />
                      Check back soon for new challenges.
                    </p>
                  </>
                ) : (
                  <>
                    <h1
                      className="font-dutch809 text-4xl mb-2"
                      style={{
                        color: '#f6d493',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                      }}
                    >
                      No Challenge Today
                    </h1>
                    <p
                      className="font-avenir text-lg"
                      style={{ color: 'rgba(245, 230, 184, 0.7)' }}
                    >
                      Check back tomorrow for a new daily challenge!
                    </p>
                  </>
                )}
                {todayString && (
                  <p
                    className="font-avenir text-sm mt-2"
                    style={{ color: 'rgba(245, 230, 184, 0.4)' }}
                  >
                    Date: {todayString}
                  </p>
                )}
              </div>

              <ParchmentButton onClick={() => router.push('/fantasy/home')}>
                Return Home
              </ParchmentButton>
            </div>
          )}

          {phase === 'blocked' && blockStatus && (
            <div className="w-full max-w-2xl text-center space-y-8">
              <div>
                <h1
                  className="font-dutch809 text-4xl mb-2"
                  style={{
                    color: '#f6d493',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  Practice Required
                </h1>
                <p
                  className="font-avenir text-lg"
                  style={{ color: 'rgba(245, 230, 184, 0.7)' }}
                >
                  {blockStatus.reason === 'high_severity'
                    ? 'A critical skill gap needs attention before continuing ranked challenges.'
                    : 'Persistent skill gaps have been detected. Complete the recommended lessons to unlock ranked mode.'}
                </p>
              </div>

              <div
                className="rounded-lg p-6"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(245, 230, 184, 0.2)',
                }}
              >
                <h3
                  className="font-memento text-sm uppercase tracking-wider mb-4"
                  style={{ color: 'rgba(245, 230, 184, 0.6)' }}
                >
                  Skills to Improve
                </h3>
                <div className="space-y-2">
                  {blockStatus.blockingGaps.map((gap) => (
                    <div
                      key={gap}
                      className="font-avenir text-base"
                      style={{ color: '#fbbf24' }}
                    >
                      • {gap}
                    </div>
                  ))}
                </div>
              </div>

              {blockStatus.requiredLessons.length > 0 && (
                <div
                  className="rounded-lg p-6"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(245, 230, 184, 0.2)',
                  }}
                >
                  <h3
                    className="font-memento text-sm uppercase tracking-wider mb-4"
                    style={{ color: 'rgba(245, 230, 184, 0.6)' }}
                  >
                    Required Lessons
                  </h3>
                  <div className="space-y-2">
                    {blockStatus.requiredLessons.slice(0, 5).map((lesson) => (
                      <div
                        key={lesson}
                        className="font-avenir text-base"
                        style={{ color: 'rgba(245, 230, 184, 0.9)' }}
                      >
                        • {getLessonDisplayName(lesson)}
                      </div>
                    ))}
                    {blockStatus.requiredLessons.length > 5 && (
                      <div
                        className="font-avenir text-sm"
                        style={{ color: 'rgba(245, 230, 184, 0.5)' }}
                      >
                        +{blockStatus.requiredLessons.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-4">
                <ParchmentButton onClick={() => router.push('/fantasy/home')}>
                  Return Home
                </ParchmentButton>
                {completedCount > 0 && (
                  <ParchmentButton onClick={viewHistory}>
                    View Past Challenges
                  </ParchmentButton>
                )}
                <ParchmentButton onClick={() => router.push('/fantasy/study')} variant="golden">
                  Go to Practice
                </ParchmentButton>
              </div>
            </div>
          )}

          {phase === 'prompt' && !currentPrompt && error && (
            <div className="w-full max-w-2xl text-center space-y-8">
              <div>
                <h1
                  className="font-dutch809 text-4xl mb-2"
                  style={{
                    color: '#f6d493',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  Something went wrong
                </h1>
                <p className="text-red-400">{error}</p>
              </div>
              <ParchmentButton onClick={fetchTodaysPrompt}>
                Try Again
              </ParchmentButton>
            </div>
          )}

          {phase === 'prompt' && currentPrompt && (
            <div className="w-full max-w-2xl text-center space-y-8">
              <div>
                <p
                  className="font-memento text-sm uppercase tracking-wider mb-2"
                  style={{ color: 'rgba(245, 230, 184, 0.5)' }}
                >
                  {getRankDisplayName(userSkillLevel, userSkillTier)} • {submissionMode === 'paragraph' ? 'Paragraph' : 'Essay'} Mode
                </p>
                <h1
                  className="font-dutch809 text-4xl mb-2"
                  style={{
                    color: '#f6d493',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  Daily Challenge #{promptIndex + 1}
                </h1>
                <p
                  className="font-avenir text-lg"
                  style={{ color: 'rgba(245, 230, 184, 0.7)' }}
                >
                  {submissionMode === 'paragraph' 
                    ? 'You have 7 minutes to write, then 2 minutes to revise'
                    : 'You have 10 minutes to write, then 3 minutes to revise'}
                </p>
                {completedCount > 0 && (
                  <p
                    className="font-avenir text-sm mt-1"
                    style={{ color: 'rgba(245, 230, 184, 0.5)' }}
                  >
                    {completedCount} challenge{completedCount !== 1 ? 's' : ''} completed today
                  </p>
                )}
              </div>

              {/* Warning banner for approaching block threshold */}
              {blockStatus?.warnings && blockStatus.warnings.length > 0 && (
                <div
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: 'rgba(251, 191, 36, 0.15)',
                    border: '1px solid rgba(251, 191, 36, 0.4)',
                  }}
                >
                  <p
                    className="font-avenir text-sm"
                    style={{ color: '#fbbf24' }}
                  >
                    ⚠️ You&apos;re approaching the limit for: {blockStatus.warnings.join(', ')}. 
                    Consider practicing these skills to avoid being blocked.
                  </p>
                </div>
              )}

              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}

              <div className="flex justify-center gap-4">
                {completedCount > 0 && (
                  <ParchmentButton onClick={viewHistory}>
                    View Past Challenges
                  </ParchmentButton>
                )}
                <ParchmentButton onClick={beginSelection} disabled={isLoadingSelection} variant="golden">
                  {isLoadingSelection ? 'Loading...' : 'Begin Writing'}
                </ParchmentButton>
              </div>
            </div>
          )}

          {phase === 'selection' && promptOptions && (
            <div className="w-full max-w-2xl text-center space-y-8">
              <div>
                <p
                  className="font-memento text-sm uppercase tracking-wider mb-2"
                  style={{ color: 'rgba(245, 230, 184, 0.5)' }}
                >
                  Today&apos;s Topic: {promptOptions.topic}
                </p>
                <h1
                  className="font-dutch809 text-3xl mb-4"
                  style={{
                    color: '#f6d493',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  {promptOptions.question}
                </h1>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-3">
                {promptOptions.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelection(option)}
                    disabled={isLoadingSelection}
                    className="font-avenir text-base py-3 px-4 rounded-lg transition-all"
                    style={{
                      backgroundColor: 'rgba(245, 230, 184, 0.1)',
                      border: '1px solid rgba(245, 230, 184, 0.3)',
                      color: 'rgba(245, 230, 184, 0.9)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(245, 230, 184, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(245, 230, 184, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(245, 230, 184, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(245, 230, 184, 0.3)';
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Or type your own..."
                  disabled={isLoadingSelection}
                  className="flex-1 font-avenir text-base py-3 px-4 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(245, 230, 184, 0.3)',
                    color: 'rgba(245, 230, 184, 0.9)',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customInput.trim()) {
                      handleSelection(customInput.trim());
                    }
                  }}
                />
                <ParchmentButton
                  onClick={() => handleSelection(customInput.trim())}
                  disabled={!customInput.trim() || isLoadingSelection}
                  variant="golden"
                >
                  {isLoadingSelection ? '...' : 'Go'}
                </ParchmentButton>
              </div>

              {/* Error Message */}
              {selectionError && (
                <div
                  className="font-avenir text-sm py-2 px-4 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(251, 191, 36, 0.15)',
                    border: '1px solid rgba(251, 191, 36, 0.4)',
                    color: '#fbbf24',
                  }}
                >
                  ⚠️ {selectionError}
                </div>
              )}

              {/* Back button */}
              <div>
                <button
                  onClick={backToPrompt}
                  className="font-memento text-sm uppercase tracking-wider"
                  style={{ color: 'rgba(245, 230, 184, 0.5)' }}
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {phase === 'history' && (
            <div className="w-full max-w-3xl space-y-4">
              <div className="flex gap-4 items-stretch">
                <div className="flex-1">
                  <ParchmentCard className="h-full flex items-center">
                    <h1 
                      className="font-memento text-2xl tracking-wide" 
                      style={getParchmentTextStyle()}
                    >
                      Today&apos;s Challenges
                    </h1>
                  </ParchmentCard>
                </div>
                <div className="shrink-0">
                  <ParchmentCard className="h-full flex items-center justify-center px-6">
                    <div className="text-center">
                      <div
                        className="font-dutch809 text-2xl"
                        style={getParchmentTextStyle()}
                      >
                        {completedCount}
                      </div>
                      <div className="font-avenir text-xs" style={getParchmentTextStyle()}>
                        completed
                      </div>
                    </div>
                  </ParchmentCard>
                </div>
              </div>

              {pastSubmissions.map((submission, index) => {
                const promptNumber = index + 1;
                const score = submission.revisedScore ?? submission.originalScore;
                const promptText = promptTexts[submission.promptId];
                return (
                  <ParchmentCard key={submission.id}>
                    <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid rgba(42, 31, 20, 0.2)' }}>
                      <div className="flex-1 mr-4">
                        <h2
                          className="font-memento text-lg tracking-wide"
                          style={getParchmentTextStyle()}
                        >
                          Challenge #{promptNumber}
                        </h2>
                        <p className="font-avenir text-sm mt-2 leading-relaxed" style={{ ...getParchmentTextStyle(), opacity: 0.85 }}>
                          {promptText || 'Loading prompt...'}
                        </p>
                      </div>
                      <div className="text-center ml-4">
                        <div
                          className="font-dutch809 text-3xl"
                          style={getParchmentTextStyle()}
                        >
                          {score}%
                        </div>
                        {submission.revisedScore !== undefined && submission.revisedScore !== submission.originalScore && (
                          <div className="font-avenir text-xs" style={{ color: submission.revisedScore > submission.originalScore ? '#16a34a' : '#d97706' }}>
                            {submission.originalScore}% → {submission.revisedScore}%
                          </div>
                        )}
                      </div>
                    </div>
                    <Leaderboard promptId={submission.promptId} userId={user?.uid} embedded />
                  </ParchmentCard>
                );
              })}

              <div className="flex justify-center gap-4 pt-4">
                <ParchmentButton onClick={backToPrompt}>
                  Back
                </ParchmentButton>
                <ParchmentButton onClick={beginSelection} disabled={isLoadingSelection} variant="golden">
                  {isLoadingSelection ? 'Loading...' : 'Start Next Challenge'}
                </ParchmentButton>
              </div>
            </div>
          )}

          {phase === 'write' && currentPrompt && (
            <div className="w-full max-w-4xl space-y-4">
              {/* Header row: Title (left) + Timer (right) - same height */}
              <div className="flex gap-4 items-stretch">
                <div className="flex-1">
                  <ParchmentCard className="h-full flex items-center">
                    <h1 
                      className="font-memento text-2xl tracking-wide" 
                      style={getParchmentTextStyle()}
                    >
                      Daily Challenge #{promptIndex + 1}
                    </h1>
                  </ParchmentCard>
                </div>
                <div className="w-48 shrink-0">
                  <Timer
                    key={phase}
                    seconds={submissionMode === 'essay' ? ESSAY_WRITE_TIME : PARAGRAPH_WRITE_TIME}
                    onComplete={handleTimerComplete}
                    parchmentStyle
                    className="h-full"
                  />
                </div>
              </div>

              {/* Two column layout */}
              <div className="flex gap-4">
                {/* Left column: Prompt, Editor */}
                <div className="flex-1 space-y-4">
                  <PromptCard prompt={promptText} />

                  <WritingEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Begin your response..."
                    showRequirements={false}
                    preventPaste
                  />

                  {error && (
                    <div className="text-center space-y-4">
                      <div className="text-red-400 text-sm">{error}</div>
                      <ParchmentButton onClick={reset}>
                        Start Over
                      </ParchmentButton>
                    </div>
                  )}
                </div>

                {/* Right column: Inspiration accordion at top, Submit at bottom */}
                <div className="w-48 flex flex-col">
                  <ParchmentAccordion
                    title="Get Inspiration"
                    icon="lightbulb"
                    isOpen={openPanel === 'hints'}
                    onToggle={handleInspirationToggle}
                    maxHeight="250px"
                  >
                    {currentPrompt?.inspirationText ? (
                      <p className="font-avenir text-sm leading-relaxed" style={getParchmentTextStyle()}>
                        {currentPrompt.inspirationText}
                      </p>
                    ) : isLoadingInspiration ? (
                      <p className="font-avenir text-sm italic" style={{ ...getParchmentTextStyle(), opacity: 0.7 }}>
                        Generating inspiration...
                      </p>
                    ) : (
                      <p className="font-avenir text-sm italic" style={{ ...getParchmentTextStyle(), opacity: 0.7 }}>
                        No background info available
                      </p>
                    )}
                  </ParchmentAccordion>

                  <div className="mt-auto">
                    {!error && (
                      <ParchmentButton onClick={submitWriting} disabled={!canSubmit} variant="golden" className="w-full">
                        {isGrading ? 'Grading...' : 'Submit'}
                      </ParchmentButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {phase === 'feedback' && response && currentPrompt && (
            <div className="w-full max-w-5xl space-y-4">
              {/* Header row: Title (left) + Score (right) - same height */}
              <div className="flex gap-4 items-stretch">
                <div className="flex-1">
                  <ParchmentCard className="h-full flex items-center">
                    <h1 
                      className="font-memento text-2xl tracking-wide" 
                      style={getParchmentTextStyle()}
                    >
                      Feedback
                    </h1>
                  </ParchmentCard>
                </div>
                <div className="w-80 shrink-0">
                  <ParchmentCard className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className="font-dutch809 text-4xl"
                        style={getParchmentTextStyle()}
                      >
                        {response.result.scores.percentage}%
                      </div>
                      <div className="font-avenir text-xs" style={getParchmentTextStyle()}>
                        {response.result.scores.total}/{response.result.scores.maxTotal} points
                      </div>
                    </div>
                  </ParchmentCard>
                </div>
              </div>

              {/* Two column layout - constrained height so buttons stay anchored */}
              <FeedbackProvider>
                <div className="flex gap-4 items-start">
                  {/* Left column: Your Writing + Practice Recommended */}
                  <ScrollShadow className="flex-1" contentClassName="space-y-4" maxHeight="calc(100vh - 250px)">
                    <WritingCard content={originalContent} />
                    
                    {response.prioritizedLessons.length > 0 && (
                      <RecommendedLessons
                        lessons={response.prioritizedLessons}
                        hasSevereGap={response.hasSevereGap}
                        showPracticeButton={false}
                      />
                    )}
                  </ScrollShadow>

                  {/* Right column: Expandable Score Breakdown (scrollable) */}
                  <ScrollShadow className="w-80 shrink-0" maxHeight="calc(100vh - 274px)">
                    <ExpandableScoreBreakdown 
                      scores={response.result.scores} 
                      remarks={response.result.remarks} 
                    />
                  </ScrollShadow>
                </div>
              </FeedbackProvider>

              <div className="flex justify-center gap-4">
                <ParchmentButton onClick={reset}>
                  Start Over
                </ParchmentButton>
                {response.prioritizedLessons.length > 0 && (
                  <ParchmentButton onClick={() => router.push('/improve/activities')}>
                    Practice
                  </ParchmentButton>
                )}
                <ParchmentButton onClick={startRevision} variant="golden">
                  Revise Your Work
                </ParchmentButton>
              </div>
            </div>
          )}

          {phase === 'revise' && originalResponse && currentPrompt && (
            <div className="w-full max-w-4xl space-y-4">
              {/* Header row: Title (left) + Timer (right) - same height */}
              <div className="flex gap-4 items-stretch">
                <div className="flex-1">
                  <ParchmentCard className="h-full flex items-center">
                    <h1 
                      className="font-memento text-2xl tracking-wide" 
                      style={getParchmentTextStyle()}
                    >
                      Revision
                    </h1>
                  </ParchmentCard>
                </div>
                <div className="w-64 shrink-0">
                  <Timer
                    key={phase}
                    seconds={submissionMode === 'essay' ? ESSAY_REVISE_TIME : PARAGRAPH_REVISE_TIME}
                    onComplete={handleTimerComplete}
                    parchmentStyle
                    className="h-full"
                  />
                </div>
              </div>

              {/* Two column layout */}
              <div className="flex gap-4">
                {/* Left column: Prompt, Editor */}
                <div className="flex-1 space-y-4">
                  <PromptCard prompt={promptText} />

                  <WritingEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Revise your response..."
                    showRequirements={false}
                    rows={12}
                    preventPaste
                  />

                  {error && (
                    <div className="text-center space-y-4">
                      <div className="text-red-400 text-sm">{error}</div>
                      <ParchmentButton onClick={reset}>
                        Start Over
                      </ParchmentButton>
                    </div>
                  )}
                </div>

                {/* Right column: Accordions at top, Submit at bottom */}
                <div className="w-64 shrink-0 flex flex-col space-y-2">
                  {/* Inspiration accordion */}
                  <ParchmentAccordion
                    title="Get Inspiration"
                    icon="lightbulb"
                    isOpen={openPanel === 'hints'}
                    onToggle={handleInspirationToggle}
                    maxHeight="250px"
                  >
                    {currentPrompt?.inspirationText ? (
                      <p className="font-avenir text-sm leading-relaxed" style={getParchmentTextStyle()}>
                        {currentPrompt.inspirationText}
                      </p>
                    ) : isLoadingInspiration ? (
                      <p className="font-avenir text-sm italic" style={{ ...getParchmentTextStyle(), opacity: 0.7 }}>
                        Generating inspiration...
                      </p>
                    ) : (
                      <p className="font-avenir text-sm italic" style={{ ...getParchmentTextStyle(), opacity: 0.7 }}>
                        No background info available
                      </p>
                    )}
                  </ParchmentAccordion>

                  {/* Things to Fix accordion - expanded by default */}
                  <ParchmentAccordion
                    title="Things to Fix"
                    icon="wrench"
                    isOpen={openPanel === 'fixes'}
                    onToggle={() => setOpenPanel(prev => prev === 'fixes' ? null : 'fixes')}
                    maxHeight="300px"
                  >
                    {originalResponse.result.remarks.length === 0 ? (
                      <div className="text-center">
                        <span className="font-avenir text-sm" style={{ ...getParchmentTextStyle(), color: '#15803d' }}>
                          Great job! No issues to fix.
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {originalResponse.result.remarks.map((remark, i) => (
                          <div key={i} className="flex gap-2 items-start">
                            <div
                              className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                              style={{ background: remark.severity === 'error' ? '#b91c1c' : '#b45309' }}
                            />
                            <div>
                              <p className="font-avenir text-sm" style={getParchmentTextStyle()}>
                                {remark.concreteProblem}
                              </p>
                              <p className="font-avenir text-xs mt-1" style={{ ...getParchmentTextStyle(), opacity: 0.7 }}>
                                {remark.callToAction}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ParchmentAccordion>

                  <div className="mt-auto pt-2">
                    {!error && (
                      <ParchmentButton onClick={submitRevision} disabled={!canSubmit} variant="golden" className="w-full">
                        {isGrading ? 'Grading...' : 'Submit Revision'}
                      </ParchmentButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {phase === 'results' && response && originalResponse && currentPrompt && (
            <div className="w-full max-w-5xl space-y-4">
              {/* Header row: Title (left) + Score (right) - same height */}
              <div className="flex gap-4 items-stretch">
                <div className="flex-1">
                  <ParchmentCard className="h-full flex items-center">
                    <h1 
                      className="font-memento text-2xl tracking-wide" 
                      style={getParchmentTextStyle()}
                    >
                      Challenge #{promptIndex + 1} Complete!
                    </h1>
                  </ParchmentCard>
                </div>
                <div className="w-80 shrink-0">
                  <ParchmentCard className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className="font-dutch809 text-4xl"
                        style={getParchmentTextStyle()}
                      >
                        {response.result.scores.percentage}%
                      </div>
                      <div className="font-avenir text-xs" style={getParchmentTextStyle()}>
                        {response.result.scores.total}/{response.result.scores.maxTotal} points
                      </div>
                      {originalResponse.result.scores.percentage !== response.result.scores.percentage && (
                        <div className="mt-1">
                          {response.result.scores.percentage > originalResponse.result.scores.percentage ? (
                            <span className="font-avenir text-xs" style={{ color: '#16a34a' }}>
                              +{response.result.scores.percentage - originalResponse.result.scores.percentage}%
                            </span>
                          ) : (
                            <span className="font-avenir text-xs" style={{ color: '#d97706' }}>
                              {originalResponse.result.scores.percentage}% → {response.result.scores.percentage}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </ParchmentCard>
                </div>
              </div>

              {/* Two column layout - constrained height so buttons stay anchored */}
              <FeedbackProvider>
                <div className="flex gap-4 items-start">
                  {/* Left column: Your Writing */}
                  <ScrollShadow className="flex-1" maxHeight="400px">
                    <WritingCard content={content} />
                  </ScrollShadow>

                  {/* Right column: Expandable Score Breakdown (scrollable) */}
                  <ScrollShadow className="w-80 shrink-0" maxHeight="400px">
                    <ExpandableScoreBreakdown 
                      scores={response.result.scores} 
                      remarks={response.result.remarks} 
                    />
                  </ScrollShadow>
                </div>
              </FeedbackProvider>

              <WinningSubmissions promptId={currentPrompt.id} />

              <Leaderboard promptId={currentPrompt.id} userId={user?.uid} />

              <div className="flex justify-center gap-4">
                <ParchmentButton onClick={() => router.push('/fantasy/home')}>
                  Done for Today
                </ParchmentButton>
                <ParchmentButton onClick={continueToNextChallenge} variant="golden">
                  Next Challenge
                </ParchmentButton>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Results Modal - shown after revision submission */}
      <RankedResultsModal
        isOpen={showResultsModal}
        onClose={handleResultsModalClose}
        finalScore={response?.result.scores.percentage ?? 0}
        originalScore={originalResponse?.result.scores.percentage ?? 0}
        lpChange={rankUpdate?.lpChange ?? 0}
        placement={userPlacement}
        totalSubmissions={totalSubmissions}
        rankUpdate={rankUpdate}
      />

      {/* Top 3 Celebration Modal - shown after results modal if placed top 3 */}
      <Top3CelebrationModal
        isOpen={showCelebrationModal}
        onClose={handleCelebrationModalClose}
        placement={userPlacement ?? 0}
        score={response?.result.scores.percentage ?? 0}
      />
    </div>
  );
}
