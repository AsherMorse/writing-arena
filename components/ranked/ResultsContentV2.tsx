'use client';

/**
 * @fileoverview Results page v2 content with TWR grading scorecard.
 * Displays detailed rubric-based feedback, gap detection, and practice recommendations.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { GameSession } from '@/lib/types/session';
import { useSessionFromParams } from '@/lib/hooks/useSessionFromParams';
import { getAIFeedback } from '@/lib/services/match-sync';
import { saveWritingSession, updateUserStatsAfterSession } from '@/lib/services/firestore';
import { updateAIStudentAfterMatch } from '@/lib/services/ai-students';
import {
  calculateCompositeScore,
  calculateLPChange,
  calculateXPEarned,
  calculatePointsEarned,
  calculateImprovementBonus,
} from '@/lib/utils/score-calculator';
import { getPhaseScoresWithFallback } from '@/lib/utils/score-fallback';
import {
  fetchAllPhaseRankings,
  mergeAIPlayerDataAcrossPhases,
  filterValidAIPlayers,
  transformPlayersForResults,
} from '@/lib/utils/rankings-fetcher';
import { LoadingState } from '@/components/shared/LoadingState';
import { rankPlayers, getPlayerRank } from '@/lib/utils/ranking-utils';
import { useExpanded } from '@/lib/hooks/useExpanded';
import { isEmpty, isNotEmpty } from '@/lib/utils/array-utils';
import { roundScore } from '@/lib/utils/math-utils';
import { logger, LOG_CONTEXTS } from '@/lib/utils/logger';
import { getCurrentTimestamp } from '@/lib/utils/date-utils';
import { ResultsHeader } from './results/ResultsHeader';
import { ResultsHero } from './results/ResultsHero';
import { ResultsRankChange } from './results/ResultsRankChange';
import { ResultsRewards } from './results/ResultsRewards';
import { ResultsRankings } from './results/ResultsRankings';
import {
  getGradingResultByMatch,
  checkBlockStatus,
} from '@/lib/services/grading-history';
import { WritingFeedback } from './results-v2/WritingFeedback';
import { BlockModal } from './results-v2/BlockModal';
import type { GradingHistoryEntry, BlockStatus } from '@/lib/types/grading-history';

interface ResultsContentV2Props {
  session?: GameSession;
}

export default function ResultsContentV2({ session: sessionProp }: ResultsContentV2Props = {}) {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const searchParams = useSearchParams();

  // Use hook to fetch session from multiple sources
  const { session: finalSession, matchId: matchIdFromParams } = useSessionFromParams(sessionProp);

  const matchId = finalSession?.matchId || matchIdFromParams;
  const trait = finalSession?.config.trait || searchParams?.get('trait') || 'all';
  const promptType = finalSession?.config.promptType || searchParams?.get('promptType') || 'narrative';

  const userPlayer = finalSession && user ? finalSession.players[user.uid] : null;
  const originalContent = userPlayer?.phases.phase1?.content || searchParams?.get('originalContent') || '';
  const revisedContent =
    (userPlayer?.phases.phase3 as any)?.revisedContent || searchParams?.get('revisedContent') || '';
  const wordCount = userPlayer?.phases.phase1?.wordCount || parseInt(searchParams?.get('wordCount') || '0', 10);
  const revisedWordCount = userPlayer?.phases.phase3?.wordCount || parseInt(searchParams?.get('revisedWordCount') || '0', 10);

  // Get scores from session first, then from URL params as fallback
  const { phase1: writingScore, phase2: feedbackScore, phase3: revisionScore } = getPhaseScoresWithFallback(
    {
      phase1: userPlayer?.phases.phase1?.score,
      phase2: (userPlayer?.phases.phase2 as any)?.score,
      phase3: userPlayer?.phases.phase3?.score,
    },
    searchParams,
    { phase1: 75, phase2: 80, phase3: 78 }
  );

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [gradingResult, setGradingResult] = useState<GradingHistoryEntry | null>(null);
  const [blockStatus, setBlockStatus] = useState<BlockStatus | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);

  // Fetch grading result from history
  useEffect(() => {
    const fetchGradingResult = async () => {
      if (!user || !matchId) return;
      try {
        const result = await getGradingResultByMatch(user.uid, matchId);
        setGradingResult(result);
        
        // Also fetch block status
        const status = await checkBlockStatus(user.uid);
        setBlockStatus(status);
      } catch (error) {
        logger.error(LOG_CONTEXTS.RESULTS, 'Failed to fetch grading result', error);
      }
    };
    fetchGradingResult();
  }, [user, matchId]);

  // Analyze match and calculate results
  useEffect(() => {
    const analyzeRankedMatch = async () => {
      try {
        // Fetch all phase rankings
        const { phase1: realPhase1Rankings, phase2: realPhase2Rankings, phase3: realPhase3Rankings } = matchId
          ? await fetchAllPhaseRankings(matchId)
          : { phase1: [], phase2: [], phase3: [] };

        const yourCompositeScore = calculateCompositeScore(writingScore, feedbackScore, revisionScore);

        // Merge AI player data across phases
        const aiPlayers = isNotEmpty(realPhase1Rankings)
          ? mergeAIPlayerDataAcrossPhases(realPhase1Rankings, realPhase2Rankings, realPhase3Rankings)
          : [];

        if (isEmpty(aiPlayers)) {
          logger.warn(LOG_CONTEXTS.RESULTS, 'No phase rankings found in Firestore. Match may not be complete.');
        }

        // Only include AI players with valid scores from LLM
        const validAIPlayers = filterValidAIPlayers(aiPlayers);

        // Transform players into display format
        const allPlayers = transformPlayersForResults(
          validAIPlayers.map((p) => ({
            name: p.name,
            avatar: p.avatar,
            rank: p.rank,
            userId: p.userId,
            phase1: p.phase1!,
            phase2: p.phase2!,
            phase3: p.phase3!,
            wordCount: p.wordCount,
          })),
          {
            phase1: writingScore,
            phase2: feedbackScore,
            phase3: revisionScore,
            wordCount,
            revisedWordCount,
          }
        );

        const rankings = rankPlayers(allPlayers, 'compositeScore');
        const yourRank = getPlayerRank(rankings, user?.uid);
        const lpChange = calculateLPChange(yourRank);
        const xpEarned = calculateXPEarned(yourCompositeScore, 'ranked');
        const pointsEarned = calculatePointsEarned(yourCompositeScore, yourRank);
        const isVictory = yourRank === 1;
        const improvementBonus = calculateImprovementBonus(writingScore, revisionScore);

        if (user) {
          try {
            await saveWritingSession({
              userId: user.uid,
              mode: 'ranked',
              trait: trait || 'all',
              promptType: promptType || 'narrative',
              content: originalContent,
              wordCount,
              score: roundScore(yourCompositeScore),
              traitScores: {
                content: roundScore(writingScore),
                organization: roundScore(writingScore),
                grammar: roundScore(writingScore),
                vocabulary: roundScore(writingScore),
                mechanics: roundScore(writingScore),
              },
              xpEarned,
              pointsEarned,
              lpChange,
              placement: yourRank,
              timestamp: getCurrentTimestamp() as any,
              matchId,
            });
            await updateUserStatsAfterSession(user.uid, xpEarned, pointsEarned, lpChange, isVictory, wordCount);
            await refreshProfile();

            // Update AI player stats
            for (const aiPlayer of validAIPlayers) {
              if (!aiPlayer.name || aiPlayer.phase1 === null || aiPlayer.phase2 === null || aiPlayer.phase3 === null)
                continue;
              const aiComposite = calculateCompositeScore(aiPlayer.phase1, aiPlayer.phase2, aiPlayer.phase3);
              const aiPlayerData = allPlayers.find((p) => p.name === aiPlayer.name);
              const aiPlacement = aiPlayerData?.position || 5;
              const aiLPChange = aiPlacement === 1 ? 35 : aiPlacement === 2 ? 22 : aiPlacement === 3 ? 12 : aiPlacement === 4 ? -5 : -15;
              const aiXP = calculateXPEarned(aiComposite, 'ranked');
              const aiIsWin = aiPlacement === 1;

              if (finalSession && aiPlayer.userId && aiPlayer.userId.startsWith('ai-')) {
                const aiStudentId = aiPlayer.userId.replace('ai-', '').replace('student-', '');
                try {
                  await updateAIStudentAfterMatch(aiStudentId, aiLPChange, aiXP, aiIsWin, aiPlayer.wordCount || 100);
                } catch (e) {
                  logger.error(LOG_CONTEXTS.RESULTS, `Failed to update AI student stats for ${aiStudentId}`, e);
                }
              } else if (finalSession && aiPlayer.userId) {
                try {
                  await updateAIStudentAfterMatch(aiPlayer.userId, aiLPChange, aiXP, aiIsWin, aiPlayer.wordCount || 100);
                } catch (e) {
                  logger.error(LOG_CONTEXTS.RESULTS, `Failed to update AI student stats for ${aiPlayer.userId}`, e);
                }
              }
            }
          } catch (error) {
            logger.error(LOG_CONTEXTS.RESULTS, 'Failed to save session data', error);
          }
        }

        setResults({
          rankings,
          yourRank,
          lpChange,
          xpEarned,
          pointsEarned,
          isVictory,
          improvementBonus: roundScore(improvementBonus),
          phases: {
            writing: roundScore(writingScore),
            feedback: roundScore(feedbackScore),
            revision: roundScore(revisionScore),
            composite: roundScore(yourCompositeScore),
          },
        });
        setIsAnalyzing(false);
      } catch (error) {
        logger.error(LOG_CONTEXTS.RESULTS, 'Failed to analyze results', error);
        setIsAnalyzing(false);
      }
    };
    analyzeRankedMatch();
  }, [wordCount, trait, promptType, writingScore, feedbackScore, revisionScore, finalSession, user, matchId]);

  /**
   * @description Handle Play Again click with block check.
   */
  const handlePlayAgain = async () => {
    if (blockStatus?.isBlocked) {
      setShowBlockModal(true);
      return;
    }
    router.push('/ranked');
  };

  /**
   * @description Navigate to practice page.
   */
  const handleGoToPractice = () => {
    setShowBlockModal(false);
    router.push('/practice');
  };

  if (isAnalyzing) return <LoadingState variant="analyzing" />;

  if (!results) return null;

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <ResultsHeader />

      <main className="mx-auto max-w-[1100px] px-8 py-10">
        <ResultsHero isVictory={results.isVictory} yourRank={results.yourRank} lpChange={results.lpChange} />

        {/* TWR Writing Feedback Section */}
        {gradingResult && (
          <WritingFeedback
            graderType={gradingResult.graderType}
            scorecard={gradingResult.scorecard}
            gaps={gradingResult.gaps}
            overallFeedback={gradingResult.overallFeedback || ''}
          />
        )}

        {/* Phase Scores Summary */}
        <div className="mb-8 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
          <h2 className="mb-4 text-center text-lg font-semibold">Phase Scores</h2>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4 text-center">
              <div className="mb-1 text-xs text-[#00e5e5]">📝 Phase 1</div>
              <div className="mb-1 text-[10px] text-[rgba(255,255,255,0.4)]">Writing</div>
              <div className="font-mono text-2xl font-medium">{results.phases.writing}</div>
              <div className="mt-1 text-[10px] text-[rgba(255,255,255,0.22)]">40% weight</div>
            </div>

            <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4 text-center">
              <div className="mb-1 text-xs text-[#ff5f8f]">🔍 Phase 2</div>
              <div className="mb-1 text-[10px] text-[rgba(255,255,255,0.4)]">Feedback</div>
              <div className="font-mono text-2xl font-medium">{results.phases.feedback}</div>
              <div className="mt-1 text-[10px] text-[rgba(255,255,255,0.22)]">30% weight</div>
            </div>

            <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4 text-center">
              <div className="mb-1 text-xs text-[#00d492]">✏️ Phase 3</div>
              <div className="mb-1 text-[10px] text-[rgba(255,255,255,0.4)]">Revision</div>
              <div className="font-mono text-2xl font-medium">{results.phases.revision}</div>
              <div className="mt-1 text-[10px] text-[rgba(255,255,255,0.22)]">30% weight</div>
            </div>

            <div className="rounded-[10px] border-2 border-[#ff9030] bg-[rgba(255,144,48,0.1)] p-4 text-center">
              <div className="mb-1 text-xs text-[#ff9030]">⭐ Final</div>
              <div className="mb-1 text-[10px] text-[rgba(255,255,255,0.4)]">Composite</div>
              <div className="font-mono text-2xl font-medium text-[#ff9030]">{results.phases.composite}</div>
              <div className="mt-1 text-[10px] text-[rgba(255,255,255,0.4)]">Overall</div>
            </div>
          </div>
        </div>

        <ResultsRankChange lpChange={results.lpChange} />

        <ResultsRewards
          yourRank={results.yourRank}
          totalPlayers={results.rankings.length}
          xpEarned={results.xpEarned}
          pointsEarned={results.pointsEarned}
          isVictory={results.isVictory}
        />

        <ResultsRankings rankings={results.rankings} />

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handlePlayAgain}
            className="rounded-[10px] border border-[#00e5e5] px-6 py-3 text-center text-sm font-medium uppercase tracking-[0.04em] text-[#00e5e5] transition hover:bg-[rgba(0,229,229,0.1)]"
          >
            Play Again 🏆
          </button>
          <Link
            href="/dashboard"
            className="rounded-[10px] border border-[rgba(255,255,255,0.05)] px-6 py-3 text-center text-sm font-medium uppercase tracking-[0.04em] text-[rgba(255,255,255,0.4)] transition hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
          >
            Dashboard
          </Link>
        </div>
      </main>

      {/* Block Modal */}
      {showBlockModal && blockStatus && (
        <BlockModal
          blockStatus={blockStatus}
          onClose={() => setShowBlockModal(false)}
          onGoToPractice={handleGoToPractice}
        />
      )}
    </div>
  );
}

