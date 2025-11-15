/**
 * The Writing Revolution (TWR) Aligned Prompts
 * 
 * These prompts ensure AI grading explicitly uses TWR methodology:
 * - Sentence Expansion (because/but/so)
 * - Appositives (descriptive phrases)
 * - Sentence Combining
 * - Transition Words
 * - SPO (Single Paragraph Outline)
 * - Five Senses
 */

export function generateTWRWritingPrompt(content: string, trait: string, promptType: string): string {
  return `You are a writing instructor trained in The Writing Revolution (TWR) methodology. Analyze this student's writing using TWR principles.

STUDENT WRITING:
${content}

CONTEXT:
- Prompt type: ${promptType}
- Focus trait: ${trait}
- TWR Framework: Explicit sentence-level instruction

THE WRITING REVOLUTION ANALYSIS CRITERIA:

1. **SENTENCE EXPANSION** - Do they expand ideas with because/but/so?
   - Check for: because (causation), but (contrast), so (result)
   - Example: "She opened the door because the light intrigued her" (shows thinking)

2. **APPOSITIVES** - Do they add description efficiently?
   - Check for: noun phrases set off by commas
   - Example: "The lighthouse, a weathered stone tower, stood on the cliff"

3. **SENTENCE COMBINING** - Do they avoid choppy sentences?
   - Check for: variety in sentence length and structure
   - Example: Combining "The door was rusty. It was heavy." → "The rusty door was heavy."

4. **TRANSITION WORDS** - Do they connect ideas logically?
   - Check for: First/Then/However/Therefore/For example/In addition
   - Shows organization and logical flow

5. **TOPIC SENTENCES** - Clear main idea at start?
   - Check for: Clear topic sentence followed by supporting details
   - SPO structure: Topic + Details + Conclusion

6. **SENSORY DETAILS** - Do they show, not tell?
   - Check for: Five senses (sight, sound, smell, touch, taste)
   - Example: "The salty air stung my eyes" vs. "The air smelled like ocean"

7. **SUBORDINATING CONJUNCTIONS** - Complex sentence structures?
   - Check for: Although/Since/While/When/If/Unless
   - Shows sophisticated thinking

GRADING RUBRIC:

**90-100**: Mastery of 5+ TWR strategies, specific details, varied sentence structure
**80-89**: Strong use of 3-4 TWR strategies, good details, some variety
**70-79**: Uses 2-3 TWR strategies, adequate details, some repetition
**60-69**: Uses 1 TWR strategy, basic details, choppy sentences
**Below 60**: No TWR strategies evident, very simple/choppy, lacks development

TASK:
Provide HIGHLY SPECIFIC feedback that:
1. QUOTES exact sentences/phrases from their writing
2. Names specific TWR strategies they used well OR should use
3. Gives CONCRETE revisions: "Change X to Y" or "Add because after 'opened the door'"

CRITICAL: Every piece of feedback must:
- Quote their actual text: "In your sentence 'X'..."
- Name the TWR strategy: "Use sentence expansion (because/but/so)"
- Give exact revision: "Change 'X' to 'Y because Z'"

Format response as JSON:
{
  "overallScore": 85,
  "traits": {
    "content": 88,
    "organization": 82,
    "grammar": 85,
    "vocabulary": 80,
    "mechanics": 90
  },
  "strengths": [
    "In your opening 'The lighthouse, a weathered stone sentinel, stood...' you use an APPOSITIVE (TWR strategy) to add vivid description efficiently",
    "Your use of 'However' (transition word - TWR) effectively signals the shift from routine to discovery",
    "The phrase 'golden light spilled from within' uses sensory detail (sight - TWR five senses) creating strong imagery"
  ],
  "improvements": [
    "In sentence 3 'She opened the door', expand with BECAUSE (sentence expansion - TWR): 'She opened the door because the mysterious glow pulled her forward'",
    "Combine sentences 5 and 6 (sentence combining - TWR): Instead of 'The room was dusty. Old equipment filled it.' try: 'The dusty room was filled with old equipment'",
    "After 'inside the circular room', add an appositive (TWR): 'inside the circular room, a space that had been sealed for decades, she saw...'"
  ],
  "specificFeedback": {
    "content": "[Quote specific ideas and evaluate using TWR principles]",
    "organization": "[Note transitions, topic sentences, SPO structure]",
    "grammar": "[Note sentence variety, combining, expansion opportunities]",
    "vocabulary": "[Note strong word choices with examples, suggest precise alternatives]",
    "mechanics": "[Note punctuation with appositives, commas with conjunctions]"
  },
  "nextSteps": [
    "Practice SENTENCE EXPANSION: Take 3 simple sentences and expand each with because/but/so",
    "Practice APPOSITIVES: Add descriptive phrases after 2-3 nouns in your next piece",
    "Practice SENTENCE COMBINING: Find 4 pairs of short sentences and combine them"
  ]
}`;
}

export function generateTWRBatchRankingPrompt(
  writings: any[], 
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

export function generateTWRPeerFeedbackPrompt(responses: any, peerWriting: string): string {
  return `You are evaluating peer feedback quality using The Writing Revolution (TWR) standards.

PEER'S WRITING THAT WAS REVIEWED:
${peerWriting}

STUDENT'S PEER FEEDBACK PROVIDED:
1. Main idea clarity: ${responses.clarity || 'Not provided'}
2. Strengths noted: ${responses.strengths || 'Not provided'}
3. Improvements suggested: ${responses.improvements || 'Not provided'}
4. Organization feedback: ${responses.organization || 'Not provided'}
5. Engagement feedback: ${responses.engagement || 'Not provided'}

EVALUATE USING TWR PEER FEEDBACK STANDARDS:

**HIGH QUALITY PEER FEEDBACK** (80-100) includes:
✓ QUOTES specific sentences/phrases from peer's writing
✓ Names TWR strategies peer used: "You used an appositive in sentence 2"
✓ Points to EXACT locations: "In your third sentence...", "The word 'X' in line 2..."
✓ Gives CONCRETE TWR suggestions: "Expand 'She ran' to 'She ran because...'"
✓ References TWR terms: sentence expansion, appositives, transition words, combining, etc.

**LOW QUALITY PEER FEEDBACK** (below 70) has:
✗ Vague comments: "good writing", "nice job", "interesting"
✗ No quotes or examples from the text
✗ General advice: "add more details" (WHERE? WHAT details?)
✗ No reference to specific sentences
✗ No TWR strategies mentioned

EXAMPLES OF GOOD PEER FEEDBACK:
✓ "Your appositive 'a weathered stone sentinel' adds vivid description (TWR strategy)"
✓ "In sentence 3, expand 'She went in' with because: 'She went in because the light beckoned'"
✓ "Combine sentences 2 and 3 (TWR): 'The old door, though rusty, opened easily'"

EXAMPLES OF BAD PEER FEEDBACK:
✗ "Good use of description"
✗ "Add more transitions"
✗ "Nice vocabulary"

TASK:
Evaluate if this student's feedback:
1. Quotes the peer's actual text
2. References specific TWR strategies
3. Gives concrete, actionable suggestions
4. Points to exact locations

Return JSON:
{
  "score": 85,
  "strengths": [
    "You quoted 'the lighthouse stood sentinel' which shows you read carefully",
    "You identified the appositive strategy by name (TWR)",
    "You gave a concrete revision: 'expand with because' - that's actionable"
  ],
  "improvements": [
    "Quote MORE specific phrases - reference at least 3 exact sentences",
    "Name the TWR strategies you see - say 'I notice you used sentence expansion' not just 'good sentences'",
    "Give concrete examples: Instead of 'add details,' say 'after lighthouse, add appositive: The lighthouse, a crumbling stone tower, stood...'"
  ]
}`;
}

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

export function generateTWRFeedbackPrompt(content: string, promptType: string): string {
  return `You are a supportive writing instructor using The Writing Revolution (TWR) methodology to provide revision feedback.

STUDENT'S WRITING:
${content}

PROMPT TYPE: ${promptType}

YOUR GOAL: Help them revise using specific TWR strategies.

THE WRITING REVOLUTION STRATEGIES TO TEACH:

1. **SENTENCE EXPANSION** (because/but/so)
   - Look for simple sentences that need WHY/CONTRAST/RESULT
   - Example: "She opened the door" → "She opened the door because the light intrigued her"

2. **APPOSITIVES** (descriptive phrases)
   - Look for nouns that need description
   - Example: "The lighthouse" → "The lighthouse, a weathered stone tower,"

3. **SENTENCE COMBINING**
   - Look for choppy sequences of short sentences
   - Example: "Door rusty. It creaked." → "The rusty door creaked open"

4. **TRANSITION WORDS**
   - Look for missing connectors between ideas
   - Add: First/Then/However/Therefore/For example/In addition

5. **SENSORY DETAILS** (five senses)
   - Look for vague descriptions
   - Example: "It smelled bad" → "The musty odor of mildew filled her nostrils"

6. **SUBORDINATING CONJUNCTIONS**
   - Look for opportunities to show relationships
   - Add: Although/Since/While/When/If/Unless

FEEDBACK REQUIREMENTS:

✓ QUOTE their exact sentences: "In your sentence 'She walked in'..."
✓ NAME the TWR strategy needed: "Use sentence expansion (because)"
✓ SHOW the exact revision: "Change to: 'She walked in because curiosity overwhelmed her'"

SPECIFICITY EXAMPLES:

GOOD ✓:
- "Your opening 'The lighthouse stood' could use an appositive (TWR): 'The lighthouse, a crumbling stone tower, stood...'"
- "Expand sentence 2 'I went inside' with because (TWR): 'I went inside because the golden light beckoned me'"
- "Combine sentences 4-5 (TWR): 'It was dark. I was scared' → 'Though it was dark, I continued forward'"

BAD ✗:
- "Good opening sentence" (not specific, no TWR strategy named)
- "Add more details" (WHERE? WHAT details? HOW?)
- "Use better transitions" (WHICH sentences? WHICH words?)

Return JSON with 3 strengths and 3 improvements:
{
  "strengths": [
    "[Quote their text] + [Name TWR strategy used] + [Why it works]",
    "[Quote exact phrase] + [TWR strategy: appositive/expansion/etc] + [Effect]",
    "[Quote sentence] + [TWR technique employed] + [Impact on reader]"
  ],
  "improvements": [
    "[Quote exact sentence] + [TWR strategy to use] + [Exact revision example]",
    "[Quote phrase to change] + [TWR technique: combining/expanding] + [Specific new version]",
    "[Point to location] + [TWR strategy needed] + [Concrete example of how]"
  ],
  "score": 78
}`;
}

export const TWR_STRATEGIES = {
  sentenceExpansion: {
    name: 'Sentence Expansion',
    description: 'Expand simple sentences with because/but/so to show deeper thinking',
    examples: [
      'Simple: "She opened the door." → Expanded: "She opened the door because the golden light intrigued her."',
      'Simple: "It was dark." → Expanded: "It was dark but she continued forward."',
      'Simple: "I ran home." → Expanded: "I ran home so I could tell my parents."',
    ],
    keywords: ['because', 'but', 'so'],
  },
  
  appositives: {
    name: 'Appositives',
    description: 'Add descriptive phrases set off by commas to provide more information',
    examples: [
      '"The lighthouse" → "The lighthouse, a weathered stone tower,"',
      '"Sarah" → "Sarah, a curious ten-year-old,"',
      '"The chest" → "The chest, an ancient oak box carved with mysterious symbols,"',
    ],
    keywords: ['appositive', 'descriptive phrase', 'commas'],
  },
  
  sentenceCombining: {
    name: 'Sentence Combining',
    description: 'Join short choppy sentences for better flow',
    examples: [
      '"The door was rusty. It creaked." → "The rusty door creaked open."',
      '"I was scared. I went in anyway." → "Though scared, I went in anyway."',
      '"Chest glowed. Light was golden." → "The chest glowed with golden light."',
    ],
    keywords: ['combine', 'combining', 'choppy'],
  },
  
  transitionWords: {
    name: 'Transition Words',
    description: 'Connect ideas with signal words',
    examples: [
      'Sequence: First, Then, Next, Finally',
      'Contrast: However, Nevertheless, On the other hand',
      'Cause/Effect: Therefore, Consequently, As a result',
      'Addition: Furthermore, In addition, Moreover',
      'Example: For instance, For example, Specifically',
    ],
    keywords: ['transition', 'however', 'therefore', 'first', 'then'],
  },
  
  sensoryDetails: {
    name: 'Five Senses',
    description: 'Show, don\'t tell - use sight, sound, smell, touch, taste',
    examples: [
      'Tell: "It smelled bad" → Show: "The musty odor of mildew filled the air"',
      'Tell: "I was scared" → Show: "My hands trembled as I reached for the handle"',
      'Tell: "The light was bright" → Show: "The golden light seared my eyes"',
    ],
    keywords: ['sensory', 'sight', 'sound', 'smell', 'touch', 'taste', 'show don\'t tell'],
  },
  
  subordinatingConjunctions: {
    name: 'Subordinating Conjunctions',
    description: 'Add complexity with although/since/while/when/if/unless',
    examples: [
      'Simple: "I was tired. I kept going." → Complex: "Although I was tired, I kept going."',
      'Simple: "It rained. We stayed inside." → Complex: "Since it rained, we stayed inside."',
      'Simple: "She sang. She worked." → Complex: "While she worked, she sang."',
    ],
    keywords: ['although', 'since', 'while', 'when', 'if', 'unless', 'subordinating'],
  },
};

export function validateTWRFeedback(feedback: any): {
  isSpecific: boolean;
  mentionsTWR: boolean;
  hasQuotes: boolean;
  hasConcreteExamples: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  const allText = [
    ...(feedback.strengths || []),
    ...(feedback.improvements || []),
  ].join(' ').toLowerCase();
  
  // Check if feedback quotes actual text
  const hasQuotes = allText.includes('"') || allText.includes("'");
  if (!hasQuotes) {
    issues.push('Feedback does not quote student text');
  }
  
  // Check if TWR strategies are mentioned
  const twrKeywords = [
    'because', 'but', 'so', 'appositive', 'combining', 'combine',
    'transition', 'however', 'therefore', 'expand', 'expansion',
    'sentence', 'sensory', 'subordinating', 'conjunction',
  ];
  
  const mentionsTWR = twrKeywords.some(keyword => allText.includes(keyword));
  if (!mentionsTWR) {
    issues.push('Feedback does not mention TWR strategies');
  }
  
  // Check if feedback is specific (longer responses)
  const avgLength = (feedback.improvements || []).reduce((sum: number, text: string) => 
    sum + text.length, 0
  ) / (feedback.improvements?.length || 1);
  
  const isSpecific = avgLength > 40; // Specific feedback is detailed
  if (!isSpecific) {
    issues.push('Feedback is too brief/vague (avg < 40 chars)');
  }
  
  // Check for concrete examples (words like "change", "add", "insert")
  const actionWords = ['change', 'add', 'insert', 'combine', 'expand', 'try'];
  const hasConcreteExamples = actionWords.some(word => allText.includes(word));
  if (!hasConcreteExamples) {
    issues.push('Feedback lacks concrete action words (change/add/expand)');
  }
  
  return {
    isSpecific,
    mentionsTWR,
    hasQuotes,
    hasConcreteExamples,
    issues,
  };
}

