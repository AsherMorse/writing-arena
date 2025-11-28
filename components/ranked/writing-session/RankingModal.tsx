import { Modal } from '@/components/shared/Modal';
import WritingTipsCarousel from '../WritingTipsCarousel';

interface RankingModalProps {
  isOpen: boolean;
  timeRemaining: number;
  isBatchSubmitting: boolean;
}

export function RankingModal({ isOpen, timeRemaining, isBatchSubmitting }: RankingModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => {}} variant="ranking" showCloseButton={false}>
      <div className="text-center">
        <div className="mb-4 text-5xl animate-bounce">📊</div>
        <h2 className="text-xl font-semibold">{timeRemaining === 0 ? "Time's Up!" : "Calculating..."}</h2>
        <p className="mt-2 text-sm text-[rgba(255,255,255,0.4)]">
          {isBatchSubmitting ? "Evaluating writing quality..." : "Preparing results..."}
        </p>
        <p className="mt-2 text-xs text-[#00e5e5]">⏱️ Usually takes 1-2 minutes</p>
        
        <div className="mt-6">
          <WritingTipsCarousel autoPlay={isOpen} />
        </div>
        
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#00e5e5]" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#00e5e5]" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#00e5e5]" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </Modal>
  );
}

