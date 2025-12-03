/**
 * @fileoverview Displays TWR scorecard with category/criteria breakdown.
 * Supports both paragraph (0-5 scores) and essay (Yes/Developing/No) formats.
 */

import type { ParagraphScorecard } from '@/lib/grading/paragraph-rubrics';
import type { EssayScorecard } from '@/lib/grading/essay-rubrics';
import type { GraderType } from '@/lib/types/grading-history';

interface ScorecardDisplayProps {
  graderType: GraderType;
  scorecard: ParagraphScorecard | EssayScorecard;
  strengths: string[];
  improvements: string[];
  overallFeedback: string;
}

/**
 * @description Get color based on paragraph score (0-5).
 */
function getParagraphScoreColor(score: number): string {
  if (score >= 4) return '#00d492'; // Green - good
  if (score >= 3) return '#ff9030'; // Orange - needs work
  return '#ff5f8f'; // Red - severe
}

/**
 * @description Get color based on essay criterion score.
 */
function getEssayScoreColor(score: string): string {
  if (score === 'Yes') return '#00d492';
  if (score === 'Developing') return '#ff9030';
  return '#ff5f8f';
}

/**
 * @description Get icon based on score level.
 */
function getScoreIcon(score: number | string, graderType: GraderType): string {
  if (graderType === 'paragraph') {
    const numScore = score as number;
    if (numScore >= 4) return '✓';
    if (numScore <= 2) return '⚠️';
    return '';
  } else {
    if (score === 'Yes') return '✓';
    if (score === 'No') return '⚠️';
    return '';
  }
}

/**
 * @description Render paragraph scorecard with score bars.
 */
function ParagraphScorecardDisplay({ scorecard }: { scorecard: ParagraphScorecard }) {
  return (
    <div className="space-y-4">
      {scorecard.categories.map((category, idx) => {
        const color = getParagraphScoreColor(category.score);
        const percentage = (category.score / category.maxScore) * 100;
        const icon = getScoreIcon(category.score, 'paragraph');

        return (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[rgba(255,255,255,0.8)]">{category.title}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm" style={{ color }}>
                  {category.score}/{category.maxScore}
                </span>
                {icon && <span className="text-sm">{icon}</span>}
              </div>
            </div>
            <div className="h-2 rounded-full bg-[rgba(255,255,255,0.1)]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%`, backgroundColor: color }}
              />
            </div>
            {category.feedback && (
              <p className="text-xs text-[rgba(255,255,255,0.5)]">{category.feedback}</p>
            )}
          </div>
        );
      })}

      {/* Overall Score */}
      <div className="mt-6 rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.025)] p-4 text-center">
        <div className="text-sm text-[rgba(255,255,255,0.5)]">Overall Score</div>
        <div className="mt-1 font-mono text-3xl font-bold text-[#00e5e5]">{scorecard.percentageScore}%</div>
        <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">
          {scorecard.totalScore}/{scorecard.maxScore} points
        </div>
      </div>
    </div>
  );
}

/**
 * @description Render essay scorecard with Yes/Developing/No criteria.
 */
function EssayScorecardDisplay({ scorecard }: { scorecard: EssayScorecard }) {
  return (
    <div className="space-y-3">
      {scorecard.criteria.map((criterion, idx) => {
        const color = getEssayScoreColor(criterion.score);
        const icon = getScoreIcon(criterion.score, 'essay');

        return (
          <div
            key={idx}
            className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[rgba(255,255,255,0.8)]">{criterion.criterion}</span>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: `${color}20`,
                    color,
                  }}
                >
                  {criterion.score}
                </span>
                {icon && <span className="text-sm">{icon}</span>}
              </div>
            </div>
            {criterion.explanation && (
              <p className="mt-2 text-xs text-[rgba(255,255,255,0.5)]">{criterion.explanation}</p>
            )}
          </div>
        );
      })}

      {/* Overall Score */}
      <div className="mt-6 rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.025)] p-4 text-center">
        <div className="text-sm text-[rgba(255,255,255,0.5)]">Overall Score</div>
        <div className="mt-1 font-mono text-3xl font-bold text-[#00e5e5]">{scorecard.percentageScore}%</div>
        <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">
          {scorecard.totalPoints}/{scorecard.maxPoints} points
        </div>
      </div>
    </div>
  );
}

/**
 * @description Main scorecard display component.
 */
export function ScorecardDisplay({
  graderType,
  scorecard,
  strengths,
  improvements,
  overallFeedback,
}: ScorecardDisplayProps) {
  const isParagraph = graderType === 'paragraph';

  return (
    <div className="mb-8 rounded-[14px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.05)] p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#00e5e5]">
        <span>📊</span>
        <span>TWR Writing Assessment</span>
        <span className="ml-2 rounded-full bg-[rgba(0,229,229,0.2)] px-2 py-0.5 text-xs">
          {isParagraph ? 'Paragraph' : 'Essay'} Rubric
        </span>
      </h2>

      {isParagraph ? (
        <ParagraphScorecardDisplay scorecard={scorecard as ParagraphScorecard} />
      ) : (
        <EssayScorecardDisplay scorecard={scorecard as EssayScorecard} />
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-[#00d492]">✨ Strengths</h3>
          <ul className="space-y-1">
            {strengths.map((s, i) => (
              <li key={i} className="pl-3 text-sm text-[rgba(255,255,255,0.6)]">
                • {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-[#ff9030]">🎯 Areas for Improvement</h3>
          <ul className="space-y-1">
            {improvements.map((imp, i) => (
              <li key={i} className="pl-3 text-sm text-[rgba(255,255,255,0.6)]">
                • {imp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Overall Feedback */}
      {overallFeedback && (
        <div className="mt-4 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
          <p className="text-sm text-[rgba(255,255,255,0.6)]">{overallFeedback}</p>
        </div>
      )}
    </div>
  );
}

