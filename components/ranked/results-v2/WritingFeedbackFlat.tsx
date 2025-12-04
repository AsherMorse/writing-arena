'use client';

/**
 * @fileoverview Flat version of writing feedback display (previous version).
 * Shows strengths as flat list, before/after improvements, and category bars.
 */

import { useState } from 'react';
import Link from 'next/link';
import type { ParagraphScorecard } from '@/lib/grading/paragraph-rubrics';
import type { EssayScorecard } from '@/lib/grading/essay-rubrics';
import type { SkillGap } from '@/lib/grading/paragraph-rubrics';
import type { EssaySkillGap } from '@/lib/grading/essay-rubrics';
import type { GraderType } from '@/lib/types/grading-history';

interface WritingFeedbackFlatProps {
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
 * @description Parse a strength string to extract quote and strategy.
 */
function parseStrength(strength: string): { quote: string; strategy: string } {
  // Format: "Quote: 'text' - demonstrates strategy"
  const quoteMatch = strength.match(/Quote:\s*['"]([^'"]+)['"]/i);
  const quote = quoteMatch ? quoteMatch[1] : '';
  
  // Get the part after the dash
  const dashIndex = strength.indexOf(' - ');
  const strategy = dashIndex > 0 ? strength.slice(dashIndex + 3) : strength;
  
  return { quote, strategy };
}

/**
 * @description Parse an improvement string to extract before/after/reason.
 */
function parseImprovement(improvement: string): { before: string; after: string; reason: string } {
  // Format: "Change 'before' to 'after' - reason"
  const changeMatch = improvement.match(/Change\s*['"]([^'"]+)['"]\s*to\s*['"]([^'"]+)['"]/i);
  
  if (changeMatch) {
    const before = changeMatch[1];
    const after = changeMatch[2];
    const dashIndex = improvement.lastIndexOf(' - ');
    const reason = dashIndex > 0 ? improvement.slice(dashIndex + 3) : '';
    return { before, after, reason };
  }
  
  // Fallback for other formats
  return { before: '', after: '', reason: improvement };
}

export function WritingFeedbackFlat({
  graderType,
  scorecard,
  gaps,
  strengths,
  improvements,
  overallFeedback,
}: WritingFeedbackFlatProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isParagraph = graderType === 'paragraph';
  
  // Get categories for paragraph scorecard
  const categories = isParagraph 
    ? (scorecard as ParagraphScorecard).categories 
    : [];
  
  // Get top lessons from gaps
  const allLessons = new Set<string>();
  gaps.forEach((gap) => gap.recommendedLessons.slice(0, 2).forEach((l) => allLessons.add(l)));
  const topLessons = Array.from(allLessons).slice(0, 3);
  
  // Get primary improvement (first one with before/after)
  const primaryImprovement = improvements[0] ? parseImprovement(improvements[0]) : null;
  
  // Get top 2 strengths
  const topStrengths = strengths.slice(0, 2).map(parseStrength);

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <div className="rounded-[14px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.05)] p-6">
        <div className="flex items-center justify-between mb-6">
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
        
        {/* Category Bars */}
        {isParagraph && (
          <div className="space-y-3">
            {categories.map((cat, idx) => {
              const color = getScoreColor(cat.score, cat.maxScore);
              const pct = (cat.score / cat.maxScore) * 100;
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[rgba(255,255,255,0.7)]">{cat.title}</span>
                    <span className="font-mono text-xs" style={{ color }}>
                      {cat.score}/{cat.maxScore}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[rgba(255,255,255,0.1)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* What You Did Well */}
      {topStrengths.length > 0 && (
        <div className="rounded-[14px] border border-[rgba(0,212,146,0.2)] bg-[rgba(0,212,146,0.05)] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#00d492]">✨ What You Did Well</h2>
          <div className="space-y-4">
            {topStrengths.map((s, idx) => (
              <div key={idx} className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
                {s.quote && (
                  <p className="mb-2 text-sm italic text-[rgba(255,255,255,0.8)]">
                    "{s.quote}"
                  </p>
                )}
                <p className="text-sm text-[#00d492]">
                  → {s.strategy}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Focus On This */}
      {primaryImprovement && (primaryImprovement.before || primaryImprovement.reason) && (
        <div className="rounded-[14px] border border-[rgba(255,144,48,0.2)] bg-[rgba(255,144,48,0.05)] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#ff9030]">🎯 Focus On This</h2>
          
          {primaryImprovement.before && primaryImprovement.after ? (
            <div className="space-y-4">
              <div className="rounded-[10px] border border-[rgba(255,95,143,0.2)] bg-[rgba(255,95,143,0.05)] p-4">
                <div className="mb-1 text-xs font-semibold uppercase text-[#ff5f8f]">Before</div>
                <p className="text-sm text-[rgba(255,255,255,0.7)]">"{primaryImprovement.before}"</p>
              </div>
              
              <div className="flex justify-center">
                <span className="text-2xl">↓</span>
              </div>
              
              <div className="rounded-[10px] border border-[rgba(0,212,146,0.2)] bg-[rgba(0,212,146,0.05)] p-4">
                <div className="mb-1 text-xs font-semibold uppercase text-[#00d492]">Try This</div>
                <p className="text-sm text-[rgba(255,255,255,0.9)]">"{primaryImprovement.after}"</p>
              </div>
              
              {primaryImprovement.reason && (
                <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3">
                  <p className="text-xs text-[rgba(255,255,255,0.6)]">
                    <strong className="text-[#ff9030]">Why:</strong> {primaryImprovement.reason}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[rgba(255,255,255,0.7)]">{primaryImprovement.reason}</p>
          )}
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

      {/* Show More Details Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.025)] py-3 text-sm text-[rgba(255,255,255,0.5)] transition hover:bg-[rgba(255,255,255,0.05)] hover:text-[rgba(255,255,255,0.8)]"
      >
        {showDetails ? '▲ Hide Detailed Feedback' : '▼ Show Detailed Feedback'}
      </button>

      {/* Detailed Breakdown (Expandable) */}
      {showDetails && isParagraph && (
        <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[rgba(255,255,255,0.6)]">📋 Detailed Breakdown</h2>
          <div className="space-y-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[rgba(255,255,255,0.8)]">{cat.title}</span>
                  <span 
                    className="font-mono text-sm"
                    style={{ color: getScoreColor(cat.score, cat.maxScore) }}
                  >
                    {cat.score}/{cat.maxScore}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[rgba(255,255,255,0.5)]">{cat.feedback}</p>
              </div>
            ))}
          </div>
          
          {/* All Improvements */}
          {improvements.length > 1 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-[#ff9030]">All Improvement Suggestions</h3>
              <ul className="space-y-2">
                {improvements.map((imp, idx) => (
                  <li key={idx} className="rounded-[8px] bg-[#101012] p-3 text-xs text-[rgba(255,255,255,0.6)]">
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

