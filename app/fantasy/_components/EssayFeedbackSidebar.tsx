'use client';

import { ESSAY_CRITERIA } from '../_lib/essay-grader-config';
import type { EssayGraderResult, CriterionStatus } from '../_lib/grading';

interface EssayFeedbackSidebarProps {
  result: EssayGraderResult;
}

function StatusDot({ status }: { status: CriterionStatus }) {
  const color = {
    yes: '#4ade80',
    developing: '#fbbf24',
    no: '#f87171',
  }[status];

  return (
    <div
      className="w-2 h-2 rounded-full shrink-0"
      style={{ background: color }}
    />
  );
}

function CompactCriterion({ 
  name, 
  status, 
  feedback 
}: { 
  name: string; 
  status: CriterionStatus; 
  feedback: string;
}) {
  if (status === 'yes') return null;

  return (
    <div className="flex gap-2 items-start">
      <StatusDot status={status} />
      <div>
        <p className="font-memento text-xs mb-0.5" style={{ color: 'rgba(245, 230, 184, 0.7)' }}>
          {name}
        </p>
        {feedback && (
          <p className="font-avenir text-sm" style={{ color: '#f5e6b8' }}>
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
}

export function EssayFeedbackSidebar({ result }: EssayFeedbackSidebarProps) {
  const { criteria } = result;
  const criteriaMap = new Map(criteria.map(c => [c.criterionId, c]));

  const issueCount = criteria.filter(c => c.status !== 'yes').length;

  if (issueCount === 0) {
    return (
      <div
        className="rounded-md p-4 text-center"
        style={{
          background: 'rgba(74, 222, 128, 0.1)',
          border: '1px solid rgba(74, 222, 128, 0.3)',
        }}
      >
        <span className="font-avenir text-sm" style={{ color: '#4ade80' }}>
          Great job! All criteria met.
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-md p-4 h-full overflow-y-auto"
      style={{
        background: 'rgba(26, 18, 8, 0.9)',
        border: '1px solid rgba(201, 168, 76, 0.2)',
      }}
    >
      <div
        className="text-xs uppercase tracking-widest mb-4 font-memento"
        style={{ color: '#c9a84c' }}
      >
        Areas to Improve ({issueCount})
      </div>

      <div className="space-y-3">
        {ESSAY_CRITERIA.map((criterion) => {
          const result = criteriaMap.get(criterion.id);
          if (!result || result.status === 'yes') return null;
          return (
            <CompactCriterion
              key={criterion.id}
              name={criterion.name}
              status={result.status}
              feedback={result.feedback}
            />
          );
        })}
      </div>
    </div>
  );
}
