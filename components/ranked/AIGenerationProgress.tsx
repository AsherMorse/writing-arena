'use client';

import { roundScore } from '@/lib/utils/math-utils';

interface AIGenerationProgressProps {
  progress: number;
  isGenerating: boolean;
}

export default function AIGenerationProgress({ progress, isGenerating }: AIGenerationProgressProps) {
  if (!isGenerating) return null;

  return (
    <div className="rounded-[14px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.05)] p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-[#00e5e5]">🤖 Generating AI writings...</span>
        <span className="font-mono text-xs text-[rgba(255,255,255,0.4)]">{roundScore(progress)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
        <div 
          className="h-full rounded-full bg-[#00e5e5] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

