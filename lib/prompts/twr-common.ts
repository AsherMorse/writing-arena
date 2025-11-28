/**
 * Shared TWR (The Writing Revolution) methodology constants and common text
 * Used across all TWR prompt generators
 */

export const TWR_ANALYSIS_CRITERIA = `
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
`;

export const TWR_GRADING_RUBRIC = `
GRADING RUBRIC:

**90-100**: Mastery of 5+ TWR strategies, specific details, varied sentence structure
**80-89**: Strong use of 3-4 TWR strategies, good details, some variety
**70-79**: Uses 2-3 TWR strategies, adequate details, some repetition
**60-69**: Uses 1 TWR strategy, basic details, choppy sentences
**Below 60**: No TWR strategies evident, very simple/choppy, lacks development
`;

export const TWR_FEEDBACK_REQUIREMENTS = `
CRITICAL: Every piece of feedback must:
- Quote their actual text: "In your sentence 'X'..."
- Name the TWR strategy: "Use sentence expansion (because/but/so)"
- Give exact revision: "Change 'X' to 'Y because Z'"
`;

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

