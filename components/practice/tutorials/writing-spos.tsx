/**
 * @fileoverview Tutorial placeholders for writing-spos lesson.
 */

import writingSpos from '@/lib/constants/practice-tutorials/writing-spos.md';
import { TutorialRenderer } from './TutorialRenderer';
import { ExampleBlock } from './PlaceholderComponents';

interface TutorialProps {
  onComplete: () => void;
}

export function WritingSposTutorial({ onComplete }: TutorialProps) {
  const placeholders = {
    example: (
      <ExampleBlock label="Example SPO" variant="primary">
        <div className="space-y-3">
          <div>
            <div className="text-xs font-semibold text-[rgba(255,255,255,0.6)] mb-1">Topic Sentence:</div>
            <div>"Dogs are wonderful pets."</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-[rgba(255,255,255,0.6)] mb-1">Supporting Details:</div>
            <div>• They are loyal and provide constant companionship</div>
            <div>• Dogs can be trained to perform tasks or tricks</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-[rgba(255,255,255,0.6)] mb-1">Concluding Sentence:</div>
            <div>"Owning a dog can bring joy and friendship into a home."</div>
          </div>
        </div>
      </ExampleBlock>
    ),
  };

  return (
    <TutorialRenderer
      markdown={writingSpos}
      placeholders={placeholders}
      lessonName="Writing SPOs"
      onComplete={onComplete}
    />
  );
}
