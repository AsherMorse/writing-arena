'use client';

import { ParchmentCardWithLine } from './ParchmentCard';
import { getParchmentTextStyle } from './parchment-styles';
import type { GraderResult, GraderRemark } from '@/app/_lib/grading';

interface FeedbackSidebarProps {
  result: GraderResult;
  /** Class name for the outer card container */
  className?: string;
  /** Class name for the scrollable content area (e.g., max-h-[400px] overflow-y-auto) */
  contentClassName?: string;
}

function CompactRemark({ remark }: { remark: GraderRemark }) {
  const isError = remark.severity === 'error';
  const dotColor = isError ? '#b91c1c' : '#b45309';
  const textStyle = getParchmentTextStyle();

  return (
    <div className="flex gap-2 items-start">
      <div
        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
        style={{ background: dotColor }}
      />
      <div>
        <p className="font-avenir text-sm" style={textStyle}>
          {remark.concreteProblem}
        </p>
        <p className="font-avenir text-xs mt-1" style={{ ...textStyle, opacity: 0.7 }}>
          {remark.callToAction}
        </p>
      </div>
    </div>
  );
}

export function FeedbackSidebar({ result, className, contentClassName }: FeedbackSidebarProps) {
  const { remarks } = result;
  const errors = remarks.filter(r => r.severity === 'error');
  const nits = remarks.filter(r => r.severity === 'nit');

  if (remarks.length === 0) {
    return (
      <ParchmentCardWithLine title="Things to Fix" className={className}>
        <div className="text-center">
          <span className="font-avenir text-sm" style={{ ...getParchmentTextStyle(), color: '#15803d' }}>
          Great job! No issues to fix.
        </span>
      </div>
      </ParchmentCardWithLine>
    );
  }

  return (
    <ParchmentCardWithLine title="Things to Fix" className={className} contentClassName={contentClassName}>
      <div className="space-y-4">
        {errors.map((remark, i) => (
          <CompactRemark key={`error-${i}`} remark={remark} />
        ))}
        {nits.map((remark, i) => (
          <CompactRemark key={`nit-${i}`} remark={remark} />
        ))}
      </div>
    </ParchmentCardWithLine>
  );
}

