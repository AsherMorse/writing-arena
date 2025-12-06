'use client';

import type { GraderResult, GraderRemark } from '../_lib/grading';

interface FeedbackSidebarProps {
  result: GraderResult;
}

function CompactRemark({ remark }: { remark: GraderRemark }) {
  const isError = remark.severity === 'error';
  const dotColor = isError ? '#f87171' : '#fbbf24';

  return (
    <div className="flex gap-2 items-start">
      <div
        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
        style={{ background: dotColor }}
      />
      <div>
        <p className="font-avenir text-sm" style={{ color: '#f5e6b8' }}>
          {remark.concreteProblem}
        </p>
        <p className="font-avenir text-xs mt-1" style={{ color: 'rgba(245, 230, 184, 0.6)' }}>
          {remark.callToAction}
        </p>
      </div>
    </div>
  );
}

export function FeedbackSidebar({ result }: FeedbackSidebarProps) {
  const { remarks } = result;
  const errors = remarks.filter(r => r.severity === 'error');
  const nits = remarks.filter(r => r.severity === 'nit');

  if (remarks.length === 0) {
    return (
      <div
        className="rounded-md p-4 text-center"
        style={{
          background: 'rgba(74, 222, 128, 0.1)',
          border: '1px solid rgba(74, 222, 128, 0.3)',
        }}
      >
        <span className="font-avenir text-sm" style={{ color: '#4ade80' }}>
          Great job! No issues to fix.
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
        Things to Fix
      </div>

      <div className="space-y-4">
        {errors.map((remark, i) => (
          <CompactRemark key={`error-${i}`} remark={remark} />
        ))}
        {nits.map((remark, i) => (
          <CompactRemark key={`nit-${i}`} remark={remark} />
        ))}
      </div>
    </div>
  );
}

