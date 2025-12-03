/**
 * @fileoverview Modal displayed when user is blocked from ranked matches.
 * Shows blocking criteria and redirects to practice.
 */

import type { BlockStatus } from '@/lib/types/grading-history';

interface BlockModalProps {
  blockStatus: BlockStatus;
  onClose: () => void;
  onGoToPractice: () => void;
}

/**
 * @description Friendly criterion name mapping.
 */
const CRITERION_NAMES: Record<string, string> = {
  'Topic Sentence': 'Topic Sentences',
  'Detail Sentences': 'Supporting Details',
  'Concluding Sentence': 'Concluding Sentences',
  'Conventions': 'Grammar & Mechanics',
  'Claim (Topic Sentence)': 'Claims & Topic Sentences',
  'Evidence and Reasoning (Detail Sentences)': 'Evidence & Reasoning',
};

/**
 * @description Get friendly criterion name.
 */
function getCriterionName(criterion: string): string {
  return CRITERION_NAMES[criterion] || criterion;
}

export function BlockModal({ blockStatus, onClose, onGoToPractice }: BlockModalProps) {
  const isAccumulated = blockStatus.reason === 'accumulated_gaps';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-[20px] border border-[rgba(255,95,143,0.3)] bg-[#141e27] p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 text-4xl">🚫</div>
          <h2 className="text-xl font-bold text-white">Practice Required</h2>
        </div>

        {/* Message */}
        <p className="mb-6 text-center text-sm text-[rgba(255,255,255,0.7)]">
          {isAccumulated
            ? 'You have recurring skill gaps that need attention before your next ranked match.'
            : 'Your recent writing showed areas that need strengthening before your next ranked match.'}
        </p>

        {/* Blocking Criteria */}
        <div className="mb-6 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.025)] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#ff5f8f]">Areas to Improve:</h3>
          <ul className="space-y-2">
            {blockStatus.blockingCriteria.map((criterion, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.8)]">
                <span className="text-[#ff9030]">•</span>
                <span>{getCriterionName(criterion)}</span>
                {isAccumulated && (
                  <span className="ml-auto text-xs text-[rgba(255,255,255,0.4)]">(recurring)</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <p className="mb-6 text-center text-xs text-[rgba(255,255,255,0.5)]">
          Complete the recommended practice lessons to unlock ranked matches again.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onGoToPractice}
            className="w-full rounded-[12px] bg-[#00e5e5] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#101012] transition hover:bg-[#00d4d4]"
          >
            Go to Practice
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-[12px] border border-[rgba(255,255,255,0.1)] px-6 py-3 text-sm font-medium text-[rgba(255,255,255,0.5)] transition hover:border-[rgba(255,255,255,0.2)] hover:text-[rgba(255,255,255,0.8)]"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

