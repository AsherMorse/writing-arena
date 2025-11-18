import { NextRequest, NextResponse } from 'next/server';
import { getPhase3RevisionPrompt } from '@/lib/prompts/grading-prompts';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { parseClaudeJSON } from '@/lib/utils/claude-parser';

interface RevisionSubmission {
  playerId: string;
  playerName: string;
  originalContent: string;
  revisedContent: string;
  feedback: any;
  wordCount: number;
  isAI: boolean;
}

export async function POST(request: NextRequest) {
  // Read request body once and store it
  const requestBody = await request.json();
  const { revisionSubmissions } = requestBody;
  
  try {
    logApiKeyStatus('BATCH RANK REVISIONS');
    
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      console.warn('⚠️ BATCH RANK REVISIONS - API key missing, using MOCK rankings');
      return NextResponse.json(generateMockRevisionRankings(revisionSubmissions));
    }

    // Call Claude API to rank all revisions together
    const prompt = getPhase3RevisionPrompt(revisionSubmissions);
    const aiResponse = await callAnthropicAPI(apiKey, prompt, 3500);
    const rankings = parseBatchRevisionRankings(aiResponse.content[0].text, revisionSubmissions);

    return NextResponse.json(rankings);
  } catch (error) {
    console.error('❌ BATCH RANK REVISIONS - Error:', error);
    console.warn('⚠️ BATCH RANK REVISIONS - Falling back to MOCK rankings');
    return NextResponse.json(generateMockRevisionRankings(revisionSubmissions));
  }
}

// Prompt moved to lib/prompts/grading-prompts.ts - use getPhase3RevisionPrompt()

function parseBatchRevisionRankings(claudeResponse: string, revisionSubmissions: RevisionSubmission[]): any {
  const parsed = parseClaudeJSON<{ rankings: any[] }>(claudeResponse);
  
  if (!parsed || !parsed.rankings) {
    console.warn('⚠️ BATCH RANK REVISIONS - Falling back to mock rankings due to parse error');
    return generateMockRevisionRankings(revisionSubmissions);
  }
  
  console.log('✅ BATCH RANK REVISIONS - Successfully parsed AI response');
  
  const rankings = parsed.rankings.map((ranking: any) => {
    const index = ranking.writerIndex || 0;
    const actualSubmission = revisionSubmissions[index];
    
    return {
      playerId: actualSubmission.playerId,
      playerName: actualSubmission.playerName,
      isAI: actualSubmission.isAI,
      score: ranking.score,
      rank: ranking.rank,
      improvements: ranking.improvements || [],
      strengths: ranking.strengths || [],
      suggestions: ranking.suggestions || [],
      originalContent: actualSubmission.originalContent,
      revisedContent: actualSubmission.revisedContent,
      wordCount: actualSubmission.wordCount,
    };
  });
  
  return { rankings };
}

function generateMockRevisionRankings(revisionSubmissions: RevisionSubmission[]): any {
  const rankings = revisionSubmissions.map((submission, index) => {
    // Check if revision is empty or unchanged
    const isEmpty = !submission.revisedContent || submission.revisedContent.trim().length === 0;
    
    let score = 0;
    let improvements: string[] = [];
    let strengths: string[] = [];
    let suggestions: string[] = [];
    
    if (isEmpty) {
      // Empty revision gets 0
      score = 0;
      improvements = [];
      strengths = [];
      suggestions = [
        'Submit a revision to receive a score',
        'Apply the feedback you received',
        'Try to expand and improve your writing',
      ];
    } else {
      // Score based on amount of change and word count difference
      const originalWords = submission.originalContent.split(/\s+/).length;
      const revisedWords = submission.revisedContent.split(/\s+/).length;
      const wordDifference = Math.abs(revisedWords - originalWords);
      const hasSignificantChanges = wordDifference > 10;
      
      const baseScore = hasSignificantChanges ? 75 : 60;
      const changeBonus = Math.min(wordDifference, 20);
      score = Math.round(Math.min(baseScore + changeBonus + Math.random() * 15, 95));
      
      improvements = [
        'Added more descriptive details',
        'Improved sentence variety',
      ];
      strengths = [
        'Applied feedback effectively',
        'Made meaningful changes',
      ];
      suggestions = [
        'Could combine more short sentences',
        'Try adding more transitional phrases',
      ];
    }
    
    return {
      playerId: submission.playerId,
      playerName: submission.playerName,
      isAI: submission.isAI,
      score,
      rank: 0, // Will be set after sorting
      improvements,
      strengths,
      suggestions,
      originalContent: submission.originalContent,
      revisedContent: submission.revisedContent,
      wordCount: submission.wordCount,
    };
  });
  
  // Sort by score and assign ranks
  rankings.sort((a, b) => b.score - a.score);
  rankings.forEach((ranking, index) => {
    ranking.rank = index + 1;
  });
  
  return { rankings };
}

