/**
 * @fileoverview Match history page showing all past ranked submissions.
 * Displays submissions grouped by date with scores and LP earned.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/shared/LoadingState';
import { ParchmentCard } from '@/app/_components/ParchmentCard';
import { ParchmentButton } from '@/app/_components/ParchmentButton';
import { getParchmentTextStyle, getParchmentContainerStyle, PaperTexture } from '@/app/_components/parchment-styles';
import { getAllUserSubmissions } from '@/lib/services/ranked-submissions';
import type { RankedSubmission } from '@/lib/types';

/**
 * @description Groups submissions by date string (YYYY-MM-DD).
 */
function groupByDate(submissions: RankedSubmission[]): Map<string, RankedSubmission[]> {
  const groups = new Map<string, RankedSubmission[]>();
  
  for (const submission of submissions) {
    // Extract date from promptId (format: paragraph-YYYY-MM-DD-N)
    const match = submission.promptId?.match(/\d{4}-\d{2}-\d{2}/);
    const dateStr = match ? match[0] : 'Unknown';
    
    const existing = groups.get(dateStr) || [];
    existing.push(submission);
    groups.set(dateStr, existing);
  }
  
  return groups;
}

/**
 * @description Formats a date string for display.
 */
function formatDateDisplay(dateStr: string): string {
  if (dateStr === 'Unknown') return 'Unknown Date';
  
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<RankedSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<RankedSubmission | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getAllUserSubmissions(user.uid, 100);
      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchHistory();
    }
  }, [user, authLoading, fetchHistory]);

  if (authLoading || isLoading) {
    return <LoadingState message="Loading match history..." />;
  }

  if (!user) {
    return null;
  }

  const groupedSubmissions = groupByDate(submissions);
  const dateKeys = Array.from(groupedSubmissions.keys()).sort().reverse();

  // Calculate totals
  const totalMatches = submissions.length;
  const totalLP = submissions.reduce((sum, s) => sum + (s.lpEarned || 0), 0);
  const avgScore = totalMatches > 0
    ? Math.round(submissions.reduce((sum, s) => sum + (s.revisedScore ?? s.originalScore), 0) / totalMatches)
    : 0;

  return (
    <div className="relative min-h-screen">
      <Image
        src="/images/backgrounds/battle.webp"
        alt=""
        fill
        className="object-cover"
        priority
      />

      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="p-4">
          <button
            onClick={() => router.push('/home')}
            className="font-memento text-sm uppercase tracking-wider"
            style={{ color: 'rgba(245, 230, 184, 0.6)' }}
          >
            ← Back to Home
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl space-y-4">
            {/* Header */}
            <div className="flex gap-4 items-stretch">
              <div className="flex-1">
                <ParchmentCard className="h-full flex items-center">
                  <h1
                    className="font-memento text-2xl tracking-wide"
                    style={getParchmentTextStyle()}
                  >
                    Match History
                  </h1>
                </ParchmentCard>
              </div>
              <div className="shrink-0">
                <ParchmentCard className="h-full flex items-center justify-center px-6">
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div
                        className="font-dutch809 text-2xl"
                        style={getParchmentTextStyle()}
                      >
                        {totalMatches}
                      </div>
                      <div
                        className="font-avenir text-xs"
                        style={getParchmentTextStyle()}
                      >
                        matches
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="font-dutch809 text-2xl"
                        style={getParchmentTextStyle()}
                      >
                        {avgScore}%
                      </div>
                      <div
                        className="font-avenir text-xs"
                        style={getParchmentTextStyle()}
                      >
                        avg score
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="font-dutch809 text-2xl"
                        style={getParchmentTextStyle()}
                      >
                        {totalLP.toLocaleString()}
                      </div>
                      <div
                        className="font-avenir text-xs"
                        style={getParchmentTextStyle()}
                      >
                        LP earned
                      </div>
                    </div>
                  </div>
                </ParchmentCard>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <ParchmentCard>
                <div className="text-center py-4">
                  <p className="text-red-600 mb-4">{error}</p>
                  <ParchmentButton onClick={fetchHistory}>Try Again</ParchmentButton>
                </div>
              </ParchmentCard>
            )}

            {/* Empty state */}
            {!error && submissions.length === 0 && (
              <ParchmentCard>
                <div className="text-center py-8">
                  <p
                    className="font-avenir text-lg mb-2"
                    style={getParchmentTextStyle()}
                  >
                    No matches yet!
                  </p>
                  <p
                    className="font-avenir text-sm mb-6"
                    style={{ ...getParchmentTextStyle(), opacity: 0.7 }}
                  >
                    Complete your first daily challenge to see your history here.
                  </p>
                  <ParchmentButton
                    onClick={() => router.push('/ranked')}
                    variant="golden"
                  >
                    Start a Challenge
                  </ParchmentButton>
                </div>
              </ParchmentCard>
            )}

            {/* Submissions grouped by date */}
            {dateKeys.map((dateStr) => {
              const daySubmissions = groupedSubmissions.get(dateStr) || [];
              const dayLP = daySubmissions.reduce((sum, s) => sum + (s.lpEarned || 0), 0);

              return (
                <div key={dateStr} className="space-y-2">
                  {/* Date header */}
                  <div className="flex items-center justify-between px-2">
                    <h2
                      className="font-memento text-lg tracking-wide"
                      style={{
                        color: '#f6d493',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                      }}
                    >
                      {formatDateDisplay(dateStr)}
                    </h2>
                    <span
                      className="font-avenir text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        color: dayLP >= 0 ? 'rgba(245, 230, 184, 0.9)' : 'rgba(255, 100, 100, 0.9)',
                        backgroundColor: dayLP >= 0 ? 'rgba(245, 230, 184, 0.15)' : 'rgba(255, 100, 100, 0.15)',
                        border: `1px solid ${dayLP >= 0 ? 'rgba(245, 230, 184, 0.25)' : 'rgba(255, 100, 100, 0.25)'}`
                      }}
                    >
                      {dayLP >= 0 ? '+' : ''}{dayLP} LP
                    </span>
                  </div>

                  {/* Submissions for this date */}
                  {daySubmissions.map((submission, index) => (
                    <SubmissionCard
                      key={submission.id}
                      submission={submission}
                      index={index + 1}
                      onView={() => setSelectedSubmission(submission)}
                    />
                  ))}
                </div>
              );
            })}

            {/* Back button at bottom */}
            {submissions.length > 0 && (
              <div className="flex justify-center pt-4 pb-8">
                <ParchmentButton onClick={() => router.push('/home')}>
                  Back to Home
                </ParchmentButton>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Response Modal */}
      {selectedSubmission && (
        <ResponseModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
}

interface SubmissionCardProps {
  submission: RankedSubmission;
  index: number;
  onView: () => void;
}

/**
 * @description Card displaying a single submission's details with view button.
 */
function SubmissionCard({ submission, index, onView }: SubmissionCardProps) {
  const score = submission.revisedScore ?? submission.originalScore;
  const improved = submission.revisedScore !== undefined && 
    submission.revisedScore > submission.originalScore;
  const hasContent = !!submission.originalContent;

  return (
    <ParchmentCard>
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="flex items-center gap-2">
            <span
              className="font-memento text-base tracking-wide"
              style={getParchmentTextStyle()}
            >
              Challenge #{index}
            </span>
            {submission.lpEarned !== undefined && (
              <span
                className="font-avenir text-xs px-2 py-0.5 rounded"
                style={{
                  background: submission.lpEarned >= 0 
                    ? 'rgba(212, 168, 75, 0.3)' 
                    : 'rgba(220, 38, 38, 0.2)',
                  color: submission.lpEarned >= 0 ? '#8b6334' : '#dc2626',
                }}
              >
                {submission.lpEarned >= 0 ? '+' : ''}{submission.lpEarned} LP
              </span>
            )}
          </div>
          {submission.promptText && (
            <p
              className="font-avenir text-sm mt-1 line-clamp-2"
              style={{ ...getParchmentTextStyle(), opacity: 0.8 }}
            >
              {submission.promptText}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div
              className="font-dutch809 text-2xl"
              style={getParchmentTextStyle()}
            >
              {score}%
            </div>
            {improved && (
              <div
                className="font-avenir text-xs"
                style={{ color: '#16a34a' }}
              >
                {submission.originalScore}% → {submission.revisedScore}%
              </div>
            )}
          </div>
          {hasContent && (
            <button
              onClick={onView}
              className="px-3 py-1.5 rounded text-sm font-semibold transition hover:scale-105"
              style={{
                background: 'rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(42, 31, 20, 0.3)',
                ...getParchmentTextStyle(),
              }}
            >
              View
            </button>
          )}
        </div>
      </div>
    </ParchmentCard>
  );
}

interface ResponseModalProps {
  submission: RankedSubmission;
  onClose: () => void;
}

/**
 * @description Modal displaying a submission's full content with parchment styling.
 */
function ResponseModal({ submission, onClose }: ResponseModalProps) {
  const improved = submission.revisedScore !== undefined && 
    submission.revisedScore > submission.originalScore;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-xl p-6"
        style={getParchmentContainerStyle()}
        onClick={(e) => e.stopPropagation()}
      >
        <PaperTexture borderRadius="xl" />
        <div className="relative z-10 max-h-[calc(80vh-48px)] overflow-y-auto parchment-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-dutch809 text-xl" style={getParchmentTextStyle()}>
              Your Response
            </h3>
            <ParchmentButton onClick={onClose} className="!px-4 !py-1 !text-sm">
              Close
            </ParchmentButton>
          </div>

          {/* Scores */}
          <div className="flex gap-4 mb-4 text-sm" style={getParchmentTextStyle()}>
            <span>Original: <strong>{submission.originalScore}%</strong></span>
            {submission.revisedScore !== undefined && (
              <span>
                Revised:{' '}
                <strong style={{ color: improved ? '#16a34a' : '#d97706' }}>
                  {submission.revisedScore}%
                </strong>
              </span>
            )}
            {submission.lpEarned !== undefined && (
              <span style={{ color: submission.lpEarned >= 0 ? '#8b6334' : '#dc2626' }}>
                {submission.lpEarned >= 0 ? '+' : ''}{submission.lpEarned} LP
              </span>
            )}
          </div>

          {/* Prompt */}
          {submission.promptText && (
            <div className="mb-4">
              <h4 className="font-avenir text-sm mb-2" style={{ ...getParchmentTextStyle(), opacity: 0.7 }}>
                Prompt
              </h4>
              <div
                className="p-3 rounded-lg font-avenir text-sm leading-relaxed italic"
                style={{
                  background: 'rgba(200, 148, 21, 0.15)',
                  border: '1px solid rgba(200, 148, 21, 0.3)',
                  ...getParchmentTextStyle(),
                }}
              >
                &ldquo;{submission.promptText}&rdquo;
              </div>
            </div>
          )}

          {/* Original Submission */}
          {submission.originalContent && (
            <div className="mb-4">
              <h4 className="font-avenir text-sm mb-2" style={{ ...getParchmentTextStyle(), opacity: 0.7 }}>
                Original Submission
              </h4>
              <div
                className="p-4 rounded-lg font-avenir text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                  background: 'rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(42, 31, 20, 0.3)',
                  ...getParchmentTextStyle(),
                }}
              >
                {submission.originalContent}
              </div>
            </div>
          )}

          {/* Revised Submission */}
          {submission.revisedContent && submission.revisedContent !== submission.originalContent && (
            <div>
              <h4 className="font-avenir text-sm mb-2" style={{ ...getParchmentTextStyle(), opacity: 0.7 }}>
                Revised Submission
              </h4>
              <div
                className="p-4 rounded-lg font-avenir text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                  background: 'rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(22, 163, 74, 0.3)',
                  ...getParchmentTextStyle(),
                }}
              >
                {submission.revisedContent}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


