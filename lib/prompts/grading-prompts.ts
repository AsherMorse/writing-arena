/**
 * Centralized Grading Prompts
 * 
 * All prompts for grading Phase 1 (Writing), Phase 2 (Peer Feedback), and Phase 3 (Revision)
 * are defined here in a single document for easy editing and maintenance.
 * 
 * Edit these prompts to adjust how AI evaluates student work across all phases.
 */

// ============================================================================
// PHASE 1: WRITING EVALUATION PROMPT
// ============================================================================

export function getPhase1WritingPrompt(
  writings: Array<{ playerName: string; content: string }>,
  prompt: string,
  promptType: string,
  trait: string
): string {
  const writingsText = writings.map((w, idx) => 
    `WRITER ${idx + 1}: ${w.playerName}\n${w.content}\n---`
  ).join('\n\n');

  return `You are a writing instructor trained in The Writing Revolution (TWR) methodology. Rank these ${writings.length} student writings using TWR principles.

WRITING PROMPT:
${prompt}

PROMPT TYPE: ${promptType}
FOCUS TRAIT: ${trait}

SUBMISSIONS:
${writingsText}

EVALUATE USING THE WRITING REVOLUTION FRAMEWORK:

**SENTENCE-LEVEL SKILLS** (Primary TWR Focus):
1. Sentence Expansion (because/but/so) - Shows deeper thinking
2. Appositives - Adds description efficiently
3. Sentence Combining - Avoids choppiness
4. Subordinating Conjunctions (although/since/while/when) - Complexity

**ORGANIZATION SKILLS**:
5. Transition Words (First/Then/However/Therefore)
6. Topic Sentences - Clear main idea
7. SPO Structure - Topic + Details + Conclusion

**CONTENT SKILLS**:
8. Five Senses - Show don't tell
9. Specific Details - Precise, not vague
10. Development - Ideas fully explained

SCORING CRITERIA:

**Rank 1 (90-100)**: Mastery of 5+ TWR strategies, sophisticated sentence structures, rich details
**Rank 2-3 (80-89)**: Strong use of 3-4 TWR strategies, good variety, specific details  
**Middle (70-79)**: Uses 2-3 TWR strategies, adequate development, some issues
**Lower (60-69)**: Uses 1 TWR strategy, simple sentences, basic development
**Lowest (below 60)**: No TWR strategies, choppy/simple sentences, underdeveloped

CRITICAL FEEDBACK REQUIREMENTS:
1. QUOTE exact text: "The phrase 'lighthouse stood sentinel'..."
2. NAME the TWR strategy: "uses an appositive (TWR)" or "needs sentence expansion (TWR)"
3. CONCRETE revisions: "Change 'X' to 'X because Y'" not "add details"

For EACH writer provide:
- Overall score (0-100)
- Rank (1 = best)
- 3 SPECIFIC strengths - quote their text + name TWR strategy used
- 3 SPECIFIC improvements - quote what to change + name TWR strategy to use
- Brief trait feedback - reference actual sentences

Return JSON:
{
  "rankings": [
    {
      "playerId": "writer_index_0 through ${writings.length - 1}",
      "playerName": "name",
      "score": 92,
      "rank": 1,
      "strengths": [
        "Opens with an appositive: 'The lighthouse, a weathered sentinel, stood...' (TWR - adds description without new sentence)",
        "Uses 'However' (TWR transition word) to signal shift: 'However, today was different'",
        "Expands with because: 'different because the door stood ajar' (TWR sentence expansion - shows thinking)"
      ],
      "improvements": [
        "Sentence 3 'She approached it' - expand with WHY (because/but/so): 'She approached it because curiosity consumed her thoughts'",
        "Combine sentences 5 and 6 (TWR): 'The rusty door creaked' + 'It was heavy' = 'The rusty door, though heavy, creaked open'",
        "Add transition before sentence 4 (TWR): 'However,' or 'Then,' to connect ideas"
      ],
      "traitFeedback": {
        "content": "[Cite specific ideas and explain using TWR lens]",
        "organization": "[Note transitions, topic sentences used]",
        "grammar": "[Note sentence variety, TWR strategies employed]",
        "vocabulary": "[Quote strong words, suggest TWR improvements]",
        "mechanics": "[Note comma usage with appositives, conjunctions]"
      }
    }
  ]
}

Rank strictly by quality - identify which writers best demonstrate TWR principles.`;
}

// ============================================================================
// PHASE 2: PEER FEEDBACK EVALUATION PROMPT
// ============================================================================

export function getPhase2PeerFeedbackPrompt(
  feedbackSubmissions: Array<{
    playerName: string;
    peerWriting: string;
    responses: {
      clarity: string;
      strengths: string;
      improvements: string;
      organization: string;
      engagement: string;
    };
  }>
): string {
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

// ============================================================================
// PHASE 3: REVISION EVALUATION PROMPT
// ============================================================================

export function getPhase3RevisionPrompt(
  revisionSubmissions: Array<{
    playerName: string;
    originalContent: string;
    revisedContent: string;
    feedback: any;
  }>
): string {
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

