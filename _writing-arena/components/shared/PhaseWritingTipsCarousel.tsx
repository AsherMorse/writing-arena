'use client';

import { WritingTip } from '@/lib/constants/writing-tips';
import { useCarousel } from '@/lib/hooks/useCarousel';
import { getPhaseColor } from '@/lib/constants/colors';
import { getColorWithOpacity } from '@/lib/constants/colors';

interface PhaseWritingTipsCarouselProps {
  tips: WritingTip[];
  phase: 1 | 2 | 3;
  autoPlay?: boolean;
}

export function PhaseWritingTipsCarousel({ tips, phase, autoPlay = false }: PhaseWritingTipsCarouselProps) {
  const phaseColor = getPhaseColor(phase);
  const { currentIndex: currentTipIndex, goTo: goToTip } = useCarousel({
    items: tips,
    interval: 5000,
    autoPlay,
  });

  const borderColor = getColorWithOpacity(phaseColor, 0.2);
  const bgColor = getColorWithOpacity(phaseColor, 0.05);

  return (
    <div className="rounded-[14px] border p-4" style={{ borderColor, background: bgColor }}>
      <div className="mb-2 flex items-center justify-center gap-2">
        <span className="text-lg">{tips[currentTipIndex].icon}</span>
        <span className="font-medium">{tips[currentTipIndex].name}</span>
      </div>
      <p className="text-sm text-[rgba(255,255,255,0.6)]">{tips[currentTipIndex].tip}</p>
      <div className="mt-3 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3">
        <div className="mb-1 text-[10px] uppercase" style={{ color: phaseColor }}>Example</div>
        <p className="text-xs italic text-[rgba(255,255,255,0.6)]">{tips[currentTipIndex].example}</p>
      </div>
      <div className="mt-3 flex justify-center gap-1">
        {tips.map((_, index) => (
          <button
            key={index}
            onClick={() => goToTip(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === currentTipIndex 
                ? 'w-6' 
                : 'w-1.5 bg-[rgba(255,255,255,0.1)]'
            }`}
            style={index === currentTipIndex ? { backgroundColor: phaseColor } : {}}
          />
        ))}
      </div>
    </div>
  );
}

