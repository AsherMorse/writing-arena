'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import WritingTipsModal from '@/components/shared/WritingTipsModal';

export default function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait');
  const promptType = searchParams.get('promptType');

  const [timeLeft, setTimeLeft] = useState(240);
  const [isWriting, setIsWriting] = useState(false);
  const [writingContent, setWritingContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showPasteWarning, setShowPasteWarning] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);

  const prompts = {
    narrative: {
      icon: '🌄',
      title: 'Unexpected adventure',
      description: 'Write about a character who discovers something surprising during an ordinary day. Focus on pacing and detail.',
      guideQuestions: [
        'Who is your main character and what is the ordinary routine?',
        'What surprising event changes the day?',
        'How does the character react in the moment?',
        'How does the scene wrap up or hint at what comes next?',
      ],
    },
    descriptive: {
      icon: '🏰',
      title: 'A mysterious place',
      description: 'Describe a place that feels magical or strange using sensory detail to anchor the reader.',
      guideQuestions: [
        'What does the place look like from the entrance?',
        'What sounds, smells, or textures stand out?',
        'What small detail reveals something unexpected?',
        'How should the reader feel after visiting?',
      ],
    },
    informational: {
      icon: '🔬',
      title: 'Explain a process',
      description: 'Teach the reader how something works or why something happens. Use sequence words and clear examples.',
      guideQuestions: [
        'What are you explaining and why does it matter?',
        'What are the key steps or parts in order?',
        'What comparison or example clarifies the concept?',
        'What should the reader remember most?',
      ],
    },
    argumentative: {
      icon: '💭',
      title: 'Take a stand',
      description: 'State a claim and support it with reasons and evidence. Address the other side briefly.',
      guideQuestions: [
        'What is your position on the issue?',
        'What is your strongest reason and example?',
        'What evidence or data supports that reason?',
        'How would you address someone who disagrees?',
      ],
    },
  } as const;

  const currentPrompt = prompts[promptType as keyof typeof prompts] || prompts.narrative;

  useEffect(() => {
    if (isWriting && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
    if (isWriting && timeLeft === 0) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWriting, timeLeft]);

  useEffect(() => {
    const words = writingContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [writingContent]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsWriting(true);
  };

  const handleSubmit = () => {
    const encodedContent = encodeURIComponent(writingContent);
    router.push(`/practice/results?trait=${trait}&promptType=${promptType}&content=${encodedContent}&wordCount=${wordCount}`);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    setShowPasteWarning(true);
    setTimeout(() => setShowPasteWarning(false), 2500);
  };

  const handleCut = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
  };

  if (!isWriting) {
    return (
      <div className="min-h-screen bg-[#0c141d] text-white">
        <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-16">
          <section className="w-full rounded-3xl border border-white/10 bg-[#141e27] p-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-[#0c141d] text-4xl">
              {currentPrompt.icon}
            </div>
            <h1 className="mt-6 text-3xl font-semibold">{currentPrompt.title}</h1>
            <p className="mt-3 text-sm text-white/60 leading-relaxed">{currentPrompt.description}</p>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-left text-sm text-white/70">
              <h2 className="text-white/60 text-xs uppercase">Consider:</h2>
              <ul className="mt-3 space-y-2">
                {currentPrompt.guideQuestions.map(question => (
                  <li key={question} className="flex items-start gap-2">
                    <span className="text-emerald-300">-</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 grid gap-4 text-sm text-white/60 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">⏱️ 4-minute timer</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">📝 Solo drill</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">🤖 Instant AI feedback</div>
            </div>
            <button
              onClick={handleStart}
              className="mt-8 w-full rounded-full bg-emerald-400 px-8 py-3 text-sm font-semibold text-[#0c141d] transition hover:bg-emerald-300"
            >
              Start practice sprint
            </button>
            <p className="mt-4 text-xs text-white/40">The timer begins once you enter the writing view.</p>
          </section>
        </main>
      </div>
    );
  }

  const timerColor = timeLeft > 120 ? 'text-emerald-200' : timeLeft > 60 ? 'text-yellow-300' : 'text-red-300';

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <WritingTipsModal isOpen={showTipsModal} onClose={() => setShowTipsModal(false)} promptType={promptType || 'narrative'} />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0c141d]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#141e27] text-xl font-semibold">
              {formatTime(timeLeft)}
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Practice sprint</div>
              <p className={`text-sm font-semibold ${timerColor}`}>Keep drafting until you hear the buzzer.</p>
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
              onClick={() => setShowTipsModal(true)}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 font-semibold text-white transition hover:bg-white/10"
            >
              Tips
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-full bg-emerald-400 px-6 py-2 font-semibold text-[#0c141d] transition hover:bg-emerald-300"
            >
              Submit
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
        <div className="grid gap-6 lg:grid-cols-[1.05fr,1.35fr]">
          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-[#141e27] p-7">
              <header className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0c141d] text-lg">{currentPrompt.icon}</span>
                <div>
                  <h2 className="text-sm font-semibold uppercase text-white/80">Prompt reference</h2>
                  <p className="text-xs text-white/50">{promptType}</p>
                </div>
              </header>
              <p className="mt-4 text-sm text-white/60 leading-relaxed">{currentPrompt.description}</p>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-xs text-white/60">
                <div className="text-white/50">Remember:</div>
                <ul className="mt-2 space-y-1">
                  {currentPrompt.guideQuestions.map(question => (
                    <li key={question} className="flex gap-2">
                      <span className="text-emerald-300">-</span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
            <section className="rounded-3xl border border-white/10 bg-[#141e27] p-7 text-xs text-white/60">
              <div className="text-white/50">Focus mantra:</div>
              <p className="mt-3">Draft fast, revise later. Ignore mistakes for now—capture ideas and pacing. Feedback will point you toward targeted revision.</p>
            </section>
          </aside>

          <section className="relative rounded-3xl border border-white/10 bg-white p-8 text-[#1b1f24] shadow-xl">
            <textarea
              value={writingContent}
              onChange={event => setWritingContent(event.target.value)}
              onPaste={handlePaste}
              onCut={handleCut}
              placeholder="Start writing here..."
              className="h-[520px] w-full resize-none bg-transparent text-base leading-relaxed focus:outline-none"
              autoFocus
            />
            {showPasteWarning && (
              <div className="absolute inset-x-0 top-6 mx-auto w-max rounded-full border border-red-500/40 bg-red-500/15 px-4 py-2 text-xs font-semibold text-red-200 shadow-lg">
                Paste disabled during practice sprints
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

