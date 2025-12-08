/**
 * @fileoverview Tutorial placeholders for fragment-or-sentence lesson.
 */

import fragmentOrSentence from '@/lib/constants/practice-tutorials/fragment-or-sentence.md';
import { TutorialRenderer } from './TutorialRenderer';
import { ExampleBlock, QuestionAnswerBlock } from './PlaceholderComponents';

interface TutorialProps {
  onComplete: () => void;
}

export function FragmentOrSentenceTutorial({ onComplete }: TutorialProps) {
  const placeholders = {
    example_question: (
      <QuestionAnswerBlock
        question='Look at these two sentences: "the cat sleeps" and "in the morning"'
        context="Which is a complete sentence?"
      />
    ),
    example_solution: (
      <ExampleBlock label="Correct Solutions" variant="success">
        <div className="space-y-2">
          <div>✓ "I saw my teacher in the morning."</div>
          <div>✓ "Will you be there in the morning?"</div>
          <div>✓ "In the morning, I will attend practice."</div>
        </div>
      </ExampleBlock>
    ),
  };

  return (
    <TutorialRenderer
      markdown={fragmentOrSentence}
      placeholders={placeholders}
      lessonName="Fragment or Sentence"
      onComplete={onComplete}
    />
  );
}
