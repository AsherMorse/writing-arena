/**
 * Phase 2: Peer Feedback Evaluation Prompts
 * Prompts for evaluating peer feedback quality
 */

export function getPhase2PeerFeedbackPrompt(
  feedbackSubmissions: Array<{
    playerName: string;
    peerWriting: string;
    responses: {
      mainIdea: string;
      strength: string;
      suggestion: string;
    };
  }>
): string {
  const feedbackText = feedbackSubmissions.map((f, idx) => {
    return `EVALUATOR ${idx + 1}: ${f.playerName}

Peer Writing They Evaluated:
${f.peerWriting.substring(0, 500)}...

Their Feedback (3 Targeted Questions):
- What is the main idea?: ${f.responses.mainIdea}
- What is one strength?: ${f.responses.strength}
- What is one specific suggestion?: ${f.responses.suggestion}
---`;
  }).join('\n\n');

  return `You are evaluating the quality of peer feedback from ${feedbackSubmissions.length} students.

${feedbackText}

TASK:
Evaluate each student's peer feedback based on these 3 targeted questions:

1. **Main Idea Identification**: Did they accurately identify and articulate the main idea?
2. **Strength Recognition**: Did they identify a specific, meaningful strength with examples?
3. **Actionable Suggestion**: Did they provide a concrete, helpful improvement suggestion?

SCORING CRITERIA:
- **High scores (85-100)**: Specific quotes from the text, names TWR strategies, actionable advice
- **Medium scores (70-84)**: Generally specific but could be more concrete
- **Lower scores (50-69)**: Vague or generic feedback without examples
- **Low scores (below 50)**: Unhelpful, unclear, or missing responses

Provide scores 0-100 for each evaluator's feedback quality.

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

