import { Suspense } from 'react';
import PeerFeedbackContent from '@/components/ranked/PeerFeedbackContent';

export default function RankedPeerFeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading peer feedback...</div>
        </div>
      }
    >
      <PeerFeedbackContent />
    </Suspense>
  );
}
