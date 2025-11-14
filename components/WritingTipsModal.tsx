'use client';

interface WritingTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptType: string;
}

export default function WritingTipsModal({ isOpen, onClose, promptType }: WritingTipsModalProps) {
  if (!isOpen) return null;

  const tips = {
    narrative: {
      title: 'Narrative tactics',
      icon: '📖',
      subtitle: 'Build momentum with concrete detail and pacing moves.',
      strategies: [
        {
          name: 'Sentence expansion',
          tip: 'Use because, but, or so to explain cause and effect.',
          example: 'She opened the door because she heard a strange noise in the stairwell.',
        },
        {
          name: 'Show versus tell',
          tip: 'Swap general statements for sensory detail.',
          example: 'Her hands trembled on the rusted handle as the lighthouse groaned in the wind.',
        },
        {
          name: 'Appositives',
          tip: 'Add quick description inside commas without starting a new sentence.',
          example: 'Sarah, a curious fifth grader, pushed the door open with her elbow.',
        },
        {
          name: 'Time transitions',
          tip: 'Sequence events with words like first, suddenly, after that, finally.',
          example: 'First she checked the hall. Moments later a golden light spilled out.',
        },
      ],
    },
    descriptive: {
      title: 'Descriptive tactics',
      icon: '🎨',
      subtitle: 'Anchor readers with vivid, specific images.',
      strategies: [
        {
          name: 'Five senses',
          tip: 'Describe what characters see, hear, smell, taste, and feel.',
          example: 'Salt stung her tongue while cold spray dripped from the lantern room ceiling.',
        },
        {
          name: 'Specific nouns',
          tip: 'Replace vague words with precise objects or textures.',
          example: 'Instead of old book try leather bound log streaked with soot.',
        },
        {
          name: 'Spatial order',
          tip: 'Tour the scene from one location to another so readers can follow.',
          example: 'At the entrance the floor creaked, farther in broken glass glittered beside the lamp.',
        },
        {
          name: 'Figurative language',
          tip: 'Use similes or metaphors to compare unfamiliar images.',
          example: 'Fog coiled around the beacon like a lazy cat.',
        },
      ],
    },
    informational: {
      title: 'Informational tactics',
      icon: '📚',
      subtitle: 'Explain clearly with structure, signal words, and evidence.',
      strategies: [
        {
          name: 'Topic sentence',
          tip: 'Lead each paragraph with the main idea, then support it.',
          example: 'Lighthouses prevent shipwrecks. First they send light, then horns warn during storms.',
        },
        {
          name: 'Signal words',
          tip: 'Use connectors like because, therefore, however to show relationships.',
          example: 'The beacon rotates every thirty seconds therefore sailors can measure distance.',
        },
        {
          name: 'Sequential steps',
          tip: 'Describe processes in order from start to finish.',
          example: 'First the keeper trims the wick, next he polishes the lens, finally he logs the weather.',
        },
        {
          name: 'Evidence and examples',
          tip: 'Support each claim with specific facts or sources.',
          example: 'According to the Coast Guard the Heceta Head light reaches twenty one miles.',
        },
      ],
    },
    argumentative: {
      title: 'Argument tactics',
      icon: '💬',
      subtitle: 'State a claim, reinforce it, then dismantle the counterpoint.',
      strategies: [
        {
          name: 'Claim and reasons',
          tip: 'Lead with your position and two or three strong reasons.',
          example: 'Students should rotate as lighthouse guides because it builds teamwork and persistence.',
        },
        {
          name: 'Counterargument',
          tip: 'Address the other side briefly, then refute it.',
          example: 'Some argue tours are unsafe, however safety gear and training solve that problem.',
        },
        {
          name: 'Evidence stack',
          tip: 'Back each reason with data, quotes, or concrete examples.',
          example: 'A 2024 study found field shifts increased science scores by fifteen percent.',
        },
        {
          name: 'Closing loop',
          tip: 'Finish by restating the claim and strongest takeaway.',
          example: 'Therefore rotating tours build responsibility and should continue.',
        },
      ],
    },
  } as const;

  const currentTips = tips[promptType as keyof typeof tips] || tips.narrative;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c141d]/80 backdrop-blur" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#141e27] p-0 text-white shadow-2xl"
        onClick={event => event.stopPropagation()}
      >
        <header className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[#0c141d] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#141e27] text-2xl">
              {currentTips.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{currentTips.title}</h2>
              <p className="text-xs text-white/50">{currentTips.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-white transition hover:bg-white/15"
            aria-label="Close tips"
          >
            ×
          </button>
        </header>

        <div className="space-y-4 px-6 py-6">
          {currentTips.strategies.map((strategy, index) => (
            <article key={strategy.name} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#0c141d] text-sm font-semibold">
                  {index + 1}
                </span>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{strategy.name}</h3>
                    <p className="mt-1 text-xs text-white/60 leading-relaxed">{strategy.tip}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-xs text-white/70">
                    <span className="font-semibold text-emerald-200">Example:</span> {strategy.example}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <footer className="sticky bottom-0 border-t border-white/10 bg-[#141e27] px-6 py-4 text-center text-xs text-white/60">
          Apply one strategy immediately, then queue another if time allows.
        </footer>
      </div>
    </div>
  );
}

