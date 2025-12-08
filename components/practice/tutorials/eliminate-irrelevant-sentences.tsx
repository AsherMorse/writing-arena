/**
 * @fileoverview Tutorial placeholders for eliminate-irrelevant-sentences lesson.
 */

import eliminateIrrelevantSentences from '@/lib/constants/practice-tutorials/eliminate-irrelevant-sentences.md';
import { TutorialRenderer } from './TutorialRenderer';
import { ExampleBlock } from './PlaceholderComponents';

interface TutorialProps {
  onComplete: () => void;
}

export function EliminateIrrelevantSentencesTutorial({ onComplete }: TutorialProps) {
  const placeholders = {
    example: (
      <ExampleBlock label="Example Sentences" variant="primary">
        <div className="space-y-2">
          <div>1. "The water makes puddles on the ground."</div>
          <div>2. "It's easy to slip on ice."</div>
          <div className="text-[rgba(255,144,48,1)]">3. "Sunny days are great for playing outside." ← Irrelevant</div>
          <div className="text-[#00e5e5]">4. "The ice melts on sunny days." ← Topic Sentence</div>
        </div>
        <div className="mt-3 text-xs text-[rgba(255,255,255,0.6)]">
          Sentence 3 is irrelevant because it doesn't relate to ice melting.
        </div>
      </ExampleBlock>
    ),
  };

  return (
    <TutorialRenderer
      markdown={eliminateIrrelevantSentences}
      placeholders={placeholders}
      lessonName="Eliminate Irrelevant Sentences"
      onComplete={onComplete}
    />
  );
}
