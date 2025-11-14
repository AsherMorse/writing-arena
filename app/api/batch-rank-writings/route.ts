import { NextRequest, NextResponse } from 'next/server';

interface WritingSubmission {
  playerId: string;
  playerName: string;
  content: string;
  wordCount: number;
  isAI: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { writings, prompt, promptType, trait } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json(generateMockRankings(writings));
    }

    // Call Claude API to rank all writings together
    const response = await fetch('https://api.anthropic.com/v1/messages', {
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
            content: generateBatchRankingPrompt(writings, prompt, promptType, trait),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Claude API request failed');
    }

    const data = await response.json();
    const rankings = parseBatchRankings(data.content[0].text, writings);

    return NextResponse.json(rankings);
  } catch (error) {
    console.error('Error batch ranking writings:', error);
    const { writings } = await request.json();
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

For each writer, provide:
1. Overall score (0-100)
2. 3 specific strengths
3. 3 specific areas for improvement
4. Brief feedback for each trait

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
    }
  } catch (error) {
    console.error('Error parsing batch rankings:', error);
  }
  
  return generateMockRankings(writings);
}

function generateMockRankings(writings: WritingSubmission[]): any {
  // Fallback: generate rankings based on word count and some randomness
  const rankings = writings.map((writing, index) => {
    // Base score on word count (more words = generally more developed)
    const wordCountScore = Math.min(writing.wordCount / 2, 40);
    const randomFactor = Math.random() * 30;
    const score = Math.round(Math.min(50 + wordCountScore + randomFactor, 95));
    
    return {
      playerId: writing.playerId,
      playerName: writing.playerName,
      isAI: writing.isAI,
      score,
      rank: 0, // Will be set after sorting
      strengths: [
        'Clear attempt to address the prompt',
        'Some descriptive details included',
        'Organized structure',
      ],
      improvements: [
        'Try expanding sentences with because/but/so',
        'Add more specific details',
        'Use stronger transitions',
      ],
      traitFeedback: {
        content: 'Ideas are present and relevant to the prompt.',
        organization: 'Writing has a clear structure.',
        grammar: 'Sentences are generally well-constructed.',
        vocabulary: 'Word choice is appropriate.',
        mechanics: 'Spelling and punctuation are mostly correct.',
      },
    };
  });
  
  // Sort by score and assign ranks
  rankings.sort((a, b) => b.score - a.score);
  rankings.forEach((ranking, index) => {
    ranking.rank = index + 1;
  });
  
  return { rankings };
}

