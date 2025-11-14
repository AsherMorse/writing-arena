'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import WritingTipsModal from '@/components/WritingTipsModal';

// Mock AI feedback - will be replaced with real AI later
const MOCK_AI_FEEDBACK = {
  strengths: [
    'Strong opening hook that draws the reader in',
    'Good use of descriptive language and sensory details',
    'Clear narrative structure with a beginning, middle, and setup for continuation',
  ],
  improvements: [
    'Consider adding more character development to deepen Sarah as a protagonist.',
    'Slow the pacing to build tension before the chest is revealed.',
    'Layer additional sensory details about the lighthouse interior.',
  ],
  score: 78,
};

function RankedRevisionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait');
  const promptId = searchParams.get('promptId');
  const promptType = searchParams.get('promptType');
  const originalContent = decodeURIComponent(searchParams.get('content') || '');
  const wordCount = searchParams.get('wordCount') || '0';
  const aiScores = searchParams.get('aiScores') || '';
  const yourScore = searchParams.get('yourScore') || '75';
  const feedbackScore = searchParams.get('feedbackScore') || '80';
  const peerFeedbackRaw = searchParams.get('peerFeedback') || '{}';
  
  const [timeLeft, setTimeLeft] = useState(240);
  const [revisedContent, setRevisedContent] = useState(originalContent);
  const [wordCountRevised, setWordCountRevised] = useState(0);
  const [showFeedback, setShowFeedback] = useState(true);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(MOCK_AI_FEEDBACK);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  let peerFeedback;
  try {
    peerFeedback = JSON.parse(decodeURIComponent(peerFeedbackRaw));
  } catch {
    peerFeedback = {};
  }

  useEffect(() => {
    const fetchAIFeedback = async () => {
      try {
        const response = await fetch('/api/generate-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: originalContent,
            promptType: promptType || 'narrative',
          }),
        });
        const data = await response.json();
        setAiFeedback(data);
      } catch (error) {
        setAiFeedback(MOCK_AI_FEEDBACK);
      } finally {
        setLoadingFeedback(false);
      }
    };

    fetchAIFeedback();
  }, [originalContent, promptType]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
    handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  useEffect(() => {
    const words = revisedContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCountRevised(words.length);
  }, [revisedContent]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    try {
      const response = await fetch('/api/evaluate-revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalContent,
          revisedContent,
          feedback: aiFeedback,
        }),
      });
      const data = await response.json();
      const revisionScore = data.score || 75;
      router.push(
        `/ranked/results?trait=${trait}&promptId=${promptId}&promptType=${promptType}&originalContent=${encodeURIComponent(originalContent)}&revisedContent=${encodeURIComponent(revisedContent)}&wordCount=${wordCount}&revisedWordCount=${wordCountRevised}&aiScores=${aiScores}&writingScore=${yourScore}&feedbackScore=${feedbackScore}&revisionScore=${Math.round(revisionScore)}`
      );
    } catch (error) {
      const changeAmount = Math.abs(wordCountRevised - parseInt(wordCount));
      const hasSignificantChanges = changeAmount > 10;
      const revisionScore = hasSignificantChanges ? Math.min(85 + Math.random() * 10, 95) : 60 + Math.random() * 15;
      router.push(
        `/ranked/results?trait=${trait}&promptId=${promptId}&promptType=${promptType}&originalContent=${encodeURIComponent(originalContent)}&revisedContent=${encodeURIComponent(revisedContent)}&wordCount=${wordCount}&revisedWordCount=${wordCountRevised}&aiScores=${aiScores}&writingScore=${yourScore}&feedbackScore=${feedbackScore}&revisionScore=${Math.round(revisionScore)}`
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const hasRevised = revisedContent.trim() !== originalContent.trim();
  const countdownColor = timeLeft > 120 ? 'text-emerald-200' : timeLeft > 60 ? 'text-yellow-300' : 'text-red-300';

  const peerStrengths = peerFeedback.strengths || peerFeedback.clarity || '';
  const peerImprovements = peerFeedback.improvements || peerFeedback.organization || '';
  const peerEngagement = peerFeedback.engagement || '';

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <WritingTipsModal
        isOpen={showTipsModal}
        onClose={() => setShowTipsModal(false)}
        promptType={promptType || 'narrative'}
      />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0c141d]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#141e27] text-xl font-semibold">
              {formatTime(timeLeft)}
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Phase 3 · Revision</div>
              <p className={`text-sm font-semibold ${countdownColor}`}>Strengthen your draft using the feedback cues.</p>
            </div>
            <div className="rounded-full border border-emerald-200/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              Trait focus: {trait || 'all'}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => setShowTipsModal(true)}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 font-semibold text-white transition hover:bg-white/10"
            >
              Revision tips
            </button>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/60">
              <span className="font-semibold text-white">{wordCountRevised}</span> words
              {hasRevised && (
                <span className="ml-2 text-emerald-200">({wordCountRevised - parseInt(wordCount)})</span>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isEvaluating}
              className={`rounded-full px-6 py-2 font-semibold transition ${
                isEvaluating ? 'bg-white/5 text-white/40 cursor-not-allowed' : 'bg-emerald-400 text-[#0c141d] hover:bg-emerald-300'
              }`}
            >
              {isEvaluating ? 'Scoring...' : 'Submit revision'}
            </button>
          </div>
        </div>
        <div className="mx-auto h-1.5 max-w-6xl rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${timeLeft > 120 ? 'bg-emerald-400' : timeLeft > 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
            style={{ width: `${(timeLeft / 240) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.05fr,1.35fr]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#141e27] p-7">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/50">Feedback console</div>
                  <p className="mt-2 text-xs text-white/50">Blend AI suggestions with peer notes to unlock maximum LP.</p>
                </div>
                <button
                  onClick={() => setShowFeedback(prev => !prev)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 lg:hidden"
                >
                  {showFeedback ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className={`${showFeedback ? 'space-y-6' : 'hidden lg:block space-y-6'}`}>
              <section className="rounded-3xl border border-white/10 bg-[#141e27] p-7">
                <header className="flex items-center gap-3 text-sm font-semibold text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0c141d]">🤖</span>
                  <span>AI feedback</span>
                </header>
                <div className="mt-5 space-y-4 text-sm text-white/70">
                  <div>
                    <div className="text-xs uppercase text-emerald-200">Strengths</div>
                    {loadingFeedback ? (
                      <p className="mt-2 text-white/40">Loading...</p>
                    ) : (
                      <ul className="mt-2 space-y-1">
                        {aiFeedback.strengths.map((item, index) => (
                          <li key={index} className="leading-relaxed">- {item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <div className="text-xs uppercase text-yellow-300">Suggestions</div>
                    {loadingFeedback ? (
                      <p className="mt-2 text-white/40">Loading...</p>
                    ) : (
                      <ul className="mt-2 space-y-1">
                        {aiFeedback.improvements.map((item, index) => (
                          <li key={index} className="leading-relaxed">- {item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-[#141e27] p-7 text-sm text-white/70">
                <header className="flex items-center gap-3 font-semibold text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0c141d]">👥</span>
                  <span>Peer notes</span>
                </header>
                <div className="mt-5 space-y-4">
                  {peerStrengths && (
                    <div>
                      <div className="text-xs uppercase text-emerald-200">Strengths noticed</div>
                      <p className="mt-2 leading-relaxed text-white/70">{peerStrengths}</p>
                    </div>
                  )}
                  {peerImprovements && (
                    <div>
                      <div className="text-xs uppercase text-yellow-300">Improve this</div>
                      <p className="mt-2 leading-relaxed text-white/70">{peerImprovements}</p>
                    </div>
                  )}
                  {peerEngagement && (
                    <div>
                      <div className="text-xs uppercase text-blue-300">Engagement</div>
                      <p className="mt-2 leading-relaxed text-white/70">{peerEngagement}</p>
                    </div>
                  )}
                  {!peerStrengths && !peerImprovements && !peerEngagement && (
                    <p className="text-white/40">Peer feedback not available for this round.</p>
                  )}
                </div>
              </section>
            </div>
          </aside>

          <section className="space-y-8">
            <article className="rounded-3xl border border-white/10 bg-[#141e27] p-7">
              <header className="flex items-center justify-between text-sm text-white/60">
                <span>Original draft</span>
                <span>{wordCount} words</span>
              </header>
              <div className="mt-4 max-h-[200px] overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/80 whitespace-pre-wrap">
                {originalContent || 'Original content not found.'}
              </div>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white p-7 text-[#1b1f24] shadow-xl">
              <header className="flex items-center justify-between">
                <div className="text-lg font-semibold">Your revision</div>
                {hasRevised ? (
                  <span className="text-sm font-semibold text-emerald-600">Changes detected</span>
                ) : (
                  <span className="text-sm text-[#1b1f24]/50">Make edits to improve your score</span>
                )}
              </header>
              <textarea
                value={revisedContent}
                onChange={(e) => setRevisedContent(e.target.value)}
                placeholder="Revise your writing using the feedback provided..."
                className="mt-4 h-[420px] w-full resize-none bg-transparent text-base leading-relaxed focus:outline-none"
              />
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function RankedRevisionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0c141d] flex items-center justify-center text-white/60 text-sm">
        Loading revision phase...
      </div>
    }>
      <RankedRevisionContent />
    </Suspense>
  );
}

