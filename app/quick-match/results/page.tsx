import { Suspense } from 'react';
import ResultsContent from '@/components/quick-match/ResultsContent';

export default function QuickMatchResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Analyzing results...</div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
