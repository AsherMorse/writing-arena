'use client';

/**
 * @fileoverview Test page for iterating on grader integration.
 * Allows grading essays/paragraphs without going through ranked match flow.
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { saveGradingResult } from '@/lib/services/grading-history';
import { WritingFeedback } from '@/components/ranked/results-v2/WritingFeedback';
import { WritingFeedbackFlat } from '@/components/ranked/results-v2/WritingFeedbackFlat';
import HighlightedText from '@/components/shared/HighlightedText';
import { extractAndLocateSpans } from '@/lib/grading/text-highlighting';

const SAMPLE_PARAGRAPH = `The dog ran fast because it was chasing a squirrel through the park. The squirrel was very clever, and it quickly climbed up a tall oak tree to escape. The dog barked loudly at the base of the tree, but it could not reach the squirrel. In conclusion, the squirrel outsmarted the dog by using its climbing abilities.`;

const SAMPLE_ESSAY = `Dogs make excellent pets for many reasons. First, they provide companionship and unconditional love to their owners. A dog will always be happy to see you when you come home, wagging its tail with excitement.

Second, dogs encourage physical activity. Owners need to walk their dogs regularly, which helps both the pet and the person stay healthy. Studies show that dog owners are more likely to meet daily exercise requirements.

Third, dogs can improve mental health. Petting a dog has been shown to reduce stress and anxiety. Many therapy dogs visit hospitals and nursing homes to bring comfort to patients.

In conclusion, dogs are wonderful companions that benefit their owners physically and emotionally. Anyone considering a pet should seriously consider adopting a dog.`;

/**
 * @description Component to display student writing with highlighted spans.
 */
function HighlightedWritingSection({ content, result }: { content: string; result: any }) {
  const { improvementSpans, strengthSpans } = useMemo(() => {
    if (!result) return { improvementSpans: [], strengthSpans: [] };

    const improvements = extractAndLocateSpans(result.improvements || [], content);
    const strengths = extractAndLocateSpans(result.strengths || [], content);

    return { improvementSpans: improvements, strengthSpans: strengths };
  }, [content, result]);

  const totalHighlights = improvementSpans.length + strengthSpans.length;

  return (
    <div className="mb-8 rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.025)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[rgba(255,255,255,0.8)]">📝 Your Writing</h2>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: 'rgba(255, 224, 102, 0.5)' }} />
            <span className="text-[rgba(255,255,255,0.5)]">Improvements ({improvementSpans.length})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: 'rgba(0, 212, 146, 0.4)' }} />
            <span className="text-[rgba(255,255,255,0.5)]">Strengths ({strengthSpans.length})</span>
          </span>
        </div>
      </div>

      {totalHighlights > 0 ? (
        <HighlightedText
          text={content}
          improvements={improvementSpans}
          strengths={strengthSpans}
          className="rounded-[10px] bg-[#101012] p-4 text-sm leading-relaxed text-[rgba(255,255,255,0.7)] font-mono"
          showTooltips={true}
        />
      ) : (
        <div className="rounded-[10px] bg-[#101012] p-4">
          <p className="text-sm leading-relaxed text-[rgba(255,255,255,0.7)] font-mono whitespace-pre-wrap">
            {content}
          </p>
          <p className="mt-3 text-xs text-[rgba(255,255,255,0.4)] italic">
            No highlights found. The grader may not have returned quotes in the expected format.
          </p>
        </div>
      )}
    </div>
  );
}

export default function TestGraderPage() {
  const { user } = useAuth();
  const [content, setContent] = useState(SAMPLE_PARAGRAPH);
  const [prompt, setPrompt] = useState('Write about an animal interaction');
  const [graderType, setGraderType] = useState<'paragraph' | 'essay'>('paragraph');
  const [gradeLevel, setGradeLevel] = useState(8);
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedbackVersion, setFeedbackVersion] = useState<'category' | 'flat'>('category');
  const [isFullWidthPreview, setIsFullWidthPreview] = useState(false);

  const handleGrade = async () => {
    if (!user) {
      setError('You must be logged in to grade');
      return;
    }

    setIsGrading(true);
    setError(null);
    setResult(null);

    const testMatchId = `test-${Date.now()}`;

    try {
      // Step 1: Call grading API
      const response = await fetch('/api/grade-revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: testMatchId,
          userId: user.uid,
          content,
          prompt,
          graderType,
          gradeLevel: graderType === 'essay' ? gradeLevel : undefined,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Grading failed');
      }

      // Step 2: Save to Firestore (client-side)
      const gradingId = await saveGradingResult(user.uid, {
        matchId: testMatchId,
        phase: 3,
        graderType: data.graderType,
        scorecard: data.scorecard,
        gaps: data.gaps,
        hasSevereGap: data.hasSevereGap,
        writingContent: content,
        prompt,
        strengths: data.strengths || [],
        improvements: data.improvements || [],
        overallFeedback: data.overallFeedback || '',
      });

      setResult({ ...data, gradingId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsGrading(false);
    }
  };

  const loadSample = (type: 'paragraph' | 'essay') => {
    setGraderType(type);
    setContent(type === 'paragraph' ? SAMPLE_PARAGRAPH : SAMPLE_ESSAY);
    setPrompt(type === 'paragraph' ? 'Write about an animal interaction' : 'Write about why dogs make good pets');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#101012] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Test Grader</h1>
          <p className="text-[rgba(255,255,255,0.6)] mb-4">Please log in to use the test grader</p>
          <Link href="/auth" className="text-[#00e5e5] hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101012] text-[rgba(255,255,255,0.8)]">
      <header className="border-b border-[rgba(255,255,255,0.05)]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-5">
          <h1 className="text-lg font-semibold">🧪 Test Grader</h1>
          <Link
            href="/dashboard"
            className="rounded-[10px] border border-[rgba(255,255,255,0.05)] px-4 py-2 text-xs font-medium uppercase tracking-[0.04em] text-[rgba(255,255,255,0.4)] transition-all hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-8 py-8">
        {/* Full Width Preview Mode */}
        {isFullWidthPreview && result ? (
          <div className="mx-auto max-w-[1100px]">
            {/* Back Button */}
            <button
              onClick={() => setIsFullWidthPreview(false)}
              className="mb-6 flex items-center gap-2 rounded-[10px] border border-[rgba(255,255,255,0.1)] px-4 py-2 text-sm text-[rgba(255,255,255,0.6)] transition hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
            >
              ← Back to Editor
            </button>

            {/* Version Toggle */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[rgba(255,255,255,0.8)]">Full Width Preview</h2>
              <div className="flex rounded-lg border border-[rgba(255,255,255,0.1)] overflow-hidden">
                <button
                  onClick={() => setFeedbackVersion('category')}
                  className={`px-4 py-2 text-sm font-medium transition ${
                    feedbackVersion === 'category'
                      ? 'bg-[#00e5e5] text-[#101012]'
                      : 'text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.05)]'
                  }`}
                >
                  Category (New)
                </button>
                <button
                  onClick={() => setFeedbackVersion('flat')}
                  className={`px-4 py-2 text-sm font-medium transition ${
                    feedbackVersion === 'flat'
                      ? 'bg-[#00e5e5] text-[#101012]'
                      : 'text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.05)]'
                  }`}
                >
                  Flat (Old)
                </button>
              </div>
            </div>

            {/* Your Writing with Highlights */}
            <HighlightedWritingSection content={content} result={result} />

            {/* Full Width Feedback */}
            {feedbackVersion === 'category' ? (
              <WritingFeedback
                graderType={result.graderType}
                scorecard={result.scorecard}
                gaps={result.gaps || []}
                strengths={result.strengths || []}
                improvements={result.improvements || []}
                overallFeedback={result.overallFeedback || ''}
              />
            ) : (
              <WritingFeedbackFlat
                graderType={result.graderType}
                scorecard={result.scorecard}
                gaps={result.gaps || []}
                strengths={result.strengths || []}
                improvements={result.improvements || []}
                overallFeedback={result.overallFeedback || ''}
              />
            )}
          </div>
        ) : (
          /* Normal 2-Column Layout */
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input Section */}
            <div className="space-y-6">
            <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
                Configuration
              </h2>

              {/* Quick Load Buttons */}
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => loadSample('paragraph')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    graderType === 'paragraph'
                      ? 'bg-[#00e5e5] text-[#101012]'
                      : 'border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)]'
                  }`}
                >
                  Paragraph Grader
                </button>
                <button
                  onClick={() => loadSample('essay')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    graderType === 'essay'
                      ? 'bg-[#00e5e5] text-[#101012]'
                      : 'border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)]'
                  }`}
                >
                  Essay Grader
                </button>
              </div>

              {/* Grade Level (Essay only) */}
              {graderType === 'essay' && (
                <div className="mb-4">
                  <label className="mb-2 block text-xs text-[rgba(255,255,255,0.5)]">Grade Level</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(Number(e.target.value))}
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#101012] px-4 py-2 text-sm text-white"
                  >
                    {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Prompt */}
              <div className="mb-4">
                <label className="mb-2 block text-xs text-[rgba(255,255,255,0.5)]">Writing Prompt</label>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#101012] px-4 py-2 text-sm text-white placeholder-[rgba(255,255,255,0.3)]"
                  placeholder="Enter the writing prompt..."
                />
              </div>

              {/* Content */}
              <div className="mb-4">
                <label className="mb-2 block text-xs text-[rgba(255,255,255,0.5)]">
                  Content to Grade ({content.split(/\s+/).filter(Boolean).length} words)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#101012] px-4 py-3 text-sm text-white placeholder-[rgba(255,255,255,0.3)] font-mono"
                  placeholder="Paste or type content to grade..."
                />
              </div>

              {/* Grade Button */}
              <button
                onClick={handleGrade}
                disabled={isGrading || !content.trim()}
                className={`w-full rounded-lg py-3 text-sm font-semibold uppercase tracking-wider transition ${
                  isGrading || !content.trim()
                    ? 'cursor-not-allowed bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.3)]'
                    : 'bg-[#00e5e5] text-[#101012] hover:bg-[#33ebeb]'
                }`}
              >
                {isGrading ? 'Grading...' : 'Grade Content'}
              </button>

              {/* User Info */}
              <p className="mt-3 text-center text-xs text-[rgba(255,255,255,0.4)]">
                Grading as: {user.email || user.uid}
              </p>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {error && (
              <div className="rounded-[14px] border border-[rgba(255,95,143,0.3)] bg-[rgba(255,95,143,0.1)] p-6">
                <h3 className="mb-2 font-semibold text-[#ff5f8f]">Error</h3>
                <p className="text-sm text-[rgba(255,255,255,0.7)]">{error}</p>
              </div>
            )}

            {result && (
              <>
                {/* Score Summary */}
                <div className="rounded-[14px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.05)] p-6">
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#00e5e5]">
                    Grading Result
                  </h2>
                  
                  <div className="mb-4 text-center">
                    <div className="text-4xl font-bold text-[#00e5e5]">
                      {result.scorecard?.percentageScore}%
                    </div>
                    <div className="text-sm text-[rgba(255,255,255,0.5)]">
                      {graderType === 'paragraph'
                        ? `${result.scorecard?.totalScore}/${result.scorecard?.maxScore} points`
                        : `${result.scorecard?.totalPoints}/${result.scorecard?.maxPoints} points`}
                    </div>
                  </div>

                  {result.hasSevereGap && (
                    <div className="mb-4 rounded-lg bg-[rgba(255,95,143,0.2)] p-3 text-center text-sm text-[#ff5f8f]">
                      ⚠️ Severe gap detected - practice required
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsFullWidthPreview(true)}
                      className="flex-1 rounded-lg bg-[#00e5e5] py-2 text-center text-sm font-semibold text-[#101012] transition hover:bg-[#33ebeb]"
                    >
                      Full Width Preview ↔
                    </button>
                    <Link
                      href={`/ranked/results-v2?matchId=${result.gradingId}`}
                      className="rounded-lg border border-[rgba(255,255,255,0.1)] px-4 py-2 text-center text-sm font-medium text-[rgba(255,255,255,0.6)] transition hover:bg-[rgba(255,255,255,0.05)]"
                    >
                      Results Page →
                    </Link>
                  </div>
                </div>

                {/* Student-Friendly Feedback */}
                <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">
                      Student Feedback Preview
                    </h3>
                    {/* Version Toggle */}
                    <div className="flex rounded-lg border border-[rgba(255,255,255,0.1)] overflow-hidden">
                      <button
                        onClick={() => setFeedbackVersion('category')}
                        className={`px-3 py-1.5 text-xs font-medium transition ${
                          feedbackVersion === 'category'
                            ? 'bg-[#00e5e5] text-[#101012]'
                            : 'text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.05)]'
                        }`}
                      >
                        Category (New)
                      </button>
                      <button
                        onClick={() => setFeedbackVersion('flat')}
                        className={`px-3 py-1.5 text-xs font-medium transition ${
                          feedbackVersion === 'flat'
                            ? 'bg-[#00e5e5] text-[#101012]'
                            : 'text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.05)]'
                        }`}
                      >
                        Flat (Old)
                      </button>
                    </div>
                  </div>
                  
                  {feedbackVersion === 'category' ? (
                    <WritingFeedback
                      graderType={result.graderType}
                      scorecard={result.scorecard}
                      gaps={result.gaps || []}
                      strengths={result.strengths || []}
                      improvements={result.improvements || []}
                      overallFeedback={result.overallFeedback || ''}
                    />
                  ) : (
                    <WritingFeedbackFlat
                      graderType={result.graderType}
                      scorecard={result.scorecard}
                      gaps={result.gaps || []}
                      strengths={result.strengths || []}
                      improvements={result.improvements || []}
                      overallFeedback={result.overallFeedback || ''}
                    />
                  )}
                </div>

                {/* Gaps */}
                {result.gaps?.length > 0 && (
                  <div className="rounded-[14px] border border-[rgba(255,144,48,0.2)] bg-[rgba(255,144,48,0.05)] p-6">
                    <h3 className="mb-3 text-sm font-semibold text-[#ff9030]">Skill Gaps ({result.gaps.length})</h3>
                    <div className="space-y-2">
                      {result.gaps.map((gap: any, i: number) => (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-[#101012] p-3">
                          <span className="text-sm">{gap.category || gap.criterion}</span>
                          <span className={`text-xs font-semibold uppercase ${
                            gap.severity === 'high' ? 'text-[#ff5f8f]' : 'text-[#ff9030]'
                          }`}>
                            {gap.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full JSON */}
                <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
                  <h3 className="mb-3 text-sm font-semibold text-[rgba(255,255,255,0.4)]">Full Response (Debug)</h3>
                  <pre className="max-h-[400px] overflow-auto rounded-lg bg-[#101012] p-4 text-xs text-[rgba(255,255,255,0.6)]">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </>
            )}

            {!result && !error && (
              <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6 text-center">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-sm text-[rgba(255,255,255,0.5)]">
                  Click "Grade Content" to test the grader
                </p>
              </div>
            )}
          </div>
        </div>
        )}
      </main>
    </div>
  );
}

