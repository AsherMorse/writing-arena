'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const trait = searchParams.get('trait');
  const promptType = searchParams.get('promptType');
  const content = searchParams.get('content') || '';
  const wordCount = parseInt(searchParams.get('wordCount') || '0');

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [feedback, setFeedback] = useState<any>(null);

  useEffect(() => {
    const analyzeWriting = async () => {
      try {
        const response = await fetch('/api/analyze-writing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: decodeURIComponent(content),
            trait,
            promptType,
          }),
        });

        const data = await response.ok ? await response.json() : null;
        if (!data) throw new Error('analysis failed');

        if (user) {
          console.log('Mock practice session save', {
            userId: user.uid,
            score: data.overallScore,
            xpEarned: data.xpEarned,
            wordCount,
          });
        }

        setTimeout(() => {
          setFeedback(data);
          setIsAnalyzing(false);
        }, 1200);
      } catch (error) {
        console.error('Practice analysis error:', error);
        setTimeout(() => {
          setFeedback(generateMockFeedback(wordCount));
          setIsAnalyzing(false);
        }, 1200);
      }
    };

    analyzeWriting();
  }, [trait, promptType, content, wordCount, user]);

  const generateMockFeedback = (words: number) => {
    const base = Math.min(100, Math.max(45, 60 + words / 8));
    return {
      overallScore: Math.round(base),
      xpEarned: Math.round(base * 1.2),
      traits: {
        content: Math.round(base + Math.random() * 10 - 5),
        organization: Math.round(base + Math.random() * 10 - 5),
        grammar: Math.round(base + Math.random() * 10 - 5),
        vocabulary: Math.round(base + Math.random() * 10 - 5),
        mechanics: Math.round(base + Math.random() * 10 - 5),
      },
      strengths: ['Clear main idea anchored your draft.', 'Specific examples made the message concrete.', 'Paragraph order helped readers follow.' ],
      improvements: ['Add transitions to smooth shifts between ideas.', 'Vary sentence openings to avoid repetition.', 'Double-check punctuation on compound sentences.'],
      specificFeedback: {
        content: 'Stay focused on the prompt; add one more supporting detail next time.',
        organization: 'Consider transition words like furthermore or however to guide readers.',
        grammar: 'Watch comma placement in longer sentences.',
        vocabulary: 'Swap general verbs for precise action words.',
        mechanics: 'Proofread for capitalization and ending punctuation.',
      },
      nextSteps: ['Practice a descriptive prompt to stretch vocabulary.', 'Rewrite one paragraph using sentence combining.', 'Use because/but/so to expand key ideas.'],
    };
  };

  const scoreTone = (score: number) => {
    if (score >= 90) return 'text-emerald-200';
    if (score >= 75) return 'text-blue-200';
    if (score >= 60) return 'text-yellow-200';
    return 'text-orange-200';
  };

  const traitScores = (feedback?.traits ?? {}) as Record<string, number>;
  const traitNotes = (feedback?.specificFeedback ?? {}) as Record<string, string>;

  if (isAnalyzing || !feedback) {
    return (
      <div className="min-h-screen bg-[#0c141d] text-white">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#141e27] text-3xl">🤖</div>
          <h2 className="text-2xl font-semibold">Reading your draft</h2>
          <p className="text-sm text-white/60">AI is evaluating your response and preparing feedback.</p>
          <div className="flex gap-2">
            {[0, 150, 300].map(delay => (
              <span key={delay} className="h-2 w-2 animate-bounce rounded-full bg-emerald-300" style={{ animationDelay: `${delay}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
        <section className="flex flex-col gap-4 sm:flex-row sm:justify-end">
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
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
          <div className="grid gap-6 sm:grid-cols-3 text-center">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Overall score</div>
              <div className={`mt-3 text-5xl font-semibold ${scoreTone(feedback.overallScore)}`}>{feedback.overallScore}</div>
              <p className="mt-1 text-xs text-white/50">out of 100</p>
            </div>
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
                      <span className={`text-sm font-semibold ${scoreTone(score)}`}>{score}</span>
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
      </main>
    </div>
  );
}

