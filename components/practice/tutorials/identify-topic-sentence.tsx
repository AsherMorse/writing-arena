/**
 * @fileoverview Tutorial placeholders for identify-topic-sentence lesson.
 */

import identifyTopicSentence from '@/lib/constants/practice-tutorials/identify-topic-sentence.md';
import { TutorialRenderer } from './TutorialRenderer';
import { ExampleBlock } from './PlaceholderComponents';

interface TutorialProps {
  onComplete: () => void;
}

export function IdentifyTopicSentenceTutorial({ onComplete }: TutorialProps) {
  const placeholders = {
    sample: (
      <ExampleBlock label="Example Paragraph" variant="primary">
        <div className="space-y-3">
          <p className="font-semibold text-[#00e5e5]">
            "Science is my favorite subject in school because it helps me understand the world around me."
          </p>
          <p>
            "Last week, we did an experiment about how plants grow, and I learned that they need sunlight and water."
          </p>
          <p>
            "We also used microscopes to look at tiny cells, which was really cool."
          </p>
        </div>
        <div className="mt-3 text-xs text-[rgba(255,255,255,0.6)]">
          The first sentence (in cyan) is the topic sentence because it introduces the main idea.
        </div>
      </ExampleBlock>
    ),
  };

  return (
    <TutorialRenderer
      markdown={identifyTopicSentence}
      placeholders={placeholders}
      lessonName="Identify Topic Sentence"
      onComplete={onComplete}
    />
  );
}
