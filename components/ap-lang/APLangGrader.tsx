'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function APLangGrader() {
  const { user } = useAuth();
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
                <div className="text-xs text-white/60 mb-1">Thesis</div>
                <div className="text-2xl font-bold text-white">{result.thesisScore}/1</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-xs text-white/60 mb-1">Evidence & Commentary</div>
                <div className="text-2xl font-bold text-white">{result.evidenceScore}/4</div>
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

