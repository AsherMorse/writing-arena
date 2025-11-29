'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { countWords } from '@/lib/utils/text-utils';
import { formatTime } from '@/lib/utils/time-utils';
import { usePastePrevention } from '@/lib/hooks/usePastePrevention';
import { useInterval } from '@/lib/hooks/useInterval';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { COLOR_CLASSES } from '@/lib/constants/colors';
import { clamp } from '@/lib/utils/math-utils';

export default function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait');
  const promptType = searchParams.get('promptType');

  const [timeLeft, setTimeLeft] = useState(240);
  const [writingContent, setWritingContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const { showPasteWarning, handlePaste, handleCut } = usePastePrevention({ warningDuration: 2500 });

  const [partyMembers] = useState([
    { name: 'You', avatar: '🌿', wordCount: 0, isYou: true },
    { name: 'WriteBot', avatar: '🤖', wordCount: 0, isYou: false },
    { name: 'PenPal AI', avatar: '✍️', wordCount: 0, isYou: false },
    { name: 'WordSmith', avatar: '📝', wordCount: 0, isYou: false },
    { name: 'QuillMaster', avatar: '🖋️', wordCount: 0, isYou: false },
  ]);

  const [aiWordCounts, setAiWordCounts] = useState<number[]>([0, 0, 0, 0]);

  const prompts = {
    narrative: { icon: '🌄', title: 'Unexpected adventure', description: 'Write about a character who discovers something surprising during an ordinary day.' },
    descriptive: { icon: '🏰', title: 'Mysterious location', description: 'Describe a place that feels magical or strange. Use vivid sensory detail.' },
    informational: { icon: '🔬', title: 'Explain a process', description: 'Teach the reader how something works or why a phenomenon happens step by step.' },
    argumentative: { icon: '💭', title: 'Take a position', description: 'Should students choose their own projects? State a claim and support it with reasons.' },
  } as const;

  const currentPrompt = prompts[promptType as keyof typeof prompts] || prompts.narrative;

  const handleSubmit = () => { router.push(`/quick-match/results?trait=${trait}&promptType=${promptType}&content=${encodeURIComponent(writingContent)}&wordCount=${wordCount}&aiScores=${aiWordCounts.join(',')}`); };

  useInterval(() => {
    if (timeLeft > 0) {
      setTimeLeft(prev => prev - 1);
    } else {
      handleSubmit();
    }
  }, timeLeft > 0 ? 1000 : null, [timeLeft]);

  const debouncedContent = useDebounce(writingContent, 300);
  useEffect(() => { setWordCount(countWords(debouncedContent)); }, [debouncedContent]);

  useInterval(() => {
    setAiWordCounts(prev => prev.map(count => clamp(count + Math.floor(Math.random() * 5) + 2, 0, 220)));
  }, 2000, []);
  const timerColor = timeLeft > 120 ? '#00e5e5' : timeLeft > 60 ? '#ff9030' : '#ff5f8f'; // Timer colors: cyan -> orange -> pink

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <header className="sticky top-0 z-20 border-b border-[rgba(255,255,255,0.05)] bg-[#101012]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] font-mono text-xl font-medium">{formatTime(timeLeft)}</div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">Quick match · phase 1</div>
              <p className="text-sm font-medium" style={{ color: timerColor }}>Keep drafting until the buzzer.</p>
            </div>
            <div className="rounded-[20px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-1 text-xs text-[rgba(255,255,255,0.5)]">Trait focus: {trait || 'all'}</div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="rounded-[20px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-1 text-[rgba(255,255,255,0.5)]"><span className="font-medium">{wordCount}</span> words</div>
            <button onClick={handleSubmit} className={`rounded-[10px] ${COLOR_CLASSES.phase1.border} ${COLOR_CLASSES.phase1.bg} px-6 py-2 font-medium text-[#101012] transition hover:bg-[#33ebeb]`}>Submit draft</button>
          </div>
        </div>
        <div className="mx-auto h-[6px] max-w-6xl rounded-[3px] bg-[rgba(255,255,255,0.05)]">
          <div className="h-full rounded-[3px] transition-all" style={{ width: `${(timeLeft / 240) * 100}%`, background: timerColor }} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[0.95fr,1.45fr]">
          <aside className="space-y-6">
            <section className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-7">
              <header className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] text-2xl">{currentPrompt.icon}</span>
                <div><h2 className="font-semibold">{currentPrompt.title}</h2><p className="text-xs text-[rgba(255,255,255,0.4)]">Category: {promptType}</p></div>
              </header>
              <p className="mt-4 text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">{currentPrompt.description}</p>
            </section>

            <section className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-7">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">Squad tracker</div>
              <div className="mt-4 space-y-3">
                <div className="rounded-[10px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.08)] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#101012] text-lg">🌿</span>
                      <div><div className="text-sm font-medium">You</div><div className={`text-[10px] uppercase ${COLOR_CLASSES.phase1.text}`}>Drafting</div></div>
                    </div>
                    <div className="font-mono text-sm font-medium">{wordCount}<span className="ml-1 text-xs text-[rgba(255,255,255,0.4)]">w</span></div>
                  </div>
                  <div className="mt-3 h-[6px] rounded-[3px] bg-[rgba(255,255,255,0.05)]"><div className={`h-full rounded-[3px] ${COLOR_CLASSES.phase1.bg}`} style={{ width: `${clamp((wordCount / 200) * 100, 0, 100)}%` }} /></div>
                </div>
                {aiWordCounts.map((count, index) => (
                  <div key={index} className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[rgba(255,255,255,0.025)] text-lg">{partyMembers[index + 1].avatar}</span>
                        <div><div className="text-sm font-medium">{partyMembers[index + 1].name}</div><div className="text-[10px] uppercase text-[rgba(255,255,255,0.3)]">AI teammate</div></div>
                      </div>
                      <div className="font-mono text-sm font-medium text-[rgba(255,255,255,0.5)]">{count}<span className="ml-1 text-xs text-[rgba(255,255,255,0.3)]">w</span></div>
                    </div>
                    <div className="mt-3 h-[6px] rounded-[3px] bg-[rgba(255,255,255,0.05)]"><div className="h-full rounded-[3px] bg-[rgba(255,255,255,0.2)]" style={{ width: `${clamp((count / 200) * 100, 0, 100)}%` }} /></div>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <section className="rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-white p-7 text-[#1b1f24] shadow-xl">
            <header className="flex items-center justify-between text-xs text-[#1b1f24]/60"><span>Draft your response</span><span>{wordCount} words</span></header>
            <textarea value={writingContent} onChange={event => setWritingContent(event.target.value)} onPaste={handlePaste} onCut={handleCut} placeholder="Start writing... keep sentences moving and hit your word target." className="mt-4 h-[460px] w-full resize-none bg-transparent text-base leading-relaxed focus:outline-none" autoFocus />
            {showPasteWarning && (<div className={`absolute inset-x-0 top-6 mx-auto w-max rounded-[20px] ${COLOR_CLASSES.phase2.borderOpacity(0.3)} border ${COLOR_CLASSES.phase2.bgOpacity(0.15)} px-4 py-2 text-xs font-medium ${COLOR_CLASSES.phase2.text} shadow-lg`}>Paste disabled during quick match drafts</div>)}
          </section>
        </div>
      </main>
    </div>
  );
}
