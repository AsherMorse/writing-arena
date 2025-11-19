import { NextRequest } from 'next/server';
import { createBatchRankingHandler } from '@/lib/utils/batch-ranking-handler';
import { getPhase2PeerFeedbackPrompt } from '@/lib/prompts/grading-prompts';
import { parseClaudeJSON } from '@/lib/utils/claude-parser';
import { generateMockRankings as generateMockRankingsUtil } from '@/lib/utils/mock-ranking-generator';

interface FeedbackSubmission {
  playerId: string;
  playerName: string;
  responses: {
    clarity: string;
    strengths: string;
    improvements: string;
    organization: string;
    engagement: string;
  };
  peerWriting: string;
  isAI: boolean;
}

function parseBatchFeedbackRankings(claudeResponse: string, feedbackSubmissions: FeedbackSubmission[]): any[] {
  const parsed = parseClaudeJSON<{ rankings: any[] }>(claudeResponse);
  
  if (!parsed || !parsed.rankings) {
    console.warn('⚠️ BATCH RANK FEEDBACK - Falling back to mock rankings due to parse error');
    return generateMockRankings(feedbackSubmissions).rankings;
  }
  
  console.log('✅ BATCH RANK FEEDBACK - Successfully parsed AI response');
  
  const rankings = parsed.rankings.map((ranking: any) => {
    const index = ranking.evaluatorIndex || 0;
    const actualSubmission = feedbackSubmissions[index];
    
    return {
      playerId: actualSubmission.playerId,
      playerName: actualSubmission.playerName,
      isAI: actualSubmission.isAI,
      score: ranking.score,
      rank: ranking.rank,
      strengths: ranking.strengths || [],
      improvements: ranking.improvements || [],
      responses: actualSubmission.responses,
    };
  });
  
  return rankings;
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
    generateMockRankings: generateMockRankings,
    maxTokens: 2500,
  })(request);
}

