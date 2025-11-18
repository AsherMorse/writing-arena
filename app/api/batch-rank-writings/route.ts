import { NextRequest, NextResponse } from 'next/server';
import { generateTWRBatchRankingPrompt } from '@/lib/utils/twr-prompts';

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
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    // Debug: Log API key status (without exposing the actual key)
    const hasApiKey = !!apiKey;
    const apiKeyLength = apiKey?.length || 0;
    const apiKeyPrefix = apiKey?.substring(0, 8) || 'none';
    const isPlaceholder = apiKey === 'your_api_key_here';
    
    console.log('🔍 BATCH RANK WRITINGS - API Key Check:', {
      hasKey: hasApiKey,
      keyLength: apiKeyLength,
      keyPrefix: `${apiKeyPrefix}...`,
      isPlaceholder,
      envKeys: Object.keys(process.env).filter(k => k.includes('ANTHROPIC') || k.includes('API')).join(', '),
    });
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      console.warn('⚠️ BATCH RANK WRITINGS - API key missing or invalid, using MOCK rankings');
      console.warn('⚠️ MOCK RANKINGS DO NOT REFLECT ACTUAL WRITING QUALITY');
      console.warn('⚠️ If deploying to Vercel, set ANTHROPIC_API_KEY in Vercel environment variables');
      console.warn('⚠️ If running locally, ensure ANTHROPIC_API_KEY is in .env.local');
      return NextResponse.json(generateMockRankings(writings));
    }
    
    console.log('✅ BATCH RANK WRITINGS - Using real AI evaluation for', writings.length, 'writings');

    // Call Claude API to rank all writings together
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: generateTWRBatchRankingPrompt(writings, prompt, promptType, trait),
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error('❌ BATCH RANK WRITINGS - Claude API error:', errorText);
      throw new Error(`Claude API request failed: ${anthropicResponse.status}`);
    }

    const aiResponse = await anthropicResponse.json();
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

function generateBatchRankingPrompt(
  writings: WritingSubmission[], 
  prompt: string, 
  promptType: string,
  trait: string
): string {
  const writingsText = writings.map((w, idx) => 
    `WRITER ${idx + 1}: ${w.playerName}\n${w.content}\n---`
  ).join('\n\n');

  return `You are evaluating and ranking ${writings.length} student writing submissions for a competitive writing session.

WRITING PROMPT:
${prompt}

PROMPT TYPE: ${promptType}
FOCUS TRAIT: ${trait}

SUBMISSIONS TO EVALUATE:
${writingsText}

TASK:
Evaluate each submission on the following criteria (The Writing Revolution principles):
- Content: Ideas, development, relevance to prompt
- Organization: Structure, transitions, flow
- Grammar: Sentence variety, correct usage
- Vocabulary: Word choice, precision
- Mechanics: Spelling, punctuation, capitalization

For each writer, provide HIGHLY SPECIFIC, POINTED feedback:
1. Overall score (0-100)
2. 3 SPECIFIC strengths - QUOTE exact phrases/sentences that work well
3. 3 SPECIFIC improvements - QUOTE what needs fixing and give CONCRETE revisions
4. Brief but SPECIFIC feedback for each trait - reference actual text

CRITICAL: All feedback must quote the student's actual writing. 
- Good: "The phrase 'lighthouse stood sentinel' uses strong imagery"
- Bad: "Good use of descriptive language"
- Good: "Change 'got the better' to 'consumed her thoughts' for stronger vocabulary"
- Bad: "Could improve word choice"

Then rank them from best to worst based on overall quality.

Respond in JSON format:
{
  "rankings": [
    {
      "playerId": "writer_index_0_to_${writings.length - 1}",
      "playerName": "name",
      "score": 85,
      "rank": 1,
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "improvements": ["improvement 1", "improvement 2", "improvement 3"],
      "traitFeedback": {
        "content": "feedback",
        "organization": "feedback",
        "grammar": "feedback",
        "vocabulary": "feedback",
        "mechanics": "feedback"
      }
    }
  ]
}

Important:
- Score objectively based on writing quality
- Don't favor any writer
- Provide specific, actionable feedback
- Use The Writing Revolution terminology where appropriate
- Rank strictly by quality (highest score = rank 1)`;
}

function parseBatchRankings(claudeResponse: string, writings: WritingSubmission[]): any {
  try {
    const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      console.log('✅ BATCH RANK WRITINGS - Successfully parsed AI response');
      
      // Map writer indices back to actual player IDs
      const rankings = parsed.rankings.map((ranking: any, idx: number) => {
        // Extract index from playerId if it's in format "writer_index_X"
        let writerIndex = idx;
        if (ranking.playerId && typeof ranking.playerId === 'string') {
          const match = ranking.playerId.match(/writer_index_(\d+)/);
          if (match) {
            writerIndex = parseInt(match[1]);
          }
        }
        
        const actualPlayer = writings[writerIndex];
        
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
      });
      
      return { rankings };
    } else {
      console.error('❌ BATCH RANK WRITINGS - No JSON found in AI response');
    }
  } catch (error) {
    console.error('❌ BATCH RANK WRITINGS - Error parsing AI response:', error);
  }
  
  console.warn('⚠️ BATCH RANK WRITINGS - Falling back to mock rankings due to parse error');
  return generateMockRankings(writings);
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
      // Base score: 30-50 (much lower than before)
      // Word count bonus: up to 20 points (was 40)
      // Random factor: 0-15 (was 0-30)
      // This gives range of 30-85 instead of 50-95
      const baseScore = 30 + Math.random() * 20; // 30-50 base
      const wordCountBonus = Math.min(writing.wordCount / 3, 20); // Up to 20 points for word count
      const randomFactor = Math.random() * 15; // 0-15 random
      score = Math.round(Math.min(baseScore + wordCountBonus + randomFactor, 85));
      
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

