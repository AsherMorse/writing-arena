import { NextRequest, NextResponse } from 'next/server';
import { getPhase2PeerFeedbackPrompt } from '@/lib/prompts/grading-prompts';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { parseClaudeJSON } from '@/lib/utils/claude-parser';

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

export async function POST(request: NextRequest) {
  // Read request body once and store it
  const requestBody = await request.json();
  const { feedbackSubmissions } = requestBody;
  
  try {
    logApiKeyStatus('BATCH RANK FEEDBACK');
    
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      console.warn('⚠️ BATCH RANK FEEDBACK - API key missing, using MOCK rankings');
      return NextResponse.json(generateMockFeedbackRankings(feedbackSubmissions));
    }

    // Call Claude API to rank all feedback submissions together
    const prompt = getPhase2PeerFeedbackPrompt(feedbackSubmissions);
    const aiResponse = await callAnthropicAPI(apiKey, prompt, 2500);
    const rankings = parseBatchFeedbackRankings(aiResponse.content[0].text, feedbackSubmissions);

    return NextResponse.json(rankings);
  } catch (error) {
    console.error('❌ BATCH RANK FEEDBACK - Error:', error);
    console.warn('⚠️ BATCH RANK FEEDBACK - Falling back to MOCK rankings');
    return NextResponse.json(generateMockFeedbackRankings(feedbackSubmissions));
  }
}

// Prompt moved to lib/prompts/grading-prompts.ts - use getPhase2PeerFeedbackPrompt()

function parseBatchFeedbackRankings(claudeResponse: string, feedbackSubmissions: FeedbackSubmission[]): any {
  const parsed = parseClaudeJSON<{ rankings: any[] }>(claudeResponse);
  
  if (!parsed || !parsed.rankings) {
    console.warn('⚠️ BATCH RANK FEEDBACK - Falling back to mock rankings due to parse error');
    return generateMockFeedbackRankings(feedbackSubmissions);
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
  
  return { rankings };
}

function generateMockFeedbackRankings(feedbackSubmissions: FeedbackSubmission[]): any {
  const rankings = feedbackSubmissions.map((submission, index) => {
    // Score based on completeness and length of responses
    const totalLength = Object.values(submission.responses).join('').length;
    const isEmpty = totalLength === 0;
    
    let score = 0;
    let strengths: string[] = [];
    let improvements: string[] = [];
    
    if (isEmpty) {
      // Empty feedback gets 0
      score = 0;
      strengths = [];
      improvements = [
        'Provide feedback to receive a score',
        'Answer all feedback questions',
        'Be specific and constructive',
      ];
    } else {
      const isComplete = totalLength > 200;
      const baseScore = isComplete ? 70 : 50;
      const lengthBonus = Math.min(totalLength / 20, 20);
      score = Math.round(Math.min(baseScore + lengthBonus + Math.random() * 15, 95));
      
      strengths = [
        'Provided feedback on multiple aspects',
        'Constructive approach',
      ];
      improvements = [
        'Could be more specific with examples',
        'Try referencing Writing Revolution strategies',
      ];
    }
    
    return {
      playerId: submission.playerId,
      playerName: submission.playerName,
      isAI: submission.isAI,
      score,
      rank: 0, // Will be set after sorting
      strengths,
      improvements,
      responses: submission.responses,
    };
  });
  
  // Sort by score and assign ranks
  rankings.sort((a, b) => b.score - a.score);
  rankings.forEach((ranking, index) => {
    ranking.rank = index + 1;
  });
  
  return { rankings };
}

