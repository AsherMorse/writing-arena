/**
 * @fileoverview Tutorial placeholders for basic-conjunctions lesson.
 */

import basicConjunctions from '@/lib/constants/practice-tutorials/basic-conjunctions.md';
import { TutorialRenderer } from './TutorialRenderer';
import { ExampleBlock, QuestionAnswerBlock } from './PlaceholderComponents';

interface TutorialProps {
  onComplete: () => void;
}

export function BasicConjunctionsTutorial({ onComplete }: TutorialProps) {
  const placeholders = {
    example_question: (
      <QuestionAnswerBlock
        question='"Water is good for us." - Expand this sentence using "because"'
      />
    ),
    example_solution: (
      <ExampleBlock label="Example Solution" variant="success">
        "Water is good for us <strong>because</strong> it keeps our bodies cool."
      </ExampleBlock>
    ),
    so_example_question: (
      <QuestionAnswerBlock
        question='"I miss you." - Expand using "so"'
      />
    ),
    so_example_incorrect_answer: (
      <ExampleBlock label="Incorrect ✗" variant="warning">
        "I miss you <strong>so</strong> much."
        <div className="mt-2 text-xs text-[rgba(255,255,255,0.6)]">
          ❌ This doesn't explain a consequence
        </div>
      </ExampleBlock>
    ),
    so_example_correct_answer: (
      <ExampleBlock label="Correct ✓" variant="success">
        "I miss you, <strong>so</strong> I wrote you a letter."
        <div className="mt-2 text-xs text-[rgba(255,255,255,0.6)]">
          ✓ This shows a consequence
        </div>
      </ExampleBlock>
    ),
  };

  return (
    <TutorialRenderer
      markdown={basicConjunctions}
      placeholders={placeholders}
      lessonName="Basic Conjunctions"
      onComplete={onComplete}
    />
  );
}
