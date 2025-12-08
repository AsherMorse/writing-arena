/**
 * @fileoverview Tutorial placeholders for make-topic-sentences lesson.
 */

import makeTopicSentences from '@/lib/constants/practice-tutorials/make-topic-sentences.md';
import { TutorialRenderer } from './TutorialRenderer';
import { ExampleBlock, QuestionAnswerBlock } from './PlaceholderComponents';

interface TutorialProps {
  onComplete: () => void;
}

export function MakeTopicSentencesTutorial({ onComplete }: TutorialProps) {
  const placeholders = {
    example_question: (
      <QuestionAnswerBlock
        question="Write a topic sentence for the following topic: Solar System"
      />
    ),
    example_solution: (
      <ExampleBlock label="Example Solutions" variant="success">
        <div className="space-y-3">
          <div>
            <div className="text-xs text-[rgba(255,255,255,0.6)] mb-1">Simple topic sentence:</div>
            <div>"Without the Sun, Earth would not be able to support life."</div>
          </div>
          <div>
            <div className="text-xs text-[rgba(255,255,255,0.6)] mb-1">With appositive:</div>
            <div>"The smallest planet in the Solar System, Mercury, is also the closest to the Sun."</div>
          </div>
          <div>
            <div className="text-xs text-[rgba(255,255,255,0.6)] mb-1">Interrogative sentence:</div>
            <div>"What makes the Solar System different from other star systems?"</div>
          </div>
        </div>
      </ExampleBlock>
    ),
  };

  return (
    <TutorialRenderer
      markdown={makeTopicSentences}
      placeholders={placeholders}
      lessonName="Make Topic Sentences"
      onComplete={onComplete}
    />
  );
}
