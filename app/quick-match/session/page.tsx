import { Suspense } from 'react';
import SessionContent from '@/components/quick-match/SessionContent';

export default function QuickMatchSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0c141d] flex items-center justify-center text-white/60 text-sm">
          Loading quick match session...
        </div>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
