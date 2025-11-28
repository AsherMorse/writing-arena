'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MarkdownRenderer } from '@/lib/utils/markdown-renderer';
import { formatTime } from '@/lib/utils/time-utils';
import { useCountdown } from '@/lib/hooks/useCountdown';
import { useApiCall } from '@/lib/hooks/useApiCall';
import { useAsyncStateWithStringError } from '@/lib/hooks/useAsyncState';
import { safeStringifyJSON } from '@/lib/utils/json-utils';

const AP_LANG_TIME_LIMIT = 40 * 60;

export default function APLangWriter() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState<string | null>(null);
  const [essay, setEssay] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const startTimeRef = useRef<number | null>(null);
  
  const { call } = useApiCall();
  const { isLoading: isGenerating, error: generateError, execute: executeGenerate } = useAsyncStateWithStringError();
  const { isLoading: isGrading, error: gradeError, execute: executeGrade } = useAsyncStateWithStringError();
  
  const { countdown: timeRemaining, start: startTimer, stop: stopTimer, reset: resetTimer } = useCountdown({
    initialValue: AP_LANG_TIME_LIMIT,
    onComplete: () => {
      // Timer completed - could auto-submit or disable input
    },
  });

  const generatePrompt = async () => {
    await executeGenerate(async () => {
      setResult(null);
      setEssay('');
      resetTimer(AP_LANG_TIME_LIMIT);
      setHasStarted(false);
      
      const data = await call<{ prompt: string }>('/api/ap-lang/generate-prompt', {
        method: 'POST',
      });
      setPrompt(data.prompt);
    });
  };

  const handleStart = () => {
    setHasStarted(true);
    startTimeRef.current = Date.now();
    startTimer(AP_LANG_TIME_LIMIT);
  };

  const handleSubmit = async () => {
    if (!prompt || !essay.trim()) {
      executeGrade(() => Promise.reject(new Error('Please write an essay before submitting.')));
      return;
    }
    
    await executeGrade(async () => {
      setResult(null);
      setHasStarted(false);
      stopTimer();

      const data = await call<any>('/api/ap-lang/grade', {
        method: 'POST',
        body: safeStringifyJSON({ prompt, essay }) || '',
      });
      setResult(data);
    });
  };

  const wordCount = essay.split(/\s+/).filter(Boolean).length;
  const timeRemainingValue = timeRemaining ?? 0;
  const isTimeUp = timeRemainingValue === 0;
  const timeColor = timeRemainingValue < 300 ? '#ff5f8f' : '#ff9030';
  const error = generateError || gradeError;

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
            <div className="mb-2 font-mono text-4xl font-medium text-[#00e5e5]">{formatTime(AP_LANG_TIME_LIMIT, 'long')}</div>
            <p className="mb-4 text-sm text-[rgba(255,255,255,0.5)]">You&apos;ll have 40 minutes to write your essay</p>
            <button onClick={handleStart} className="rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-8 py-3 font-medium text-[#101012] transition hover:bg-[#33ebeb]">
              Start Writing
            </button>
          </div>
        )}

        {hasStarted && (
          <div className={`rounded-[14px] p-4 text-center ${timeRemainingValue < 300 ? 'border-2 border-[rgba(255,95,143,0.4)] bg-[rgba(255,95,143,0.1)]' : 'border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)]'}`}>
            <div className="mb-1 font-mono text-3xl font-medium" style={{ color: timeColor }}>{formatTime(timeRemainingValue, 'long')}</div>
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
                onClick={() => { setPrompt(null); setEssay(''); setResult(null); resetTimer(AP_LANG_TIME_LIMIT); setHasStarted(false); stopTimer(); }}
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
