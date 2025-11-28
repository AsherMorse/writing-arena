'use client';

import { WRITING_TIPS_WITH_CONCLUSIONS } from '@/lib/constants/writing-tips';
import { useCarousel } from '@/lib/hooks/useCarousel';
import { TIMING } from '@/lib/constants/scoring';
import { getPhaseColor, getColorWithOpacity } from '@/lib/constants/colors';

interface WritingTipsCarouselProps {
  autoPlay?: boolean;
  phase?: 1 | 2 | 3;
  interval?: number;
}

export default function WritingTipsCarousel({ 
  autoPlay = false, 
  phase = 1,
  interval = TIMING.CAROUSEL_INTERVAL 
}: WritingTipsCarouselProps) {
  const { currentIndex: currentTipIndex, goTo: goToTip } = useCarousel({
    items: WRITING_TIPS_WITH_CONCLUSIONS,
    interval,
    autoPlay,
  });

  const writingTips = WRITING_TIPS_WITH_CONCLUSIONS;
  const phaseColor = getPhaseColor(phase);
  const borderColor = getColorWithOpacity(phaseColor, 0.2);
  const bgColor = getColorWithOpacity(phaseColor, 0.05);

  return (
    <div 
      className="rounded-[14px] border p-4"
      style={{ 
        borderColor: borderColor,
        background: bgColor
      }}
    >
      <div className="mb-2 flex items-center justify-center gap-2">
        <span className="text-lg">{writingTips[currentTipIndex].icon}</span>
        <span className="font-medium">{writingTips[currentTipIndex].name}</span>
      </div>
      <p className="text-sm text-[rgba(255,255,255,0.6)]">{writingTips[currentTipIndex].tip}</p>
      <div className="mt-3 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3">
        <div className="mb-1 text-[10px] uppercase" style={{ color: phaseColor }}>Example</div>
        <p className="text-xs italic text-[rgba(255,255,255,0.6)]">{writingTips[currentTipIndex].example}</p>
      </div>
      <div className="mt-3 flex justify-center gap-1">
        {writingTips.map((_, index) => (
          <button
            key={index}
            onClick={() => goToTip(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === currentTipIndex 
                ? 'w-6' 
                : 'w-1.5 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)]'
            }`}
            style={index === currentTipIndex ? { background: phaseColor } : {}}
          />
        ))}
      </div>
    </div>
  );
}

