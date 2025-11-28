import { AIFeedbackCard } from './AIFeedbackCard';
import { PeerFeedbackCard } from './PeerFeedbackCard';

interface FeedbackSidebarProps {
  showFeedback: boolean;
  onToggleFeedback: () => void;
  strengths: string[];
  improvements: string[];
  loadingFeedback: boolean;
  peerFeedback: any;
  loadingPeerFeedback: boolean;
}

export function FeedbackSidebar({
  showFeedback,
  onToggleFeedback,
  strengths,
  improvements,
  loadingFeedback,
  peerFeedback,
  loadingPeerFeedback,
}: FeedbackSidebarProps) {
  return (
    <div className="space-y-4">
      <button 
        onClick={onToggleFeedback} 
        className="w-full rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-2 text-sm lg:hidden"
      >
        {showFeedback ? 'Hide' : 'Show'} Feedback
      </button>

      <div className={`space-y-4 ${showFeedback ? 'block' : 'hidden lg:block'}`}>
        <AIFeedbackCard 
          strengths={strengths} 
          improvements={improvements} 
          loading={loadingFeedback} 
        />
        <PeerFeedbackCard 
          peerFeedback={peerFeedback} 
          loading={loadingPeerFeedback} 
        />
      </div>
    </div>
  );
}

