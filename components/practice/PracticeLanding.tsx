'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PracticeLanding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null);
  const [selectedPromptType, setSelectedPromptType] = useState<string | null>(null);

  const traits = [
    { id: 'all', name: 'All traits', icon: '✨', description: 'Balanced practice across writing skills.' },
    { id: 'content', name: 'Content', icon: '📚', description: 'Strengthen ideas, relevance, and evidence.' },
    { id: 'organization', name: 'Organization', icon: '🗂️', description: 'Improve structure, flow, and transitions.' },
    { id: 'grammar', name: 'Grammar', icon: '✏️', description: 'Focus on sentence variety and syntax.' },
    { id: 'vocabulary', name: 'Vocabulary', icon: '📖', description: 'Elevate precision and word choice.' },
    { id: 'mechanics', name: 'Mechanics', icon: '⚙️', description: 'Tune spelling, punctuation, and conventions.' },
  ];

  const promptTypes = [
    { id: 'narrative', name: 'Narrative', icon: '📖', description: 'Tell a story with clear pacing.' },
    { id: 'descriptive', name: 'Descriptive', icon: '🎨', description: 'Paint a scene with sensory detail.' },
    { id: 'informational', name: 'Informational', icon: '📰', description: 'Explain how or why with evidence.' },
    { id: 'argumentative', name: 'Argumentative', icon: '💭', description: 'Make a claim and defend it.' },
  ];

  const handleTraitSelect = (traitId: string) => { setSelectedTrait(traitId); setTimeout(() => setCurrentStep(2), 200); };
  const handlePromptTypeSelect = (typeId: string) => { setSelectedPromptType(typeId); setTimeout(() => setCurrentStep(3), 200); };
  const handleStartPractice = () => { if (selectedTrait && selectedPromptType) router.push(`/practice/session?trait=${selectedTrait}&promptType=${selectedPromptType}`); };

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <header className="border-b border-[rgba(255,255,255,0.05)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/dashboard" className="flex items-center gap-3"><span className="text-xl font-semibold tracking-wide">Practice Studio</span></Link>
          <Link href="/dashboard" className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-2 text-sm font-medium transition hover:bg-[rgba(255,255,255,0.04)]">Back to dashboard</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-6 py-14">
        <section className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8">
          <div className="flex flex-col gap-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[#101012] text-3xl">🛠️</div>
            <div>
              <h1 className="text-2xl font-semibold">Craft your practice run</h1>
              <p className="mt-2 text-sm text-[rgba(255,255,255,0.5)]">Pick a trait focus, select a prompt style, then run a four-minute drill with instant AI feedback.</p>
            </div>
            <div className="flex justify-center gap-3 text-xs">{[1, 2, 3].map(step => (<div key={step} className={`h-2 w-12 rounded-[3px] ${currentStep >= step ? 'bg-[#00e5e5]' : 'bg-[rgba(255,255,255,0.1)]'}`} />))}</div>
          </div>
        </section>

        {currentStep === 1 && (
          <section className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8">
            <header className="mb-6 text-center"><h2 className="text-xl font-semibold">Step 1 · Choose a focus trait</h2><p className="mt-2 text-sm text-[rgba(255,255,255,0.5)]">Guide prompts and feedback toward the skill you want to sharpen.</p></header>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {traits.map(trait => (
                <button key={trait.id} onClick={() => handleTraitSelect(trait.id)} className="flex items-start gap-3 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-5 py-4 text-left transition hover:border-[rgba(0,229,229,0.2)] hover:bg-[rgba(0,229,229,0.05)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[rgba(255,255,255,0.025)] text-2xl">{trait.icon}</span>
                  <div><div className="text-sm font-medium">{trait.name}</div><p className="mt-1 text-xs leading-relaxed text-[rgba(255,255,255,0.4)]">{trait.description}</p></div>
                </button>
              ))}
            </div>
          </section>
        )}

        {currentStep === 2 && (
          <section className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8">
            <header className="mb-6 flex items-center justify-between">
              <div><h2 className="text-xl font-semibold">Step 2 · Pick a prompt style</h2><p className="mt-2 text-sm text-[rgba(255,255,255,0.5)]">We tailor the drill and tips based on your choice.</p></div>
              <button onClick={() => setCurrentStep(1)} className="rounded-[20px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-1 text-xs text-[rgba(255,255,255,0.5)] transition hover:bg-[rgba(255,255,255,0.04)]">← Change trait</button>
            </header>
            <div className="grid gap-4 sm:grid-cols-2">
              {promptTypes.map(type => (
                <button key={type.id} onClick={() => handlePromptTypeSelect(type.id)} className="flex items-start gap-3 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-5 py-4 text-left transition hover:border-[rgba(0,229,229,0.2)] hover:bg-[rgba(0,229,229,0.05)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[rgba(255,255,255,0.025)] text-2xl">{type.icon}</span>
                  <div><div className="text-sm font-medium">{type.name}</div><p className="mt-1 text-xs leading-relaxed text-[rgba(255,255,255,0.4)]">{type.description}</p></div>
                </button>
              ))}
            </div>
          </section>
        )}

        {currentStep === 3 && (
          <section className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8">
            <header className="flex items-center justify-between">
              <div><h2 className="text-xl font-semibold">Step 3 · Launch practice</h2><p className="mt-2 text-sm text-[rgba(255,255,255,0.5)]">Confirm your setup and start the four-minute drill.</p></div>
              <button onClick={() => setCurrentStep(2)} className="rounded-[20px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-3 py-1 text-xs text-[rgba(255,255,255,0.5)] transition hover:bg-[rgba(255,255,255,0.04)]">← Adjust prompt</button>
            </header>
            <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-5 py-4"><div className="text-[rgba(255,255,255,0.4)]">Trait focus</div><div className="mt-2 flex items-center gap-2"><span className="text-2xl">{traits.find(t => t.id === selectedTrait)?.icon}</span><span className="font-medium">{traits.find(t => t.id === selectedTrait)?.name}</span></div></div>
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-5 py-4"><div className="text-[rgba(255,255,255,0.4)]">Prompt style</div><div className="mt-2 flex items-center gap-2"><span className="text-2xl">{promptTypes.find(t => t.id === selectedPromptType)?.icon}</span><span className="font-medium">{promptTypes.find(t => t.id === selectedPromptType)?.name}</span></div></div>
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-5 py-4"><div className="text-[rgba(255,255,255,0.4)]">Timer</div><div className="mt-2 font-medium">4 minutes</div></div>
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-5 py-4"><div className="text-[rgba(255,255,255,0.4)]">Outcome</div><div className="mt-2 font-medium">Instant AI feedback</div></div>
            </div>
            <div className="mt-6 rounded-[10px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.08)] px-5 py-4 text-sm text-[#00e5e5]">Tip: Treat practice like a sprint—write continuously, then review feedback to pick your next drill.</div>
            <div className="mt-8 text-center"><button onClick={handleStartPractice} className="w-full rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-8 py-3 text-sm font-medium text-[#101012] transition hover:bg-[#33ebeb]">Start practice session</button></div>
          </section>
        )}
      </main>
    </div>
  );
}
