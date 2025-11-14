import { Suspense } from 'react';
import ResultsContent from '@/components/practice/ResultsContent';

export default function PracticeResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Analyzing practice session...</div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
