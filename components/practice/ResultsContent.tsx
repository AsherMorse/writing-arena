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

function ResultsContentInner() {
  const { user } = useAuth();
  const params = useSearchParams(parseResultsSearchParams);
  const { trait, promptType, content, wordCount } = params;
  const decodedContent = decodeURIComponent(content);

  const [feedback, setFeedback] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const { data: analysisData, loading, error } = useAsyncData(
    async () => {
      const response = await fetch('/api/analyze-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: decodedContent, trait, promptType }),
      });
      if (!response.ok) throw new Error('analysis failed');
      const data = await response.json();
      if (user) {
        console.log('Mock practice session save', { userId: user.uid, score: data.overallScore, xpEarned: data.xpEarned, wordCount });
      }
      return data;
    },
    [decodedContent, trait, promptType, user],
    {
      onSuccess: (data) => { setTimeout(() => { setFeedback(data); setIsAnalyzing(false); }, 1200); },
      onError: () => { setTimeout(() => { setFeedback(generateMockPracticeFeedback(wordCount)); setIsAnalyzing(false); }, 1200); },
    }
  );

  const traitScores = (feedback?.traits ?? {}) as Record<string, number>;
  const traitNotes = (feedback?.specificFeedback ?? {}) as Record<string, string>;

  if (isAnalyzing || !feedback) return <AnalyzingState message="Reading your draft" />;

  const actions = (
    <>
      <Link href="/practice" className="rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-8 py-3 text-center text-sm font-medium text-[#101012] transition hover:bg-[#33ebeb]">Practice again</Link>
      <Link href="/dashboard" className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-8 py-3 text-center text-sm font-medium transition hover:bg-[rgba(255,255,255,0.04)]">Return to dashboard</Link>
    </>
  );

  return (
    <ResultsLayout actions={actions}>
      <section className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8">
        <div className="grid gap-6 text-center sm:grid-cols-3">
          <ScoreDisplay label="Overall score" score={feedback.overallScore} />
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">XP earned</div>
            <div className="mt-3 font-mono text-4xl font-medium text-[#00e5e5]">+{feedback.xpEarned}</div>
            <p className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">Keep the streak alive</p>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">Words typed</div>
            <div className="mt-3 font-mono text-4xl font-medium">{wordCount}</div>
            <p className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">Goal: 150 words</p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.4fr,0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8">
            <h2 className="font-semibold">Trait breakdown</h2>
            <p className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">Each trait scored on a 0–100 scale.</p>
            <div className="mt-6 space-y-5">
              {Object.entries(traitScores).map(([key, score]) => (
                <div key={key}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm capitalize text-[rgba(255,255,255,0.6)]">{key}</span>
                    <span className="font-mono text-sm font-medium" style={{ color: score >= 80 ? '#00d492' : score >= 60 ? '#00e5e5' : score >= 40 ? '#ff9030' : '#ff5f8f' }}>{score}</span>
                  </div>
                  <div className="mt-2 h-[6px] rounded-[3px] bg-[rgba(255,255,255,0.05)]">
                    <div className="h-full rounded-[3px] bg-[#00e5e5]" style={{ width: `${Math.min(score, 100)}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-[rgba(255,255,255,0.4)]">{traitNotes[key]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-[14px] border border-[rgba(0,212,146,0.2)] bg-[rgba(0,212,146,0.08)] p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-[#00d492]"><span>✅</span><span>Strengths</span></div>
              <ul className="mt-4 space-y-2 text-xs text-[rgba(255,255,255,0.6)]">
                {feedback.strengths.map((item: string) => (<li key={item} className="flex gap-2"><span className="text-[#00d492]">-</span><span>{item}</span></li>))}
              </ul>
            </div>
            <div className="rounded-[14px] border border-[rgba(255,144,48,0.2)] bg-[rgba(255,144,48,0.08)] p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-[#ff9030]"><span>🎯</span><span>Growth areas</span></div>
              <ul className="mt-4 space-y-2 text-xs text-[rgba(255,255,255,0.6)]">
                {feedback.improvements.map((item: string) => (<li key={item} className="flex gap-2"><span className="text-[#ff9030]">-</span><span>{item}</span></li>))}
              </ul>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-7 text-sm">
            <h3 className="text-sm font-medium">Next steps</h3>
            <p className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">Keep momentum with targeted drills.</p>
            <ul className="mt-4 space-y-3 text-xs text-[rgba(255,255,255,0.6)]">
              {feedback.nextSteps.map((step: string) => (<li key={step} className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3">{step}</li>))}
            </ul>
          </div>
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-7 text-xs text-[rgba(255,255,255,0.5)]">
            <div className="text-[rgba(255,255,255,0.4)]">Draft recap</div>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between"><span>Trait lane</span><span className="capitalize">{trait || 'all'}</span></div>
              <div className="flex justify-between"><span>Prompt type</span><span className="capitalize">{promptType}</span></div>
              <div className="flex justify-between"><span>Words typed</span><span>{wordCount}</span></div>
            </div>
          </div>
        </aside>
      </section>

      <section className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">Your draft</div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[rgba(255,255,255,0.6)]">{decodeURIComponent(content) || 'Draft unavailable.'}</p>
      </section>
    </ResultsLayout>
  );
}

export default function ResultsContent() {
  return (<Suspense fallback={<AnalyzingState />}><ResultsContentInner /></Suspense>);
}
