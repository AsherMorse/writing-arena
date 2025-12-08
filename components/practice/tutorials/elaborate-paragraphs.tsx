/**
 * @fileoverview Tutorial placeholders for elaborate-paragraphs lesson.
 */

import elaborateParagraphs from '@/lib/constants/practice-tutorials/elaborate-paragraphs.md';
import { TutorialRenderer } from './TutorialRenderer';
import { TwoColumnCompare } from './PlaceholderComponents';

interface TutorialProps {
  onComplete: () => void;
}

export function ElaborateParagraphsTutorial({ onComplete }: TutorialProps) {
  const placeholders = {
    simple: (
      <div>
        "I have a pet dog. His name is Buddy. Buddy has brown fur. He likes to run. He barks loud. I love playing with Buddy."
      </div>
    ),
    revised: (
      <TwoColumnCompare
        left={{
          label: 'Before (Simple)',
          content: 'I have a pet dog. His name is Buddy. Buddy has brown fur. He likes to run. He barks loud. I love playing with Buddy.',
        }}
        right={{
          label: 'After (Elaborated)',
          content: 'My pet dog Buddy is fluffy with shiny brown fur that feels soft when I pet him. He runs really fast in the park, his ears flopping in the wind. Sometimes, when he barks, it\'s so loud that it surprises me! Playing fetch with Buddy is my favorite thing to do after school because it makes us both super happy.',
        }}
      />
    ),
  };

  return (
    <TutorialRenderer
      markdown={elaborateParagraphs}
      placeholders={placeholders}
      lessonName="Elaborate Paragraphs"
      onComplete={onComplete}
    />
  );
}
