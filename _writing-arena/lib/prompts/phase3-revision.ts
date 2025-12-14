/**
 * Phase 3: Revision Evaluation Prompts
 * Prompts for evaluating revision quality
 */

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
${r.originalContent ? r.originalContent.substring(0, 400) : ''}...

REVISED:
${r.revisedContent ? r.revisedContent.substring(0, 400) : ''}...

FEEDBACK THEY RECEIVED:
${r.feedback ? JSON.stringify(r.feedback, null, 2).substring(0, 300) : 'No feedback provided'}...
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

