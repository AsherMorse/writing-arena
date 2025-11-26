import { NextRequest } from 'next/server';
import { createBatchRankingHandler } from '@/lib/utils/batch-ranking-handler';
import { getPhase2PeerFeedbackPrompt } from '@/lib/prompts/grading-prompts';
import { generateMockRankings as generateMockRankingsUtil } from '@/lib/utils/mock-ranking-generator';
import { mapRankingsWithIndexFix } from '@/lib/utils/index-parser';
import { parseRankings } from '@/lib/utils/parse-rankings';
import { API_MAX_TOKENS } from '@/lib/constants/api-config';

interface FeedbackSubmission {
  playerId: string;
  playerName: string;
  responses: {
    mainIdea: string;
    strength: string;
    suggestion: string;
  };
  peerWriting: string;
  isAI: boolean;
}

function parseBatchFeedbackRankings(claudeResponse: string, feedbackSubmissions: FeedbackSubmission[]): any[] {
  return parseRankings(
    claudeResponse,
    feedbackSubmissions,
    'BATCH RANK FEEDBACK',
    (parsed, submissions) => {
      return mapRankingsWithIndexFix(
        parsed.rankings,
        submissions,
        'evaluatorIndex',
        'BATCH RANK FEEDBACK',
        (ranking, submission) => ({
          playerId: submission.playerId,
          playerName: submission.playerName,
          isAI: submission.isAI,
          score: ranking.score,
          rank: ranking.rank,
          strengths: ranking.strengths || [],
          improvements: ranking.improvements || [],
          responses: submission.responses,
        })
      );
    }
  );
}

function generateMockRankings(feedbackSubmissions: FeedbackSubmission[]): { rankings: any[] } {
  return generateMockRankingsUtil(feedbackSubmissions, {
    isEmpty: (submission) => {
      const totalLength = Object.values(submission.responses).join('').length;
      return totalLength === 0;
    },
    calculateScore: (submission) => {
    const totalLength = Object.values(submission.responses).join('').length;
      const isComplete = totalLength > 200;
      const baseScore = isComplete ? 70 : 50;
      const lengthBonus = Math.min(totalLength / 20, 20);
      return Math.round(Math.min(baseScore + lengthBonus + Math.random() * 15, 95));
    },
    generateStrengths: (submission, isEmpty) => {
      if (isEmpty) return [];
      return [
        'Provided feedback on multiple aspects',
        'Constructive approach',
      ];
    },
    generateImprovements: (submission, isEmpty) => {
      if (isEmpty) {
        return [
          'Provide feedback to receive a score',
          'Answer all feedback questions',
          'Be specific and constructive',
        ];
      }
      return [
        'Could be more specific with examples',
        'Try referencing Writing Revolution strategies',
      ];
    },
  });
}

export async function POST(request: NextRequest) {
  return createBatchRankingHandler<FeedbackSubmission, any>({
    endpointName: 'BATCH RANK FEEDBACK',
    requestBodyKey: 'feedbackSubmissions',
    getPrompt: (feedbackSubmissions) => getPhase2PeerFeedbackPrompt(feedbackSubmissions),
    parseRankings: parseBatchFeedbackRankings,
    generateMockRankings: generateMockRankings, // Not used anymore but kept for interface compatibility
    maxTokens: API_MAX_TOKENS.BATCH_RANK_FEEDBACK,
  })(request);
}

