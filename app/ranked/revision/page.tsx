import { Suspense } from 'react';
import RevisionContent from '@/components/ranked/RevisionContent';

export default function RankedRevisionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading revision phase...</div>
        </div>
      }
    >
      <RevisionContent />
    </Suspense>
  );
}
