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
    { id: 'all', name: 'All Traits', icon: '✨', color: 'from-purple-400 to-purple-600', description: 'Balanced practice across all writing skills' },
    { id: 'content', name: 'Content', icon: '📚', color: 'from-blue-400 to-blue-600', description: 'Ideas, relevance, and supporting details' },
    { id: 'organization', name: 'Organization', icon: '🗂️', color: 'from-purple-400 to-purple-600', description: 'Structure, flow, and transitions' },
    { id: 'grammar', name: 'Grammar', icon: '✏️', color: 'from-green-400 to-green-600', description: 'Sentence variety and syntax' },
    { id: 'vocabulary', name: 'Vocabulary', icon: '📖', color: 'from-yellow-400 to-yellow-600', description: 'Word choice and precision' },
    { id: 'mechanics', name: 'Mechanics', icon: '⚙️', color: 'from-red-400 to-red-600', description: 'Spelling, punctuation, and conventions' },
  ];

  const promptTypes = [
    { id: 'narrative', name: 'Narrative', icon: '📖', description: 'Tell a story' },
    { id: 'descriptive', name: 'Descriptive', icon: '🎨', description: 'Describe a scene' },
    { id: 'informational', name: 'Informational', icon: '📰', description: 'Explain something' },
    { id: 'argumentative', name: 'Argumentative', icon: '💭', description: 'Make an argument' },
  ];

  const handleTraitSelect = (traitId: string) => {
    setSelectedTrait(traitId);
    setTimeout(() => setCurrentStep(2), 300);
  };

  const handlePromptTypeSelect = (typeId: string) => {
    setSelectedPromptType(typeId);
    setTimeout(() => setCurrentStep(3), 300);
  };

  const handleStartPractice = () => {
    if (selectedTrait && selectedPromptType) {
      router.push(`/practice/session?trait=${selectedTrait}&promptType=${selectedPromptType}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">✍️</span>
                </div>
                <span className="text-xl font-bold text-white">Writing Arena</span>
              </Link>
            </div>

            <Link 
              href="/dashboard"
              className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors"
            >
              <span>←</span>
              <span>Back to Dashboard</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Practice Mode</h1>
            <p className="text-white/60 text-sm sm:text-base">Choose your focus and start writing</p>
          </div>

          {/* Progress Steps Indicator */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold transition-all duration-300 text-sm sm:text-base ${
                    currentStep === step
                      ? 'bg-gradient-to-br from-green-400 to-teal-500 text-white scale-110 shadow-lg'
                      : currentStep > step
                      ? 'bg-green-600 text-white'
                      : 'bg-white/10 text-white/40'
                  }`}>
                    {currentStep > step ? '✓' : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 sm:w-20 md:w-24 h-1 mx-2 rounded transition-all duration-300 ${
                      currentStep > step ? 'bg-green-600' : 'bg-white/10'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content - Single Frame at a Time */}
          <div className="relative w-full">
          {/* Step 1: Choose Trait Focus */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right duration-300">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 border border-white/10">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">Choose Your Focus</h2>
                  <p className="text-white/60 text-sm sm:text-base">Select which writing trait to practice</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                  {traits.map((trait) => (
                    <button
                      key={trait.id}
                      onClick={() => handleTraitSelect(trait.id)}
                      className="group p-4 sm:p-5 md:p-6 rounded-xl transition-all duration-200 text-center border-2 border-white/10 bg-white/5 hover:bg-white/10 hover:scale-105 hover:border-white/30"
                    >
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br ${trait.color} rounded-lg flex items-center justify-center text-2xl sm:text-3xl md:text-4xl mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                        {trait.icon}
                      </div>
                      <div className="text-white text-sm sm:text-base font-semibold mb-1">{trait.name}</div>
                      <p className="text-white/50 text-xs sm:text-sm leading-relaxed hidden sm:block">{trait.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Choose Prompt Type */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right duration-300">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 border border-white/10">
                <div className="text-center mb-6 sm:mb-8">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-white/60 hover:text-white transition-colors text-sm mb-4"
                  >
                    ← Back
                  </button>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3">Choose Writing Type</h2>
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/20 rounded-full border border-green-500/30 text-sm sm:text-base">
                    <span className="text-green-400">Focus:</span>
                    <span className="text-white font-semibold">
                      {traits.find(t => t.id === selectedTrait)?.name}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 md:gap-6 max-w-4xl mx-auto">
                  {promptTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handlePromptTypeSelect(type.id)}
                      className="group p-5 sm:p-6 md:p-8 rounded-xl transition-all duration-200 text-center border-2 border-white/10 bg-white/5 hover:bg-white/10 hover:scale-105 hover:border-white/30"
                    >
                      <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">{type.icon}</div>
                      <div className="text-white text-sm sm:text-base md:text-lg font-semibold mb-1">{type.name}</div>
                      <p className="text-white/50 text-xs sm:text-sm">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Ready to Start */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right duration-300">
              <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl p-6 sm:p-8 md:p-10 border-2 border-green-400/30 shadow-2xl max-w-3xl mx-auto">
                <div className="text-center mb-6 sm:mb-8">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-white/80 hover:text-white transition-colors text-sm mb-4"
                  >
                    ← Back
                  </button>
                  <div className="text-5xl sm:text-6xl mb-4">🚀</div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">Ready to Start!</h2>
                  <p className="text-white/90 text-sm sm:text-base">Your practice session is configured</p>
                </div>

                {/* Session Details */}
                <div className="grid grid-cols-2 gap-4 sm:gap-5 mb-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20">
                    <div className="text-white/70 text-xs sm:text-sm mb-2">Focus Trait</div>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl sm:text-3xl">
                        {traits.find(t => t.id === selectedTrait)?.icon}
                      </div>
                      <div className="text-white text-base sm:text-lg md:text-xl font-semibold">
                        {traits.find(t => t.id === selectedTrait)?.name}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20">
                    <div className="text-white/70 text-xs sm:text-sm mb-2">Writing Type</div>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl sm:text-3xl">
                        {promptTypes.find(t => t.id === selectedPromptType)?.icon}
                      </div>
                      <div className="text-white text-base sm:text-lg md:text-xl font-semibold">
                        {promptTypes.find(t => t.id === selectedPromptType)?.name}
                      </div>
                    </div>
                  </div>
                </div>

                {/* What to Expect */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 sm:p-6 border border-white/20 mb-6">
                  <h3 className="text-white font-bold text-base sm:text-lg mb-4 text-center">What to Expect</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm sm:text-base">
                    <div className="flex items-center space-x-2">
                      <div className="text-xl sm:text-2xl">⏱️</div>
                      <div className="text-white/90">4-minute timer</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xl sm:text-2xl">📝</div>
                      <div className="text-white/90">Guided prompt</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xl sm:text-2xl">🤖</div>
                      <div className="text-white/90">AI feedback</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xl sm:text-2xl">⭐</div>
                      <div className="text-white/90">Earn XP</div>
                    </div>
                  </div>
                </div>

                {/* Start Button */}
                <div className="text-center">
                  <button
                    onClick={handleStartPractice}
                    className="w-full px-8 py-4 sm:py-5 bg-white text-green-600 font-bold text-base sm:text-lg md:text-xl rounded-xl hover:scale-105 transition-all duration-200 shadow-2xl"
                  >
                    Start Writing Now! →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}

