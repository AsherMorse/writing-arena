'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MarkdownRenderer } from '@/lib/utils/markdown-renderer';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const AP_LANG_TIME_LIMIT = 40 * 60;

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

  useEffect(() => {
    if (!hasStarted || timeRemaining <= 0) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [hasStarted, timeRemaining]);

  const generatePrompt = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setEssay('');
    setTimeRemaining(AP_LANG_TIME_LIMIT);
    setHasStarted(false);

    try {
      const response = await fetch('/api/ap-lang/generate-prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) throw new Error('Failed to generate prompt');
      const data = await response.json();
      setPrompt(data.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStart = () => { setHasStarted(true); startTimeRef.current = Date.now(); };

  const handleSubmit = async () => {
    if (!prompt || !essay.trim()) { setError('Please write an essay before submitting.'); return; }
    setIsGrading(true);
    setError(null);
    setResult(null);
    setHasStarted(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    try {
      const response = await fetch('/api/ap-lang/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, essay }),
      });
      if (!response.ok) throw new Error('Failed to grade essay');
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
  const timeColor = timeRemaining < 300 ? '#ff5f8f' : '#ff9030';

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-semibold">AP Lang Practice</h1>
        <p className="text-sm text-[rgba(255,255,255,0.4)]">
          Generate an authentic AP Language prompt and write your essay with a 40-minute timer
        </p>
      </div>

      <div className="space-y-6">
        {!prompt && (
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-8 text-center">
            <button
              onClick={generatePrompt}
              disabled={isGenerating}
              className="rounded-[10px] border border-[#ff9030] bg-[#ff9030] px-8 py-4 font-medium text-[#101012] transition hover:bg-[#ffaa60] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? 'Generating Prompt...' : 'Generate AP Lang Prompt'}
            </button>
          </div>
        )}

        {prompt && (
          <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Prompt</h2>
              {!hasStarted && (
                <button onClick={generatePrompt} disabled={isGenerating} className="text-sm text-[#ff9030] transition hover:text-[#ffaa60]">
                  Generate New Prompt
                </button>
              )}
            </div>
            <div className="leading-relaxed text-[rgba(255,255,255,0.7)]">
              <MarkdownRenderer content={prompt} />
            </div>
          </div>
        )}

        {prompt && !hasStarted && !result && (
          <div className="rounded-[14px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.08)] p-6 text-center">
            <div className="mb-2 font-mono text-4xl font-medium text-[#00e5e5]">{formatTime(AP_LANG_TIME_LIMIT)}</div>
            <p className="mb-4 text-sm text-[rgba(255,255,255,0.5)]">You'll have 40 minutes to write your essay</p>
            <button onClick={handleStart} className="rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-8 py-3 font-medium text-[#101012] transition hover:bg-[#33ebeb]">
              Start Writing
            </button>
          </div>
        )}

        {hasStarted && (
          <div className={`rounded-[14px] p-4 text-center ${timeRemaining < 300 ? 'border-2 border-[rgba(255,95,143,0.4)] bg-[rgba(255,95,143,0.1)]' : 'border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)]'}`}>
            <div className="mb-1 font-mono text-3xl font-medium" style={{ color: timeColor }}>{formatTime(timeRemaining)}</div>
            <div className="text-sm text-[rgba(255,255,255,0.4)]">{isTimeUp ? "Time's up!" : 'Time remaining'}</div>
            <div className="mt-2 text-xs text-[rgba(255,255,255,0.3)]">{wordCount} words</div>
          </div>
        )}

        {prompt && hasStarted && (
          <div>
            <label className="mb-2 block text-sm font-medium">Your Essay Response</label>
            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              disabled={isTimeUp}
              placeholder="Begin writing your essay response here..."
              className="h-[500px] w-full resize-none rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3 text-sm leading-relaxed placeholder-[rgba(255,255,255,0.22)] focus:border-[#ff9030] focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-[rgba(255,255,255,0.3)]">{wordCount} words</div>
              <button
                onClick={handleSubmit}
                disabled={isGrading || !essay.trim()}
                className="rounded-[10px] border border-[#ff9030] bg-[#ff9030] px-6 py-2 font-medium text-[#101012] transition hover:bg-[#ffaa60] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGrading ? 'Grading...' : 'Submit Essay'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-[10px] border border-[rgba(255,95,143,0.3)] bg-[rgba(255,95,143,0.1)] p-4 text-sm text-[#ff5f8f]">{error}</div>
        )}

        {result && (
          <div className="space-y-6 rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
            <div className="text-center">
              <div className="mb-2 text-xs text-[rgba(255,255,255,0.4)]">AP Score</div>
              <div className="font-mono text-5xl font-medium text-[#ff9030]">{result.score}/6</div>
              <div className="mt-2 text-sm text-[rgba(255,255,255,0.5)]">{result.scoreDescriptor}</div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
                <div className="mb-1 text-xs text-[rgba(255,255,255,0.4)]">Thesis</div>
                <div className="font-mono text-2xl font-medium">{result.thesisScore}/1</div>
              </div>
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
                <div className="mb-1 text-xs text-[rgba(255,255,255,0.4)]">Evidence & Commentary</div>
                <div className="font-mono text-2xl font-medium">{result.evidenceScore}/4</div>
              </div>
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
                <div className="mb-1 text-xs text-[rgba(255,255,255,0.4)]">Sophistication</div>
                <div className="font-mono text-2xl font-medium">{result.sophisticationScore}/1</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-base font-semibold text-[#00d492]">Strengths</h3>
                <ul className="space-y-1 text-sm text-[rgba(255,255,255,0.6)]">
                  {result.strengths?.map((strength: string, i: number) => (
                    <li key={i} className="flex items-start"><span className="mr-2 text-[#00d492]">✓</span><span>{strength}</span></li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-base font-semibold text-[#ff9030]">Areas for Improvement</h3>
                <ul className="space-y-1 text-sm text-[rgba(255,255,255,0.6)]">
                  {result.improvements?.map((improvement: string, i: number) => (
                    <li key={i} className="flex items-start"><span className="mr-2 text-[#ff9030]">→</span><span>{improvement}</span></li>
                  ))}
                </ul>
              </div>

              {result.detailedFeedback && (
                <div>
                  <h3 className="mb-2 text-base font-semibold text-[#00e5e5]">Detailed Feedback</h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-[rgba(255,255,255,0.6)]">{result.detailedFeedback}</div>
                </div>
              )}
            </div>

            <div className="border-t border-[rgba(255,255,255,0.05)] pt-4">
              <button
                onClick={() => { setPrompt(null); setEssay(''); setResult(null); setTimeRemaining(AP_LANG_TIME_LIMIT); setHasStarted(false); }}
                className="w-full rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-6 py-3 transition hover:bg-[rgba(255,255,255,0.04)]"
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
