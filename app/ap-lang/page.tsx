'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/shared/Header';
import APLangGrader from '@/components/ap-lang/APLangGrader';
import APLangWriter from '@/components/ap-lang/APLangWriter';
import { LoadingState } from '@/components/shared/LoadingState';
import { COLOR_CLASSES } from '@/lib/constants/colors';

type ViewMode = 'grader' | 'writer';

export default function APLangPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('grader');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#101012]">
        <Header />
        <LoadingState message="Loading AP Lang tools..." />
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <Header />
      
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex gap-3">
          <button
            onClick={() => setViewMode('grader')}
            className={`rounded-[10px] px-6 py-3 font-medium transition ${
              viewMode === 'grader'
                ? `${COLOR_CLASSES.orange.border} ${COLOR_CLASSES.orange.bg} text-[#101012]`
                : 'border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.04)]'
            }`}
          >
            Grade Existing Essay
          </button>
          <button
            onClick={() => setViewMode('writer')}
            className={`rounded-[10px] px-6 py-3 font-medium transition ${
              viewMode === 'writer'
                ? `${COLOR_CLASSES.orange.border} ${COLOR_CLASSES.orange.bg} text-[#101012]`
                : 'border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.04)]'
            }`}
          >
            Practice with New Prompt
          </button>
        </div>

        {viewMode === 'grader' ? <APLangGrader /> : <APLangWriter />}
      </div>
    </div>
  );
}
