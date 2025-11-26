'use client';

import { useState } from 'react';

interface RevisionGuidanceProps {
  onClose?: () => void;
}

const REVISION_EXAMPLES = [
  {
    strategy: 'Sentence Expansion (because/but/so)',
    before: 'She opened the door.',
    after: 'She opened the door because the golden light beckoned her.',
    explanation: 'Added "because" to show WHY she opened the door. This expands the sentence and adds depth.',
  },
  {
    strategy: 'Appositives',
    before: 'The lighthouse stood on the cliff.',
    after: 'The lighthouse, a weathered stone tower, stood on the cliff.',
    explanation: 'Added an appositive (descriptive phrase) to add detail without a new sentence.',
  },
  {
    strategy: 'Sentence Combining',
    before: 'The door was rusty. It was heavy. She pushed it open.',
    after: 'She pushed open the heavy, rusty door.',
    explanation: 'Combined three choppy sentences into one smooth sentence.',
  },
  {
    strategy: 'Transition Words',
    before: 'She walked inside. The room was dark.',
    after: 'She walked inside. However, the room was dark.',
    explanation: 'Added "However" to show contrast and connect the ideas.',
  },
  {
    strategy: 'Sensory Details',
    before: 'The air smelled bad.',
    after: 'The musty odor of mildew filled her nostrils.',
    explanation: 'Replaced vague description with specific sensory detail (smell).',
  },
];

export default function RevisionGuidance({ onClose }: RevisionGuidanceProps) {
  const [currentExample, setCurrentExample] = useState(0);
  const example = REVISION_EXAMPLES[currentExample];

  return (
    <div className="mb-6 rounded-[14px] border border-[#00d49230] bg-[#00d49208] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📚</span>
          <h3 className="text-sm font-semibold" style={{ color: '#00d492' }}>
            Revision Strategy Guide
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentExample((prev) => (prev > 0 ? prev - 1 : REVISION_EXAMPLES.length - 1))}
            className="rounded-[6px] border border-[rgba(255,255,255,0.1)] bg-transparent px-2 py-1 text-xs text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)]"
          >
            ←
          </button>
          <span className="text-xs text-[rgba(255,255,255,0.4)]">
            {currentExample + 1}/{REVISION_EXAMPLES.length}
          </span>
          <button
            onClick={() => setCurrentExample((prev) => (prev < REVISION_EXAMPLES.length - 1 ? prev + 1 : 0))}
            className="rounded-[6px] border border-[rgba(255,255,255,0.1)] bg-transparent px-2 py-1 text-xs text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)]"
          >
            →
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 text-xs text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.6)]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 text-xs">
        <div className="rounded-[10px] border border-[#00d49220] bg-[#00d49205] p-3">
          <div className="mb-2 font-medium text-[rgba(255,255,255,0.8)]">
            Strategy: {example.strategy}
          </div>
          <div className="text-[rgba(255,255,255,0.6)]">
            {example.explanation}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[10px] border border-[#ff5f8f30] bg-[#ff5f8f08] p-3">
            <div className="mb-2 flex items-center gap-1 font-medium text-[#ff5f8f]">
              ❌ Before
            </div>
            <div className="text-[rgba(255,255,255,0.6)] italic">
              &quot;{example.before}&quot;
            </div>
          </div>

          <div className="rounded-[10px] border border-[#00d49230] bg-[#00d49208] p-3">
            <div className="mb-2 flex items-center gap-1 font-medium text-[#00d492]">
              ✅ After
            </div>
            <div className="text-[rgba(255,255,255,0.6)] italic">
              &quot;{example.after}&quot;
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border border-[#00d49220] bg-[#00d49205] p-3 text-[rgba(255,255,255,0.5)]">
          <strong className="text-[rgba(255,255,255,0.7)]">💡 How to Apply:</strong>
          <ol className="mt-1 space-y-1 pl-4 list-decimal">
            <li>Read your feedback carefully</li>
            <li>Find sentences that match the &quot;before&quot; examples</li>
            <li>Apply the TWR strategy shown</li>
            <li>Check: Does your revision improve clarity and depth?</li>
          </ol>
        </div>
      </div>
    </div>
  );
}


