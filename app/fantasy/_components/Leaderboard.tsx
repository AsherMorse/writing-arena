'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard, type LeaderboardData, type LeaderboardEntry } from '@/lib/services/ranked-leaderboard';

interface LeaderboardProps {
  promptId: string;
  userId?: string;
}

const RANK_COLORS: Record<number, string> = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
};

const RANK_LABELS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

function SubmissionModal({
  entry,
  onClose,
}: {
  entry: LeaderboardEntry;
  onClose: () => void;
}) {
  const rankColor = RANK_COLORS[entry.rank] || '#f6d493';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg p-6"
        style={{
          background: 'linear-gradient(180deg, rgba(42,26,15,0.98) 0%, rgba(30,18,10,0.99) 100%)',
          border: '1px solid rgba(201,168,76,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{RANK_LABELS[entry.rank]}</span>
            <h3 className="font-dutch809 text-xl" style={{ color: rankColor }}>
              {entry.displayName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded text-sm"
            style={{
              border: '1px solid rgba(201, 168, 76, 0.3)',
              color: 'rgba(245, 230, 184, 0.6)',
            }}
          >
            Close
          </button>
        </div>

        <div className="flex gap-4 mb-4 text-sm" style={{ color: 'rgba(245, 230, 184, 0.7)' }}>
          <span>Original: <strong style={{ color: '#f6d493' }}>{entry.originalScore}%</strong></span>
          {entry.revisedScore !== undefined && (
            <span>
              Revised:{' '}
              <strong style={{ color: entry.revisedScore > entry.originalScore ? '#4ade80' : '#fbbf24' }}>
                {entry.revisedScore}%
              </strong>
            </span>
          )}
        </div>

        {entry.originalContent && (
          <div className="mb-4">
            <h4 className="font-avenir text-sm mb-2" style={{ color: 'rgba(245, 230, 184, 0.5)' }}>
              Original Submission
            </h4>
            <div
              className="p-4 rounded-lg font-avenir text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(201, 168, 76, 0.2)',
                color: 'rgba(245, 230, 184, 0.9)',
              }}
            >
              {entry.originalContent}
            </div>
          </div>
        )}

        {entry.revisedContent && entry.revisedContent !== entry.originalContent && (
          <div>
            <h4 className="font-avenir text-sm mb-2" style={{ color: 'rgba(245, 230, 184, 0.5)' }}>
              Revised Submission
            </h4>
            <div
              className="p-4 rounded-lg font-avenir text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(74, 222, 128, 0.2)',
                color: 'rgba(245, 230, 184, 0.9)',
              }}
            >
              {entry.revisedContent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LeaderboardEntryRow({
  entry,
  onViewSubmission,
}: {
  entry: LeaderboardEntry;
  onViewSubmission?: (entry: LeaderboardEntry) => void;
}) {
  const isTopThree = entry.rank <= 3;
  const rankColor = RANK_COLORS[entry.rank] || 'rgba(245, 230, 184, 0.6)';
  const hasContent = !!entry.originalContent;

  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-lg transition-all"
      style={{
        background: entry.isCurrentUser
          ? 'rgba(201, 168, 76, 0.2)'
          : 'rgba(26, 18, 8, 0.6)',
        border: entry.isCurrentUser
          ? '1px solid rgba(201, 168, 76, 0.5)'
          : '1px solid rgba(201, 168, 76, 0.1)',
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
          style={{ color: entry.isCurrentUser ? '#f6d493' : 'rgba(245, 230, 184, 0.8)' }}
        >
          {entry.displayName}
          {entry.isCurrentUser && (
            <span className="ml-2 text-xs" style={{ color: 'rgba(201, 168, 76, 0.8)' }}>
              (You)
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-4 text-right">
        <div>
          <span className="font-avenir text-sm" style={{ color: 'rgba(245, 230, 184, 0.5)' }}>
            Score:{' '}
          </span>
          <span className="font-avenir font-semibold" style={{ color: '#f6d493' }}>
            {entry.originalScore}%
          </span>
        </div>
        {entry.revisedScore !== undefined && entry.revisedScore !== entry.originalScore && (
          <div>
            <span className="font-avenir text-sm" style={{ color: 'rgba(245, 230, 184, 0.5)' }}>
              →{' '}
            </span>
            <span
              className="font-avenir font-semibold"
              style={{
                color: entry.revisedScore > entry.originalScore ? '#4ade80' : '#fbbf24',
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
              background: 'rgba(201, 168, 76, 0.15)',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              color: 'rgba(245, 230, 184, 0.8)',
            }}
          >
            View
          </button>
        )}
      </div>
    </div>
  );
}

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
      <div className="text-center py-8">
        <p className="font-avenir" style={{ color: 'rgba(245, 230, 184, 0.6)' }}>
          Loading leaderboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="font-avenir text-red-400">{error}</p>
      </div>
    );
  }

  if (!data || data.totalSubmissions === 0) {
    return (
      <div className="text-center py-8">
        <p className="font-avenir" style={{ color: 'rgba(245, 230, 184, 0.6)' }}>
          No submissions yet. Be the first!
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg p-6"
      style={{
        background: 'rgba(26, 18, 8, 0.9)',
        border: '1px solid rgba(201, 168, 76, 0.3)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3
          className="font-dutch809 text-xl"
          style={{ color: '#f6d493' }}
        >
          Leaderboard
        </h3>
        <span
          className="font-avenir text-sm"
          style={{ color: 'rgba(245, 230, 184, 0.5)' }}
        >
          {data.totalSubmissions} submission{data.totalSubmissions !== 1 ? 's' : ''}
        </span>
      </div>

      {data.userRank !== null && (
        <div
          className="mb-6 p-4 rounded-lg text-center"
          style={{
            background: 'rgba(201, 168, 76, 0.1)',
            border: '1px solid rgba(201, 168, 76, 0.3)',
          }}
        >
          <p className="font-avenir" style={{ color: 'rgba(245, 230, 184, 0.8)' }}>
            You placed{' '}
            <span className="font-semibold" style={{ color: '#f6d493' }}>
              #{data.userRank}
            </span>{' '}
            out of {data.totalSubmissions}
            {data.userPercentile !== null && data.totalSubmissions > 1 && (
              <span style={{ color: 'rgba(245, 230, 184, 0.6)' }}>
                {' '}— Top {100 - data.userPercentile}%
              </span>
            )}
          </p>
        </div>
      )}

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {data.rankings.map((entry) => (
          <LeaderboardEntryRow
            key={`${entry.rank}-${entry.odisplayName}`}
            entry={entry}
            onViewSubmission={entry.originalContent ? setSelectedEntry : undefined}
          />
        ))}
      </div>

      {selectedEntry && (
        <SubmissionModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}
    </div>
  );
}
