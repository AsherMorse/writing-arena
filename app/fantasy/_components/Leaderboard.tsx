/**
 * @fileoverview Leaderboard component with parchment-styled fantasy UI.
 * Displays ranked submissions for daily challenges.
 */
'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard, type LeaderboardData, type LeaderboardEntry } from '@/lib/services/ranked-leaderboard';
import { ParchmentCard } from './ParchmentCard';
import { ParchmentButton } from './ParchmentButton';
import { getParchmentTextStyle, getParchmentContainerStyle, PaperTexture } from './parchment-styles';

interface LeaderboardProps {
  promptId: string;
  userId?: string;
}

const RANK_COLORS: Record<number, string> = {
  1: '#b8860b', // Dark gold for parchment
  2: '#6b7280', // Silver/gray
  3: '#92400e', // Bronze/amber
};

const RANK_LABELS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

/**
 * @description Modal displaying a user's submission content with parchment styling.
 */
function SubmissionModal({
  entry,
  onClose,
}: {
  entry: LeaderboardEntry;
  onClose: () => void;
}) {
  const rankColor = RANK_COLORS[entry.rank] || '#2d2d2d';

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{RANK_LABELS[entry.rank]}</span>
              <h3 className="font-dutch809 text-xl" style={{ ...getParchmentTextStyle(), color: rankColor }}>
                {entry.displayName}
              </h3>
            </div>
            <ParchmentButton onClick={onClose} className="!px-4 !py-1 !text-sm">
              Close
            </ParchmentButton>
          </div>

          <div className="flex gap-4 mb-4 text-sm" style={getParchmentTextStyle()}>
            <span>Original: <strong>{entry.originalScore}%</strong></span>
            {entry.revisedScore !== undefined && (
              <span>
                Revised:{' '}
                <strong style={{ color: entry.revisedScore > entry.originalScore ? '#16a34a' : '#d97706' }}>
                  {entry.revisedScore}%
                </strong>
              </span>
            )}
          </div>

          {entry.originalContent && (
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
                {entry.originalContent}
              </div>
            </div>
          )}

          {entry.revisedContent && entry.revisedContent !== entry.originalContent && (
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
                {entry.revisedContent}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * @description Single leaderboard entry row with parchment styling.
 */
function LeaderboardEntryRow({
  entry,
  onViewSubmission,
}: {
  entry: LeaderboardEntry;
  onViewSubmission?: (entry: LeaderboardEntry) => void;
}) {
  const isTopThree = entry.rank <= 3;
  const rankColor = RANK_COLORS[entry.rank] || '#2d2d2d';
  const hasContent = !!entry.originalContent;

  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-lg transition-all"
      style={{
        background: entry.isCurrentUser
          ? 'rgba(200, 148, 21, 0.25)'
          : 'rgba(0, 0, 0, 0.06)',
        border: entry.isCurrentUser
          ? '1px solid rgba(42, 31, 20, 0.5)'
          : '1px solid rgba(42, 31, 20, 0.15)',
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="font-dutch809 text-lg w-8 text-center"
          style={{ color: rankColor }}
        >
          {isTopThree ? RANK_LABELS[entry.rank] : `#${entry.rank}`}
        </span>
        <span
          className="font-avenir"
          style={{ 
            ...getParchmentTextStyle(),
            fontWeight: entry.isCurrentUser ? 600 : 400,
          }}
        >
          {entry.displayName}
          {entry.isCurrentUser && (
            <span className="ml-2 text-xs" style={{ opacity: 0.7 }}>
              (You)
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-4 text-right">
        <div style={getParchmentTextStyle()}>
          <span className="font-avenir text-sm" style={{ opacity: 0.6 }}>
            Score:{' '}
          </span>
          <span className="font-avenir font-semibold">
            {entry.originalScore}%
          </span>
        </div>
        {entry.revisedScore !== undefined && entry.revisedScore !== entry.originalScore && (
          <div style={getParchmentTextStyle()}>
            <span className="font-avenir text-sm" style={{ opacity: 0.6 }}>
              →{' '}
            </span>
            <span
              className="font-avenir font-semibold"
              style={{
                color: entry.revisedScore > entry.originalScore ? '#16a34a' : '#d97706',
              }}
            >
              {entry.revisedScore}%
            </span>
          </div>
        )}
        {hasContent && onViewSubmission && (
          <button
            onClick={() => onViewSubmission(entry)}
            className="px-2 py-1 rounded text-xs font-semibold transition hover:scale-105"
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
  );
}

/**
 * @description Leaderboard component displaying ranked submissions with parchment styling.
 */
export function Leaderboard({ promptId, userId }: LeaderboardProps) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);

      try {
        const leaderboardData = await getLeaderboard(promptId, userId);
        setData(leaderboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [promptId, userId]);

  if (loading) {
    return (
      <ParchmentCard className="text-center py-4">
        <p className="font-avenir" style={getParchmentTextStyle()}>
          Loading leaderboard...
        </p>
      </ParchmentCard>
    );
  }

  if (error) {
    return (
      <ParchmentCard className="text-center py-4">
        <p className="font-avenir" style={{ ...getParchmentTextStyle(), color: '#b91c1c' }}>
          {error}
        </p>
      </ParchmentCard>
    );
  }

  if (!data || data.totalSubmissions === 0) {
    return (
      <ParchmentCard className="text-center py-4">
        <p className="font-avenir" style={getParchmentTextStyle()}>
          No submissions yet. Be the first!
        </p>
      </ParchmentCard>
    );
  }

  return (
    <ParchmentCard>
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-memento text-lg uppercase tracking-wider"
          style={getParchmentTextStyle()}
        >
          Leaderboard
        </h3>
        <span
          className="font-avenir text-sm"
          style={{ ...getParchmentTextStyle(), opacity: 0.6 }}
        >
          {data.totalSubmissions} submission{data.totalSubmissions !== 1 ? 's' : ''}
        </span>
      </div>

      {data.userRank !== null && (
        <div
          className="mb-4 p-3 rounded-lg text-center"
          style={{
            background: 'rgba(200, 148, 21, 0.2)',
            border: '1px solid rgba(42, 31, 20, 0.3)',
          }}
        >
          <p className="font-avenir" style={getParchmentTextStyle()}>
            You placed{' '}
            <span className="font-semibold">
              #{data.userRank}
            </span>{' '}
            out of {data.totalSubmissions}
            {data.userPercentile !== null && data.totalSubmissions > 1 && (
              <span style={{ opacity: 0.7 }}>
                {' '}— Top {100 - data.userPercentile}%
              </span>
            )}
          </p>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto parchment-scrollbar">
        {data.rankings.map((entry) => (
          <LeaderboardEntryRow
            key={entry.rank}
            entry={entry}
            onViewSubmission={entry.originalContent ? setSelectedEntry : undefined}
          />
        ))}
      </div>

      {selectedEntry && (
        <SubmissionModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}
    </ParchmentCard>
  );
}

