'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type EssayType = 'argument' | 'rhetorical-analysis' | 'synthesis';

export default function APLangGrader() {
  const { user } = useAuth();
  const [essayType, setEssayType] = useState<EssayType>('argument');
  const [prompt, setPrompt] = useState('');
  const [essay, setEssay] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGrade = async () => {
    if (!prompt.trim() || !essay.trim()) {
      setError('Please provide both a prompt and your essay.');
      return;
    }

    setIsGrading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ap-lang/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          essay,
          essayType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to grade essay');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while grading');
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AP Lang Essay Grader</h1>
        <p className="text-white/60 text-sm">
          Paste your AP Language prompt and essay to receive authentic AP scoring (0-6 scale)
        </p>
      </div>

      <div className="space-y-6">
        {/* Essay Type Selector */}
        <div>
          <label className="block text-sm font-semibold text-white mb-3">
            Essay Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setEssayType('argument')}
              className={`px-4 py-3 rounded-xl font-medium transition ${
                essayType === 'argument'
                  ? 'bg-emerald-500 text-[#0c141d]'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              Argument
            </button>
            <button
              onClick={() => setEssayType('rhetorical-analysis')}
              className={`px-4 py-3 rounded-xl font-medium transition ${
                essayType === 'rhetorical-analysis'
                  ? 'bg-emerald-500 text-[#0c141d]'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              Rhetorical Analysis
            </button>
            <button
              onClick={() => setEssayType('synthesis')}
              className={`px-4 py-3 rounded-xl font-medium transition ${
                essayType === 'synthesis'
                  ? 'bg-emerald-500 text-[#0c141d]'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              Synthesis
            </button>
          </div>
          
          {/* Essay Type Description */}
          <div className="mt-3 bg-white/5 rounded-lg p-3 text-xs text-white/70">
            {essayType === 'argument' && (
              <>
                <strong className="text-white">Argument Essay:</strong> Develop an evidence-based argument on a given topic. Your thesis should establish a clear line of reasoning supported by specific evidence and commentary.
              </>
            )}
            {essayType === 'rhetorical-analysis' && (
              <>
                <strong className="text-white">Rhetorical Analysis Essay:</strong> Analyze how an author uses rhetorical strategies to achieve their purpose. Focus on explaining HOW and WHY the choices work, not just identifying them.
              </>
            )}
            {essayType === 'synthesis' && (
              <>
                <strong className="text-white">Synthesis Essay:</strong> Develop an argument that synthesizes information from at least 3 provided sources. Integrate sources to support your position, don&apos;t just summarize them.
              </>
            )}
          </div>
        </div>
        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            AP Lang Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste the prompt from your AP Lang practice exercise here..."
            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 resize-none focus:outline-none focus:border-emerald-400/50"
          />
        </div>

        {/* Essay Input */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Your Essay
          </label>
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Paste your essay response here..."
            className="w-full h-96 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 resize-none focus:outline-none focus:border-emerald-400/50 font-serif"
          />
          <div className="text-xs text-white/40 mt-2">
            {essay.split(/\s+/).filter(Boolean).length} words
          </div>
        </div>

        {/* Grade Button */}
        <button
          onClick={handleGrade}
          disabled={isGrading || !prompt.trim() || !essay.trim()}
          className="w-full px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#0c141d] font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGrading ? 'Grading...' : 'Grade Essay'}
        </button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300">
            {error}
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
            <div className="text-center">
              <div className="text-sm text-white/60 mb-2">AP Score</div>
              <div className="text-6xl font-bold text-emerald-400">{result.score}/6</div>
              <div className="text-sm text-white/60 mt-2">
                {result.scoreDescriptor}
              </div>
            </div>

            {/* Scoring Breakdown */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-xs text-white/60 mb-1">
                  {essayType === 'rhetorical-analysis' 
                    ? 'Thesis (Rhetorical Choices)' 
                    : essayType === 'synthesis'
                    ? 'Thesis (Position)'
                    : 'Thesis'}
                </div>
                <div className="text-2xl font-bold text-white">{result.thesisScore}/1</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-xs text-white/60 mb-1">Evidence & Commentary</div>
                <div className="text-2xl font-bold text-white">{result.evidenceScore}/4</div>
                {essayType === 'synthesis' && (
                  <div className="text-xs text-white/40 mt-1">
                    (Must cite 3+ sources for 4 pts)
                  </div>
                )}
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-xs text-white/60 mb-1">Sophistication</div>
                <div className="text-2xl font-bold text-white">{result.sophisticationScore}/1</div>
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-emerald-300 mb-2">Strengths</h3>
                <ul className="space-y-1 text-white/80 text-sm">
                  {result.strengths?.map((strength: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-yellow-300 mb-2">Areas for Improvement</h3>
                <ul className="space-y-1 text-white/80 text-sm">
                  {result.improvements?.map((improvement: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <span className="text-yellow-400 mr-2">→</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {result.detailedFeedback && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-300 mb-2">Detailed Feedback</h3>
                  <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                    {result.detailedFeedback}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

