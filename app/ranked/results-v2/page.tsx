/**
 * @fileoverview Results page v2 with TWR grading scorecard display.
 * Shows detailed rubric-based feedback, gap detection, and practice recommendations.
 */

import { Suspense } from 'react';
import ResultsContentV2 from '@/components/ranked/ResultsContentV2';
import { LoadingState } from '@/components/shared/LoadingState';

export default function RankedResultsV2Page() {
  return (
    <Suspense fallback={<LoadingState variant="analyzing" />}>
      <ResultsContentV2 />
    </Suspense>
  );
}

