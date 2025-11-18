import { NextRequest, NextResponse } from 'next/server';
import { getPhase1WritingPrompt } from '@/lib/prompts/grading-prompts';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { parseClaudeJSON, mapRankingsToPlayers } from '@/lib/utils/claude-parser';
import { SCORING } from '@/lib/constants/scoring';

interface WritingSubmission {
  playerId: string;
  playerName: string;
  content: string;
  wordCount: number;
  isAI: boolean;
}

export async function POST(request: NextRequest) {
  // Read request body once and store it
  const requestBody = await request.json();
  const { writings, prompt, promptType, trait } = requestBody;
  
  try {
    logApiKeyStatus('BATCH RANK WRITINGS');
    
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      console.warn('⚠️ BATCH RANK WRITINGS - API key missing or invalid, using MOCK rankings');
      console.warn('⚠️ MOCK RANKINGS DO NOT REFLECT ACTUAL WRITING QUALITY');
      return NextResponse.json(generateMockRankings(writings));
    }
    
    console.log('✅ BATCH RANK WRITINGS - Using real AI evaluation for', writings.length, 'writings');

    // Call Claude API to rank all writings together
    const rankingPrompt = getPhase1WritingPrompt(writings, prompt, promptType, trait);
    const aiResponse = await callAnthropicAPI(apiKey, rankingPrompt, 3000);
    const rankings = parseBatchRankings(aiResponse.content[0].text, writings);

    console.log('✅ BATCH RANK WRITINGS - AI evaluation complete, scores:', 
      rankings.rankings?.map((r: any) => `${r.playerName}: ${r.score}`).join(', '));
    
    return NextResponse.json(rankings);
  } catch (error) {
    console.error('❌ BATCH RANK WRITINGS - Error:', error);
    console.warn('⚠️ BATCH RANK WRITINGS - Falling back to MOCK rankings (scores may not reflect quality)');
    return NextResponse.json(generateMockRankings(writings));
  }
}

// Prompt moved to lib/prompts/grading-prompts.ts - use getPhase1WritingPrompt()

function parseBatchRankings(claudeResponse: string, writings: WritingSubmission[]): any {
  const parsed = parseClaudeJSON<{ rankings: any[] }>(claudeResponse);
  
  if (!parsed || !parsed.rankings) {
    console.warn('⚠️ BATCH RANK WRITINGS - Falling back to mock rankings due to parse error');
    return generateMockRankings(writings);
  }
  
  console.log('✅ BATCH RANK WRITINGS - Successfully parsed AI response');
  
  // Map writer indices back to actual player IDs
  const rankings = mapRankingsToPlayers(
    parsed.rankings,
    writings,
    (ranking, idx, actualPlayer) => ({
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
    })
  );
  
  return { rankings };
}

function generateMockRankings(writings: WritingSubmission[]): any {
  console.warn('⚠️ MOCK RANKINGS - Using fallback scoring (NOT based on actual quality)');
  
  // Fallback: generate rankings based on word count and some randomness
  // NOTE: These scores are NOT based on actual writing quality - they're just placeholders
  const rankings = writings.map((writing, index) => {
    // Check if submission is empty
    const isEmpty = !writing.content || writing.content.trim().length === 0 || writing.wordCount === 0;
    
    let score = 0;
    let strengths: string[] = [];
    let improvements: string[] = [];
    let traitFeedback: any = {};
    
    if (isEmpty) {
      // Empty submission gets 0
      score = 0;
      strengths = [];
      improvements = [
        'Submit your writing to receive a score',
        'Try to write at least 50 words',
        'Remember to address the prompt directly',
      ];
      traitFeedback = {
        content: 'No content submitted.',
        organization: 'No content submitted.',
        grammar: 'No content submitted.',
        vocabulary: 'No content submitted.',
        mechanics: 'No content submitted.',
      };
    } else {
      // CONSERVATIVE mock scoring - lower scores to encourage real AI evaluation
      const baseScore = SCORING.MOCK_BASE_MIN + Math.random() * (SCORING.MOCK_BASE_MAX - SCORING.MOCK_BASE_MIN);
      const wordCountBonus = Math.min(writing.wordCount / 3, 20); // Up to 20 points for word count
      const randomFactor = Math.random() * SCORING.MOCK_RANDOM_MAX;
      score = Math.round(Math.min(baseScore + wordCountBonus + randomFactor, SCORING.MOCK_MAX));
      
      // Add warning in feedback that this is mock scoring
      strengths = [
        '⚠️ MOCK SCORING: This score is not based on actual quality',
        'Clear attempt to address the prompt',
        'Some descriptive details included',
      ];
      improvements = [
        '⚠️ Enable AI evaluation for accurate feedback',
        'Try expanding sentences with because/but/so',
        'Add more specific details',
        'Use stronger transitions',
      ];
      traitFeedback = {
        content: '⚠️ Mock evaluation - enable AI for accurate assessment.',
        organization: '⚠️ Mock evaluation - enable AI for accurate assessment.',
        grammar: '⚠️ Mock evaluation - enable AI for accurate assessment.',
        vocabulary: '⚠️ Mock evaluation - enable AI for accurate assessment.',
        mechanics: '⚠️ Mock evaluation - enable AI for accurate assessment.',
      };
    }
    
    return {
      playerId: writing.playerId,
      playerName: writing.playerName,
      isAI: writing.isAI,
      content: writing.content,
      wordCount: writing.wordCount,
      score,
      rank: 0, // Will be set after sorting
      strengths,
      improvements,
      traitFeedback,
    };
  });
  
  // Sort by score and assign ranks
  rankings.sort((a, b) => b.score - a.score);
  rankings.forEach((ranking, index) => {
    ranking.rank = index + 1;
  });
  
  return { rankings };
}

