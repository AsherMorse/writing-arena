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
      color: '#00e5e5',
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
      color: '#ff5f8f',
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
      color: '#00d492',
    },
  };
  
  const current = instructions[phase];
  
  return (
    <div 
      className="mb-6 rounded-[14px] border p-4"
      style={{ borderColor: `${current.color}30`, background: `${current.color}08` }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-xl">💡</div>
        <div className="flex-1">
          <h3 className="mb-1 text-sm font-semibold" style={{ color: current.color }}>
            {current.title}
          </h3>
          <p className="mb-3 text-xs text-[rgba(255,255,255,0.5)]">
            {current.description}
          </p>
          <div className="space-y-1">
            {current.tips.map((tip, i) => (
              <div key={i} className="text-xs text-[rgba(255,255,255,0.4)] leading-relaxed">
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
