'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getScoreColor } from '@/lib/utils/score-utils';
import { useAsyncData } from '@/lib/hooks/useAsyncData';
import { useSearchParams, parseResultsSearchParams } from '@/lib/hooks/useSearchParams';
import { AnalyzingState } from '@/components/shared/AnalyzingState';
import { ResultsLayout } from '@/components/shared/ResultsLayout';
import { ScoreDisplay } from '@/components/shared/ScoreDisplay';
import { generateMockPracticeFeedback } from '@/lib/utils/mock-data';
import { useTimeout } from '@/lib/hooks/useTimer';

function ResultsContentInner() {
  const { user } = useAuth();
  const params = useSearchParams(parseResultsSearchParams);
  const { trait, promptType, content, wordCount } = params;
  const decodedContent = decodeURIComponent(content);

  const [feedback, setFeedback] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // Use async data hook for fetching analysis
  const { data: analysisData, loading, error } = useAsyncData(
    async () => {
      const response = await fetch('/api/analyze-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: decodedContent,
          trait,
          promptType,
        }),
      });

      if (!response.ok) throw new Error('analysis failed');
      const data = await response.json();
      
      if (user) {
        console.log('Mock practice session save', {
          userId: user.uid,
          score: data.overallScore,
          xpEarned: data.xpEarned,
          wordCount,
        });
      }
      
      return data;
    },
    [decodedContent, trait, promptType, user],
    {
      onSuccess: (data) => {
        // Delay showing results for better UX
        setTimeout(() => {
          setFeedback(data);
          setIsAnalyzing(false);
        }, 1200);
      },
      onError: () => {
        // Use mock feedback on error
        setTimeout(() => {
          setFeedback(generateMockPracticeFeedback(wordCount));
          setIsAnalyzing(false);
        }, 1200);
      },
    }
  );

  const traitScores = (feedback?.traits ?? {}) as Record<string, number>;
  const traitNotes = (feedback?.specificFeedback ?? {}) as Record<string, string>;

  if (isAnalyzing || !feedback) {
    return <AnalyzingState message="Reading your draft" />;
  }

  const actions = (
    <>
      <Link
        href="/practice"
        className="rounded-full border border-emerald-200/40 bg-emerald-400 px-8 py-3 text-center text-sm font-semibold text-[#0c141d] transition hover:bg-emerald-300"
      >
        Practice again
      </Link>
      <Link
        href="/dashboard"
        className="rounded-full border border-white/15 bg-white/5 px-8 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
      >
        Return to dashboard
      </Link>
    </>
  );

  return (
    <ResultsLayout actions={actions}>
      <section className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
        <div className="grid gap-6 sm:grid-cols-3 text-center">
          <ScoreDisplay label="Overall score" score={feedback.overallScore} />
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">XP earned</div>
            <div className="mt-3 text-5xl font-semibold text-emerald-200">+{feedback.xpEarned}</div>
            <p className="mt-1 text-xs text-white/50">Keep the streak alive</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">Words typed</div>
            <div className="mt-3 text-5xl font-semibold text-white">{wordCount}</div>
            <p className="mt-1 text-xs text-white/50">Goal: 150 words</p>
          </div>
        </div>
      </section>

        <section className="grid gap-8 lg:grid-cols-[1.4fr,0.8fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
              <h2 className="text-lg font-semibold">Trait breakdown</h2>
              <p className="mt-1 text-xs text-white/50">Each trait scored on a 0–100 scale.</p>
              <div className="mt-6 space-y-5">
                {Object.entries(traitScores).map(([key, score]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between">
                      <span className="capitalize text-sm text-white/70">{key}</span>
                      <span className={`text-sm font-semibold ${getScoreColor(score)}`}>{score}</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${Math.min(score, 100)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-white/50">{traitNotes[key]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-emerald-300/30 bg-emerald-400/10 p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <span>✅</span>
                  <span>Strengths</span>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-white/70">
                  {feedback.strengths.map((item: string) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-emerald-300">-</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-yellow-300/30 bg-yellow-400/10 p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-yellow-200">
                  <span>🎯</span>
                  <span>Growth areas</span>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-white/70">
                  {feedback.improvements.map((item: string) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-yellow-200">-</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7 text-sm">
              <h3 className="text-sm font-semibold text-white">Next steps</h3>
              <p className="mt-1 text-xs text-white/50">Keep momentum with targeted drills.</p>
              <ul className="mt-4 space-y-3 text-xs text-white/70">
                {feedback.nextSteps.map((step: string) => (
                  <li key={step} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">{step}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7 text-xs text-white/60">
              <div className="text-white/50">Draft recap</div>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between"><span>Trait lane</span><span className="text-white/80 capitalize">{trait || 'all'}</span></div>
                <div className="flex justify-between"><span>Prompt type</span><span className="text-white/80 capitalize">{promptType}</span></div>
                <div className="flex justify-between"><span>Words typed</span><span className="text-white/80">{wordCount}</span></div>
              </div>
            </div>
          </aside>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
          <div className="text-xs uppercase tracking-[0.3em] text-white/50">Your draft</div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-white/70">
            {decodeURIComponent(content) || 'Draft unavailable.'}
          </p>
        </section>
    </ResultsLayout>
  );
}

export default function ResultsContent() {
  return (
    <Suspense fallback={<AnalyzingState />}>
      <ResultsContentInner />
    </Suspense>
  );
}

