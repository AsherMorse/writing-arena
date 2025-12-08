/**
 * @fileoverview Tutorial placeholders for finishing-transition-words lesson.
 */

import finishingTransitionWords from '@/lib/constants/practice-tutorials/finishing-transition-words.md';
import { TutorialRenderer } from './TutorialRenderer';
import { ExampleBlock } from './PlaceholderComponents';

interface TutorialProps {
  onComplete: () => void;
}

export function FinishingTransitionWordsTutorial({ onComplete }: TutorialProps) {
  const placeholders = {
    timeExample: (
      <ExampleBlock label="Time Transitions" variant="primary">
        <strong>After. In addition. Then. Also.</strong>
        <div className="mt-1">"I went to school. <strong>After</strong> that, I came home."</div>
      </ExampleBlock>
    ),
    illustrationExample: (
      <ExampleBlock label="Illustration Transitions" variant="primary">
        <strong>For example. Like. Including. Specifically.</strong>
        <div className="mt-1">"There are many ways to stay healthy. <strong>For example</strong>, you can exercise regularly."</div>
      </ExampleBlock>
    ),
    emphasisExample: (
      <ExampleBlock label="Emphasis Transitions" variant="primary">
        <strong>Obviously. Certainly. Especially. Notably.</strong>
        <div className="mt-1">"I love all fruits. <strong>Especially,</strong> I love apples."</div>
      </ExampleBlock>
    ),
    conclusionExample: (
      <ExampleBlock label="Conclusion Transitions" variant="primary">
        <strong>So. Therefore. Finally. As a result.</strong>
        <div className="mt-1">"I didn't study for the test. <strong>So,</strong> I didn't do well on it."</div>
      </ExampleBlock>
    ),
    directionExample: (
      <ExampleBlock label="Change of Direction Transitions" variant="primary">
        <strong>But. However. Although. Yet.</strong>
        <div className="mt-1">"It was raining outside. <strong>But</strong> we still went to the park."</div>
      </ExampleBlock>
    ),
    question: (
      <ExampleBlock label="Practice Question" variant="default">
        Use "In addition" to write one transition to the following sentence:
        <div className="mt-2">"Roses are admired for their beauty."</div>
      </ExampleBlock>
    ),
    answer: (
      <ExampleBlock label="Answer" variant="success">
        "Roses are admired for their beauty. <strong>In addition</strong>, they are often used in skincare products."
      </ExampleBlock>
    ),
  };

  return (
    <TutorialRenderer
      markdown={finishingTransitionWords}
      placeholders={placeholders}
      lessonName="Finishing Transition Words"
      onComplete={onComplete}
    />
  );
}
