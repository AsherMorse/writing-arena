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
        body: JSON.stringify({ prompt, essay, essayType }),
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

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-semibold">AP Lang Essay Grader</h1>
        <p className="text-sm text-[rgba(255,255,255,0.4)]">
          Paste your AP Language prompt and essay to receive authentic AP scoring (0-6 scale)
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-3 block text-sm font-medium">Essay Type</label>
          <div className="grid grid-cols-3 gap-3">
            {(['argument', 'rhetorical-analysis', 'synthesis'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setEssayType(type)}
                className={`rounded-[10px] px-4 py-3 font-medium transition ${
                  essayType === type
                    ? 'border border-[#ff9030] bg-[#ff9030] text-[#101012]'
                    : 'border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.04)]'
                }`}
              >
                {type === 'argument' ? 'Argument' : type === 'rhetorical-analysis' ? 'Rhetorical Analysis' : 'Synthesis'}
              </button>
            ))}
          </div>
          
          <div className="mt-3 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-3 text-xs text-[rgba(255,255,255,0.5)]">
            {essayType === 'argument' && (
              <><strong className="text-[rgba(255,255,255,0.8)]">Argument Essay:</strong> Develop an evidence-based argument on a given topic. Your thesis should establish a clear line of reasoning supported by specific evidence and commentary.</>
            )}
            {essayType === 'rhetorical-analysis' && (
              <><strong className="text-[rgba(255,255,255,0.8)]">Rhetorical Analysis Essay:</strong> Analyze how an author uses rhetorical strategies to achieve their purpose. Focus on explaining HOW and WHY the choices work, not just identifying them.</>
            )}
            {essayType === 'synthesis' && (
              <><strong className="text-[rgba(255,255,255,0.8)]">Synthesis Essay:</strong> Develop an argument that synthesizes information from at least 3 provided sources. Integrate sources to support your position, don&apos;t just summarize them.</>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">AP Lang Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste the prompt from your AP Lang practice exercise here..."
            className="h-32 w-full resize-none rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3 text-sm placeholder-[rgba(255,255,255,0.22)] focus:border-[#ff9030] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Your Essay</label>
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Paste your essay response here..."
            className="h-96 w-full resize-none rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3 text-sm placeholder-[rgba(255,255,255,0.22)] focus:border-[#ff9030] focus:outline-none"
          />
          <div className="mt-2 text-xs text-[rgba(255,255,255,0.3)]">
            {essay.split(/\s+/).filter(Boolean).length} words
          </div>
        </div>

        <button
          onClick={handleGrade}
          disabled={isGrading || !prompt.trim() || !essay.trim()}
          className="w-full rounded-[10px] border border-[#ff9030] bg-[#ff9030] px-6 py-4 font-medium text-[#101012] transition hover:bg-[#ffaa60] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGrading ? 'Grading...' : 'Grade Essay'}
        </button>

        {error && (
          <div className="rounded-[10px] border border-[rgba(255,95,143,0.3)] bg-[rgba(255,95,143,0.1)] p-4 text-sm text-[#ff5f8f]">
            {error}
          </div>
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
                <div className="mb-1 text-xs text-[rgba(255,255,255,0.4)]">
                  {essayType === 'rhetorical-analysis' ? 'Thesis (Rhetorical Choices)' : essayType === 'synthesis' ? 'Thesis (Position)' : 'Thesis'}
                </div>
                <div className="font-mono text-2xl font-medium">{result.thesisScore}/1</div>
              </div>
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
                <div className="mb-1 text-xs text-[rgba(255,255,255,0.4)]">Evidence & Commentary</div>
                <div className="font-mono text-2xl font-medium">{result.evidenceScore}/4</div>
                {essayType === 'synthesis' && <div className="mt-1 text-[10px] text-[rgba(255,255,255,0.3)]">(Must cite 3+ sources for 4 pts)</div>}
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
          </div>
        )}
      </div>
    </div>
  );
}
