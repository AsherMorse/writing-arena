/**
 * @fileoverview GrammarGuard prompt builder and response parser.
 * Provides LLM-based grammar checking for student writing.
 */

import type { GrammarCategory, GrammarGuardMatch } from './dnd-conventions-types';

/**
 * @description Get human-readable description for a grammar category.
 */
export function getCategoryDescription(category: GrammarCategory): string {
  const descriptions: Record<string, string> = {
    CASING: 'Incorrect use of uppercase or lowercase letters',
    COMPOUNDING: 'Errors related to compound words',
    MISC_GRAMMAR: 'Miscellaneous grammatical errors',
    TYPOS: 'Spelling mistakes and typos',
    PUNCTUATION: 'Incorrect or missing punctuation',
    CONFUSED_WORDS: 'Misuse of words that sound similar',
    REPETITIONS: 'Unnecessary repetitions',
    REDUNDANCY: 'Redundant phrases or words',
    SENTENCE_FRAGMENT: 'Incomplete sentences',
    SUBJECT_VERB_AGREEMENT: 'Incorrect subject-verb agreement',
    TENSE_CONSISTENCY: 'Inconsistent use of verb tenses',
    MISPLACED_MODIFIER: 'Misplaced modifiers',
    DANGLING_MODIFIER: 'Dangling modifiers without clear subjects',
    ARTICLE_USAGE: 'Incorrect use or omission of articles',
    PREPOSITION_ERROR: 'Misuse of prepositions',
    PLURALIZATION_ERROR: 'Incorrect plural or singular noun forms',
    DOUBLE_NEGATIVE: 'Use of double negatives',
    RUN_ON_SENTENCE: 'Run-on sentences',
    COMMA_SPLICE: 'Comma splices',
    CAPITALIZATION_ERROR: 'Incorrect capitalization',
    HOMOPHONE_ERROR: 'Confusion between homophones',
    VERB_FORM_ERROR: 'Incorrect verb forms, including irregular verbs',
    WORD_ORDER_ERROR: 'Incorrect word order affecting clarity',
    PASSIVE_VOICE_OVERUSE: 'Overuse of passive voice',
    AWKWARD_PHRASING: 'Grammatically correct but awkward sentences',
    CLICHE_USAGE: 'Use of clichés',
    VERBOSITY: 'Wordiness; using more words than necessary',
    PARALLELISM_ERROR: 'Lack of parallel structure',
    PUNCTUATION_IN_LISTS: 'Incorrect punctuation in lists',
    APOSTROPHE_ERROR: 'Misuse of apostrophes',
    QUOTATION_ERROR: 'Incorrect use of quotation marks',
    AMBIGUOUS_REFERENCE: 'Unclear antecedents',
    WORD_USAGE_ERROR: 'Misused words, words used in wrong context',
    UNFINISHED_THOUGHT: 'Incomplete ideas',
    INCONSISTENT_TONE: 'Mixing formal and informal language',
    COMPARISON_ERROR: 'Incorrect use of comparative and superlative adjectives',
    COLON_SEMICOLON_ERROR: 'Misuse of colons and semicolons',
    SPACING_ERROR: 'Inconsistent spacing',
    FORMATTING_ERROR: 'Formatting issues',
    FACTUAL_ERROR: 'Factual errors',
    NONSENSE_INPUT: 'Gibberish, random letters, or text that is not a coherent attempt at writing',
  };
  return descriptions[category] || 'Unknown category';
}

/**
 * @description Build the GrammarGuard system prompt.
 */
export function buildGrammarGuardPrompt(
  categoriesToCheck?: GrammarCategory[],
  optionalInstructions?: string
): string {
  const categories = categoriesToCheck || [];
  
  const categoryDescriptions = categories
    .map(cat => `${cat}: ${getCategoryDescription(cat)}`)
    .join('\n');

  return `You are a helpful assistant that suggests grammar and spelling fixes for texts.

You will be given a piece of text, and you will suggest corrections for the errors, if there are any.

You will then correct the sentence for the error and return the corrected sentence.

Then, if there's an error, you will provide a detailed explanation/feedback of the issue. When you are providing an explanation:
- Speak in a friendly tone and direct your explanation/feedback as if you're talking directly to a student. For example, instead of saying "There should be a period", say "You'll want to add a period".
- Use simple language and write for a younger audience.
- Be as specific as possible.
- Never say "Let me know".
- Never give the student a solution to the question; you want to teach them how to do it themselves.
- Keep each piece of explanation/feedback to three sentences or less; be concise, friendly and helpful.
- Do not use technical terms, such as "describing phrase", or "noun phrase", or any other grammar jargon.
- Be very friendly about the errors you find.

Here are the types of errors (categories) you can correct for:

${categoryDescriptions}
${optionalInstructions ? `\n${optionalInstructions}` : ''}

Your output should be in the following format (for each error):

Explanation:
Potential New Sentence:
Substring:
Category:

If there are no errors, return 'No errors'. Remember to provide detailed explanation/feedback strings and accurate categorizations for each error you identify.

Here are some additional guidelines to consider:

- Who vs Whom: Both of these are correct in colloquial English, so never flag them as errors.
- Avoid suggesting changes between contractions and their expanded forms (e.g. "I'll" vs "I will"). Both forms are acceptable.
- Do not suggest changes between semicolons and commas when both are grammatically valid.
- Do not suggest changes to proper nouns, even if they appear misspelled, unless you are ABSOLUTELY SURE.
- Beginning of sentences should always be capitalized.
- Only suggest capitalization for proper nouns if you are ABSOLUTELY SURE.
- Do not suggest changes to the Oxford comma style - both with and without are acceptable.
- Look out for fragments and suggest corrections for them.

Examples:

Input: "The cat sitted on the mat."

Output:
Explanation: I noticed you used 'sitted' in your sentence. You'll want to use 'sat' instead. Remember, the past tense of 'sit' is 'sat'.
Potential New Sentence: The cat sat on the mat.
Substring: sitted
Category: VERB_FORM_ERROR


Input: "My father and I is visiting europe."

Output:
Explanation: I noticed that when you wrote "My father and I is", the word "is" doesn't match with having two people. Since you're talking about two people, you'll want to use "are" instead.
Potential New Sentence: My father and I are travelling to europe.
Substring: is
Category: SUBJECT_VERB_AGREEMENT

Explanation: I noticed you wrote "europe" with a lowercase letter. Since Europe is the name of a continent, you'll want to capitalize it.
Potential New Sentence: My father and I are visiting Europe.
Substring: europe
Category: CAPITALIZATION_ERROR

Input: "He was happy."

Output: No errors


Input: "asdfghjkl"

Output:
Explanation: This doesn't appear to be a real attempt at writing. You need to write actual words that describe what your character does. Try writing a complete sentence like "I carefully sneak past the dragon."
Potential New Sentence: [Cannot correct - please write a real sentence]
Substring: asdfghjkl
Category: NONSENSE_INPUT


Input: "run"

Output:
Explanation: You'll want to write a complete sentence describing your action. Instead of just "run", try something like "I run toward the exit" or "I sprint away from the dragon."
Potential New Sentence: I run toward the exit.
Substring: run
Category: NONSENSE_INPUT
`;
}

/**
 * @description Parse the LLM response to extract grammar error matches.
 */
export function parseGrammarGuardResponse(
  originalText: string,
  response: string
): GrammarGuardMatch[] {
  if (!response) {
    return [];
  }

  const trimmedResponse = response.trim();

  if (/^No errors$/i.test(trimmedResponse)) {
    return [];
  }

  const matches: GrammarGuardMatch[] = [];
  const errorSections = trimmedResponse.split(/(?=Explanation:)/g);

  for (const section of errorSections) {
    const explanationMatch = section.match(
      /Explanation:\s*([\s\S]+?)(?=\n(?:Potential New Sentence|Substring|Category):)/
    );
    const potentialSentenceMatch = section.match(
      /Potential New Sentence:\s*([\s\S]+?)(?=\n(?:Explanation|Substring|Category):)/
    );
    const substringMatch = section.match(
      /Substring:\s*([\s\S]+?)(?=\n(?:Explanation|Potential New Sentence|Category):)/
    );
    const categoryMatch = section.match(/Category:\s*(.+?)(?:\n|$)/);

    if (explanationMatch && potentialSentenceMatch && substringMatch && categoryMatch) {
      const match: GrammarGuardMatch = {
        explanation_of_issue: explanationMatch[1].trim(),
        potential_corrected_sentence: potentialSentenceMatch[1].trim(),
        substring_of_interest: substringMatch[1].trim(),
        category: categoryMatch[1].trim() as GrammarCategory,
      };

      matches.push(match);
    }
  }

  // Filter out matches where the corrected sentence is the same as the original
  const filteredMatches = matches.filter(match => {
    const trimmedOriginal = originalText.trim();
    const trimmedCorrected = match.potential_corrected_sentence?.trim() || '';
    return trimmedOriginal !== trimmedCorrected;
  });

  return filteredMatches;
}

