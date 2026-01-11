"use client";

import { useState } from "react";
import { SEVERITY_ICONS, type GraderError } from "@/lib/grading/client-constants";

type FeedbackDisplayProps = {
  errors: GraderError[];
  errorCount?: number;
};

export function FeedbackDisplay({ errors, errorCount }: FeedbackDisplayProps) {
  const [expanded, setExpanded] = useState(false);

  if (!errors || errors.length === 0) return null;

  const totalCount = errorCount || errors.length;
  const hasMore = totalCount > 3;
  const displayErrors = expanded ? errors : errors.slice(0, 2);

  return (
    <div className="space-y-1.5">
      {displayErrors.map((error, idx) => (
        <p key={idx} className="text-neutral-400 text-sm md:text-base">
          <span className="mr-1.5">{SEVERITY_ICONS[error.severity]}</span>
          {error.explanation}
        </p>
      ))}
      {hasMore && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-amber-500/70 hover:text-amber-400 text-xs transition-colors"
        >
          +{totalCount - 2} more {totalCount - 2 === 1 ? "issue" : "issues"}
        </button>
      )}
      {expanded && hasMore && (
        <button
          onClick={() => setExpanded(false)}
          className="text-neutral-600 hover:text-neutral-500 text-xs transition-colors"
        >
          Show less
        </button>
      )}
    </div>
  );
}
