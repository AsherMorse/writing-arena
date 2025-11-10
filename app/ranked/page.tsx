'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RankedPage() {
  const router = useRouter();
  const [selectedTrait, setSelectedTrait] = useState<string>('all');

  const traits = [
    { id: 'all', name: 'All Traits', icon: '✨', color: 'from-purple-400 to-purple-600' },
    { id: 'content', name: 'Content', icon: '📚', color: 'from-blue-400 to-blue-600' },
    { id: 'organization', name: 'Organization', icon: '🗂️', color: 'from-purple-400 to-purple-600' },
    { id: 'grammar', name: 'Grammar', icon: '✏️', color: 'from-green-400 to-green-600' },
    { id: 'vocabulary', name: 'Vocabulary', icon: '📖', color: 'from-yellow-400 to-yellow-600' },
    { id: 'mechanics', name: 'Mechanics', icon: '⚙️', color: 'from-red-400 to-red-600' },
  ];

  const handleStartMatch = () => {
    router.push(`/ranked/matchmaking?trait=${selectedTrait}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-7xl">
          <div className="grid lg:grid-cols-5 gap-6 items-start">
            {/* Left Column - Title & Explanation */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-3xl shadow-lg">
                    🏆
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Ranked Match</h1>
                </div>
                
                <p className="text-white/70 text-sm mb-4 leading-relaxed">
                  Compete in skill-matched battles where your rank is on the line. Climb from Bronze to Grandmaster through consistent performance.
                </p>

                {/* Current Rank Display */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg p-4 mb-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-white/80 text-[10px] mb-1">Current Rank</div>
                      <div className="text-2xl font-bold text-white">Silver III</div>
                    </div>
                    <div className="text-4xl">🥈</div>
                  </div>
                  <div className="bg-white/20 rounded-full h-1.5 overflow-hidden mb-1">
                    <div className="bg-white h-full rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <div className="text-white/90 text-[10px]">120 LP to Silver II</div>
                </div>

                {/* Match Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start space-x-2">
                    <div className="text-lg">⚔️</div>
                    <div>
                      <div className="text-white font-semibold text-sm">Skill-Based Matching</div>
                      <div className="text-white/60 text-xs">Matched with similar rank players</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="text-lg">📈</div>
                    <div>
                      <div className="text-white font-semibold text-sm">Rank Impact</div>
                      <div className="text-white/60 text-xs">Win: +15-30 LP | Loss: -10-20 LP</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="text-lg">💎</div>
                    <div>
                      <div className="text-white font-semibold text-sm">Double Rewards</div>
                      <div className="text-white/60 text-xs">2x XP and points</div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <span className="text-yellow-400">⚠️</span>
                    <div className="text-white/80 text-xs">
                      <span className="font-semibold text-yellow-400">Notice:</span> Your rank is affected. Play your best!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Selection Process */}
            <div className="lg:col-span-3">
              {/* Trait Selection */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 mb-4">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white mb-1">Choose Your Focus</h2>
                  <p className="text-white/60 text-xs">Select which trait to compete on</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {traits.map((trait) => (
                    <button
                      key={trait.id}
                      onClick={() => setSelectedTrait(trait.id)}
                      className={`group p-3 rounded-lg transition-all duration-200 text-center border-2 ${
                        selectedTrait === trait.id
                          ? 'border-purple-400 bg-purple-500/20 scale-105'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:scale-105'
                      }`}
                    >
                      <div className={`w-10 h-10 bg-gradient-to-br ${trait.color} rounded-lg flex items-center justify-center text-xl mx-auto mb-1 group-hover:scale-110 transition-transform`}>
                        {trait.icon}
                      </div>
                      <div className="text-white text-xs font-semibold">{trait.name}</div>
                      {selectedTrait === trait.id && (
                        <div className="text-purple-400 text-[10px] mt-0.5">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rank Tiers Info */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-4">
                <h3 className="text-white font-semibold text-sm mb-3">Rank Tiers</h3>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {[
                    { name: 'Bronze', emoji: '🥉', color: 'text-orange-400' },
                    { name: 'Silver', emoji: '🥈', color: 'text-gray-300' },
                    { name: 'Gold', emoji: '🥇', color: 'text-yellow-400' },
                    { name: 'Platinum', emoji: '💎', color: 'text-cyan-400' },
                    { name: 'Diamond', emoji: '💠', color: 'text-blue-400' },
                    { name: 'Master', emoji: '⭐', color: 'text-purple-400' },
                    { name: 'Grand', emoji: '👑', color: 'text-yellow-300' },
                  ].map((tier) => (
                    <div key={tier.name} className="bg-white/5 rounded-lg p-1.5 border border-white/10">
                      <div className="text-xl mb-0.5">{tier.emoji}</div>
                      <div className={`text-[10px] font-semibold ${tier.color}`}>{tier.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <button
                  onClick={handleStartMatch}
                  className="group w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-purple-500/50"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>Start Ranked Match</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>
                <p className="text-white/50 text-xs mt-2">Finding skill-matched opponents...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

