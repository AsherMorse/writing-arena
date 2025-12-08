/**
 * @fileoverview Tutorial placeholders for subordinating-conjunctions lesson.
 */

import subordinatingConjunctions from '@/lib/constants/practice-tutorials/subordinating-conjunctions.md';
import { TutorialRenderer } from './TutorialRenderer';
import { ExampleBlock, QuestionAnswerBlock } from './PlaceholderComponents';

interface TutorialProps {
  onComplete: () => void;
}

export function SubordinatingConjunctionsTutorial({ onComplete }: TutorialProps) {
  const placeholders = {
    example_question_fill_in: (
      <QuestionAnswerBlock
        question='Fill in the blank: "Although it was raining, _______________"'
        answer='"Although it was raining, we still decided to go for a walk."'
      />
    ),
    example_question_write: (
      <QuestionAnswerBlock
        question='Write a sentence about "baseball" using the conjunction "despite"'
      />
    ),
    example_answer_write: (
      <ExampleBlock label="Example Answer" variant="success">
        "Despite the rain, the baseball game continued as scheduled."
      </ExampleBlock>
    ),
  };

  return (
    <TutorialRenderer
      markdown={subordinatingConjunctions}
      placeholders={placeholders}
      lessonName="Subordinating Conjunctions"
      onComplete={onComplete}
    />
  );
}
