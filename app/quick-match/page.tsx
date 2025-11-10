'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function QuickMatchPage() {
  const router = useRouter();
  const [selectedTrait, setSelectedTrait] = useState<string>('all');

  const traits = [
    { id: 'all', name: 'All Traits', icon: '✨', color: 'from-purple-400 to-purple-600', description: 'Balanced practice across all writing skills' },
    { id: 'content', name: 'Content', icon: '📚', color: 'from-blue-400 to-blue-600', description: 'Ideas, relevance, and supporting details' },
    { id: 'organization', name: 'Organization', icon: '🗂️', color: 'from-purple-400 to-purple-600', description: 'Structure, flow, and transitions' },
    { id: 'grammar', name: 'Grammar', icon: '✏️', color: 'from-green-400 to-green-600', description: 'Sentence variety and syntax' },
    { id: 'vocabulary', name: 'Vocabulary', icon: '📖', color: 'from-yellow-400 to-yellow-600', description: 'Word choice and precision' },
    { id: 'mechanics', name: 'Mechanics', icon: '⚙️', color: 'from-red-400 to-red-600', description: 'Spelling, punctuation, and conventions' },
  ];

  const handleStartMatch = () => {
    router.push(`/quick-match/matchmaking?trait=${selectedTrait}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900">
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
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-7xl">
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Left Column - Title & Explanation */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl text-4xl shadow-lg">
                    ⚡
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">Quick Match</h1>
                </div>
                
                <p className="text-white/70 text-base mb-6 leading-relaxed">
                  Join a fast-paced 4-minute writing battle against AI opponents. Earn points, climb ranks, and improve your skills in competitive matches.
                </p>

                {/* Match Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">⏱️</div>
                    <div>
                      <div className="text-white font-semibold">4 Minutes</div>
                      <div className="text-white/60 text-sm">Fast-paced writing sprint</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">👥</div>
                    <div>
                      <div className="text-white font-semibold">4-6 Players</div>
                      <div className="text-white/60 text-sm">AI fills empty slots instantly</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">🏅</div>
                    <div>
                      <div className="text-white font-semibold">Competitive Scoring</div>
                      <div className="text-white/60 text-sm">Earn points & climb ranks</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <div className="text-white font-semibold">Focus Training</div>
                      <div className="text-white/60 text-sm">Optional trait-specific practice</div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-orange-400 text-lg">💡</span>
                    <div className="text-white/80 text-sm">
                      <span className="font-semibold text-orange-400">Pro Tip:</span> Quick Match is perfect for daily practice. Matchmaking is fast, and you&apos;ll always find a party ready to compete!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Selection Process */}
            <div className="lg:col-span-3">
              {/* Trait Selection */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-2">Choose Your Focus</h2>
                  <p className="text-white/60 text-sm">Select which trait to compete on (optional)</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {traits.map((trait) => (
                    <button
                      key={trait.id}
                      onClick={() => setSelectedTrait(trait.id)}
                      className={`group p-4 rounded-xl transition-all duration-200 text-center border-2 ${
                        selectedTrait === trait.id
                          ? 'border-orange-400 bg-orange-500/20 scale-105'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:scale-105'
                      }`}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${trait.color} rounded-lg flex items-center justify-center text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                        {trait.icon}
                      </div>
                      <div className="text-white text-sm font-semibold mb-1">{trait.name}</div>
                      {selectedTrait === trait.id && (
                        <div className="text-orange-400 text-xs mt-1">✓ Selected</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <button
                  onClick={handleStartMatch}
                  className="group w-full px-8 py-5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-xl rounded-xl hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-orange-500/50"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <span>Find Match</span>
                    <span className="group-hover:translate-x-1 transition-transform text-2xl">→</span>
                  </div>
                </button>
                <p className="text-white/50 text-sm mt-3">Matchmaking usually takes less than 10 seconds</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

