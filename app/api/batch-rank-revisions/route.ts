import { NextRequest, NextResponse } from 'next/server';

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
  try {
    const { revisionSubmissions } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json(generateMockRevisionRankings(revisionSubmissions));
    }

    // Call Claude API to rank all revisions together
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3500,
        messages: [
          {
            role: 'user',
            content: generateBatchRevisionRankingPrompt(revisionSubmissions),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Claude API request failed');
    }

    const data = await response.json();
    const rankings = parseBatchRevisionRankings(data.content[0].text, revisionSubmissions);

    return NextResponse.json(rankings);
  } catch (error) {
    console.error('Error batch ranking revisions:', error);
    const { revisionSubmissions } = await request.json();
    return NextResponse.json(generateMockRevisionRankings(revisionSubmissions));
  }
}

function generateBatchRevisionRankingPrompt(revisionSubmissions: RevisionSubmission[]): string {
  const revisionsText = revisionSubmissions.map((r, idx) => {
    return `WRITER ${idx + 1}: ${r.playerName}

ORIGINAL:
${r.originalContent.substring(0, 400)}...

REVISED:
${r.revisedContent.substring(0, 400)}...

FEEDBACK THEY RECEIVED:
${JSON.stringify(r.feedback, null, 2).substring(0, 300)}...
---`;
  }).join('\n\n');

  return `You are evaluating the quality of revisions from ${revisionSubmissions.length} students.

${revisionsText}

TASK:
Evaluate each revision based on:
- **Effectiveness**: Did they apply the feedback well?
- **Improvement**: Is the revised version better than the original?
- **Depth**: Are changes meaningful or just superficial edits?
- **Writing Revolution strategies**: Did they use sentence combining, appositives, transitions, etc.?
- **Quality**: Overall writing quality of the revised version

Provide scores 0-100 for each revision. Higher scores for:
- Meaningful improvements (not just adding words)
- Applying feedback suggestions effectively
- Using Writing Revolution strategies
- Clearer, stronger writing in revision
- Thoughtful changes that enhance the piece

Respond in JSON format:
{
  "rankings": [
    {
      "writerIndex": 0,
      "playerName": "name",
      "score": 88,
      "rank": 1,
      "improvements": ["specific improvements they made"],
      "strengths": ["what they did well in revising"],
      "suggestions": ["what could still improve"]
    }
  ]
}

Rank from best (1) to worst (${revisionSubmissions.length}) revision quality.`;
}

function parseBatchRevisionRankings(claudeResponse: string, revisionSubmissions: RevisionSubmission[]): any {
  try {
    const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
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
  } catch (error) {
    console.error('Error parsing batch revision rankings:', error);
  }
  
  return generateMockRevisionRankings(revisionSubmissions);
}

function generateMockRevisionRankings(revisionSubmissions: RevisionSubmission[]): any {
  const rankings = revisionSubmissions.map((submission, index) => {
    // Score based on amount of change and word count difference
    const originalWords = submission.originalContent.split(/\s+/).length;
    const revisedWords = submission.revisedContent.split(/\s+/).length;
    const wordDifference = Math.abs(revisedWords - originalWords);
    const hasSignificantChanges = wordDifference > 10;
    
    const baseScore = hasSignificantChanges ? 75 : 60;
    const changeBonus = Math.min(wordDifference, 20);
    const score = Math.round(Math.min(baseScore + changeBonus + Math.random() * 15, 95));
    
    return {
      playerId: submission.playerId,
      playerName: submission.playerName,
      isAI: submission.isAI,
      score,
      rank: 0, // Will be set after sorting
      improvements: [
        'Added more descriptive details',
        'Improved sentence variety',
      ],
      strengths: [
        'Applied feedback effectively',
        'Made meaningful changes',
      ],
      suggestions: [
        'Could combine more short sentences',
        'Try adding more transitional phrases',
      ],
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

