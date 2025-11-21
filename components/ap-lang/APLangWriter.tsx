'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MarkdownRenderer } from '@/lib/utils/markdown-renderer';

// Format seconds to MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const AP_LANG_TIME_LIMIT = 40 * 60; // 40 minutes in seconds

export default function APLangWriter() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState<string | null>(null);
  const [essay, setEssay] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(AP_LANG_TIME_LIMIT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Timer countdown
  useEffect(() => {
    if (!hasStarted || timeRemaining <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [hasStarted, timeRemaining]);

  const generatePrompt = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setEssay('');
    setTimeRemaining(AP_LANG_TIME_LIMIT);
    setHasStarted(false);

    try {
      const response = await fetch('/api/ap-lang/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const data = await response.json();
      setPrompt(data.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStart = () => {
    setHasStarted(true);
    startTimeRef.current = Date.now();
  };

  const handleSubmit = async () => {
    if (!prompt || !essay.trim()) {
      setError('Please write an essay before submitting.');
      return;
    }

    setIsGrading(true);
    setError(null);
    setResult(null);
    setHasStarted(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

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

  const wordCount = essay.split(/\s+/).filter(Boolean).length;
  const isTimeUp = timeRemaining === 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AP Lang Practice</h1>
        <p className="text-white/60 text-sm">
          Generate an authentic AP Language prompt and write your essay with a 40-minute timer
        </p>
      </div>

      <div className="space-y-6">
        {/* Generate Prompt Section */}
        {!prompt && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
            <button
              onClick={generatePrompt}
              disabled={isGenerating}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#0c141d] font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating Prompt...' : 'Generate AP Lang Prompt'}
            </button>
          </div>
        )}

        {/* Prompt Display */}
        {prompt && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Prompt</h2>
              {!hasStarted && (
                <button
                  onClick={generatePrompt}
                  disabled={isGenerating}
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition"
                >
                  Generate New Prompt
                </button>
              )}
            </div>
            <div className="text-white/90 leading-relaxed">
              <MarkdownRenderer content={prompt} />
            </div>
          </div>
        )}

        {/* Timer and Start Button */}
        {prompt && !hasStarted && !result && (
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-blue-300 mb-2">
              {formatTime(AP_LANG_TIME_LIMIT)}
            </div>
            <p className="text-white/70 mb-4">You&apos;ll have 40 minutes to write your essay</p>
            <button
              onClick={handleStart}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition"
            >
              Start Writing
            </button>
          </div>
        )}

        {/* Timer Display (when writing) */}
        {hasStarted && (
          <div className={`rounded-xl p-4 text-center ${
            timeRemaining < 300 
              ? 'bg-red-500/20 border-2 border-red-400/50' 
              : 'bg-white/5 border border-white/10'
          }`}>
            <div className={`text-3xl font-bold mb-1 ${
              timeRemaining < 300 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-white/60">
              {isTimeUp ? "Time&apos;s up!" : 'Time remaining'}
            </div>
            <div className="mt-2 text-xs text-white/40">
              {wordCount} words
            </div>
          </div>
        )}

        {/* Essay Editor */}
        {prompt && hasStarted && (
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Your Essay Response
            </label>
            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              disabled={isTimeUp}
              placeholder="Begin writing your essay response here..."
              className="w-full h-[500px] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 resize-none focus:outline-none focus:border-emerald-400/50 font-serif text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-white/40">
                {wordCount} words
              </div>
              <button
                onClick={handleSubmit}
                disabled={isGrading || !essay.trim()}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#0c141d] font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGrading ? 'Grading...' : 'Submit Essay'}
              </button>
            </div>
          </div>
        )}

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

            {/* Try Again Button */}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setPrompt(null);
                  setEssay('');
                  setResult(null);
                  setTimeRemaining(AP_LANG_TIME_LIMIT);
                  setHasStarted(false);
                }}
                className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition"
              >
                Try Another Prompt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

