/**
 * @fileoverview Tutorial placeholders for kernel-expansion lesson.
 */

import kernelExpansion from '@/lib/constants/practice-tutorials/kernel-expansion.md';
import { TutorialRenderer } from './TutorialRenderer';
import { ExampleBlock, QuestionAnswerBlock } from './PlaceholderComponents';

interface TutorialProps {
  onComplete: () => void;
}

export function KernelExpansionTutorial({ onComplete }: TutorialProps) {
  const placeholders = {
    question: (
      <ExampleBlock label="Kernel Sentence" variant="primary">
        "Pyramids were built."
      </ExampleBlock>
    ),
    expansion: (
      <ExampleBlock label="Brainstormed Details" variant="default">
        <div className="space-y-1">
          <div><strong>When:</strong> Ancient times</div>
          <div><strong>Where:</strong> Egypt</div>
          <div><strong>Why:</strong> To protect the body of the pharaoh</div>
        </div>
      </ExampleBlock>
    ),
    answer: (
      <ExampleBlock label="Expanded Sentence" variant="success">
        "In ancient times in Egypt, pyramids were built to protect the body of the pharaoh."
      </ExampleBlock>
    ),
  };

  return (
    <TutorialRenderer
      markdown={kernelExpansion}
      placeholders={placeholders}
      lessonName="Kernel Expansion"
      onComplete={onComplete}
    />
  );
}
