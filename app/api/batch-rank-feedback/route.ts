import { NextRequest, NextResponse } from 'next/server';

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
  try {
    const { feedbackSubmissions } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json(generateMockFeedbackRankings(feedbackSubmissions));
    }

    // Call Claude API to rank all feedback submissions together
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        messages: [
          {
            role: 'user',
            content: generateBatchFeedbackRankingPrompt(feedbackSubmissions),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Claude API request failed');
    }

    const data = await response.json();
    const rankings = parseBatchFeedbackRankings(data.content[0].text, feedbackSubmissions);

    return NextResponse.json(rankings);
  } catch (error) {
    console.error('Error batch ranking feedback:', error);
    const { feedbackSubmissions } = await request.json();
    return NextResponse.json(generateMockFeedbackRankings(feedbackSubmissions));
  }
}

function generateBatchFeedbackRankingPrompt(feedbackSubmissions: FeedbackSubmission[]): string {
  const feedbackText = feedbackSubmissions.map((f, idx) => {
    return `EVALUATOR ${idx + 1}: ${f.playerName}

Peer Writing They Evaluated:
${f.peerWriting.substring(0, 500)}...

Their Feedback:
- Main idea clarity: ${f.responses.clarity}
- Strengths noted: ${f.responses.strengths}
- Improvements suggested: ${f.responses.improvements}
- Organization: ${f.responses.organization}
- Engagement: ${f.responses.engagement}
---`;
  }).join('\n\n');

  return `You are evaluating the quality of peer feedback from ${feedbackSubmissions.length} students.

${feedbackText}

TASK:
Evaluate each student's peer feedback based on:
- **Specificity**: Are comments specific with examples, or vague/general?
- **Constructiveness**: Are suggestions helpful and actionable?
- **Completeness**: Did they address all aspects thoroughly?
- **Insight**: Do they demonstrate understanding of good writing?
- **Writing Revolution principles**: Do they reference specific strategies?

Provide scores 0-100 for each evaluator's feedback quality. Higher scores for:
- Specific references to sentences/phrases
- Actionable improvement suggestions
- Mentions of writing techniques (transitions, sentence variety, etc.)
- Constructive tone
- Thorough responses

Respond in JSON format:
{
  "rankings": [
    {
      "evaluatorIndex": 0,
      "playerName": "name",
      "score": 85,
      "rank": 1,
      "strengths": ["what they did well in giving feedback"],
      "improvements": ["how to improve feedback skills"]
    }
  ]
}

Rank from best (1) to worst (${feedbackSubmissions.length}) feedback quality.`;
}

function parseBatchFeedbackRankings(claudeResponse: string, feedbackSubmissions: FeedbackSubmission[]): any {
  try {
    const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
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
  } catch (error) {
    console.error('Error parsing batch feedback rankings:', error);
  }
  
  return generateMockFeedbackRankings(feedbackSubmissions);
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

