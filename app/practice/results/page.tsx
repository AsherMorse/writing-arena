'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

function PracticeResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trait = searchParams.get('trait');
  const promptType = searchParams.get('promptType');
  const content = searchParams.get('content') || '';
  const wordCount = parseInt(searchParams.get('wordCount') || '0');

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [feedback, setFeedback] = useState<any>(null);

  useEffect(() => {
    // Call API to analyze writing
    const analyzeWriting = async () => {
      try {
        const response = await fetch('/api/analyze-writing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: decodeURIComponent(content),
            trait,
            promptType,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze writing');
        }

        const data = await response.json();
        
        // Simulate loading time for better UX
        setTimeout(() => {
          setFeedback(data);
          setIsAnalyzing(false);
        }, 2000);
      } catch (error) {
        console.error('Error analyzing writing:', error);
        // Fallback to mock feedback
        setTimeout(() => {
          const mockFeedback = generateMockFeedback(trait, wordCount);
          setFeedback(mockFeedback);
          setIsAnalyzing(false);
        }, 2000);
      }
    };

    analyzeWriting();
  }, [trait, promptType, content, wordCount]);

  const generateMockFeedback = (focusTrait: string | null, words: number) => {
    const baseScore = Math.min(100, Math.max(40, 60 + (words / 10)));
    
    return {
      overallScore: Math.round(baseScore),
      xpEarned: Math.round(baseScore * 1.5),
      traits: {
        content: Math.round(baseScore + Math.random() * 10 - 5),
        organization: Math.round(baseScore + Math.random() * 10 - 5),
        grammar: Math.round(baseScore + Math.random() * 10 - 5),
        vocabulary: Math.round(baseScore + Math.random() * 10 - 5),
        mechanics: Math.round(baseScore + Math.random() * 10 - 5),
      },
      strengths: [
        'Strong opening that captures attention',
        'Good use of descriptive details',
        'Clear progression of ideas',
      ],
      improvements: [
        'Try adding more transitional phrases between paragraphs',
        'Vary your sentence structure for better flow',
        'Consider expanding on your main points with specific examples',
      ],
      specificFeedback: {
        content: 'Your ideas are relevant and address the prompt well. Consider adding more specific examples to support your main points.',
        organization: 'Good logical flow overall. Transitions could be smoother between some paragraphs.',
        grammar: 'Sentence variety is good. Watch for a few minor punctuation issues.',
        vocabulary: 'Solid word choice. Try incorporating more precise verbs to strengthen your writing.',
        mechanics: 'Generally clean writing with good spelling and punctuation. Check capitalization in a few spots.',
      },
      nextSteps: [
        'Practice writing transitions between paragraphs',
        'Try the descriptive prompt type to expand vocabulary skills',
        'Focus on varying sentence beginnings in your next session',
      ]
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-green-400 to-emerald-500';
    if (score >= 75) return 'from-blue-400 to-blue-500';
    if (score >= 60) return 'from-yellow-400 to-yellow-500';
    return 'from-orange-400 to-orange-500';
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin text-7xl mb-6">🤖</div>
          <h2 className="text-3xl font-bold text-white mb-3">Analyzing Your Writing...</h2>
          <p className="text-white/60 text-lg mb-6">AI is reading your work and preparing feedback</p>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">✍️</span>
              </div>
              <span className="text-xl font-bold text-white">Writing Arena</span>
            </div>
            <Link 
              href="/dashboard"
              className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors"
            >
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Celebration Header */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-4 animate-bounce">🎉</div>
          <h1 className="text-5xl font-bold text-white mb-3">Great Work!</h1>
          <p className="text-xl text-white/70">Here&apos;s your detailed feedback</p>
        </div>

        {/* Score Card */}
        <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-3xl p-8 mb-8 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-white/80 mb-2">Overall Score</div>
              <div className={`text-6xl font-bold text-white mb-2`}>
                {feedback?.overallScore}
              </div>
              <div className="text-white/60">out of 100</div>
            </div>
            <div className="text-center">
              <div className="text-white/80 mb-2">XP Earned</div>
              <div className="text-6xl font-bold text-yellow-300 mb-2">
                +{feedback?.xpEarned}
              </div>
              <div className="text-white/60">experience points</div>
            </div>
            <div className="text-center">
              <div className="text-white/80 mb-2">Words Written</div>
              <div className="text-6xl font-bold text-white mb-2">
                {wordCount}
              </div>
              <div className="text-white/60">total words</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Trait Scores */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trait Breakdown */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Trait Scores</h2>
              
              <div className="space-y-6">
                {[
                  { name: 'Content', key: 'content', icon: '📚', color: 'blue' },
                  { name: 'Organization', key: 'organization', icon: '🗂️', color: 'purple' },
                  { name: 'Grammar', key: 'grammar', icon: '✏️', color: 'green' },
                  { name: 'Vocabulary', key: 'vocabulary', icon: '📖', color: 'yellow' },
                  { name: 'Mechanics', key: 'mechanics', icon: '⚙️', color: 'red' },
                ].map((trait) => {
                  const score = feedback?.traits[trait.key] || 0;
                  return (
                    <div key={trait.key}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{trait.icon}</span>
                          <span className="text-white font-semibold">{trait.name}</span>
                        </div>
                        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                          {score}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${getScoreGradient(score)} transition-all duration-1000`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <p className="text-white/60 text-sm mt-2">
                        {feedback?.specificFeedback[trait.key]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">💪</span>
                  <h3 className="text-xl font-bold text-white">Strengths</h3>
                </div>
                <div className="space-y-3">
                  {feedback?.strengths.map((strength: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-white/80 text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Areas for Improvement */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">🎯</span>
                  <h3 className="text-xl font-bold text-white">Growth Areas</h3>
                </div>
                <div className="space-y-3">
                  {feedback?.improvements.map((improvement: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-yellow-400 mt-1">→</span>
                      <span className="text-white/80 text-sm">{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Next Steps */}
          <div className="space-y-6">
            {/* Next Steps */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🚀</span>
                <h3 className="text-xl font-bold text-white">Next Steps</h3>
              </div>
              <div className="space-y-3">
                {feedback?.nextSteps.map((step: string, index: number) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-400 font-bold">{index + 1}.</span>
                      <span className="text-white/80 text-sm">{step}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/practice"
                className="block w-full px-6 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl hover:scale-105 transition-all duration-200 text-center"
              >
                Practice Again 🔄
              </Link>
              <Link
                href="/dashboard"
                className="block w-full px-6 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20 text-center"
              >
                Back to Dashboard
              </Link>
            </div>

            {/* Character Progress Hint */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🌿</div>
                <div className="text-white font-semibold mb-2">Character Update</div>
                <p className="text-white/90 text-sm mb-3">
                  You&apos;re getting closer to Young Oak!
                </p>
                <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                  <div className="bg-white h-full rounded-full" style={{ width: '73%' }}></div>
                </div>
                <p className="text-white/70 text-xs mt-2">73% to next level</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PracticeResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading results...</div>
      </div>
    }>
      <PracticeResultsContent />
    </Suspense>
  );
}

