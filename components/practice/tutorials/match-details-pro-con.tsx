/**
 * @fileoverview Tutorial placeholders for match-details-pro-con lesson.
 */

import matchDetailsProCon from '@/lib/constants/practice-tutorials/match-details-pro-con.md';
import { TutorialRenderer } from './TutorialRenderer';
import { ExampleBlock } from './PlaceholderComponents';

interface TutorialProps {
  onComplete: () => void;
}

export function MatchDetailsProConTutorial({ onComplete }: TutorialProps) {
  const placeholders = {
    pro_con_example: (
      <ExampleBlock label="Example Topic: School Uniforms" variant="primary">
        <div className="space-y-3">
          <div>
            <div className="text-xs font-semibold text-[rgba(0,212,146,1)] mb-1">PRO Statement:</div>
            <div>"School uniforms create equality and reduce distractions in the classroom."</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-[rgba(255,95,143,1)] mb-1">CON Statement:</div>
            <div>"School uniforms limit students' personal expression and can be costly for families."</div>
          </div>
        </div>
      </ExampleBlock>
    ),
    dragging_example: (
      <ExampleBlock label="Sample Details to Sort" variant="default">
        <div className="space-y-2">
          <div className="p-2 bg-[rgba(255,255,255,0.05)] rounded">→ "Reduces clothing costs for families" (PRO)</div>
          <div className="p-2 bg-[rgba(255,255,255,0.05)] rounded">→ "Limits personal expression" (CON)</div>
          <div className="p-2 bg-[rgba(255,255,255,0.05)] rounded">→ "Creates sense of equality" (PRO)</div>
          <div className="p-2 bg-[rgba(255,255,255,0.05)] rounded">→ "Can be uncomfortable" (CON)</div>
        </div>
      </ExampleBlock>
    ),
    practice_button: (
      <ExampleBlock label="Ready to Practice!" variant="success">
        Read the topic and viewpoints carefully, then drag each detail to the correct category.
      </ExampleBlock>
    ),
  };

  return (
    <TutorialRenderer
      markdown={matchDetailsProCon}
      placeholders={placeholders}
      lessonName="Match Details Pro/Con"
      onComplete={onComplete}
    />
  );
}
