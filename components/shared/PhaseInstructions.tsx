'use client';

interface PhaseInstructionsProps {
  phase: 1 | 2 | 3;
}

export default function PhaseInstructions({ phase }: PhaseInstructionsProps) {
  const instructions = {
    1: {
      title: '📝 Phase 1: Writing',
      description: 'Write your response to the prompt. Focus on clear ideas and good organization.',
      tips: [
        '✨ Use sentence expansion (because/but/so) to show deeper thinking',
        '✨ Try adding an appositive for vivid description',
        '✨ Include sensory details (what you see, hear, feel)',
        '✨ Use transition words to connect ideas',
      ],
      color: 'emerald',
    },
    2: {
      title: '🔍 Phase 2: Peer Feedback',
      description: 'Provide specific, helpful feedback on your peer\'s writing.',
      tips: [
        '✨ Quote exact sentences from their writing',
        '✨ Name TWR strategies you notice (appositives, transitions, etc.)',
        '✨ Give concrete suggestions: "Change X to Y because..."',
        '✨ Be specific - avoid vague comments like "good job"',
      ],
      color: 'blue',
    },
    3: {
      title: '✏️ Phase 3: Revision',
      description: 'Use the feedback to improve your writing. Apply TWR strategies!',
      tips: [
        '✨ Apply feedback suggestions - add appositives, expand sentences',
        '✨ Combine short choppy sentences',
        '✨ Add transition words where suggested',
        '✨ Include more specific details and sensory language',
      ],
      color: 'purple',
    },
  };
  
  const current = instructions[phase];
  
  return (
    <div className={`rounded-2xl border border-${current.color}-400/30 bg-${current.color}-400/10 p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-2xl">💡</div>
        <div className="flex-1">
          <h3 className={`text-${current.color}-200 font-semibold text-sm mb-1`}>
            {current.title}
          </h3>
          <p className="text-white/70 text-xs mb-3">
            {current.description}
          </p>
          <div className="space-y-1.5">
            {current.tips.map((tip, i) => (
              <div key={i} className="text-white/60 text-xs leading-relaxed">
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

