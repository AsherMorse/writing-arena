import { Suspense } from 'react';
import WritingSessionContent from '@/components/ranked/WritingSessionContent';

export default function RankedSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0c141d] flex items-center justify-center text-white/60 text-sm">
          Loading ranked session...
        </div>
      }
    >
      <WritingSessionContent />
    </Suspense>
  );
}
