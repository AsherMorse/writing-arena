/**
 * @fileoverview Sidebar displaying per-section grading scores.
 * Only shown for cardinal rubric activities (writing-spos, elaborate-paragraphs, write-freeform-paragraph).
 */

'use client';

import { SectionScores } from '@/lib/constants/grader-configs';

interface GradingSidebarProps {
  /** The section scores to display */
  sectionScores: SectionScores;
  /** Total score achieved */
  totalScore: number;
  /** Maximum possible score (20 for SPO, 10 for elaborate) */
  maxScore: number;
  /** Whether the sidebar is collapsed */
  collapsed?: boolean;
}

/**
 * @description Get color based on score (0-5 scale).
 */
function getScoreColor(score: number): string {
  if (score >= 4) return '#00d492'; // Green - excellent
  if (score >= 3) return '#00e5e5'; // Cyan - proficient
  if (score >= 2) return '#ff9030'; // Orange - developing
  return '#ff5f8f'; // Pink - needs work
}

/**
 * @description Get percentage for progress bar (0-5 scale).
 */
function getScorePercentage(score: number): number {
  return (score / 5) * 100;
}

/**
 * @description Get label for score level.
 */
function getScoreLabel(score: number): string {
  if (score === 5) return 'Exceptional';
  if (score === 4) return 'Skilled';
  if (score === 3) return 'Proficient';
  if (score === 2) return 'Developing';
  if (score === 1) return 'Beginning';
  return 'Missing';
}

/**
 * @description Sidebar component displaying per-section grading scores.
 */
export function GradingSidebar({
  sectionScores,
  totalScore,
  maxScore,
  collapsed = false,
}: GradingSidebarProps) {
  if (collapsed) {
    return null;
  }

  // Build sections array from sectionScores object
  const sections: { name: string; score: number }[] = [];

  if (sectionScores.topicSentence !== undefined) {
    sections.push({ name: 'Topic Sentence', score: sectionScores.topicSentence });
  }
  if (sectionScores.supportingDetails !== undefined) {
    sections.push({ name: 'Supporting Details', score: sectionScores.supportingDetails });
  }
  if (sectionScores.concludingSentence !== undefined) {
    sections.push({ name: 'Concluding Sentence', score: sectionScores.concludingSentence });
  }
  if (sectionScores.improvements !== undefined) {
    sections.push({ name: 'Improvements', score: sectionScores.improvements });
  }
  if (sectionScores.conventions !== undefined) {
    sections.push({ name: 'Conventions', score: sectionScores.conventions });
  }

  const overallPercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Section Scores</h3>
        <div className="text-xs text-[rgba(255,255,255,0.4)]">
          {totalScore}/{maxScore} pts
        </div>
      </div>

      {/* Overall Score */}
      <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[rgba(255,255,255,0.5)]">Overall</span>
          <span
            className="text-lg font-semibold"
            style={{ color: getScoreColor(Math.round((overallPercentage / 100) * 5)) }}
          >
            {overallPercentage}%
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.1)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${overallPercentage}%`,
              backgroundColor: getScoreColor(Math.round((overallPercentage / 100) * 5)),
            }}
          />
        </div>
      </div>

      {/* Section Breakdown */}
      <div className="space-y-3">
        {sections.map((section) => (
          <div
            key={section.name}
            className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[rgba(255,255,255,0.7)]">{section.name}</span>
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-medium"
                  style={{ color: getScoreColor(section.score) }}
                >
                  {section.score}/5
                </span>
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.1)]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${getScorePercentage(section.score)}%`,
                  backgroundColor: getScoreColor(section.score),
                }}
              />
            </div>
            <div className="mt-1 text-[10px] text-[rgba(255,255,255,0.4)]">
              {getScoreLabel(section.score)}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
          Score Key
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[#00d492]" />
            <span className="text-[rgba(255,255,255,0.5)]">4-5 Excellent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[#00e5e5]" />
            <span className="text-[rgba(255,255,255,0.5)]">3 Proficient</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[#ff9030]" />
            <span className="text-[rgba(255,255,255,0.5)]">2 Developing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[#ff5f8f]" />
            <span className="text-[rgba(255,255,255,0.5)]">0-1 Needs Work</span>
          </div>
        </div>
      </div>
    </div>
  );
}
