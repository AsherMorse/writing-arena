/**
 * @fileoverview Dev tool for testing prompt generation. Compares v1 (legacy) vs v2 (selection) flows.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  RANKED_TOPICS,
  ESSAY_TOPICS,
  VIBES,
  ESSAY_VIBES,
} from '@/lib/services/ranked-prompts';

interface PromptResult {
  promptText: string;
  promptQuestion: string;
  promptHint: string;
  valid?: boolean;
  reason?: string;
  selection?: string;
  raw: Record<string, unknown>;
}

interface OptionsResult {
  question: string;
  options: string[];
  topic: string;
  angle: string;
}

interface HistoryEntry {
  id: string;
  timestamp: Date;
  topic: string;
  level: 'paragraph' | 'essay';
  v1?: PromptResult;
  v2?: PromptResult;
  v2Options?: OptionsResult;
}

/**
 * @description Prompt testing page for comparing v1 (legacy) vs v2 (selection) prompt generation.
 */
export default function TestPromptPage() {
  const router = useRouter();

  // Inputs
  const [topic, setTopic] = useState(RANKED_TOPICS[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [useCustomTopic, setUseCustomTopic] = useState(false);
  const [angle, setAngle] = useState(VIBES[0]);
  const [useRandomAngle, setUseRandomAngle] = useState(false);
  const [level, setLevel] = useState<'paragraph' | 'essay'>('paragraph');
  const [question, setQuestion] = useState("What's your favorite one?");
  const [selection, setSelection] = useState('');

  // Results
  const [v1Result, setV1Result] = useState<PromptResult | null>(null);
  const [v2Result, setV2Result] = useState<PromptResult | null>(null);
  const [v2Options, setV2Options] = useState<OptionsResult | null>(null);
  const [v1Inspiration, setV1Inspiration] = useState<string | null>(null);
  const [v2Inspiration, setV2Inspiration] = useState<string | null>(null);

  // Loading states
  const [isGeneratingV1, setIsGeneratingV1] = useState(false);
  const [isGeneratingV2, setIsGeneratingV2] = useState(false);
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);
  const [isLoadingV1Insp, setIsLoadingV1Insp] = useState(false);
  const [isLoadingV2Insp, setIsLoadingV2Insp] = useState(false);

  // UI state
  const [showV1Raw, setShowV1Raw] = useState(false);
  const [showV2Raw, setShowV2Raw] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const effectiveTopic = useCustomTopic ? customTopic : topic;
  const topics = level === 'essay' ? ESSAY_TOPICS : RANKED_TOPICS;
  const vibes = level === 'essay' ? ESSAY_VIBES : VIBES;

  function getRandomVibe() {
    const list = level === 'essay' ? ESSAY_VIBES : VIBES;
    return list[Math.floor(Math.random() * list.length)];
  }

  /**
   * @description Randomize topic and vibe.
   */
  function randomizeInputs() {
    const topicList = level === 'essay' ? ESSAY_TOPICS : RANKED_TOPICS;
    const vibeList = level === 'essay' ? ESSAY_VIBES : VIBES;
    
    setTopic(topicList[Math.floor(Math.random() * topicList.length)]);
    setAngle(vibeList[Math.floor(Math.random() * vibeList.length)]);
    setUseCustomTopic(false);
    setUseRandomAngle(false);
    
    // Clear previous results
    setV2Options(null);
    setV2Result(null);
    setSelection('');
    setQuestion("What's your favorite one?");
  }

  /**
   * @description Generate v2 options (question + selections) from the options endpoint.
   */
  async function generateOptions() {
    setIsGeneratingOptions(true);
    setV2Options(null);
    setV2Result(null);
    setV2Inspiration(null);
    setSelection('');

    const effectiveAngle = useRandomAngle ? getRandomVibe() : angle;

    try {
      const res = await fetch('/api/daily-prompt/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: effectiveTopic,
          angle: effectiveAngle,
          level,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate options');

      const data = await res.json();
      const result: OptionsResult = {
        question: data.question || '',
        options: data.options || [],
        topic: data.topic || effectiveTopic,
        angle: data.angle || effectiveAngle,
      };
      setV2Options(result);
      setQuestion(result.question);
      return result;
    } catch (err) {
      console.error('Options generation error:', err);
      return null;
    } finally {
      setIsGeneratingOptions(false);
    }
  }

  /**
   * @description Generate v1 (legacy) prompt.
   */
  async function generateV1() {
    setIsGeneratingV1(true);
    setV1Result(null);
    setV1Inspiration(null);

    const effectiveAngle = useRandomAngle ? getRandomVibe() : angle;

    try {
      const res = await fetch('/api/daily-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: effectiveTopic,
          angle: effectiveAngle,
          level,
        }),
      });

      const data = await res.json();
      const result: PromptResult = {
        promptText: data.promptText || '',
        promptQuestion: data.promptQuestion || '',
        promptHint: data.promptHint || '',
        raw: data,
      };
      setV1Result(result);
      return result;
    } catch (err) {
      console.error('v1 generation error:', err);
      return null;
    } finally {
      setIsGeneratingV1(false);
    }
  }

  /**
   * @description Generate v2 (selection) prompt.
   */
  async function generateV2() {
    if (!selection.trim()) {
      alert('Please enter a selection for v2 flow');
      return null;
    }

    setIsGeneratingV2(true);
    setV2Result(null);
    setV2Inspiration(null);

    const effectiveAngle = useRandomAngle ? getRandomVibe() : angle;

    try {
      const res = await fetch('/api/daily-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: effectiveTopic,
          angle: effectiveAngle,
          level,
          question,
          selection: selection.trim(),
        }),
      });

      const data = await res.json();
      const result: PromptResult = {
        promptText: data.promptText || '',
        promptQuestion: data.promptQuestion || '',
        promptHint: data.promptHint || '',
        valid: data.valid,
        reason: data.reason,
        selection: data.selection,
        raw: data,
      };
      setV2Result(result);
      return result;
    } catch (err) {
      console.error('v2 generation error:', err);
      return null;
    } finally {
      setIsGeneratingV2(false);
    }
  }

  /**
   * @description Generate both v1 and v2 prompts and add to history.
   */
  async function generateBoth() {
    const [r1, r2] = await Promise.all([generateV1(), generateV2()]);

    if (r1 || r2) {
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        topic: effectiveTopic,
        level,
        v1: r1 || undefined,
        v2: r2 || undefined,
      };
      setHistory((prev) => [entry, ...prev].slice(0, 20));
    }
  }

  /**
   * @description Fetch inspiration text for a prompt.
   */
  async function fetchInspiration(promptText: string, version: 'v1' | 'v2') {
    const setLoading = version === 'v1' ? setIsLoadingV1Insp : setIsLoadingV2Insp;
    const setInspiration = version === 'v1' ? setV1Inspiration : setV2Inspiration;

    setLoading(true);
    try {
      const res = await fetch('/api/generate-inspiration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });

      const data = await res.json();
      setInspiration(data.backgroundInfo || 'No inspiration generated');
    } catch (err) {
      console.error('Inspiration error:', err);
      setInspiration('Error fetching inspiration');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  const inputClass =
    'w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-600 text-zinc-100 text-sm focus:outline-none focus:border-amber-500';
  const labelClass = 'block text-xs font-medium text-zinc-400 mb-1';
  const buttonClass =
    'px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50';
  const primaryButton = `${buttonClass} bg-amber-600 hover:bg-amber-500 text-white`;
  const secondaryButton = `${buttonClass} bg-zinc-700 hover:bg-zinc-600 text-zinc-100`;

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/home')}
              className="text-zinc-400 hover:text-zinc-200 text-sm"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold text-amber-400">
              Prompt Testing
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-600/20 text-amber-400 border border-amber-600/30">
              DEV
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Input Controls */}
        <section className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-300">
              Shared Inputs
            </h2>
            <button
              onClick={randomizeInputs}
              className="text-xs px-3 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white"
            >
              🎲 Randomize
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Topic */}
            <div>
              <label className={labelClass}>
                Topic
                <label className="ml-2 text-zinc-500">
                  <input
                    type="checkbox"
                    checked={useCustomTopic}
                    onChange={(e) => setUseCustomTopic(e.target.checked)}
                    className="mr-1"
                  />
                  Custom
                </label>
              </label>
              {useCustomTopic ? (
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Enter custom topic..."
                  className={inputClass}
                />
              ) : (
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className={inputClass}
                >
                  {topics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Level */}
            <div>
              <label className={labelClass}>Level</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLevel('paragraph')}
                  className={`flex-1 px-3 py-2 rounded text-sm ${
                    level === 'paragraph'
                      ? 'bg-amber-600 text-white'
                      : 'bg-zinc-700 text-zinc-300'
                  }`}
                >
                  Paragraph
                </button>
                <button
                  onClick={() => setLevel('essay')}
                  className={`flex-1 px-3 py-2 rounded text-sm ${
                    level === 'essay'
                      ? 'bg-amber-600 text-white'
                      : 'bg-zinc-700 text-zinc-300'
                  }`}
                >
                  Essay
                </button>
              </div>
            </div>

            {/* Vibe */}
            <div>
              <label className={labelClass}>
                Vibe
                <label className="ml-2 text-zinc-500">
                  <input
                    type="checkbox"
                    checked={useRandomAngle}
                    onChange={(e) => setUseRandomAngle(e.target.checked)}
                    className="mr-1"
                  />
                  Random
                </label>
              </label>
              <select
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                disabled={useRandomAngle}
                className={`${inputClass} ${useRandomAngle ? 'opacity-50' : ''}`}
              >
                {vibes.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* v2 Selection Flow */}
          <div className="border-t border-zinc-700 pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-zinc-500">
                v2 Selection Flow
              </h3>
              <button
                onClick={generateOptions}
                disabled={isGeneratingOptions}
                className="text-xs px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
              >
                {isGeneratingOptions ? 'Generating...' : '1. Generate Options'}
              </button>
            </div>

            {/* Generated Options Display */}
            {v2Options && (
              <div className="mb-4 p-3 rounded bg-zinc-900 border border-zinc-600">
                <div className="text-xs text-zinc-500 mb-1">Generated Question</div>
                <div className="text-amber-300 font-medium mb-3">
                  {v2Options.question}
                </div>
                <div className="text-xs text-zinc-500 mb-2">
                  Click an option or type custom below:
                </div>
                <div className="flex flex-wrap gap-2">
                  {v2Options.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelection(opt)}
                      className={`text-sm px-3 py-1.5 rounded border transition-colors ${
                        selection === opt
                          ? 'bg-amber-600 border-amber-500 text-white'
                          : 'bg-zinc-800 border-zinc-600 text-zinc-300 hover:border-amber-500'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Question (asked to student)
                  {v2Options && (
                    <span className="ml-2 text-green-500 text-xs">✓ generated</span>
                  )}
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Selection (student's answer)
                  {selection && (
                    <span className="ml-2 text-green-500 text-xs">✓ selected</span>
                  )}
                </label>
                <input
                  type="text"
                  value={selection}
                  onChange={(e) => setSelection(e.target.value)}
                  placeholder="e.g. pepperoni pizza"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Generate Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={generateBoth}
              disabled={isGeneratingV1 || isGeneratingV2 || !selection.trim()}
              className={primaryButton}
            >
              {isGeneratingV1 || isGeneratingV2 ? 'Generating...' : 'Generate Both Prompts'}
            </button>
            <button
              onClick={async () => {
                const r = await generateV1();
                if (r) {
                  setHistory((prev) =>
                    [
                      {
                        id: Date.now().toString(),
                        timestamp: new Date(),
                        topic: effectiveTopic,
                        level,
                        v1: r,
                      },
                      ...prev,
                    ].slice(0, 20)
                  );
                }
              }}
              disabled={isGeneratingV1}
              className={secondaryButton}
            >
              v1 Only
            </button>
            <button
              onClick={async () => {
                const r = await generateV2();
                if (r) {
                  setHistory((prev) =>
                    [
                      {
                        id: Date.now().toString(),
                        timestamp: new Date(),
                        topic: effectiveTopic,
                        level,
                        v2: r,
                        v2Options: v2Options || undefined,
                      },
                      ...prev,
                    ].slice(0, 20)
                  );
                }
              }}
              disabled={isGeneratingV2 || !selection.trim()}
              className={secondaryButton}
            >
              2. Generate v2 Prompt
            </button>
          </div>
        </section>

        {/* Results Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* v1 Result */}
          <ResultCard
            title="v1 Legacy"
            result={v1Result}
            isLoading={isGeneratingV1}
            inspiration={v1Inspiration}
            isLoadingInsp={isLoadingV1Insp}
            onFetchInspiration={() =>
              v1Result && fetchInspiration(v1Result.promptText, 'v1')
            }
            showRaw={showV1Raw}
            onToggleRaw={() => setShowV1Raw(!showV1Raw)}
            onCopy={(text) => copyToClipboard(text, 'v1')}
            copied={copied === 'v1'}
          />

          {/* v2 Result */}
          <ResultCard
            title="v2 Selection Flow"
            result={v2Result}
            options={v2Options}
            isLoading={isGeneratingV2}
            isLoadingOptions={isGeneratingOptions}
            inspiration={v2Inspiration}
            isLoadingInsp={isLoadingV2Insp}
            onFetchInspiration={() =>
              v2Result && fetchInspiration(v2Result.promptText, 'v2')
            }
            showRaw={showV2Raw}
            onToggleRaw={() => setShowV2Raw(!showV2Raw)}
            onCopy={(text) => copyToClipboard(text, 'v2')}
            copied={copied === 'v2'}
            showValidation
          />
        </div>

        {/* History */}
        {history.length > 0 && (
          <section className="bg-zinc-800/50 rounded-lg border border-zinc-700">
            <div className="px-4 py-3 border-b border-zinc-700 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-300">
                Session History ({history.length})
              </h2>
              <button
                onClick={() => setHistory([])}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Clear
              </button>
            </div>
            <div className="divide-y divide-zinc-700/50 max-h-64 overflow-y-auto">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="px-4 py-3 text-sm hover:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-3 text-zinc-400 mb-1">
                    <span className="text-xs font-mono">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="text-amber-400">{entry.topic}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-700">
                      {entry.level}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-zinc-500">v1: </span>
                      <span className="text-zinc-300">
                        {entry.v1?.promptQuestion?.slice(0, 60) || '—'}
                        {(entry.v1?.promptQuestion?.length || 0) > 60 && '...'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">v2: </span>
                      <span className="text-zinc-300">
                        {entry.v2?.valid === false
                          ? `❌ ${entry.v2.reason}`
                          : entry.v2?.promptQuestion?.slice(0, 60) || '—'}
                        {entry.v2?.valid !== false &&
                          (entry.v2?.promptQuestion?.length || 0) > 60 &&
                          '...'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

interface ResultCardProps {
  title: string;
  result: PromptResult | null;
  options?: OptionsResult | null;
  isLoading: boolean;
  isLoadingOptions?: boolean;
  inspiration: string | null;
  isLoadingInsp: boolean;
  onFetchInspiration: () => void;
  showRaw: boolean;
  onToggleRaw: () => void;
  onCopy: (text: string) => void;
  copied: boolean;
  showValidation?: boolean;
}

/**
 * @description Card component for displaying prompt generation results.
 */
function ResultCard({
  title,
  result,
  options,
  isLoading,
  isLoadingOptions,
  inspiration,
  isLoadingInsp,
  onFetchInspiration,
  showRaw,
  onToggleRaw,
  onCopy,
  copied,
  showValidation,
}: ResultCardProps) {
  const hasContent = result || options || isLoading || isLoadingOptions;

  return (
    <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 flex flex-col">
      <div className="px-4 py-3 border-b border-zinc-700">
        <h2 className="text-sm font-semibold text-zinc-300">{title}</h2>
      </div>

      <div className="p-4 flex-1">
        {isLoadingOptions ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-zinc-500 animate-pulse">Generating options...</div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-zinc-500 animate-pulse">Generating prompt...</div>
          </div>
        ) : hasContent ? (
          <div className="space-y-4">
            {/* Step 1: Options (for v2) */}
            {options && (
              <div className="pb-4 border-b border-zinc-700">
                <div className="text-xs text-blue-400 font-medium mb-2">
                  Step 1: Generated Options
                </div>
                <div className="text-xs text-zinc-500 mb-1">Question Asked</div>
                <div className="text-zinc-300 mb-2">{options.question}</div>
                <div className="text-xs text-zinc-500 mb-1">Available Options</div>
                <div className="flex flex-wrap gap-1">
                  {options.options.map((opt, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded bg-zinc-700 text-zinc-300"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Generated Prompt */}
            {result && (
              <>
                {options && (
                  <div className="text-xs text-amber-400 font-medium">
                    Step 2: Generated Prompt
                  </div>
                )}

                {/* Validation status for v2 */}
                {showValidation && result.valid !== undefined && (
                  <div
                    className={`text-sm px-3 py-2 rounded ${
                      result.valid
                        ? 'bg-green-900/30 text-green-400 border border-green-700/50'
                        : 'bg-red-900/30 text-red-400 border border-red-700/50'
                    }`}
                  >
                    {result.valid ? '✓ Valid' : `✗ Invalid: ${result.reason}`}
                  </div>
                )}

                {/* Question */}
                {result.promptQuestion && (
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Prompt Question</div>
                    <div className="text-amber-300 font-medium">
                      {result.promptQuestion}
                    </div>
                  </div>
                )}

                {/* Hint */}
                {result.promptHint && (
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Prompt Hint</div>
                    <div className="text-zinc-300">{result.promptHint}</div>
                  </div>
                )}

                {/* Selection echo for v2 */}
                {result.selection && (
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Selection Used</div>
                    <div className="text-zinc-400 italic">"{result.selection}"</div>
                  </div>
                )}
              </>
            )}

            {/* Waiting for step 2 */}
            {options && !result && (
              <div className="text-xs text-zinc-500 italic">
                Select an option above, then click "2. Generate v2 Prompt"
              </div>
            )}

            {/* Inspiration */}
            {inspiration && (
              <div className="mt-4 pt-4 border-t border-zinc-700">
                <div className="text-xs text-zinc-500 mb-1">Inspiration</div>
                <div className="text-zinc-400 text-sm">{inspiration}</div>
              </div>
            )}

            {/* Raw JSON */}
            {showRaw && result && (
              <div className="mt-4 pt-4 border-t border-zinc-700">
                <div className="text-xs text-zinc-500 mb-1">Raw Response</div>
                <pre className="text-xs bg-zinc-900 p-3 rounded overflow-x-auto text-zinc-400">
                  {JSON.stringify(result.raw, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-zinc-600">
            No result yet
          </div>
        )}
      </div>

      {/* Actions */}
      {result && (
        <div className="px-4 py-3 border-t border-zinc-700 flex gap-2">
          <button
            onClick={() => onCopy(result.promptText)}
            className="text-xs px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button
            onClick={onFetchInspiration}
            disabled={isLoadingInsp || !!inspiration}
            className="text-xs px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300 disabled:opacity-50"
          >
            {isLoadingInsp ? 'Loading...' : inspiration ? '✓ Inspiration' : '+ Inspiration'}
          </button>
          <button
            onClick={onToggleRaw}
            className="text-xs px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
          >
            {showRaw ? 'Hide Raw' : 'Show Raw'}
          </button>
        </div>
      )}
    </div>
  );
}

