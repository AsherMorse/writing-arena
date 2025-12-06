'use client';

import type { GraderResult, GraderRemark } from '../_lib/grading';

interface FeedbackDisplayProps {
  result: GraderResult;
}

function ScoreBar({ label, score, maxScore }: { label: string; score: number; maxScore: number }) {
  const pct = (score / maxScore) * 100;
  const color = pct >= 80 ? '#4ade80' : pct >= 60 ? '#fbbf24' : '#f87171';

  return (
    <div className="flex items-center gap-3">
      <span className="font-memento text-xs w-28 shrink-0" style={{ color: 'rgba(245, 230, 184, 0.7)' }}>
        {label}
      </span>
      <div
        className="flex-1 h-2 rounded-full"
        style={{ background: 'rgba(201, 168, 76, 0.2)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="font-memento text-xs w-8 text-right" style={{ color }}>
        {score}/{maxScore}
      </span>
    </div>
  );
}

function RemarkCard({ remark }: { remark: GraderRemark }) {
  const isError = remark.severity === 'error';
  const borderColor = isError ? 'rgba(248, 113, 113, 0.4)' : 'rgba(251, 191, 36, 0.4)';
  const labelColor = isError ? '#f87171' : '#fbbf24';
  const labelText = isError ? 'Issue' : 'Suggestion';

  return (
    <div
      className="rounded-md p-4"
      style={{
        background: 'rgba(26, 18, 8, 0.8)',
        border: `1px solid ${borderColor}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="font-memento text-xs uppercase tracking-wider px-2 py-0.5 rounded"
          style={{
            color: labelColor,
            background: `${labelColor}15`,
          }}
        >
          {labelText}
        </span>
        <span className="font-memento text-xs" style={{ color: 'rgba(245, 230, 184, 0.5)' }}>
          {remark.category}
        </span>
      </div>
      <p className="font-avenir text-sm mb-2" style={{ color: '#f5e6b8' }}>
        {remark.concreteProblem}
      </p>
      <p className="font-avenir text-sm" style={{ color: 'rgba(245, 230, 184, 0.7)' }}>
        {remark.callToAction}
      </p>
      {remark.substringOfInterest && (
        <div
          className="mt-3 p-2 rounded text-xs font-mono"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            color: 'rgba(245, 230, 184, 0.6)',
            borderLeft: `2px solid ${labelColor}`,
          }}
        >
          "{remark.substringOfInterest}"
        </div>
      )}
    </div>
  );
}

export function FeedbackDisplay({ result }: FeedbackDisplayProps) {
  const { scores, remarks } = result;

  return (
    <div className="space-y-4">
      <div
        className="rounded-md p-4"
        style={{
          background: 'rgba(26, 18, 8, 0.8)',
          border: '1px solid rgba(201, 168, 76, 0.2)',
        }}
      >
        <div
          className="text-xs uppercase tracking-widest mb-3 font-memento"
          style={{ color: '#c9a84c' }}
        >
          Score Breakdown
        </div>
        <div className="space-y-2">
          <ScoreBar label="Topic Sentence" score={scores.topicSentence} maxScore={5} />
          <ScoreBar label="Details" score={scores.detailSentences} maxScore={5} />
          <ScoreBar label="Conclusion" score={scores.concludingSentence} maxScore={5} />
          <ScoreBar label="Conventions" score={scores.conventions} maxScore={5} />
        </div>
      </div>

      {remarks.length > 0 && (
        <div className="space-y-3">
          <div
            className="text-xs uppercase tracking-widest font-memento"
            style={{ color: '#c9a84c' }}
          >
            Feedback ({remarks.length})
          </div>
          {remarks.map((remark, i) => (
            <RemarkCard key={i} remark={remark} />
          ))}
        </div>
      )}

      {remarks.length === 0 && (
        <div
          className="rounded-md p-4 text-center"
          style={{
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
          }}
        >
          <span className="font-avenir text-sm" style={{ color: '#4ade80' }}>
            Excellent work! No issues found.
          </span>
        </div>
      )}

    </div>
  );
}

