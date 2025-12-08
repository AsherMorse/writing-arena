/**
 * @fileoverview Tutorial content mapping for practice activities.
 * Maps lesson IDs to their tutorial markdown content.
 */

// Sentence-level tutorials
import fragmentOrSentence from './fragment-or-sentence.md';
import basicConjunctions from './basic-conjunctions.md';
import writeAppositives from './write-appositives.md';
import subordinatingConjunctions from './subordinating-conjunctions.md';
import kernelExpansion from './kernel-expansion.md';

// Paragraph-level tutorials
import identifyTopicSentence from './identify-topic-sentence.md';
import eliminateIrrelevantSentences from './eliminate-irrelevant-sentences.md';
import writeTsFromDetails from './write-ts-from-details.md';
import writeCsFromDetails from './write-cs-from-details.md';
import makeTopicSentences from './make-topic-sentences.md';
import writingSpos from './writing-spos.md';
import elaborateParagraphs from './elaborate-paragraphs.md';
import usingTransitionWords from './using-transition-words.md';
import finishingTransitionWords from './finishing-transition-words.md';
import writeFreeformParagraph from './write-freeform-paragraph.md';

// Essay-level tutorials
import distinguishGst from './distinguish-g-s-t.md';
import writeSFromGt from './write-s-from-g-t.md';
import writeGsFromT from './write-g-s-from-t.md';
import craftConclusionFromGst from './craft-conclusion-from-gst.md';
import writeIntroductorySentences from './write-introductory-sentences.md';
import writeTFromTopic from './write-t-from-topic.md';
import matchDetailsProCon from './match-details-pro-con.md';
import preTransitionOutline from './pre-transition-outline.md';

/**
 * @description Mapping of lesson IDs to their tutorial markdown content.
 */
export const TUTORIAL_CONTENT: Record<string, string> = {
  // Sentence-level
  'fragment-or-sentence': fragmentOrSentence,
  'basic-conjunctions': basicConjunctions,
  'write-appositives': writeAppositives,
  'subordinating-conjunctions': subordinatingConjunctions,
  'kernel-expansion': kernelExpansion,

  // Paragraph-level
  'identify-topic-sentence': identifyTopicSentence,
  'eliminate-irrelevant-sentences': eliminateIrrelevantSentences,
  'write-ts-from-details': writeTsFromDetails,
  'write-cs-from-details': writeCsFromDetails,
  'make-topic-sentences': makeTopicSentences,
  'writing-spos': writingSpos,
  'elaborate-paragraphs': elaborateParagraphs,
  'using-transition-words': usingTransitionWords,
  'finishing-transition-words': finishingTransitionWords,
  'write-freeform-paragraph': writeFreeformParagraph,

  // Essay-level
  'distinguish-g-s-t': distinguishGst,
  'write-s-from-g-t': writeSFromGt,
  'write-g-s-from-t': writeGsFromT,
  'craft-conclusion-from-gst': craftConclusionFromGst,
  'write-introductory-sentences': writeIntroductorySentences,
  'write-t-from-topic': writeTFromTopic,
  'match-details-pro-con': matchDetailsProCon,
  'pre-transition-outline': preTransitionOutline,
};

/**
 * @description Get tutorial content for a lesson ID.
 * Returns undefined if no tutorial exists for the lesson.
 */
export function getTutorialContent(lessonId: string): string | undefined {
  return TUTORIAL_CONTENT[lessonId];
}

/**
 * @description Check if a lesson has tutorial content.
 */
export function hasTutorial(lessonId: string): boolean {
  return lessonId in TUTORIAL_CONTENT;
}

/**
 * @description Lessons that have placeholders and need custom components.
 * These lessons require placeholder components to be defined separately.
 */
export const LESSONS_WITH_PLACEHOLDERS = [
  'fragment-or-sentence',
  'basic-conjunctions',
  'subordinating-conjunctions',
  'kernel-expansion',
  'identify-topic-sentence',
  'eliminate-irrelevant-sentences',
  'make-topic-sentences',
  'writing-spos',
  'elaborate-paragraphs',
  'using-transition-words',
  'finishing-transition-words',
  'write-freeform-paragraph',
  'write-t-from-topic',
  'match-details-pro-con',
  'pre-transition-outline',
] as const;

/**
 * @description Check if a lesson needs placeholder components.
 */
export function needsPlaceholders(lessonId: string): boolean {
  return LESSONS_WITH_PLACEHOLDERS.includes(
    lessonId as (typeof LESSONS_WITH_PLACEHOLDERS)[number]
  );
}
