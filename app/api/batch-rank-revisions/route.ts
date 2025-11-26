import { NextRequest } from 'next/server';
import { createBatchRankingHandler } from '@/lib/utils/batch-ranking-handler';
import { getPhase3RevisionPrompt } from '@/lib/prompts/grading-prompts';
import { generateMockRankings as generateMockRankingsUtil } from '@/lib/utils/mock-ranking-generator';
import { mapRankingsWithIndexFix } from '@/lib/utils/index-parser';
import { parseRankings } from '@/lib/utils/parse-rankings';
import { API_MAX_TOKENS } from '@/lib/constants/api-config';

interface RevisionSubmission {
  playerId: string;
  playerName: string;
  originalContent: string;
  revisedContent: string;
  feedback: any;
  wordCount: number;
  isAI: boolean;
}

function parseBatchRevisionRankings(claudeResponse: string, revisionSubmissions: RevisionSubmission[]): any[] {
  return parseRankings(
    claudeResponse,
    revisionSubmissions,
    'BATCH RANK REVISIONS',
    (parsed, submissions) => {
      return mapRankingsWithIndexFix(
        parsed.rankings,
        submissions,
        'writerIndex',
        'BATCH RANK REVISIONS',
        (ranking, submission) => ({
          playerId: submission.playerId,
          playerName: submission.playerName,
          isAI: submission.isAI,
          score: ranking.score,
          rank: ranking.rank,
          improvements: ranking.improvements || [],
          strengths: ranking.strengths || [],
          suggestions: ranking.suggestions || [],
          originalContent: submission.originalContent,
          revisedContent: submission.revisedContent,
          wordCount: submission.wordCount,
        })
      );
    }
  );
}

function generateMockRankings(revisionSubmissions: RevisionSubmission[]): { rankings: any[] } {
  return generateMockRankingsUtil(revisionSubmissions, {
    isEmpty: (submission) => !submission.revisedContent || submission.revisedContent.trim().length === 0,
    calculateScore: (submission) => {
      const originalWords = submission.originalContent.split(/\s+/).length;
      const revisedWords = submission.revisedContent.split(/\s+/).length;
      const wordDifference = Math.abs(revisedWords - originalWords);
      const hasSignificantChanges = wordDifference > 10;
      
      const baseScore = hasSignificantChanges ? 75 : 60;
      const changeBonus = Math.min(wordDifference, 20);
      return Math.round(Math.min(baseScore + changeBonus + Math.random() * 15, 95));
    },
    generateStrengths: (submission, isEmpty) => {
      if (isEmpty) return [];
      return [
        'Applied feedback effectively',
        'Made meaningful changes',
      ];
    },
    generateImprovements: (submission, isEmpty) => {
      if (isEmpty) {
        return [
          'Submit a revision to receive a score',
          'Apply the feedback you received',
          'Try to expand and improve your writing',
      ];
    }
      return [
        'Added more descriptive details',
        'Improved sentence variety',
      ];
    },
  });
}

export async function POST(request: NextRequest) {
  return createBatchRankingHandler<RevisionSubmission, any>({
    endpointName: 'BATCH RANK REVISIONS',
    requestBodyKey: 'revisionSubmissions',
    getPrompt: (revisionSubmissions) => getPhase3RevisionPrompt(revisionSubmissions),
    parseRankings: parseBatchRevisionRankings,
    generateMockRankings: generateMockRankings, // Not used anymore but kept for interface compatibility
    maxTokens: API_MAX_TOKENS.BATCH_RANK_REVISIONS,
  })(request);
}

