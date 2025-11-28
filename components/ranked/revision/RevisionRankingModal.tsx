import { Modal } from '@/components/shared/Modal';
import WritingTipsCarousel from '../WritingTipsCarousel';

interface RevisionRankingModalProps {
  isOpen: boolean;
  timeRemaining: number;
  isEvaluating: boolean;
  isBatchSubmitting: boolean;
}

export function RevisionRankingModal({ isOpen, timeRemaining, isEvaluating, isBatchSubmitting }: RevisionRankingModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => {}} variant="tips" showCloseButton={false}>
      <div className="text-center">
        <div className="mb-4 text-5xl animate-bounce">✨</div>
        <h2 className="text-xl font-semibold">{timeRemaining === 0 ? "Time's Up!" : "Calculating..."}</h2>
        <p className="mt-2 text-sm text-[rgba(255,255,255,0.4)]">
          {(isEvaluating || isBatchSubmitting) ? "Evaluating revisions..." : "Preparing results..."}
        </p>
        <p className="mt-2 text-xs text-[#00d492]">⏱️ Usually takes 1-2 minutes</p>
        
        <div className="mt-6">
          <WritingTipsCarousel phase={3} autoPlay={isOpen} />
        </div>
        
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#00d492]" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#00d492]" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#00d492]" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </Modal>
  );
}

