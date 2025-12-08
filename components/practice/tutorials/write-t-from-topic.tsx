/**
 * @fileoverview Tutorial placeholders for write-t-from-topic lesson.
 */

import writeTFromTopic from '@/lib/constants/practice-tutorials/write-t-from-topic.md';
import { TutorialRenderer } from './TutorialRenderer';
import { ExampleBlock } from './PlaceholderComponents';

interface TutorialProps {
  onComplete: () => void;
}

export function WriteTFromTopicTutorial({ onComplete }: TutorialProps) {
  const placeholders = {
    example_background: (
      <ExampleBlock label="Example Topic" variant="primary">
        <div className="font-medium mb-2">Topic: Social Media's Impact on Teenagers</div>
        <div className="text-sm text-[rgba(255,255,255,0.8)]">
          Recent studies have shown that teenagers spend an average of 7-9 hours per day on social media platforms. 
          While these platforms offer opportunities for connection and creativity, concerns have been raised about 
          their effects on mental health, self-esteem, and academic performance.
        </div>
      </ExampleBlock>
    ),
    example_input: (
      <ExampleBlock label="Your Task" variant="default">
        Write a thesis statement for an essay about this topic. Your thesis should take a clear position and 
        preview your main argument.
      </ExampleBlock>
    ),
    inspiration_button: (
      <ExampleBlock label="Example Thesis Statements" variant="success">
        <div className="space-y-2">
          <div>✓ "While social media platforms offer teenagers valuable opportunities for connection and self-expression, 
          schools must implement digital literacy programs to help students navigate these spaces more healthily."</div>
          <div>✓ "The constant pressure to maintain a perfect online image on social media platforms contributes 
          to rising anxiety levels among teenagers, requiring parents and educators to take proactive steps."</div>
        </div>
      </ExampleBlock>
    ),
  };

  return (
    <TutorialRenderer
      markdown={writeTFromTopic}
      placeholders={placeholders}
      lessonName="Write Thesis from Topic"
      onComplete={onComplete}
    />
  );
}
