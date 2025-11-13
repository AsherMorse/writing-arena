'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PracticeModePage() {
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

  const handleTraitSelect = (traitId: string) => {
    setSelectedTrait(traitId);
    setTimeout(() => setCurrentStep(2), 200);
  };

  const handlePromptTypeSelect = (typeId: string) => {
    setSelectedPromptType(typeId);
    setTimeout(() => setCurrentStep(3), 200);
  };

  const handleStartPractice = () => {
    if (selectedTrait && selectedPromptType) {
      router.push(`/practice/session?trait=${selectedTrait}&promptType=${selectedPromptType}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400/20 text-xl text-emerald-200">✶</div>
            <span className="text-xl font-semibold tracking-wide">Practice Studio</span>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14 space-y-10">
        <section className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
          <div className="flex flex-col gap-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0c141d] text-3xl">🛠️</div>
            <div>
              <h1 className="text-3xl font-semibold">Craft your practice run</h1>
              <p className="mt-2 text-sm text-white/60">Pick a trait focus, select a prompt style, then run a four-minute drill with instant AI feedback.</p>
            </div>
            <div className="flex justify-center gap-3 text-xs">
              {[1, 2, 3].map(step => (
                <div key={step} className={`flex h-2 w-12 rounded-full ${currentStep >= step ? 'bg-emerald-300' : 'bg-white/15'}`} />
              ))}
            </div>
          </div>
        </section>

        {currentStep === 1 && (
          <section className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
            <header className="mb-6 text-center">
              <h2 className="text-2xl font-semibold">Step 1 · Choose a focus trait</h2>
              <p className="mt-2 text-sm text-white/60">Guide prompts and feedback toward the skill you want to sharpen.</p>
            </header>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {traits.map(trait => (
                <button
                  key={trait.id}
                  onClick={() => handleTraitSelect(trait.id)}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:border-emerald-200/30 hover:bg-white/10"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0c141d] text-2xl">{trait.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">{trait.name}</div>
                    <p className="mt-1 text-xs text-white/50 leading-relaxed">{trait.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {currentStep === 2 && (
          <section className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
            <header className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Step 2 · Pick a prompt style</h2>
                <p className="mt-2 text-sm text-white/60">We tailor the drill and tips based on your choice.</p>
              </div>
              <button
                onClick={() => setCurrentStep(1)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 transition hover:bg-white/15"
              >
                ← Change trait
              </button>
            </header>
            <div className="grid gap-4 sm:grid-cols-2">
              {promptTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handlePromptTypeSelect(type.id)}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:border-emerald-200/30 hover:bg-white/10"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0c141d] text-2xl">{type.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">{type.name}</div>
                    <p className="mt-1 text-xs text-white/50 leading-relaxed">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {currentStep === 3 && (
          <section className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Step 3 · Launch practice</h2>
                <p className="mt-2 text-sm text-white/60">Confirm your setup and start the four-minute drill.</p>
              </div>
              <button
                onClick={() => setCurrentStep(2)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 transition hover:bg-white/15"
              >
                ← Adjust prompt
              </button>
            </header>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <div className="text-white/40">Trait focus</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-2xl">{traits.find(t => t.id === selectedTrait)?.icon}</span>
                  <span className="font-semibold text-white">{traits.find(t => t.id === selectedTrait)?.name}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <div className="text-white/40">Prompt style</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-2xl">{promptTypes.find(t => t.id === selectedPromptType)?.icon}</span>
                  <span className="font-semibold text-white">{promptTypes.find(t => t.id === selectedPromptType)?.name}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <div className="text-white/40">Timer</div>
                <div className="mt-2 text-white font-semibold">4 minutes</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <div className="text-white/40">Outcome</div>
                <div className="mt-2 text-white font-semibold">Instant AI feedback</div>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-200">
              Tip: Treat practice like a sprint—write continuously, then review feedback to pick your next drill.
            </div>
            <div className="mt-8 text-center">
              <button
                onClick={handleStartPractice}
                className="w-full rounded-full bg-emerald-400 px-8 py-3 text-sm font-semibold text-[#0c141d] transition hover:bg-emerald-300"
              >
                Start practice session
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

