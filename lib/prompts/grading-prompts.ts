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

// ============================================================================
// AP LANGUAGE AND COMPOSITION ESSAY GRADING PROMPTS
// ============================================================================

/**
 * @description Generates grading prompt for AP Lang Argument Essay
 */
export function getAPLangArgumentPrompt(prompt: string, essay: string): string {
  return `You are an AP Language and Composition exam reader scoring a student's ARGUMENT essay.

AP PROMPT:
${prompt}

STUDENT'S ESSAY:
${essay}

TASK:
Score this essay using the official AP Language and Composition ARGUMENT rubric (0-6 scale).

SCORING RUBRIC:

**THESIS (0-1 point)**
- 1 point: Responds to the prompt with a defensible thesis that establishes a line of reasoning
  • Thesis may be qualified (e.g., "somewhat valid," "valid to an extent")
- 0 points: Does not meet criteria for 1 point

**EVIDENCE AND COMMENTARY (0-4 points)**
IMPORTANT: Evidence includes personal anecdotes, observations, real-world examples, cultural references (films, books, public figures), hypothetical scenarios, and reasoning. Academic sources are NOT required.

- 4 points: Provides specific evidence to support all claims in a line of reasoning AND consistently explains how the evidence supports the line of reasoning
  • "Specific evidence" includes: personal experiences with details, pop culture examples, social observations, real-world scenarios, statistics, anecdotes
  • "Consistently explains" means the writer generally connects evidence to claims, even if some connections could be stronger
  • Multiple types of evidence strengthen the argument
  
- 3 points: Provides specific evidence to support all claims in a line of reasoning AND explains how some of the evidence supports the line of reasoning
  • Evidence is specific but commentary is inconsistent
  • Some evidence is well-explained, other evidence is merely stated
  
- 2 points: Provides some specific evidence BUT does not consistently explain how the evidence supports the line of reasoning
  • Limited evidence or general examples
  • Weak or minimal commentary
  
- 1 point: Provides mostly general evidence AND inconsistently explains how the evidence supports the line of reasoning
  • Vague examples without specifics
  • Little to no explanation of how evidence relates to thesis
  
- 0 points: Does not provide evidence or fails to address the prompt

**SOPHISTICATION (0-1 point)**
- 1 point: Demonstrates sophistication of thought and/or a complex understanding of the rhetorical situation through one or more of the following:
  • Explaining the significance or relevance of the argument within a broader context
  • Identifying and exploring TENSIONS, LIMITATIONS, or COMPLEXITIES (e.g., exploring the balance between competing priorities)
  • Acknowledging counterarguments or alternative perspectives and responding to them
  • Discussing implications or consequences of the argument
  • Employing a style that is consistently vivid and persuasive
  • Making effective rhetorical choices that strengthen the argument
  
  EXAMPLES OF SOPHISTICATION:
  • Exploring tensions between competing values or priorities
  • Discussing the balance or trade-offs between different approaches
  • Addressing limitations or boundaries of the argument
  • Situating the argument in broader social, philosophical, or ethical contexts
  
- 0 points: Sophistication is merely ATTEMPTED but not achieved
  • Phrases that gesture toward sophistication without developing them
  • Surface-level mention of complexity without exploration
  • Sophistication only in conclusion, not developed throughout

CRITICAL EVALUATION GUIDELINES:

1. **Thesis**: Look for a clear position (even if qualified). Accept "somewhat valid," "to an extent," or similar nuanced positions.

2. **Evidence**: 
   - ACCEPT personal anecdotes, observations, pop culture, hypothetical scenarios
   - DO NOT require academic sources or citations
   - Value SPECIFICITY (names, numbers, details) over formality
   - Multiple evidence types (personal + cultural + observational) = stronger

3. **Commentary**:
   - For 4 points: Writer generally explains connections, even if not every sentence is perfectly explicit
   - For 3 points: Writer explains some but not all evidence clearly
   - Focus on whether the reader can follow the line of reasoning, not whether every connection is spelled out

4. **Sophistication**: 
   - EARNED by exploring tensions, limitations, balance, complexities, or counterarguments
   - EARNED by discussing implications or broader significance
   - NOT EARNED by merely mentioning complexity without developing it
   - Look for this throughout the essay, especially in body paragraphs and analysis

FORMAT DETAILED FEEDBACK: Write 2-3 paragraphs separated by \\n\\n (double newline). Start with what the writer did well, then discuss areas for improvement, then provide an overall assessment or specific advice.

Respond in JSON format:
{
  "score": 4,
  "scoreDescriptor": "Adequate",
  "thesisScore": 1,
  "evidenceScore": 3,
  "sophisticationScore": 0,
  "strengths": [
    "Clear thesis that directly addresses the prompt",
    "Provides specific examples to support claims",
    "Good organizational structure with clear paragraphs"
  ],
  "improvements": [
    "Could strengthen commentary connecting evidence to the argument",
    "Consider exploring complexities or tensions more deeply for sophistication",
    "Some evidence could be explained more explicitly"
  ],
  "detailedFeedback": "Your essay demonstrates a solid understanding of the prompt and provides relevant evidence. The thesis is clear and defensible, establishing a position that you maintain throughout the essay.\\n\\nHowever, the commentary connecting your evidence to your argument could be more explicit and developed. While you provide specific examples, the explanation of HOW these examples support your line of reasoning needs strengthening. Additionally, to earn the sophistication point, consider exploring complexities or tensions more deeply rather than mentioning them only briefly.\\n\\nTo reach a higher score, focus on explaining HOW your evidence supports your line of reasoning, not just WHAT the evidence says. Make the connections between your examples and your thesis more explicit throughout the essay."
}`;
}

/**
 * @description Generates grading prompt for AP Lang Rhetorical Analysis Essay
 */
export function getAPLangRhetoricalAnalysisPrompt(prompt: string, essay: string): string {
  return `You are an AP Language and Composition exam reader scoring a student's RHETORICAL ANALYSIS essay.

AP PROMPT:
${prompt}

STUDENT'S ESSAY:
${essay}

TASK:
Score this essay using the official AP Language and Composition RHETORICAL ANALYSIS rubric (0-6 scale).

SCORING RUBRIC:

**THESIS (0-1 point)**
- 1 point: Responds to the prompt with a defensible thesis that analyzes the writer's rhetorical choices
- 0 points: Does not meet criteria for 1 point

**EVIDENCE AND COMMENTARY (0-4 points)**
- 4 points: Provides specific evidence to support all claims in a line of reasoning AND consistently explains how the evidence supports the analysis of the writer's rhetorical choices
- 3 points: Provides specific evidence to support all claims AND explains how some of the evidence supports the analysis of the writer's rhetorical choices
- 2 points: Provides some specific evidence BUT does not consistently explain how the evidence supports the analysis of rhetorical choices
- 1 point: Provides mostly general evidence AND inconsistently explains how evidence relates to the analysis
- 0 points: Does not provide evidence or fails to address the prompt

**SOPHISTICATION (0-1 point)**
- 1 point: Demonstrates sophistication of thought and/or a complex understanding of the rhetorical situation through one or more of the following:
  • Explaining the significance or relevance of the writer's rhetorical choices within a broader context
  • Employing a style that is consistently vivid and persuasive
  • Identifying and exploring complexities or tensions in the rhetorical choices
  • Articulating the implications of the writer's choices for the audience or purpose
- 0 points: Does not meet criteria for 1 point

CRITICAL EVALUATION REQUIREMENTS:
1. Check if thesis identifies specific rhetorical choices and their relationship to the writer's purpose/argument
2. Evaluate whether evidence includes specific textual details (quotes, paraphrases) from the passage
3. Assess whether analysis explains HOW and WHY rhetorical choices achieve the writer's purpose (not just identifying them)
4. Look for sophisticated understanding of rhetorical strategies, audience, context, or purpose
5. Consider organization and clarity of the analysis

IMPORTANT: Students should ANALYZE rhetorical choices (explain how/why they work), not merely IDENTIFY or SUMMARIZE them.

FORMAT DETAILED FEEDBACK: Write 2-3 paragraphs separated by \\n\\n (double newline). Start with what the writer did well, then discuss areas for improvement, then provide an overall assessment or specific advice.

Respond in JSON format:
{
  "score": 4,
  "scoreDescriptor": "Adequate",
  "thesisScore": 1,
  "evidenceScore": 3,
  "sophisticationScore": 0,
  "strengths": [
    "Identifies specific rhetorical choices with textual evidence",
    "Thesis clearly states the writer's purpose and some rhetorical strategies",
    "Organizes analysis around multiple rhetorical choices"
  ],
  "improvements": [
    "Move beyond identifying rhetorical devices to analyzing HOW and WHY they achieve the purpose",
    "Provide more specific textual evidence (direct quotes) to support claims",
    "Connect rhetorical choices more explicitly to the writer's intended effect on the audience"
  ],
  "detailedFeedback": "Your essay identifies relevant rhetorical choices and provides some analysis. You successfully recognize key strategies the author uses and organize your essay around multiple rhetorical choices, which demonstrates a solid understanding of the text.\\n\\nHowever, to reach a higher score, you need to move beyond identification to deeper analysis. Focus on explaining HOW these rhetorical choices achieve the writer's purpose and WHY they are effective for the intended audience. Your commentary should explore the function and impact of these choices rather than simply listing or describing them.\\n\\nIncorporate more specific textual evidence with direct quotes, and make explicit connections between the rhetorical strategies and their effects on the audience. This deeper level of analysis will elevate your essay significantly."
}`;
}

/**
 * @description Generates grading prompt for AP Lang Synthesis Essay
 */
export function getAPLangSynthesisPrompt(prompt: string, essay: string): string {
  return `You are an AP Language and Composition exam reader scoring a student's SYNTHESIS essay.

AP PROMPT:
${prompt}

STUDENT'S ESSAY:
${essay}

TASK:
Score this essay using the official AP Language and Composition SYNTHESIS rubric (0-6 scale).

SCORING RUBRIC:

**THESIS (0-1 point)**
- 1 point: Responds to the prompt with a defensible thesis that establishes a line of reasoning
- 0 points: Does not meet criteria for 1 point

**EVIDENCE AND COMMENTARY (0-4 points)**
- 4 points: Provides specific evidence from at least THREE sources to support all claims in a line of reasoning AND consistently explains how the evidence supports the line of reasoning
- 3 points: Provides specific evidence from at least THREE sources to support all claims AND explains how some of the evidence supports the line of reasoning
- 2 points: Provides evidence from at least TWO sources BUT does not consistently explain how the evidence supports the line of reasoning
- 1 point: Provides evidence from at least TWO sources BUT does not explain how the evidence supports reasoning, OR only uses evidence from ONE source
- 0 points: Does not provide evidence from sources or fails to address the prompt

**SOPHISTICATION (0-1 point)**
- 1 point: Demonstrates sophistication of thought and/or a complex understanding of the rhetorical situation through one or more of the following:
  • Articulating the limits or implications of an argument by situating it within a broader context
  • Employing a style that is consistently vivid and persuasive
  • Making effective rhetorical choices that strengthen the argument
  • Developing a complex argument by making strategic connections among multiple sources
  • Addressing potential objections or alternative views thoughtfully
- 0 points: Does not meet criteria for 1 point

CRITICAL EVALUATION REQUIREMENTS:
1. Check if thesis directly responds to the prompt and establishes a clear position/line of reasoning
2. Count and verify proper citation of sources (must cite at least 3 sources for full credit)
3. Evaluate whether sources are SYNTHESIZED (integrated to support the argument) not just SUMMARIZED
4. Assess how well the student explains the connection between sources and their argument
5. Look for sophisticated synthesis showing relationships between sources or addressing complexities
6. Verify proper attribution (e.g., "Source A," "According to Source B")

IMPORTANT: Students must SYNTHESIZE sources (use them to build an argument), not just summarize them. Sources should work together to support the thesis.

FORMAT DETAILED FEEDBACK: Write 2-3 paragraphs separated by \\n\\n (double newline). Start with what the writer did well, then discuss areas for improvement, then provide an overall assessment or specific advice.

Respond in JSON format:
{
  "score": 4,
  "scoreDescriptor": "Adequate",
  "thesisScore": 1,
  "evidenceScore": 3,
  "sophisticationScore": 0,
  "strengths": [
    "Clear thesis that takes a defensible position on the issue",
    "Cites at least three sources with proper attribution",
    "Attempts to integrate source material into the argument"
  ],
  "improvements": [
    "Synthesize sources more effectively—show how they relate to each other and build your argument",
    "Explain more clearly how each source supports your specific claims",
    "Consider addressing counterarguments or limitations to demonstrate sophistication"
  ],
  "detailedFeedback": "Your essay presents a clear position and incorporates multiple sources with proper attribution. You demonstrate understanding of the issue and make an effort to integrate source material into your argument, which is a solid foundation.\\n\\nHowever, to reach a higher score, focus on SYNTHESIZING sources rather than summarizing them separately. Show how sources work together and relate to each other in building your argument. The connections between your evidence and your claims need to be more explicit—explain not just what the sources say, but how they specifically support your line of reasoning.\\n\\nConsider also addressing counterarguments or exploring the limitations of your position to demonstrate sophistication. Strong synthesis essays show strategic connections among sources and situate the argument within a broader context."
}`;
}

