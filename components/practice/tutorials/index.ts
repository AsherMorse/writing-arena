/**
 * @fileoverview Export tutorial components and utilities.
 */

import { ComponentType } from 'react';
export { TutorialRenderer } from './TutorialRenderer';
export * from './PlaceholderComponents';

// Import all tutorial components with placeholders
import { FragmentOrSentenceTutorial } from './fragment-or-sentence';
import { BasicConjunctionsTutorial } from './basic-conjunctions';
import { SubordinatingConjunctionsTutorial } from './subordinating-conjunctions';
import { KernelExpansionTutorial } from './kernel-expansion';
import { IdentifyTopicSentenceTutorial } from './identify-topic-sentence';
import { EliminateIrrelevantSentencesTutorial } from './eliminate-irrelevant-sentences';
import { MakeTopicSentencesTutorial } from './make-topic-sentences';
import { WritingSposTutorial } from './writing-spos';
import { ElaborateParagraphsTutorial } from './elaborate-paragraphs';
import { UsingTransitionWordsTutorial } from './using-transition-words';
import { FinishingTransitionWordsTutorial } from './finishing-transition-words';
import { WriteFreeformParagraphTutorial } from './write-freeform-paragraph';
import { WriteTFromTopicTutorial } from './write-t-from-topic';
import { MatchDetailsProConTutorial } from './match-details-pro-con';
import { PreTransitionOutlineTutorial } from './pre-transition-outline';

interface TutorialComponentProps {
  onComplete: () => void;
}

/**
 * @description Map of lesson IDs to their tutorial components (with placeholders).
 * These components handle placeholder rendering for interactive examples.
 */
export const TUTORIAL_COMPONENTS: Record<
  string,
  ComponentType<TutorialComponentProps>
> = {
  'fragment-or-sentence': FragmentOrSentenceTutorial,
  'basic-conjunctions': BasicConjunctionsTutorial,
  'subordinating-conjunctions': SubordinatingConjunctionsTutorial,
  'kernel-expansion': KernelExpansionTutorial,
  'identify-topic-sentence': IdentifyTopicSentenceTutorial,
  'eliminate-irrelevant-sentences': EliminateIrrelevantSentencesTutorial,
  'make-topic-sentences': MakeTopicSentencesTutorial,
  'writing-spos': WritingSposTutorial,
  'elaborate-paragraphs': ElaborateParagraphsTutorial,
  'using-transition-words': UsingTransitionWordsTutorial,
  'finishing-transition-words': FinishingTransitionWordsTutorial,
  'write-freeform-paragraph': WriteFreeformParagraphTutorial,
  'write-t-from-topic': WriteTFromTopicTutorial,
  'match-details-pro-con': MatchDetailsProConTutorial,
  'pre-transition-outline': PreTransitionOutlineTutorial,
};

/**
 * @description Get tutorial component for a lesson (if it has placeholders).
 */
export function getTutorialComponent(
  lessonId: string
): ComponentType<TutorialComponentProps> | undefined {
  return TUTORIAL_COMPONENTS[lessonId];
}
