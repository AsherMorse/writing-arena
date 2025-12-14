/**
 * TWR Peer Feedback Evaluation Prompts
 * Prompts for evaluating peer feedback quality using TWR standards
 */

export function generateTWRPeerFeedbackPrompt(responses: any, peerWriting: string): string {
  return `You are evaluating peer feedback quality using The Writing Revolution (TWR) standards.

PEER'S WRITING THAT WAS REVIEWED:
${peerWriting}

STUDENT'S PEER FEEDBACK (3 Targeted Questions):
1. Main Idea: ${responses.mainIdea || 'Not provided'}
2. One Strength: ${responses.strength || 'Not provided'}
3. One Suggestion: ${responses.suggestion || 'Not provided'}

EVALUATE EACH RESPONSE:

**1. Main Idea (Was it accurate and clear?)**
- Did they correctly identify the central point?
- Did they explain it in their own words?

**2. Strength (Was it specific and text-based?)**
- Did they quote or reference specific text?
- Did they explain WHY it was effective?

**3. Suggestion (Was it actionable and constructive?)**
- Is the suggestion specific and concrete?
- Can the writer actually implement it?

SCORING CRITERIA:
- **90-100**: All three responses are specific, text-based, and actionable
- **80-89**: Two responses are strong, one could be more specific
- **70-79**: Shows understanding but lacks specificity
- **60-69**: Vague or generic responses
- **Below 60**: Incomplete or unhelpful

Return JSON:
{
  "score": 85,
  "strengths": [
    "Correctly identified the main idea",
    "Quoted specific text when noting strength"
  ],
  "improvements": [
    "Make suggestions more concrete - say exactly what to add/change",
    "Try referencing specific sentences by location"
  ]
}`;
}

