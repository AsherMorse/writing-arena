'use client';

import { WRITING_TIPS_WITH_CONCLUSIONS } from '@/lib/constants/writing-tips';
import { useCarousel } from '@/lib/hooks/useCarousel';

interface WritingTipsCarouselProps {
  autoPlay?: boolean;
}

export default function WritingTipsCarousel({ autoPlay = false }: WritingTipsCarouselProps) {
  const { currentIndex: currentTipIndex, goTo: goToTip } = useCarousel({
    items: WRITING_TIPS_WITH_CONCLUSIONS,
    interval: 5000,
    autoPlay,
  });

  const writingTips = WRITING_TIPS_WITH_CONCLUSIONS;

  return (
    <div className="rounded-[14px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.05)] p-4">
      <div className="mb-2 flex items-center justify-center gap-2">
        <span className="text-lg">{writingTips[currentTipIndex].icon}</span>
        <span className="font-medium">{writingTips[currentTipIndex].name}</span>
      </div>
      <p className="text-sm text-[rgba(255,255,255,0.6)]">{writingTips[currentTipIndex].tip}</p>
      <div className="mt-3 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3">
        <div className="mb-1 text-[10px] uppercase text-[#00e5e5]">Example</div>
        <p className="text-xs italic text-[rgba(255,255,255,0.6)]">{writingTips[currentTipIndex].example}</p>
      </div>
      <div className="mt-3 flex justify-center gap-1">
        {writingTips.map((_, index) => (
          <button
            key={index}
            onClick={() => goToTip(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === currentTipIndex 
                ? 'w-6 bg-[#00e5e5]' 
                : 'w-1.5 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

