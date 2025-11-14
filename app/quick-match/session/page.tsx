'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

function QuickMatchSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait');
  const promptType = searchParams.get('promptType');

  const [timeLeft, setTimeLeft] = useState(240);
  const [writingContent, setWritingContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showPasteWarning, setShowPasteWarning] = useState(false);

  const [partyMembers] = useState([
    { name: 'You', avatar: '🌿', wordCount: 0, isYou: true },
    { name: 'WriteBot', avatar: '🤖', wordCount: 0, isYou: false },
    { name: 'PenPal AI', avatar: '✍️', wordCount: 0, isYou: false },
    { name: 'WordSmith', avatar: '📝', wordCount: 0, isYou: false },
    { name: 'QuillMaster', avatar: '🖋️', wordCount: 0, isYou: false },
  ]);

  const [aiWordCounts, setAiWordCounts] = useState<number[]>([0, 0, 0, 0]);

  const prompts = {
    narrative: {
      icon: '🌄',
      title: 'Unexpected adventure',
      description: 'Write about a character who discovers something surprising during an ordinary day.',
    },
    descriptive: {
      icon: '🏰',
      title: 'Mysterious location',
      description: 'Describe a place that feels magical or strange. Use vivid sensory detail.',
    },
    informational: {
      icon: '🔬',
      title: 'Explain a process',
      description: 'Teach the reader how something works or why a phenomenon happens step by step.',
    },
    argumentative: {
      icon: '💭',
      title: 'Take a position',
      description: 'Should students choose their own projects? State a claim and support it with reasons.',
    },
  } as const;

  const currentPrompt = prompts[promptType as keyof typeof prompts] || prompts.narrative;

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
    handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  useEffect(() => {
    const words = writingContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [writingContent]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAiWordCounts(prev => prev.map(count => Math.min(count + Math.floor(Math.random() * 5) + 2, 220)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    const encodedContent = encodeURIComponent(writingContent);
    router.push(`/quick-match/results?trait=${trait}&promptType=${promptType}&content=${encodedContent}&wordCount=${wordCount}&aiScores=${aiWordCounts.join(',')}`);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    setShowPasteWarning(true);
    setTimeout(() => setShowPasteWarning(false), 2500);
  };

  const handleCut = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
  };

  const timerColor = timeLeft > 120 ? 'text-emerald-200' : timeLeft > 60 ? 'text-yellow-300' : 'text-red-300';

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0c141d]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#141e27] text-xl font-semibold">
              {formatTime(timeLeft)}
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Quick match · phase 1</div>
              <p className={`text-sm font-semibold ${timerColor}`}>Keep drafting until the buzzer.</p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
              Trait focus: {trait || 'all'}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/60">
              <span className="font-semibold text-white">{wordCount}</span> words
            </div>
            <button
              onClick={handleSubmit}
              className="rounded-full bg-emerald-400 px-6 py-2 font-semibold text-[#0c141d] transition hover:bg-emerald-300"
            >
              Submit draft
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

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[0.95fr,1.45fr]">
          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-[#141e27] p-7">
              <header className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#0c141d] text-2xl">{currentPrompt.icon}</span>
                <div>
                  <h2 className="text-lg font-semibold">{currentPrompt.title}</h2>
                  <p className="text-xs text-white/50">Category: {promptType}</p>
                </div>
              </header>
              <p className="mt-4 text-sm text-white/60 leading-relaxed">{currentPrompt.description}</p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#141e27] p-7">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Squad tracker</div>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-emerald-300/40 bg-emerald-400/10 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0c141d] text-lg">🌿</span>
                      <div>
                        <div className="text-sm font-semibold text-white">You</div>
                        <div className="text-[11px] uppercase text-emerald-200">Drafting</div>
                      </div>
                    </div>
                    <div className="text-right text-sm font-semibold text-white">{wordCount}<span className="ml-1 text-xs text-white/50">w</span></div>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: `${Math.min((wordCount / 200) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                {aiWordCounts.map((count, index) => (
                  <div key={index} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0c141d] text-lg">{partyMembers[index + 1].avatar}</span>
                        <div>
                          <div className="text-sm font-semibold text-white">{partyMembers[index + 1].name}</div>
                          <div className="text-[11px] uppercase text-white/40">AI teammate</div>
                        </div>
                      </div>
                      <div className="text-right text-sm font-semibold text-white">{count}<span className="ml-1 text-xs text-white/50">w</span></div>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-white/40"
                        style={{ width: `${Math.min((count / 200) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white p-7 text-[#1b1f24] shadow-xl">
            <header className="flex items-center justify-between text-xs text-[#1b1f24]/60">
              <span>Draft your response</span>
              <span>{wordCount} words</span>
            </header>
            <textarea
              value={writingContent}
              onChange={event => setWritingContent(event.target.value)}
              onPaste={handlePaste}
              onCut={handleCut}
              placeholder="Start writing... keep sentences moving and hit your word target."
              className="mt-4 h-[460px] w-full resize-none bg-transparent text-base leading-relaxed focus:outline-none"
              autoFocus
            />
            {showPasteWarning && (
              <div className="absolute inset-x-0 top-6 mx-auto w-max rounded-full border border-red-500/40 bg-red-500/15 px-4 py-2 text-xs font-semibold text-red-200 shadow-lg">
                Paste disabled during quick match drafts
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function QuickMatchSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0c141d] flex items-center justify-center text-white/60 text-sm">
        Loading quick match session...
      </div>
    }>
      <QuickMatchSessionContent />
    </Suspense>
  );
}

