/**
 * @fileoverview Central export for all grader configurations.
 * Provides helper function to retrieve configs by lesson ID.
 */

export * from './types';

// Sentence-level configs (Tier 1)
export { basicConjunctionsConfig } from './basic-conjunctions';
export { writeAppositivesConfig } from './write-appositives';
export { subordinatingConjunctionsConfig } from './subordinating-conjunctions';
export { kernelExpansionConfig } from './kernel-expansion';
export { fragmentOrSentenceConfig } from './fragment-or-sentence';

// Paragraph-level configs (Tier 2)
export { makeTopicSentencesConfig } from './make-topic-sentences';
export { identifyTopicSentenceConfig } from './identify-topic-sentence';
export { writingSposConfig } from './writing-spos';
export { eliminateIrrelevantSentencesConfig } from './eliminate-irrelevant-sentences';
export { elaborateParagraphsConfig } from './elaborate-paragraphs';
export { usingTransitionWordsConfig } from './using-transition-words';
export { finishingTransitionWordsConfig } from './finishing-transition-words';
export { writeCsFromDetailsConfig } from './write-cs-from-details';
export { writeTsFromDetailsConfig } from './write-ts-from-details';
export { writeFreeformParagraphConfig } from './write-freeform-paragraph';

// Essay-level configs (Tier 3)
export { distinguishGstConfig } from './distinguish-g-s-t';
export { writeGSFromTConfig } from './write-g-s-from-t';
export { writeIntroductorySentencesConfig } from './write-introductory-sentences';
export { craftConclusionFromGstConfig } from './craft-conclusion-from-gst';
export { writeTFromTopicConfig } from './write-t-from-topic';
export { matchDetailsProConConfig } from './match-details-pro-con';
export { writeSFromGTConfig } from './write-s-from-g-t';
export { preTransitionOutlineConfig } from './pre-transition-outline';

import { ActivityGraderConfig } from './types';

// Sentence-level imports
import { basicConjunctionsConfig } from './basic-conjunctions';
import { writeAppositivesConfig } from './write-appositives';
import { subordinatingConjunctionsConfig } from './subordinating-conjunctions';
import { kernelExpansionConfig } from './kernel-expansion';
import { fragmentOrSentenceConfig } from './fragment-or-sentence';

// Paragraph-level imports
import { makeTopicSentencesConfig } from './make-topic-sentences';
import { identifyTopicSentenceConfig } from './identify-topic-sentence';
import { writingSposConfig } from './writing-spos';
import { eliminateIrrelevantSentencesConfig } from './eliminate-irrelevant-sentences';
import { elaborateParagraphsConfig } from './elaborate-paragraphs';
import { usingTransitionWordsConfig } from './using-transition-words';
import { finishingTransitionWordsConfig } from './finishing-transition-words';
import { writeCsFromDetailsConfig } from './write-cs-from-details';
import { writeTsFromDetailsConfig } from './write-ts-from-details';
import { writeFreeformParagraphConfig } from './write-freeform-paragraph';

// Essay-level imports
import { distinguishGstConfig } from './distinguish-g-s-t';
import { writeGSFromTConfig } from './write-g-s-from-t';
import { writeIntroductorySentencesConfig } from './write-introductory-sentences';
import { craftConclusionFromGstConfig } from './craft-conclusion-from-gst';
import { writeTFromTopicConfig } from './write-t-from-topic';
import { matchDetailsProConConfig } from './match-details-pro-con';
import { writeSFromGTConfig } from './write-s-from-g-t';
import { preTransitionOutlineConfig } from './pre-transition-outline';

/**
 * @description Map of lesson IDs to their grader configurations.
 */
const GRADER_CONFIGS: Record<string, ActivityGraderConfig> = {
  // Sentence-level (Tier 1)
  'basic-conjunctions': basicConjunctionsConfig,
  'write-appositives': writeAppositivesConfig,
  'subordinating-conjunctions': subordinatingConjunctionsConfig,
  'kernel-expansion': kernelExpansionConfig,
  'fragment-or-sentence': fragmentOrSentenceConfig,

  // Paragraph-level (Tier 2)
  'make-topic-sentences': makeTopicSentencesConfig,
  'identify-topic-sentence': identifyTopicSentenceConfig,
  'writing-spos': writingSposConfig,
  'eliminate-irrelevant-sentences': eliminateIrrelevantSentencesConfig,
  'elaborate-paragraphs': elaborateParagraphsConfig,
  'using-transition-words': usingTransitionWordsConfig,
  'finishing-transition-words': finishingTransitionWordsConfig,
  'write-cs-from-details': writeCsFromDetailsConfig,
  'write-ts-from-details': writeTsFromDetailsConfig,
  'write-freeform-paragraph': writeFreeformParagraphConfig,

  // Essay-level (Tier 3)
  'distinguish-g-s-t': distinguishGstConfig,
  'write-g-s-from-t': writeGSFromTConfig,
  'write-introductory-sentences': writeIntroductorySentencesConfig,
  'craft-conclusion-from-gst': craftConclusionFromGstConfig,
  'write-t-from-topic': writeTFromTopicConfig,
  'match-details-pro-con': matchDetailsProConConfig,
  'write-s-from-g-t': writeSFromGTConfig,
  'pre-transition-outline': preTransitionOutlineConfig,
};

/**
 * @description Retrieves the grader configuration for a given lesson ID.
 * @throws Error if the lesson ID is not found.
 */
export function getGraderConfig(lessonId: string): ActivityGraderConfig {
  const config = GRADER_CONFIGS[lessonId];
  if (!config) {
    throw new Error(`No grader config found for lesson: ${lessonId}`);
  }
  return config;
}

/**
 * @description Returns all available lesson IDs that have grader configs.
 */
export function getAvailableLessonIds(): string[] {
  return Object.keys(GRADER_CONFIGS);
}

