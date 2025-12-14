/**
 * TWR Revision Evaluation Prompts
 * Prompts for evaluating revision quality using TWR standards
 */

export function generateTWRRevisionPrompt(originalContent: string, revisedContent: string, feedback: any): string {
  return `You are evaluating revision quality using The Writing Revolution (TWR) standards.

ORIGINAL WRITING:
${originalContent}

FEEDBACK RECEIVED:
${JSON.stringify(feedback, null, 2)}

REVISED WRITING:
${revisedContent}

EVALUATE USING TWR REVISION STANDARDS:

**EXCELLENT REVISION** (85-100) shows:
✓ Applied TWR strategies from feedback
  - Added because/but/so where suggested
  - Inserted appositives
  - Combined choppy sentences
  - Added transition words
✓ MEANINGFUL changes (not just word swaps)
✓ Improved sentence variety
✓ Added specific details (five senses)
✓ Better organization/flow

**GOOD REVISION** (70-84) shows:
✓ Applied some TWR suggestions
✓ Some sentence combining or expansion
✓ A few added details
✓ Minor improvements in flow

**WEAK REVISION** (below 70) shows:
✗ Ignored feedback
✗ Only minor edits (fixed typos, changed a few words)
✗ No TWR strategies applied
✗ No new sentence structures
✗ Same choppiness/issues remain

SPECIFIC TWR IMPROVEMENTS TO CHECK:
1. Did they add because/but/so where sentences were too simple?
2. Did they insert appositives for description?
3. Did they combine short choppy sentences?
4. Did they add transition words (However, Therefore, etc.)?
5. Did they include sensory details (sight, sound, smell, touch, taste)?
6. Did they use subordinating conjunctions (although, while, since)?

TASK:
Compare original to revised. Identify SPECIFIC TWR improvements made (quote exact changes).

Return JSON:
{
  "score": 85,
  "improvements": [
    "Added appositive in opening: 'lighthouse' became 'lighthouse, a weathered stone tower,' (TWR strategy applied)",
    "Expanded sentence with because: 'She entered' became 'She entered because curiosity overwhelmed her' (TWR sentence expansion)",
    "Combined two short sentences: 'Door rusty. It creaked.' → 'The rusty door creaked open' (TWR combining)"
  ],
  "strengths": [
    "Successfully applied sentence expansion (TWR) in 3 locations",
    "Added transition word 'However' to connect paragraphs (TWR)",
    "Inserted sensory detail 'salty air stung' (TWR five senses)"
  ],
  "suggestions": [
    "Could still combine sentences 4 and 5: 'Room was dark. Equipment everywhere.' → 'The dark room was cluttered with equipment'",
    "Add one more appositive after 'chest': 'the chest, an ancient oak box carved with symbols,'",
    "Insert 'Then' before sentence 6 to improve flow (TWR transition)"
  ]
}`;
}

