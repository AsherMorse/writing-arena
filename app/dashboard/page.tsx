'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, userProfile, loading, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const [showMatchModal, setShowMatchModal] = useState(true);
  const [creatingProfile, setCreatingProfile] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // If user exists but no profile after loading, create one
  useEffect(() => {
    const ensureProfile = async () => {
      if (!loading && user && !userProfile && !creatingProfile) {
        setCreatingProfile(true);
        try {
          console.log('Dashboard: Creating missing profile for user', user.uid);
          const { createUserProfile, getUserProfile } = await import('@/lib/firestore');
          
          await createUserProfile(user.uid, {
            displayName: user.displayName || user.email?.split('@')[0] || 'Student Writer',
            email: user.email || '',
          });
          
          // Wait and refresh
          await new Promise(resolve => setTimeout(resolve, 1000));
          await refreshProfile();
        } catch (error) {
          console.error('Dashboard: Failed to create profile', error);
        } finally {
          setCreatingProfile(false);
        }
      }
    };

    ensureProfile();
  }, [user, userProfile, loading, creatingProfile, refreshProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin text-7xl mb-6">🌿</div>
          <h2 className="text-3xl font-bold text-white mb-3">Loading Dashboard...</h2>
          <p className="text-white/60 text-lg">Setting up your profile</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If user exists but profile doesn't, show loading (profile is being created)
  if (!userProfile || creatingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin text-7xl mb-6">🌱</div>
          <h2 className="text-3xl font-bold text-white mb-3">Creating Your Profile...</h2>
          <p className="text-white/60 text-lg">This will only take a moment</p>
          {creatingProfile && (
            <p className="text-white/40 text-sm mt-2">Dashboard is ensuring your profile exists...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Match Selection Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl max-w-4xl w-full p-8 border-2 border-white/20 shadow-2xl relative">
            {/* Close Button */}
            <button 
              onClick={() => setShowMatchModal(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all text-white text-xl"
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-3">Choose Your Battle Mode</h2>
              <p className="text-white/70 text-lg">Select how you want to write today</p>
            </div>

            {/* Three Options */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Quick Match */}
              <button 
                onClick={() => {
                  setShowMatchModal(false);
                  window.location.href = '/quick-match';
                }}
                className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-8 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl text-left group relative overflow-hidden"
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                
                <div className="relative z-10">
                  <div className="text-5xl mb-4">⚡</div>
                  <h3 className="text-2xl font-bold text-white mb-3">Quick Match</h3>
                  <p className="text-white/90 mb-4 leading-relaxed">
                    Jump into a 4-minute writing battle. Fast, fun, and ready to go!
                  </p>
                  
                  <div className="space-y-2 text-sm text-white/80">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-300">✓</span>
                      <span>Instant matchmaking</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-300">✓</span>
                      <span>AI opponents fill slots</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-300">✓</span>
                      <span>Earn XP & points</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/20">
                    <span className="text-white font-semibold">Best for: Casual practice</span>
                  </div>
                </div>
              </button>

              {/* Ranked Match */}
              <button 
                onClick={() => {
                  setShowMatchModal(false);
                  window.location.href = '/ranked';
                }}
                className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-8 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl text-left group relative overflow-hidden border-2 border-yellow-400/50"
              >
                {/* Featured Badge */}
                <div className="absolute top-4 right-4 bg-yellow-400 text-purple-900 text-xs font-bold px-3 py-1 rounded-full">
                  COMPETITIVE
                </div>

                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                
                <div className="relative z-10">
                  <div className="text-5xl mb-4">🏆</div>
                  <h3 className="text-2xl font-bold text-white mb-3">Ranked Match</h3>
                  <p className="text-white/90 mb-4 leading-relaxed">
                    Compete for glory! Climb the leaderboard and prove your writing mastery.
                  </p>
                  
                  <div className="space-y-2 text-sm text-white/80">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-300">★</span>
                      <span>Affects your rank</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-300">★</span>
                      <span>Matched by skill level</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-300">★</span>
                      <span>Double XP rewards</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/20">
                    <span className="text-white font-semibold">Best for: Serious competitors</span>
                  </div>
                </div>
              </button>

              {/* Practice Mode */}
              <button 
                onClick={() => {
                  setShowMatchModal(false);
                  window.location.href = '/practice';
                }}
                className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-8 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl text-left group relative overflow-hidden"
              >
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                
                <div className="relative z-10">
                  <div className="text-5xl mb-4">📝</div>
                  <h3 className="text-2xl font-bold text-white mb-3">Practice Mode</h3>
                  <p className="text-white/90 mb-4 leading-relaxed">
                    Train solo with AI feedback. Perfect for honing specific skills.
                  </p>
                  
                  <div className="space-y-2 text-sm text-white/80">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-300">◆</span>
                      <span>Solo training sessions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-300">◆</span>
                      <span>Focus on specific traits</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-300">◆</span>
                      <span>AI feedback & tips</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/20">
                    <span className="text-white font-semibold">Best for: Skill improvement</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Footer Note */}
            <div className="mt-8 text-center">
              <p className="text-white/50 text-sm">
                You can change modes anytime from the dashboard
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">✍️</span>
                </div>
                <span className="text-xl font-bold text-white">Writing Arena</span>
              </Link>
              
              <div className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-white hover:text-orange-400 transition-colors">
                  Dashboard
                </Link>
                <Link href="/matches" className="text-white/60 hover:text-white transition-colors">
                  Matches
                </Link>
                <Link href="/profile" className="text-white/60 hover:text-white transition-colors">
                  Profile
                </Link>
                <Link href="/leaderboard" className="text-white/60 hover:text-white transition-colors">
                  Leaderboard
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Points Display */}
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                <span className="text-yellow-400">⭐</span>
                <span className="text-white font-semibold">{userProfile.totalPoints.toLocaleString()}</span>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-white text-sm font-semibold">{userProfile.displayName}</div>
                  <div className="text-white/60 text-xs">Level {userProfile.characterLevel} - Sapling</div>
                </div>
                <button
                  onClick={signOut}
                  className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-xl hover:scale-110 transition-transform"
                  title="Sign Out"
                >
                  {userProfile.avatar}
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Writer! 🎉</h1>
              <p className="text-white/90">Ready to level up your writing skills today?</p>
            </div>
            <div className="hidden md:block text-6xl">🌿</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Quick Match */}
          <button 
            onClick={() => window.location.href = '/quick-match'}
            className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl p-6 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl text-left"
          >
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">Quick Match</h3>
            <p className="text-white/90">Join a 4-minute writing battle now</p>
          </button>

          {/* Ranked Match */}
          <button 
            onClick={() => window.location.href = '/ranked'}
            className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl p-6 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl text-left"
          >
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="text-xl font-bold text-white mb-2">Ranked Match</h3>
            <p className="text-white/90">Compete for glory and rankings</p>
          </button>

          {/* Practice Mode */}
          <button 
            onClick={() => window.location.href = '/practice'}
            className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-6 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl text-left"
          >
            <div className="text-3xl mb-3">📝</div>
            <h3 className="text-xl font-bold text-white mb-2">Practice Mode</h3>
            <p className="text-white/90">Train solo with AI feedback</p>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Character Progress */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Your Character</h2>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="text-8xl">{userProfile.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Level {userProfile.characterLevel} - Sapling</span>
                    <span className="text-white/60 text-sm">{Math.round((userProfile.totalXP % 1000) / 10)}% to Young Oak</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full" style={{ width: `${(userProfile.totalXP % 1000) / 10}%` }}></div>
                  </div>
                  <p className="text-white/70 text-sm mt-3">
                    Keep writing to grow your tree! You need {1000 - (userProfile.totalXP % 1000)} more XP to reach Young Oak.
                  </p>
                </div>
              </div>

              {/* Trait Progress */}
              <div className="grid grid-cols-5 gap-3">
                {[
                  { name: 'Content', level: userProfile.traits.content, icon: '📚', color: 'from-blue-400 to-blue-600' },
                  { name: 'Organization', level: userProfile.traits.organization, icon: '🗂️', color: 'from-purple-400 to-purple-600' },
                  { name: 'Grammar', level: userProfile.traits.grammar, icon: '✏️', color: 'from-green-400 to-green-600' },
                  { name: 'Vocabulary', level: userProfile.traits.vocabulary, icon: '📖', color: 'from-yellow-400 to-yellow-600' },
                  { name: 'Mechanics', level: userProfile.traits.mechanics, icon: '⚙️', color: 'from-red-400 to-red-600' },
                ].map((trait) => (
                  <div key={trait.name} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                    <div className="text-2xl mb-1">{trait.icon}</div>
                    <div className="text-white text-xs font-semibold mb-1">{trait.name}</div>
                    <div className={`text-xs bg-gradient-to-r ${trait.color} text-white px-2 py-1 rounded-full`}>
                      Level {trait.level}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Matches */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Recent Matches</h2>
              
              <div className="space-y-3">
                {[
                  { result: 'Victory', points: 95, trait: 'Organization', time: '2 hours ago' },
                  { result: 'Match Complete', points: 82, trait: 'Content', time: '1 day ago' },
                  { result: 'Victory', points: 88, trait: 'Grammar', time: '2 days ago' },
                ].map((match, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${match.result === 'Victory' ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                        <div>
                          <div className="text-white font-semibold">{match.result}</div>
                          <div className="text-white/60 text-sm">{match.trait} • {match.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold">+{match.points}</div>
                        <div className="text-white/60 text-xs">points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all border border-white/10">
                View All Matches
              </button>
            </div>
          </div>

          {/* Right Column - Stats & Achievements */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Stats</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">Total Matches</span>
                    <span className="text-white font-semibold">{userProfile.stats.totalMatches}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">Win Rate</span>
                    <span className="text-white font-semibold">{Math.round((userProfile.stats.wins / userProfile.stats.totalMatches) * 100)}%</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">Current Streak</span>
                    <span className="text-white font-semibold">🔥 {userProfile.stats.currentStreak} days</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">Total Words</span>
                    <span className="text-white font-semibold">{userProfile.stats.totalWords.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rank Card */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-2">Current Rank</h2>
              <div className="text-4xl font-bold text-white mb-1">{userProfile.currentRank}</div>
              <p className="text-white/90 text-sm mb-4">Top 35% of all writers</p>
              <div className="bg-white/20 rounded-full h-2 overflow-hidden mb-2">
                <div className="bg-white h-full" style={{ width: `${(userProfile.rankLP % 100)}%` }}></div>
              </div>
              <p className="text-white/80 text-xs">{100 - (userProfile.rankLP % 100)} LP to next tier</p>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Achievements</h2>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-yellow-500/30">
                  <div className="text-2xl">🏆</div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-semibold">First Victory</div>
                    <div className="text-white/60 text-xs">Win your first match</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-green-500/30">
                  <div className="text-2xl">🔥</div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-semibold">Hot Streak</div>
                    <div className="text-white/60 text-xs">3 day writing streak</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-white/10 opacity-50">
                  <div className="text-2xl">🌟</div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-semibold">Rising Star</div>
                    <div className="text-white/60 text-xs">Reach Gold rank</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
