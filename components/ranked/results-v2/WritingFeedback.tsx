'use client';

/**
 * @fileoverview Student-friendly writing feedback display.
 * Shows feedback by category with score bars, summaries, and expandable grader notes.
 * Styled similar to AlphaWrite's feedback UI.
 */

import { useState } from 'react';
import Link from 'next/link';
import type { ParagraphScorecard, GradedCategory } from '@/lib/grading/paragraph-rubrics';
import type { EssayScorecard } from '@/lib/grading/essay-rubrics';
import type { SkillGap } from '@/lib/grading/paragraph-rubrics';
import type { EssaySkillGap } from '@/lib/grading/essay-rubrics';
import type { GraderType } from '@/lib/types/grading-history';

interface WritingFeedbackProps {
  graderType: GraderType;
  scorecard: ParagraphScorecard | EssayScorecard;
  gaps: SkillGap[] | EssaySkillGap[];
  strengths: string[];
  improvements: string[];
  overallFeedback: string;
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
 * @description Extract quoted text from feedback string.
 */
function extractQuotes(text: string): string[] {
  const quotes: string[] = [];
  // Match text in single quotes
  const singleQuoteMatches = text.match(/'([^']+)'/g);
  if (singleQuoteMatches) {
    singleQuoteMatches.forEach((match) => {
      const content = match.slice(1, -1);
      // Only include if it looks like a sentence (has words)
      if (content.split(' ').length >= 3) {
        quotes.push(content);
      }
    });
  }
  return quotes;
}

/**
 * @description Get first sentence(s) as summary from feedback.
 */
function getSummary(feedback: string): string {
  // Get first two sentences or up to 150 chars
  const sentences = feedback.split(/(?<=[.!?])\s+/);
  let summary = sentences[0] || '';
  if (sentences[1] && summary.length < 80) {
    summary += ' ' + sentences[1];
  }
  return summary;
}

/**
 * @description Parse an improvement string to extract before/after/reason.
 */
function parseImprovement(improvement: string): { before: string; after: string; reason: string } {
  const changeMatch = improvement.match(/Change\s*['"]([^'"]+)['"]\s*to\s*['"]([^'"]+)['"]/i);
  
  if (changeMatch) {
    const before = changeMatch[1];
    const after = changeMatch[2];
    const dashIndex = improvement.lastIndexOf(' - ');
    const reason = dashIndex > 0 ? improvement.slice(dashIndex + 3) : '';
    return { before, after, reason };
  }
  
  return { before: '', after: '', reason: improvement };
}

interface CategoryCardProps {
  category: GradedCategory;
  relatedImprovement?: { before: string; after: string; reason: string };
}

/**
 * @description Individual category feedback card with expandable grader notes.
 */
function CategoryCard({ category, relatedImprovement }: CategoryCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const color = getScoreColor(category.score, category.maxScore);
  const pct = (category.score / category.maxScore) * 100;
  const quotes = extractQuotes(category.feedback);
  const summary = getSummary(category.feedback);
  const hasNotes = quotes.length > 0 || category.feedback.length > summary.length;

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
            {showNotes ? 'Hide grader notes' : `See grader notes${quotes.length > 0 ? ` (${quotes.length})` : ''}`}
          </button>

          {showNotes && (
            <div className="px-5 pb-5 space-y-4">
              {/* Quoted text examples */}
              {quotes.map((quote, idx) => (
                <div key={idx} className="border-l-2 border-[#00e5e5] pl-4">
                  <p className="text-sm italic text-[rgba(255,255,255,0.7)]">
                    "{quote}"
                  </p>
                </div>
              ))}

              {/* Full feedback if different from summary */}
              {category.feedback.length > summary.length && (
                <p className="text-xs leading-relaxed text-[rgba(255,255,255,0.5)]">
                  {category.feedback}
                </p>
              )}

              {/* Related improvement suggestion */}
              {relatedImprovement && relatedImprovement.before && (
                <div className="mt-4 p-4 rounded-lg bg-[rgba(255,144,48,0.1)] border border-[rgba(255,144,48,0.2)]">
                  <div className="text-xs font-semibold uppercase text-[#ff9030] mb-2">💡 Try This</div>
                  <div className="space-y-2">
                    <p className="text-xs text-[rgba(255,255,255,0.5)]">
                      <span className="line-through">"{relatedImprovement.before}"</span>
                    </p>
                    <p className="text-xs text-[rgba(255,255,255,0.8)]">
                      → "{relatedImprovement.after}"
                    </p>
                    {relatedImprovement.reason && (
                      <p className="text-xs text-[rgba(255,255,255,0.5)] mt-2">
                        {relatedImprovement.reason}
                      </p>
                    )}
                  </div>
                </div>
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
  strengths,
  improvements,
  overallFeedback,
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

  // Parse improvements and try to match to categories
  const parsedImprovements = improvements.map(parseImprovement);
  
  /**
   * @description Try to match an improvement to a category based on keywords.
   */
  function getRelatedImprovement(categoryTitle: string): { before: string; after: string; reason: string } | undefined {
    const titleLower = categoryTitle.toLowerCase();
    return parsedImprovements.find((imp) => {
      const reasonLower = imp.reason.toLowerCase();
      if (titleLower.includes('topic') && reasonLower.includes('topic sentence')) return true;
      if (titleLower.includes('detail') && (reasonLower.includes('transition') || reasonLower.includes('detail'))) return true;
      if (titleLower.includes('conclud') && reasonLower.includes('conclud')) return true;
      if (titleLower.includes('convention') && (reasonLower.includes('grammar') || reasonLower.includes('spelling'))) return true;
      return false;
    });
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Header */}
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

      {/* Category Cards (AlphaWrite style) */}
      {isParagraph && categories.length > 0 && (
        <div className="space-y-4">
          {categories.map((cat, idx) => (
            <CategoryCard 
              key={idx} 
              category={cat} 
              relatedImprovement={getRelatedImprovement(cat.title)}
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
