/**
 * Reusable Tips Button Component
 * Floating action button for opening tips modals
 */

interface TipsButtonProps {
  onOpen: () => void;
  phase?: 1 | 2 | 3;
}

export function TipsButton({ onOpen, phase }: TipsButtonProps) {
  const phaseEmojis = {
    1: '✍️',
    2: '🔍',
    3: '✏️',
  };

  const phaseColors = {
    1: '#00e5e5',
    2: '#ff5f8f',
    3: '#00d492',
  };

  const emoji = phase ? phaseEmojis[phase] : '💡';
  const color = phase ? phaseColors[phase] : '#ff9030';

  return (
    <button onClick={onOpen} className="fixed bottom-8 right-8 z-40 group" title="Tips">
      <div className="relative">
        <div 
          className="flex h-14 w-14 items-center justify-center rounded-full border shadow-lg transition-all hover:scale-110"
          style={{
            borderColor: color,
            backgroundColor: `${color}1A`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${color}33`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = `${color}1A`;
          }}
        >
          <span className="text-2xl">{emoji}</span>
        </div>
        <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff9030] text-[10px] animate-pulse">✨</div>
        <div className="absolute -bottom-10 right-0 rounded-[6px] bg-[rgba(255,255,255,0.025)] px-2 py-1 text-[10px] text-[rgba(255,255,255,0.4)] opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap border border-[rgba(255,255,255,0.05)]">Tips</div>
      </div>
    </button>
  );
}

