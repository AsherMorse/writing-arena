'use client';

import { Modal } from './Modal';
import WritingTipsCarousel from '@/components/ranked/WritingTipsCarousel';
import { PhaseWritingTipsCarousel } from './PhaseWritingTipsCarousel';
import { getPhaseColor } from '@/lib/constants/colors';
import { WritingTip } from '@/lib/constants/writing-tips';

interface RankingModalProps {
  isOpen: boolean;
  phase: 1 | 2 | 3;
  timeRemaining: number;
  isSubmitting?: boolean;
  isEvaluating?: boolean;
  /** Custom content to show instead of tips carousel */
  customTipsContent?: React.ReactNode;
  /** Whether to show WritingTipsCarousel component (default: false) */
  showTipsCarousel?: boolean;
  /** Writing tips array for PhaseWritingTipsCarousel (takes precedence over showTipsCarousel) */
  writingTips?: WritingTip[];
  /** Custom emoji (default: phase-based) */
  emoji?: string;
  /** Custom status message */
  statusMessage?: string;
}

const PHASE_CONFIG = {
  1: {
    emoji: '📊',
    evaluatingMessage: 'Evaluating writing quality...',
    preparingMessage: 'Preparing results...',
  },
  2: {
    emoji: '📊',
    evaluatingMessage: 'Evaluating feedback quality...',
    preparingMessage: 'Preparing results...',
  },
  3: {
    emoji: '✨',
    evaluatingMessage: 'Evaluating revisions...',
    preparingMessage: 'Preparing results...',
  },
} as const;

export function RankingModal({
  isOpen,
  phase,
  timeRemaining,
  isSubmitting = false,
  isEvaluating = false,
  customTipsContent,
  showTipsCarousel = false,
  writingTips,
  emoji,
  statusMessage,
}: RankingModalProps) {
  const phaseColor = getPhaseColor(phase);
  const config = PHASE_CONFIG[phase];
  const displayEmoji = emoji || config.emoji;
  
  const isProcessing = isSubmitting || isEvaluating;
  const finalStatusMessage = statusMessage || (isProcessing ? config.evaluatingMessage : config.preparingMessage);

  // Determine which tips component to show
  const showTips = writingTips || showTipsCarousel || customTipsContent;
  let tipsContent: React.ReactNode = null;
  
  if (writingTips) {
    tipsContent = <PhaseWritingTipsCarousel tips={writingTips} phase={phase} autoPlay={isOpen} />;
  } else if (showTipsCarousel) {
    tipsContent = <WritingTipsCarousel autoPlay={isOpen} />;
  } else if (customTipsContent) {
    tipsContent = customTipsContent;
  }

  return (
    <Modal isOpen={isOpen} onClose={() => {}} variant="ranking" showCloseButton={false}>
      <div className="text-center">
        <div className="mb-4 text-5xl animate-bounce">{displayEmoji}</div>
        <h2 className="text-xl font-semibold">{timeRemaining === 0 ? "Time's Up!" : "Calculating..."}</h2>
        <p className="mt-2 text-sm text-[rgba(255,255,255,0.4)]">
          {finalStatusMessage}
        </p>
        <p className="mt-2 text-xs" style={{ color: phaseColor }}>⏱️ Usually takes 1-2 minutes</p>
        
        {showTips && (
          <div className="mt-6">
            {tipsContent}
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-center gap-2">
          <div 
            className="h-2 w-2 animate-pulse rounded-full" 
            style={{ backgroundColor: phaseColor, animationDelay: '0ms' }} 
          />
          <div 
            className="h-2 w-2 animate-pulse rounded-full" 
            style={{ backgroundColor: phaseColor, animationDelay: '150ms' }} 
          />
          <div 
            className="h-2 w-2 animate-pulse rounded-full" 
            style={{ backgroundColor: phaseColor, animationDelay: '300ms' }} 
          />
        </div>
      </div>
    </Modal>
  );
}

