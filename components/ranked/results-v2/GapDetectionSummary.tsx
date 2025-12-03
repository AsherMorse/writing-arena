/**
 * @fileoverview Displays skill gaps detected from grading with recommended lessons.
 * Shows severity indicators and links to practice lessons.
 */

import Link from 'next/link';
import type { SkillGap } from '@/lib/grading/paragraph-rubrics';
import type { EssaySkillGap } from '@/lib/grading/essay-rubrics';
import type { GraderType } from '@/lib/types/grading-history';

interface GapDetectionSummaryProps {
  gaps: SkillGap[] | EssaySkillGap[];
  graderType: GraderType;
}

/**
 * @description Get severity color.
 */
function getSeverityColor(severity: string): string {
  if (severity === 'high') return '#ff5f8f';
  if (severity === 'medium') return '#ff9030';
  return '#00d492';
}

/**
 * @description Get severity label.
 */
function getSeverityLabel(severity: string): string {
  if (severity === 'high') return 'HIGH PRIORITY';
  if (severity === 'medium') return 'MEDIUM';
  return 'LOW';
}

/**
 * @description Get criterion name from gap (handles both types).
 */
function getCriterion(gap: SkillGap | EssaySkillGap): string {
  return (gap as SkillGap).category || (gap as EssaySkillGap).criterion;
}

/**
 * @description Get feedback text from gap.
 */
function getFeedback(gap: SkillGap | EssaySkillGap): string {
  return (gap as SkillGap).feedback || (gap as EssaySkillGap).explanation || '';
}

/**
 * @description Get score display from gap.
 */
function getScoreDisplay(gap: SkillGap | EssaySkillGap, graderType: GraderType): string {
  if (graderType === 'paragraph') {
    const paragraphGap = gap as SkillGap;
    return `${paragraphGap.score}/${paragraphGap.maxScore}`;
  } else {
    const essayGap = gap as EssaySkillGap;
    return essayGap.score;
  }
}

/**
 * @description Friendly lesson name mapping.
 */
const LESSON_NAMES: Record<string, string> = {
  'basic-conjunctions': 'Sentence Expansion (Because/But/So)',
  'write-appositives': 'Writing Appositives',
  'subordinating-conjunctions': 'Subordinating Conjunctions',
  'kernel-expansion': 'Kernel Expansion',
  'fragment-or-sentence': 'Fragment or Sentence',
  'make-topic-sentences': 'Creating Topic Sentences',
  'identify-topic-sentence': 'Identifying Topic Sentences',
  'writing-spos': 'Writing SPOs (Supporting Details)',
  'eliminate-irrelevant-sentences': 'Eliminating Irrelevant Sentences',
  'elaborate-paragraphs': 'Elaborating Paragraphs',
  'using-transition-words': 'Using Transition Words',
  'finishing-transition-words': 'Finishing Transition Words',
  'write-cs-from-details': 'Writing Concluding Sentences',
  'distinguish-g-s-t': 'GST Introduction Structure',
  'write-g-s-from-t': 'Writing G/S from Thesis',
  'write-introductory-sentences': 'Writing Introductory Sentences',
  'craft-conclusion-from-gst': 'Crafting Conclusions',
  'write-t-from-topic': 'Writing Thesis from Topic',
  'match-details-pro-con': 'Matching Pro/Con Details',
};

/**
 * @description Get friendly lesson name.
 */
function getLessonName(lessonId: string): string {
  return LESSON_NAMES[lessonId] || lessonId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function GapDetectionSummary({ gaps, graderType }: GapDetectionSummaryProps) {
  // Sort gaps by severity (high first)
  const sortedGaps = [...gaps].sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  // Collect all unique recommended lessons
  const allLessons = new Set<string>();
  gaps.forEach((gap) => gap.recommendedLessons.forEach((l) => allLessons.add(l)));
  const uniqueLessons = Array.from(allLessons).slice(0, 4);

  const hasHighSeverity = gaps.some((g) => g.severity === 'high');

  return (
    <div
      className={`mb-8 rounded-[14px] border p-6 ${
        hasHighSeverity
          ? 'border-[rgba(255,95,143,0.3)] bg-[rgba(255,95,143,0.05)]'
          : 'border-[rgba(255,144,48,0.2)] bg-[rgba(255,144,48,0.05)]'
      }`}
    >
      <h2
        className={`mb-4 flex items-center gap-2 text-lg font-semibold ${
          hasHighSeverity ? 'text-[#ff5f8f]' : 'text-[#ff9030]'
        }`}
      >
        <span>🎯</span>
        <span>Areas to Improve</span>
        {hasHighSeverity && (
          <span className="ml-2 rounded-full bg-[rgba(255,95,143,0.2)] px-2 py-0.5 text-xs">Practice Required</span>
        )}
      </h2>

      {/* Gap List */}
      <div className="space-y-3">
        {sortedGaps.map((gap, idx) => {
          const color = getSeverityColor(gap.severity);
          const criterion = getCriterion(gap);
          const feedback = getFeedback(gap);
          const scoreDisplay = getScoreDisplay(gap, graderType);

          return (
            <div key={idx} className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-bold uppercase"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {getSeverityLabel(gap.severity)}
                  </span>
                  <span className="font-medium text-[rgba(255,255,255,0.8)]">{criterion}</span>
                </div>
                <span className="font-mono text-sm" style={{ color }}>
                  {scoreDisplay}
                </span>
              </div>
              {feedback && <p className="mt-2 text-sm text-[rgba(255,255,255,0.5)]">{feedback}</p>}
            </div>
          );
        })}
      </div>

      {/* Recommended Lessons */}
      {uniqueLessons.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-[rgba(255,255,255,0.6)]">📚 Recommended Practice</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {uniqueLessons.map((lessonId) => (
              <Link
                key={lessonId}
                href={`/practice/${lessonId}`}
                className="group flex items-center justify-between rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.025)] p-3 transition hover:border-[#00e5e5] hover:bg-[rgba(0,229,229,0.05)]"
              >
                <span className="text-sm text-[rgba(255,255,255,0.7)] group-hover:text-[#00e5e5]">
                  {getLessonName(lessonId)}
                </span>
                <span className="text-[rgba(255,255,255,0.4)] group-hover:text-[#00e5e5]">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Practice CTA */}
      {hasHighSeverity && (
        <div className="mt-4 rounded-[10px] border border-[rgba(255,95,143,0.3)] bg-[rgba(255,95,143,0.1)] p-4">
          <p className="text-sm text-[#ff5f8f]">
            ⚠️ <strong>Practice Required:</strong> Complete the recommended lessons before your next ranked match to
            strengthen these skills.
          </p>
        </div>
      )}
    </div>
  );
}

