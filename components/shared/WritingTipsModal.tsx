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
        { name: 'Sentence expansion', tip: 'Use because, but, or so to explain cause and effect.', example: 'She opened the door because she heard a strange noise in the stairwell.' },
        { name: 'Show versus tell', tip: 'Swap general statements for sensory detail.', example: 'Her hands trembled on the rusted handle as the lighthouse groaned in the wind.' },
        { name: 'Appositives', tip: 'Add quick description inside commas without starting a new sentence.', example: 'Sarah, a curious fifth grader, pushed the door open with her elbow.' },
        { name: 'Time transitions', tip: 'Sequence events with words like first, suddenly, after that, finally.', example: 'First she checked the hall. Moments later a golden light spilled out.' },
      ],
    },
    descriptive: {
      title: 'Descriptive tactics',
      icon: '🎨',
      subtitle: 'Anchor readers with vivid, specific images.',
      strategies: [
        { name: 'Five senses', tip: 'Describe what characters see, hear, smell, taste, and feel.', example: 'Salt stung her tongue while cold spray dripped from the lantern room ceiling.' },
        { name: 'Specific nouns', tip: 'Replace vague words with precise objects or textures.', example: 'Instead of old book try leather bound log streaked with soot.' },
        { name: 'Spatial order', tip: 'Tour the scene from one location to another so readers can follow.', example: 'At the entrance the floor creaked, farther in broken glass glittered beside the lamp.' },
        { name: 'Figurative language', tip: 'Use similes or metaphors to compare unfamiliar images.', example: 'Fog coiled around the beacon like a lazy cat.' },
      ],
    },
    informational: {
      title: 'Informational tactics',
      icon: '📚',
      subtitle: 'Explain clearly with structure, signal words, and evidence.',
      strategies: [
        { name: 'Topic sentence', tip: 'Lead each paragraph with the main idea, then support it.', example: 'Lighthouses prevent shipwrecks. First they send light, then horns warn during storms.' },
        { name: 'Signal words', tip: 'Use connectors like because, therefore, however to show relationships.', example: 'The beacon rotates every thirty seconds therefore sailors can measure distance.' },
        { name: 'Sequential steps', tip: 'Describe processes in order from start to finish.', example: 'First the keeper trims the wick, next he polishes the lens, finally he logs the weather.' },
        { name: 'Evidence and examples', tip: 'Support each claim with specific facts or sources.', example: 'According to the Coast Guard the Heceta Head light reaches twenty one miles.' },
      ],
    },
    argumentative: {
      title: 'Argument tactics',
      icon: '💬',
      subtitle: 'State a claim, reinforce it, then dismantle the counterpoint.',
      strategies: [
        { name: 'Claim and reasons', tip: 'Lead with your position and two or three strong reasons.', example: 'Students should rotate as lighthouse guides because it builds teamwork and persistence.' },
        { name: 'Counterargument', tip: 'Address the other side briefly, then refute it.', example: 'Some argue tours are unsafe, however safety gear and training solve that problem.' },
        { name: 'Evidence stack', tip: 'Back each reason with data, quotes, or concrete examples.', example: 'A 2024 study found field shifts increased science scores by fifteen percent.' },
        { name: 'Closing loop', tip: 'Finish by restating the claim and strongest takeaway.', example: 'Therefore rotating tours build responsibility and should continue.' },
      ],
    },
  } as const;

  const currentTips = tips[promptType as keyof typeof tips] || tips.narrative;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[#101012] shadow-2xl"
        onClick={event => event.stopPropagation()}
      >
        <header className="sticky top-0 flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] bg-[#101012] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] text-2xl">
              {currentTips.icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{currentTips.title}</h2>
              <p className="text-xs text-[rgba(255,255,255,0.4)]">{currentTips.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)] transition hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
            aria-label="Close tips"
          >
            ×
          </button>
        </header>

        <div className="space-y-3 px-6 py-6">
          {currentTips.strategies.map((strategy, index) => (
            <article key={strategy.name} className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-4">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[rgba(255,255,255,0.05)] bg-[#101012] font-mono text-xs font-medium text-[rgba(255,255,255,0.4)]">
                  {index + 1}
                </span>
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-sm font-medium">{strategy.name}</h3>
                    <p className="mt-1 text-xs text-[rgba(255,255,255,0.5)] leading-relaxed">{strategy.tip}</p>
                  </div>
                  <div className="rounded-[6px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.08)] px-3 py-2 text-xs">
                    <span className="font-medium text-[#00e5e5]">Example:</span>
                    <span className="ml-1 text-[rgba(255,255,255,0.5)]">{strategy.example}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <footer className="sticky bottom-0 border-t border-[rgba(255,255,255,0.05)] bg-[#101012] px-6 py-4 text-center text-xs text-[rgba(255,255,255,0.4)]">
          Apply one strategy immediately, then queue another if time allows.
        </footer>
      </div>
    </div>
  );
}
