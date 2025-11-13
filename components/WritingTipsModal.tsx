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
      title: 'Narrative Writing Tips',
      icon: '📖',
      strategies: [
        {
          name: 'Sentence Expansion',
          tip: 'Use because, but, or so to show why things happen',
          example: 'She opened the door because she heard a strange noise.',
        },
        {
          name: 'Show, Don\'t Tell',
          tip: 'Use specific details instead of general statements',
          example: 'Instead of "She was scared" → "Her hands trembled as she reached for the handle."',
        },
        {
          name: 'Appositives',
          tip: 'Add description using commas',
          example: 'Sarah, a curious ten-year-old, pushed open the rusty gate.',
        },
        {
          name: 'Time Transitions',
          tip: 'Show passage of time clearly',
          example: 'Use: First, Then, After that, Finally, Suddenly',
        },
      ],
    },
    descriptive: {
      title: 'Descriptive Writing Tips',
      icon: '🎨',
      strategies: [
        {
          name: 'Five Senses',
          tip: 'Include what you see, hear, smell, taste, and feel',
          example: 'The salty air stung my eyes while waves crashed loudly below.',
        },
        {
          name: 'Specific Details',
          tip: 'Replace vague words with precise descriptions',
          example: 'Instead of "pretty flower" → "crimson rose with velvet petals"',
        },
        {
          name: 'Spatial Order',
          tip: 'Organize from one location to another',
          example: 'Near the entrance... Moving deeper... At the far end...',
        },
        {
          name: 'Figurative Language',
          tip: 'Use similes and metaphors',
          example: 'The fog rolled in like a silent ghost.',
        },
      ],
    },
    informational: {
      title: 'Informational Writing Tips',
      icon: '📚',
      strategies: [
        {
          name: 'Topic Sentence',
          tip: 'Start with main idea, then support it',
          example: 'Photosynthesis is how plants make food. First, they... Then...',
        },
        {
          name: 'Signal Words',
          tip: 'Use words that show relationships',
          example: 'because (cause), therefore (effect), however (contrast)',
        },
        {
          name: 'Step-by-Step Order',
          tip: 'Use sequence words for processes',
          example: 'First... Next... Then... Finally...',
        },
        {
          name: 'Examples & Evidence',
          tip: 'Support every point with specific examples',
          example: 'For example, For instance, Such as, Specifically',
        },
      ],
    },
    argumentative: {
      title: 'Argumentative Writing Tips',
      icon: '💬',
      strategies: [
        {
          name: 'Claim + Reasons',
          tip: 'State your position clearly, then give reasons',
          example: 'Students should... because... Additionally... Furthermore...',
        },
        {
          name: 'Counterargument',
          tip: 'Address the other side, then refute it',
          example: 'Some might argue that... However, this ignores...',
        },
        {
          name: 'Evidence & Examples',
          tip: 'Support each reason with specific evidence',
          example: 'According to... Studies show... For example...',
        },
        {
          name: 'Conclusion',
          tip: 'Restate your claim and strongest reason',
          example: 'Therefore... In conclusion... For these reasons...',
        },
      ],
    },
  };

  const currentTips = tips[promptType as keyof typeof tips] || tips.narrative;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl max-w-3xl w-full max-h-[80vh] overflow-y-auto border-2 border-purple-400/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-3xl border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">{currentTips.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-white">{currentTips.title}</h2>
                <p className="text-white/80 text-sm">The Writing Revolution Strategies</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all text-white text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {currentTips.strategies.map((strategy, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold mb-2 text-lg">{strategy.name}</h3>
                  <p className="text-white/80 text-sm mb-3 leading-relaxed">{strategy.tip}</p>
                  <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
                    <div className="text-blue-300 text-xs font-semibold mb-1">Example:</div>
                    <p className="text-white/90 text-sm italic leading-relaxed">
                      {strategy.example}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-emerald-600 to-teal-600 p-4 rounded-b-3xl">
          <div className="text-center">
            <p className="text-white text-sm">
              💡 <span className="font-semibold">Pro Tip:</span> Try using one or two of these strategies in your writing right now!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

