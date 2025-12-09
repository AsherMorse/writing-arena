/**
 * @fileoverview Centralized mapping of lesson IDs to human-readable display names.
 * Used by gap detection UI components to show proper lesson names.
 */

/**
 * @description Maps lesson IDs to their display names.
 * Includes all lessons from practice-lessons plus any referenced by gap detection.
 */
export const LESSON_DISPLAY_NAMES: Record<string, string> = {
  // Tier 1: Sentence-level lessons
  'basic-conjunctions': 'Because, But, So',
  'write-appositives': 'Appositives',
  'subordinating-conjunctions': 'Subordinating Conjunctions',
  'kernel-expansion': 'Sentence Expansion',
  'fragment-or-sentence': 'Fragment or Sentence',
  'combine-sentences': 'Combine Sentences',
  'identify-appositives': 'Identify Appositives',

  // Tier 2: Paragraph-level lessons
  'make-topic-sentences': 'Make Topic Sentences',
  'identify-topic-sentence': 'Identify Topic Sentences',
  'writing-spos': 'Single Paragraph Outlines',
  'eliminate-irrelevant-sentences': 'Eliminate Irrelevant Sentences',
  'elaborate-paragraphs': 'Elaborate on Paragraphs',
  'using-transition-words': 'Using Transition Words',
  'finishing-transition-words': 'Finishing Transition Words',
  'write-cs-from-details': 'Concluding Sentences',
  'write-ts-from-details': 'Topic Sentences from Details',
  'write-freeform-paragraph': 'Free-Form Paragraph',

  // Tier 3: Essay-level lessons
  'distinguish-g-s-t': 'Distinguish GST Statements',
  'write-g-s-from-t': 'Write G & S from Thesis',
  'write-introductory-sentences': 'Add Intro Sentences',
  'craft-conclusion-from-gst': 'Write Conclusion Paragraphs',
  'write-t-from-topic': 'Write Thesis from Topic',
  'match-details-pro-con': 'Match Details Pro/Con',
  'write-s-from-g-t': 'Write S from G+T',
  'pre-transition-outline': 'Pre-Transition Outline',
};

/**
 * @description Get the display name for a lesson ID.
 * Falls back to title-casing the ID if not found in the mapping.
 */
export function getLessonDisplayName(lessonId: string): string {
  if (LESSON_DISPLAY_NAMES[lessonId]) {
    return LESSON_DISPLAY_NAMES[lessonId];
  }

  // Fallback: convert kebab-case to Title Case
  return lessonId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
