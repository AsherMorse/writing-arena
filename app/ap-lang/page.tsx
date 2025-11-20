'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/shared/Header';
import APLangGrader from '@/components/ap-lang/APLangGrader';
import APLangWriter from '@/components/ap-lang/APLangWriter';

type ViewMode = 'grader' | 'writer';

export default function APLangPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('grader');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0c141d]">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <Header />
      
      {/* Mode Selector */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setViewMode('grader')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              viewMode === 'grader'
                ? 'bg-emerald-500 text-[#0c141d]'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Grade Existing Essay
          </button>
          <button
            onClick={() => setViewMode('writer')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              viewMode === 'writer'
                ? 'bg-emerald-500 text-[#0c141d]'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
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

