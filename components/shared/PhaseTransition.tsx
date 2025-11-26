'use client';

interface PhaseTransitionProps {
  fromPhase: 1 | 2 | 3;
  toPhase: 1 | 2 | 3;
  onContinue?: () => void;
}

const TRANSITION_MESSAGES: Record<string, { title: string; message: string; color: string }> = {
  '1-2': {
    title: '📝 Phase 1 Complete!',
    message: "Great writing! Now you'll review a peer's writing and provide specific feedback. Remember: Quote exact text, name TWR strategies you notice, and give actionable suggestions.",
    color: '#ff5f8f',
  },
  '2-3': {
    title: '🔍 Phase 2 Complete!',
    message: "Excellent feedback! Now use the feedback you received to improve your writing. Read all feedback carefully, identify 2-3 key improvements, and apply TWR strategies like appositives and sentence expansion.",
    color: '#00d492',
  },
};

export default function PhaseTransition({ fromPhase, toPhase, onContinue }: PhaseTransitionProps) {
  const key = `${fromPhase}-${toPhase}`;
  const transition = TRANSITION_MESSAGES[key];

  if (!transition) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.8)] p-4">
      <div 
        className="max-w-md rounded-[14px] border p-6"
        style={{ borderColor: `${transition.color}30`, background: `${transition.color}08` }}
      >
        <h2 className="mb-3 text-lg font-semibold" style={{ color: transition.color }}>
          {transition.title}
        </h2>
        <p className="mb-6 text-sm text-[rgba(255,255,255,0.7)] leading-relaxed">
          {transition.message}
        </p>
        {onContinue && (
          <button
            onClick={onContinue}
            className="w-full rounded-[10px] px-4 py-2 text-sm font-medium text-[#101012] transition-opacity hover:opacity-90"
            style={{ background: transition.color }}
          >
            Continue to Phase {toPhase}
          </button>
        )}
      </div>
    </div>
  );
}

