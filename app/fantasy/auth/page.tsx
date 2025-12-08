'use client';

import { Suspense } from 'react';
import { FantasyAuthContent } from '@/components/fantasy/FantasyAuthContent';
import { LoadingState } from '@/components/shared/LoadingState';

export default function FantasyAuthPage() {
  return (
    <Suspense fallback={<LoadingState message="Preparing the guild hall..." />}>
      <FantasyAuthContent />
    </Suspense>
  );
}

