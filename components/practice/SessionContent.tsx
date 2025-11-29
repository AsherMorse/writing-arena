'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { countWords } from '@/lib/utils/text-utils';
import { formatTime } from '@/lib/utils/time-utils';
import { usePastePrevention } from '@/lib/hooks/usePastePrevention';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useInterval } from '@/lib/hooks/useInterval';
import { useModal } from '@/lib/hooks/useModal';
import { COLOR_CLASSES } from '@/lib/constants/colors';
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
  const tipsModal = useModal(false);

  const prompts = {
    narrative: { icon: '🌄', title: 'Unexpected adventure', description: 'Write about a character who discovers something surprising during an ordinary day. Focus on pacing and detail.', guideQuestions: ['Who is your main character and what is the ordinary routine?', 'What surprising event changes the day?', 'How does the character react in the moment?', 'How does the scene wrap up or hint at what comes next?'] },
    descriptive: { icon: '🏰', title: 'A mysterious place', description: 'Describe a place that feels magical or strange using sensory detail to anchor the reader.', guideQuestions: ['What does the place look like from the entrance?', 'What sounds, smells, or textures stand out?', 'What small detail reveals something unexpected?', 'How should the reader feel after visiting?'] },
    informational: { icon: '🔬', title: 'Explain a process', description: 'Teach the reader how something works or why something happens. Use sequence words and clear examples.', guideQuestions: ['What are you explaining and why does it matter?', 'What are the key steps or parts in order?', 'What comparison or example clarifies the concept?', 'What should the reader remember most?'] },
    argumentative: { icon: '💭', title: 'Take a stand', description: 'State a claim and support it with reasons and evidence. Address the other side briefly.', guideQuestions: ['What is your position on the issue?', 'What is your strongest reason and example?', 'What evidence or data supports that reason?', 'How would you address someone who disagrees?'] },
  } as const;

  const currentPrompt = prompts[promptType as keyof typeof prompts] || prompts.narrative;

  const handleStart = () => setIsWriting(true);
  const handleSubmit = () => { router.push(`/practice/results?trait=${trait}&promptType=${promptType}&content=${encodeURIComponent(writingContent)}&wordCount=${wordCount}`); };

  useInterval(() => {
    if (isWriting && timeLeft > 0) {
      setTimeLeft(prev => prev - 1);
    } else if (isWriting && timeLeft === 0) {
      handleSubmit();
    }
  }, isWriting && timeLeft > 0 ? 1000 : null, [isWriting, timeLeft]);

  const debouncedContent = useDebounce(writingContent, 300);
  useEffect(() => { setWordCount(countWords(debouncedContent)); }, [debouncedContent]);
  const { showPasteWarning, handlePaste, handleCut } = usePastePrevention({ warningDuration: 2500 });

  if (!isWriting) {
    return (
      <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
        <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-16">
          <section className="w-full rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[#101012] text-4xl">{currentPrompt.icon}</div>
            <h1 className="mt-6 text-2xl font-semibold">{currentPrompt.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">{currentPrompt.description}</p>
            <div className="mt-8 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-6 py-5 text-left text-sm text-[rgba(255,255,255,0.6)]">
              <h2 className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">Consider:</h2>
              <ul className="mt-3 space-y-2">
                {currentPrompt.guideQuestions.map(question => (<li key={question} className="flex items-start gap-2"><span className="text-[#00e5e5]">-</span><span>{question}</span></li>))}
              </ul>
            </div>
            <div className="mt-6 grid gap-4 text-sm text-[rgba(255,255,255,0.5)] sm:grid-cols-3">
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3">⏱️ 4-minute timer</div>
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3">📝 Solo drill</div>
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3">🤖 Instant AI feedback</div>
            </div>
            <button onClick={handleStart} className="mt-8 w-full rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-8 py-3 text-sm font-medium text-[#101012] transition hover:bg-[#33ebeb]">Start practice sprint</button>
            <p className="mt-4 text-xs text-[rgba(255,255,255,0.3)]">The timer begins once you enter the writing view.</p>
          </section>
        </main>
      </div>
    );
  }

  const timerColor = timeLeft > 120 ? '#00e5e5' : timeLeft > 60 ? '#ff9030' : '#ff5f8f';

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <WritingTipsModal isOpen={tipsModal.isOpen} onClose={tipsModal.close} promptType={promptType || 'narrative'} />

      <header className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.05)] bg-[#101012]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] font-mono text-xl font-medium">{formatTime(timeLeft)}</div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">Practice sprint</div>
              <p className="text-sm font-medium" style={{ color: timerColor }}>Keep drafting until you hear the buzzer.</p>
            </div>
            <div className="rounded-[20px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-1 text-xs text-[rgba(255,255,255,0.5)]">Trait focus: {trait || 'all'}</div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="rounded-[20px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-1 text-[rgba(255,255,255,0.5)]"><span className="font-medium">{wordCount}</span> words</div>
            <button onClick={tipsModal.open} className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-2 font-medium transition hover:bg-[rgba(255,255,255,0.04)]">Tips</button>
            <button onClick={handleSubmit} className="rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-6 py-2 font-medium text-[#101012] transition hover:bg-[#33ebeb]">Submit</button>
          </div>
        </div>
        <div className="mx-auto h-[6px] max-w-6xl rounded-[3px] bg-[rgba(255,255,255,0.05)]">
          <div className="h-full rounded-[3px] transition-all" style={{ width: `${(timeLeft / 240) * 100}%`, background: timerColor }} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.05fr,1.35fr]">
          <aside className="space-y-6">
            <section className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-7">
              <header className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] text-lg">{currentPrompt.icon}</span>
                <div><h2 className="text-sm font-medium uppercase">Prompt reference</h2><p className="text-xs text-[rgba(255,255,255,0.4)]">{promptType}</p></div>
              </header>
              <p className="mt-4 text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">{currentPrompt.description}</p>
              <div className="mt-5 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-4 text-xs text-[rgba(255,255,255,0.5)]">
                <div className="text-[rgba(255,255,255,0.4)]">Remember:</div>
                <ul className="mt-2 space-y-1">{currentPrompt.guideQuestions.map(question => (<li key={question} className="flex gap-2"><span className="text-[#00e5e5]">-</span><span>{question}</span></li>))}</ul>
              </div>
            </section>
            <section className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-7 text-xs text-[rgba(255,255,255,0.5)]">
              <div className="text-[rgba(255,255,255,0.4)]">Focus mantra:</div>
              <p className="mt-3">Draft fast, revise later. Ignore mistakes for now—capture ideas and pacing. Feedback will point you toward targeted revision.</p>
            </section>
          </aside>

          <section className="relative rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-white p-8 text-[#1b1f24] shadow-xl">
            <textarea value={writingContent} onChange={event => setWritingContent(event.target.value)} onPaste={handlePaste} onCut={handleCut} placeholder="Start writing here..." className="h-[520px] w-full resize-none bg-transparent text-base leading-relaxed focus:outline-none" autoFocus />
            {showPasteWarning && (<div className={`absolute inset-x-0 top-6 mx-auto w-max rounded-[20px] ${COLOR_CLASSES.phase2.borderOpacity(0.3)} border ${COLOR_CLASSES.phase2.bgOpacity(0.15)} px-4 py-2 text-xs font-medium ${COLOR_CLASSES.phase2.text} shadow-lg`}>Paste disabled during practice sprints</div>)}
          </section>
        </div>
      </main>
    </div>
  );
}
