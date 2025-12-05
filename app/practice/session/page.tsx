import { Suspense } from 'react';
import SessionContent from '@/components/practice/SessionContent';

export default function PracticeSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading practice session...</div>
        </div>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
