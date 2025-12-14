'use client';

import { useState } from 'react';
import { getRankTier, RankTier } from '@/lib/constants/rank-timing';

interface TWRPlanningPhaseProps {
  prompt: {
    title: string;
    description: string;
    type: string;
  };
  userRank?: string;
  onComplete: (plan: PlanningData) => void;
  onSkip?: () => void;
}

export interface PlanningData {
  becauseButSo?: string;
  mainIdea?: string;
  supportingDetails?: string[];
  notes?: string;
}

const PLANNING_TEMPLATES: Record<RankTier, {
  showBecauseButSo: boolean;
  showMainIdea: boolean;
  showSupportingDetails: boolean;
  showNotes: boolean;
}> = {
  bronze: {
    showBecauseButSo: true,
    showMainIdea: true,
    showSupportingDetails: false,
    showNotes: false,
  },
  silver: {
    showBecauseButSo: true,
    showMainIdea: true,
    showSupportingDetails: true,
    showNotes: false,
  },
  gold: {
    showBecauseButSo: true,
    showMainIdea: true,
    showSupportingDetails: true,
    showNotes: true,
  },
  platinum: {
    showBecauseButSo: true,
    showMainIdea: true,
    showSupportingDetails: true,
    showNotes: true,
  },
  diamond: {
    showBecauseButSo: true,
    showMainIdea: true,
    showSupportingDetails: true,
    showNotes: true,
  },
  master: {
    showBecauseButSo: true,
    showMainIdea: true,
    showSupportingDetails: true,
    showNotes: true,
  },
};

export default function TWRPlanningPhase({ prompt, userRank, onComplete, onSkip }: TWRPlanningPhaseProps) {
  const tier = userRank ? getRankTier(userRank) : 'silver';
  const template = PLANNING_TEMPLATES[tier];

  const [plan, setPlan] = useState<PlanningData>({
    becauseButSo: '',
    mainIdea: '',
    supportingDetails: ['', ''],
    notes: '',
  });

  const handleSubmit = () => {
    onComplete(plan);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.9)] p-4">
      <div className="max-w-2xl w-full rounded-[14px] border border-[#00e5e530] bg-[#00e5e508] p-6">
        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-semibold" style={{ color: '#00e5e5' }}>
            📋 Plan Before You Write
          </h2>
          <p className="text-sm text-[rgba(255,255,255,0.6)]">
            Take a moment to plan using TWR strategies. This will help you write more clearly!
          </p>
        </div>

        <div className="mb-6 rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.025)] p-4">
          <div className="mb-2 text-xs font-semibold uppercase text-[rgba(255,255,255,0.4)]">
            Prompt
          </div>
          <div className="text-lg font-medium">{prompt.title}</div>
          <div className="mt-1 text-sm text-[rgba(255,255,255,0.6)]">{prompt.description}</div>
        </div>

        <div className="space-y-4 mb-6">
          {template.showBecauseButSo && (
            <div>
              <label className="mb-2 block text-sm font-medium text-[rgba(255,255,255,0.8)]">
                🔗 Because-But-So Planning
              </label>
              <p className="mb-2 text-xs text-[rgba(255,255,255,0.5)]">
                Think about your main idea: What happens? Why? What&apos;s different? What&apos;s the result?
              </p>
              <textarea
                value={plan.becauseButSo}
                onChange={(e) => setPlan({ ...plan, becauseButSo: e.target.value })}
                placeholder="Example: The character discovers something because they were curious, but it was dangerous, so they had to be brave..."
                className="w-full rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-3 text-sm text-[rgba(255,255,255,0.8)] placeholder:text-[rgba(255,255,255,0.3)] focus:border-[#00e5e5] focus:outline-none"
                rows={3}
              />
            </div>
          )}

          {template.showMainIdea && (
            <div>
              <label className="mb-2 block text-sm font-medium text-[rgba(255,255,255,0.8)]">
                💡 Main Idea / Thesis
              </label>
              <p className="mb-2 text-xs text-[rgba(255,255,255,0.5)]">
                What&apos;s your main point? (One clear sentence)
              </p>
              <input
                type="text"
                value={plan.mainIdea}
                onChange={(e) => setPlan({ ...plan, mainIdea: e.target.value })}
                placeholder="Example: The lighthouse keeper discovers a hidden room that changes everything..."
                className="w-full rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-3 text-sm text-[rgba(255,255,255,0.8)] placeholder:text-[rgba(255,255,255,0.3)] focus:border-[#00e5e5] focus:outline-none"
              />
            </div>
          )}

          {template.showSupportingDetails && (
            <div>
              <label className="mb-2 block text-sm font-medium text-[rgba(255,255,255,0.8)]">
                📝 Supporting Details
              </label>
              <p className="mb-2 text-xs text-[rgba(255,255,255,0.5)]">
                What 2-3 details will support your main idea?
              </p>
              {plan.supportingDetails?.map((detail, index) => (
                <input
                  key={index}
                  type="text"
                  value={detail}
                  onChange={(e) => {
                    const newDetails = [...(plan.supportingDetails || [])];
                    newDetails[index] = e.target.value;
                    setPlan({ ...plan, supportingDetails: newDetails });
                  }}
                  placeholder={`Detail ${index + 1}...`}
                  className="mb-2 w-full rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-3 text-sm text-[rgba(255,255,255,0.8)] placeholder:text-[rgba(255,255,255,0.3)] focus:border-[#00e5e5] focus:outline-none"
                />
              ))}
            </div>
          )}

          {template.showNotes && (
            <div>
              <label className="mb-2 block text-sm font-medium text-[rgba(255,255,255,0.8)]">
                📋 Additional Notes
              </label>
              <textarea
                value={plan.notes}
                onChange={(e) => setPlan({ ...plan, notes: e.target.value })}
                placeholder="Any other ideas, details, or structure notes..."
                className="w-full rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-3 text-sm text-[rgba(255,255,255,0.8)] placeholder:text-[rgba(255,255,255,0.3)] focus:border-[#00e5e5] focus:outline-none"
                rows={2}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {onSkip && (
            <button
              onClick={onSkip}
              className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-transparent px-4 py-2 text-sm font-medium text-[rgba(255,255,255,0.6)] transition-all hover:bg-[rgba(255,255,255,0.05)]"
            >
              Skip Planning
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-[10px] px-4 py-2 text-sm font-medium text-[#101012] transition-opacity hover:opacity-90"
            style={{ background: '#00e5e5' }}
          >
            Start Writing →
          </button>
        </div>

        <div className="mt-4 rounded-[10px] border border-[#00e5e520] bg-[#00e5e505] p-3 text-xs text-[rgba(255,255,255,0.5)]">
          💡 <strong>Tip:</strong> Planning helps you write faster and more clearly. Even a quick plan makes a big difference!
        </div>
      </div>
    </div>
  );
}

