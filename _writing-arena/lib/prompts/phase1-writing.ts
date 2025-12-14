/**
 * Phase 1: Writing Evaluation Prompts
 * Prompts for evaluating student writing submissions
 */

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

