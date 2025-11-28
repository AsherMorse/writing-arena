import { NextRequest } from 'next/server';
import { createBatchRankingHandler } from '@/lib/utils/batch-ranking-handler';
import { getPhase1WritingPrompt } from '@/lib/prompts/grading-prompts';
import { mapRankingsToPlayers } from '@/lib/utils/claude-parser';
import { generateMockRankings as generateMockRankingsUtil } from '@/lib/utils/mock-ranking-generator';
import { parseRankings } from '@/lib/utils/parse-rankings';
import { logMockRankingsWarning } from '@/lib/utils/ranking-logging';
import { SCORING } from '@/lib/constants/scoring';
import { API_MAX_TOKENS } from '@/lib/constants/api-config';
import { MOCK_WARNINGS } from '@/lib/constants/mock-warnings';

interface WritingSubmission {
  playerId: string;
  playerName: string;
  content: string;
  wordCount: number;
  isAI: boolean;
}

function parseBatchRankings(claudeResponse: string, writings: WritingSubmission[]): any[] {
  return parseRankings(
    claudeResponse,
    writings,
    'BATCH RANK WRITINGS',
    (parsed, submissions) => {
      // Map writer indices back to actual player IDs
      return mapRankingsToPlayers(
        parsed.rankings,
        submissions,
        (ranking, idx, actualPlayer) => {
          // mapRankingsToPlayers ensures actualPlayer is always defined
          return {
            playerId: actualPlayer.playerId,
            playerName: actualPlayer.playerName,
            isAI: actualPlayer.isAI,
            content: actualPlayer.content,  // Include content for peer review
            wordCount: actualPlayer.wordCount,
            rank: ranking.rank,
            score: ranking.score,
            strengths: ranking.strengths || [],
            improvements: ranking.improvements || [],
            traitFeedback: ranking.traitFeedback || {},
          };
        }
      );
    }
  );
}

function generateMockRankings(writings: WritingSubmission[]): { rankings: any[] } {
  logMockRankingsWarning();
  
  return generateMockRankingsUtil(writings, {
    isEmpty: (writing) => !writing.content || writing.content.trim().length === 0 || writing.wordCount === 0,
    calculateScore: (writing) => {
      const baseScore = SCORING.MOCK_BASE_MIN + Math.random() * (SCORING.MOCK_BASE_MAX - SCORING.MOCK_BASE_MIN);
      const wordCountBonus = Math.min(writing.wordCount / 3, 20);
      const randomFactor = Math.random() * SCORING.MOCK_RANDOM_MAX;
      return Math.round(Math.min(baseScore + wordCountBonus + randomFactor, SCORING.MOCK_MAX));
    },
    generateStrengths: (writing, isEmpty) => {
      if (isEmpty) return [];
      return [
        MOCK_WARNINGS.RANDOM_SCORE_GENERATED,
        'Clear attempt to address the prompt',
        'Some descriptive details included',
      ];
    },
    generateImprovements: (writing, isEmpty) => {
      if (isEmpty) {
        return [
          'Submit your writing to receive a score',
          'Try to write at least 50 words',
          'Remember to address the prompt directly',
        ];
      }
      return [
        MOCK_WARNINGS.SET_API_KEY,
        MOCK_WARNINGS.RANDOM_FEEDBACK,
        'Try expanding sentences with because/but/so',
        'Add more specific details',
        'Use stronger transitions',
      ];
    },
    generateTraitFeedback: (writing, isEmpty) => {
      if (isEmpty) {
        return {
          content: 'No content submitted.',
          organization: 'No content submitted.',
          grammar: 'No content submitted.',
          vocabulary: 'No content submitted.',
          mechanics: 'No content submitted.',
        };
      }
      return {
        content: MOCK_WARNINGS.RANDOM_TRAIT_SCORE,
        organization: MOCK_WARNINGS.RANDOM_TRAIT_SCORE,
        grammar: MOCK_WARNINGS.RANDOM_TRAIT_SCORE,
        vocabulary: MOCK_WARNINGS.RANDOM_TRAIT_SCORE,
        mechanics: MOCK_WARNINGS.RANDOM_TRAIT_SCORE,
      };
    },
  });
}

export async function POST(request: NextRequest) {
  return createBatchRankingHandler<WritingSubmission, any>({
    endpointName: 'BATCH RANK WRITINGS',
    requestBodyKey: 'writings',
    getPrompt: (writings, prompt, promptType, trait) =>
      getPhase1WritingPrompt(writings, prompt, promptType, trait),
    parseRankings: parseBatchRankings,
    generateMockRankings: generateMockRankings, // Not used anymore but kept for interface compatibility
    maxTokens: API_MAX_TOKENS.BATCH_RANK_WRITINGS,
    getAdditionalBodyParams: (requestBody) => [
      requestBody.prompt,
      requestBody.promptType,
      requestBody.trait,
    ],
  })(request);
}

