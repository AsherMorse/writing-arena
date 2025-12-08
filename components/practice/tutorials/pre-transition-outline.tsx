/**
 * @fileoverview Tutorial placeholders for pre-transition-outline lesson.
 */

import preTransitionOutline from '@/lib/constants/practice-tutorials/pre-transition-outline.md';
import { TutorialRenderer } from './TutorialRenderer';
import { ExampleBlock } from './PlaceholderComponents';

interface TutorialProps {
  onComplete: () => void;
}

export function PreTransitionOutlineTutorial({ onComplete }: TutorialProps) {
  const placeholders = {
    Form: (
      <ExampleBlock label="Outline Structure" variant="primary">
        <div className="space-y-2 text-sm">
          <div>📝 <strong>Topic</strong> (given)</div>
          <div>📝 <strong>Thesis Statement</strong></div>
          <div>📝 <strong>Topic Sentence 1</strong></div>
          <div className="ml-4">→ Supporting Details 1</div>
          <div>📝 <strong>Topic Sentence 2</strong></div>
          <div className="ml-4">→ Supporting Details 2</div>
          <div>📝 <strong>Concluding Statement</strong></div>
        </div>
      </ExampleBlock>
    ),
    Topic: (
      <ExampleBlock label="Example Topic" variant="default">
        "The Benefits of Regular Exercise"
      </ExampleBlock>
    ),
    'Thesis Statement': (
      <ExampleBlock label="Thesis Statement Input" variant="primary">
        <div className="text-xs text-[rgba(255,255,255,0.6)] mb-2">Type your thesis here:</div>
        <div className="p-2 border border-[rgba(255,255,255,0.2)] rounded bg-[rgba(255,255,255,0.05)]">
          [Your thesis statement goes here]
        </div>
      </ExampleBlock>
    ),
    'Topic Sentence 1': (
      <ExampleBlock label="Topic Sentence 1" variant="primary">
        <div className="p-2 border border-[rgba(255,255,255,0.2)] rounded bg-[rgba(255,255,255,0.05)]">
          [Topic sentence for body paragraph 1]
        </div>
      </ExampleBlock>
    ),
    'Topic Sentence 2': (
      <ExampleBlock label="Topic Sentence 2" variant="primary">
        <div className="p-2 border border-[rgba(255,255,255,0.2)] rounded bg-[rgba(255,255,255,0.05)]">
          [Topic sentence for body paragraph 2]
        </div>
      </ExampleBlock>
    ),
    'Supporting Details 1': (
      <ExampleBlock label="Supporting Details 1" variant="default">
        <div className="space-y-1 text-sm">
          <div>• Detail 1</div>
          <div>• Detail 2</div>
          <div>• Detail 3</div>
        </div>
      </ExampleBlock>
    ),
    'Supporting Details 2': (
      <ExampleBlock label="Supporting Details 2" variant="default">
        <div className="space-y-1 text-sm">
          <div>• Detail 1</div>
          <div>• Detail 2</div>
          <div>• Detail 3</div>
        </div>
      </ExampleBlock>
    ),
    'Concluding Statement': (
      <ExampleBlock label="Concluding Statement" variant="primary">
        <div className="p-2 border border-[rgba(255,255,255,0.2)] rounded bg-[rgba(255,255,255,0.05)]">
          [Your concluding statement goes here]
        </div>
      </ExampleBlock>
    ),
  };

  return (
    <TutorialRenderer
      markdown={preTransitionOutline}
      placeholders={placeholders}
      lessonName="Pre-Transition Outline"
      onComplete={onComplete}
    />
  );
}
