/**
 * @fileoverview Tutorial placeholders for write-freeform-paragraph lesson.
 */

import writeFreeformParagraph from '@/lib/constants/practice-tutorials/write-freeform-paragraph.md';
import { TutorialRenderer } from './TutorialRenderer';
import { ExampleBlock } from './PlaceholderComponents';

interface TutorialProps {
  onComplete: () => void;
}

export function WriteFreeformParagraphTutorial({ onComplete }: TutorialProps) {
  const placeholders = {
    topic: (
      <ExampleBlock label="Example Topic" variant="primary">
        <div className="font-medium mb-2">What makes your favorite school subject so interesting to you?</div>
        <div className="text-xs text-[rgba(255,255,255,0.6)]">
          You might consider what you learn, how the teacher presents the material, and the ways you use this knowledge outside of school.
        </div>
      </ExampleBlock>
    ),
    paragraph: (
      <ExampleBlock label="Example Paragraph" variant="success">
        <p className="leading-relaxed">
          Science is my favorite subject in school. I love doing experiments in the lab where we get to test different ideas. 
          Last week, we learned about plant cells by looking at them under microscopes. Our teacher makes science fun by connecting 
          it to things we see in everyday life. Science helps me understand how the world works, which is why it will always be 
          my favorite class.
        </p>
      </ExampleBlock>
    ),
  };

  return (
    <TutorialRenderer
      markdown={writeFreeformParagraph}
      placeholders={placeholders}
      lessonName="Write Freeform Paragraph"
      onComplete={onComplete}
    />
  );
}
