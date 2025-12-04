'use client';

/**
 * @fileoverview Student-friendly writing feedback display.
 * Shows feedback by category with score bars, summaries, and expandable grader notes.
 * Uses AlphaWrite's per-category example structure.
 */

import { useState } from 'react';
import Link from 'next/link';
import type { ParagraphScorecard, GradedCategory, CategoryExample } from '@/lib/grading/paragraph-rubrics';
import type { EssayScorecard } from '@/lib/grading/essay-rubrics';
import type { SkillGap } from '@/lib/grading/paragraph-rubrics';
import type { EssaySkillGap } from '@/lib/grading/essay-rubrics';
import type { GraderType } from '@/lib/types/grading-history';

/**
 * @description Info about an example highlight (for hover/click interactions).
 */
export interface ExampleHighlightInfo {
  substringOfInterest: string;
  type: 'strength' | 'improvement';
  categoryTitle: string;
}

interface WritingFeedbackProps {
  graderType: GraderType;
  scorecard: ParagraphScorecard | EssayScorecard;
  gaps: SkillGap[] | EssaySkillGap[];
  overallFeedback: string;
  /** Called when an example is hovered (null on mouse leave) */
  onExampleHover?: (info: ExampleHighlightInfo | null) => void;
  /** Called when an example is clicked (for toggle behavior) */
  onExampleClick?: (info: ExampleHighlightInfo) => void;
  /** Hide the overall score header (when displayed elsewhere) */
  hideOverallScore?: boolean;
}

/**
 * @description Friendly lesson name mapping.
 */
const LESSON_NAMES: Record<string, string> = {
  'basic-conjunctions': 'Sentence Expansion (Because/But/So)',
  'write-appositives': 'Writing Appositives',
  'subordinating-conjunctions': 'Subordinating Conjunctions',
  'make-topic-sentences': 'Creating Topic Sentences',
  'identify-topic-sentence': 'Identifying Topic Sentences',
  'writing-spos': 'Writing Supporting Details',
  'eliminate-irrelevant-sentences': 'Eliminating Irrelevant Sentences',
  'elaborate-paragraphs': 'Elaborating Paragraphs',
  'using-transition-words': 'Using Transition Words',
  'write-cs-from-details': 'Writing Concluding Sentences',
};

function getLessonName(lessonId: string): string {
  return LESSON_NAMES[lessonId] || lessonId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getScoreColor(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.8) return '#00d492';
  if (pct >= 0.6) return '#ff9030';
  return '#ff5f8f';
}

/**
 * @description Get first sentence(s) as summary from feedback.
 */
function getSummary(feedback: string): string {
  const sentences = feedback.split(/(?<=[.!?])\s+/);
  let summary = sentences[0] || '';
  if (sentences[1] && summary.length < 80) {
    summary += ' ' + sentences[1];
  }
  return summary;
}

/**
 * @description Check if example has valid substring (not N/A).
 */
function hasValidSubstring(example: CategoryExample): boolean {
  return Boolean(example.substringOfInterest) && example.substringOfInterest.toUpperCase() !== 'N/A';
}

interface CategoryCardProps {
  category: GradedCategory;
  onExampleHover?: (info: ExampleHighlightInfo | null) => void;
  onExampleClick?: (info: ExampleHighlightInfo) => void;
}

/**
 * @description Individual category feedback card with expandable grader notes.
 */
function CategoryCard({ category, onExampleHover, onExampleClick }: CategoryCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const color = getScoreColor(category.score, category.maxScore);
  const pct = (category.score / category.maxScore) * 100;
  const summary = getSummary(category.feedback);
  
  // Get examples from the category
  const greatExamples = category.examplesOfGreatResults || [];
  const improveExamples = category.examplesOfWhereToImprove || [];
  const totalExamples = greatExamples.length + improveExamples.length;
  const hasNotes = totalExamples > 0 || category.feedback.length > summary.length;

  return (
    <div className="rounded-[14px] border border-[rgba(0,212,146,0.15)] bg-[rgba(0,212,146,0.02)] overflow-hidden">
      {/* Header with category name badge */}
      <div className="px-5 pt-4 pb-3">
        <span className="inline-block rounded-md border border-[rgba(0,212,146,0.3)] bg-[rgba(0,212,146,0.1)] px-3 py-1 text-sm font-medium text-[#00d492]">
          {category.title}
        </span>
      </div>

      {/* Score bar */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 rounded-full bg-[rgba(255,255,255,0.1)]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>
          <span className="font-mono text-sm font-medium" style={{ color }}>
            {category.score}/{category.maxScore}
          </span>
        </div>
      </div>

      {/* Summary feedback */}
      <div className="px-5 pb-4">
        <p className="text-sm leading-relaxed text-[rgba(255,255,255,0.75)]">
          {summary}
        </p>
      </div>

      {/* Expandable grader notes */}
      {hasNotes && (
        <div className="border-t border-[rgba(255,255,255,0.05)]">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="w-full px-5 py-3 flex items-center gap-2 text-sm font-medium text-[#00e5e5] hover:bg-[rgba(0,229,229,0.05)] transition"
          >
            <span className={`transition-transform ${showNotes ? 'rotate-180' : ''}`}>▼</span>
            {showNotes ? 'Hide grader notes' : `See grader notes${totalExamples > 0 ? ` (${totalExamples})` : ''}`}
          </button>

          {showNotes && (
            <div className="px-5 pb-5 space-y-4">
              {/* Great Results (strengths) */}
              {greatExamples.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase text-[#00d492] mb-2">What You Did Well</div>
                  <div className="space-y-3">
                    {greatExamples.map((ex, idx) => {
                      const highlightInfo: ExampleHighlightInfo = {
                        substringOfInterest: ex.substringOfInterest,
                        type: 'strength',
                        categoryTitle: category.title,
                      };
                      return (
                        <div
                          key={idx}
                          className="border-l-2 border-[#00d492] pl-4 cursor-pointer rounded-r-lg transition hover:bg-[rgba(0,212,146,0.1)]"
                          onMouseEnter={() => hasValidSubstring(ex) && onExampleHover?.(highlightInfo)}
                          onMouseLeave={() => onExampleHover?.(null)}
                          onClick={() => hasValidSubstring(ex) && onExampleClick?.(highlightInfo)}
                        >
                          {hasValidSubstring(ex) && (
                            <p className="text-sm italic text-[rgba(255,255,255,0.7)] mb-1">
                              &ldquo;{ex.substringOfInterest}&rdquo;
                            </p>
                          )}
                          <p className="text-xs text-[rgba(255,255,255,0.5)]">
                            {ex.explanationOfSubstring}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Where to Improve */}
              {improveExamples.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase text-[#ff9030] mb-2">Areas to Improve</div>
                  <div className="space-y-3">
                    {improveExamples.map((ex, idx) => {
                      const highlightInfo: ExampleHighlightInfo = {
                        substringOfInterest: ex.substringOfInterest,
                        type: 'improvement',
                        categoryTitle: category.title,
                      };
                      return (
                        <div
                          key={idx}
                          className="border-l-2 border-[#ff9030] pl-4 cursor-pointer rounded-r-lg transition hover:bg-[rgba(255,144,48,0.1)]"
                          onMouseEnter={() => hasValidSubstring(ex) && onExampleHover?.(highlightInfo)}
                          onMouseLeave={() => onExampleHover?.(null)}
                          onClick={() => hasValidSubstring(ex) && onExampleClick?.(highlightInfo)}
                        >
                          {hasValidSubstring(ex) && (
                            <p className="text-sm italic text-[rgba(255,255,255,0.7)] mb-1">
                              &ldquo;{ex.substringOfInterest}&rdquo;
                            </p>
                          )}
                          <p className="text-xs text-[rgba(255,255,255,0.5)]">
                            {ex.explanationOfSubstring}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Full feedback if different from summary */}
              {category.feedback.length > summary.length && totalExamples === 0 && (
                <p className="text-xs leading-relaxed text-[rgba(255,255,255,0.5)]">
                  {category.feedback}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function WritingFeedback({
  graderType,
  scorecard,
  gaps,
  overallFeedback,
  onExampleHover,
  onExampleClick,
  hideOverallScore = false,
}: WritingFeedbackProps) {
  const isParagraph = graderType === 'paragraph';
  
  // Get categories for paragraph scorecard
  const categories = isParagraph 
    ? (scorecard as ParagraphScorecard).categories 
    : [];
  
  // Get top lessons from gaps
  const allLessons = new Set<string>();
  gaps.forEach((gap) => gap.recommendedLessons.slice(0, 2).forEach((l) => allLessons.add(l)));
  const topLessons = Array.from(allLessons).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Overall Score Header */}
      {!hideOverallScore && (
        <div className="rounded-[14px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.05)] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#00e5e5]">📊 Your Writing Score</h2>
            <div className="text-right">
              <div className="font-mono text-3xl font-bold text-[#00e5e5]">
                {scorecard.percentageScore}%
              </div>
              <div className="text-xs text-[rgba(255,255,255,0.4)]">
                {isParagraph 
                  ? `${(scorecard as ParagraphScorecard).totalScore}/${(scorecard as ParagraphScorecard).maxScore}` 
                  : `${(scorecard as EssayScorecard).totalPoints}/${(scorecard as EssayScorecard).maxPoints}`
                } points
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Cards (AlphaWrite style) */}
      {isParagraph && categories.length > 0 && (
        <div className="space-y-4">
          {categories.map((cat, idx) => (
            <CategoryCard
              key={idx}
              category={cat}
              onExampleHover={onExampleHover}
              onExampleClick={onExampleClick}
            />
          ))}
        </div>
      )}

      {/* Overall Feedback */}
      {overallFeedback && (
        <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
          <h2 className="mb-3 text-lg font-semibold text-[rgba(255,255,255,0.8)]">💬 Overall</h2>
          <p className="text-sm leading-relaxed text-[rgba(255,255,255,0.6)]">{overallFeedback}</p>
        </div>
      )}

      {/* Practice These Skills */}
      {topLessons.length > 0 && (
        <div className="rounded-[14px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.05)] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#00e5e5]">📚 Practice These Skills</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {topLessons.map((lessonId) => (
              <Link
                key={lessonId}
                href={`/practice/${lessonId}`}
                className="group flex items-center justify-between rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[#101012] p-4 transition hover:border-[#00e5e5] hover:bg-[rgba(0,229,229,0.05)]"
              >
                <span className="text-sm text-[rgba(255,255,255,0.8)] group-hover:text-[#00e5e5]">
                  {getLessonName(lessonId)}
                </span>
                <span className="rounded-full bg-[rgba(0,229,229,0.2)] px-3 py-1 text-xs font-semibold text-[#00e5e5] group-hover:bg-[#00e5e5] group-hover:text-[#101012]">
                  Start →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
