/**
 * @fileoverview Gallery component for displaying top 3 winning submissions.
 * Features rank tabs, arrow navigation with wrap-around, and scrollable content.
 */
'use client';

import { useState, useEffect } from 'react';
import { ParchmentCard } from './ParchmentCard';
import { getParchmentTextStyle } from './parchment-styles';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/services/ranked-leaderboard';

interface WinningSubmissionsProps {
  promptId: string;
}

const RANK_CONFIG = [
  { emoji: '🥇', label: '1st', color: '#b8860b' },
  { emoji: '🥈', label: '2nd', color: '#6b7280' },
  { emoji: '🥉', label: '3rd', color: '#92400e' },
] as const;

/**
 * @description Formats score display with optional revision delta.
 */
function formatScoreDisplay(entry: LeaderboardEntry): string {
  const hasRevision = entry.revisedScore !== undefined && entry.revisedScore !== entry.originalScore;
  
  if (!hasRevision) {
    return `${entry.originalScore}%`;
  }
  
  const delta = entry.revisedScore! - entry.originalScore;
  const deltaStr = delta > 0 ? `+${delta}` : `${delta}`;
  return `${entry.originalScore}% → ${entry.revisedScore}% (${deltaStr})`;
}

/**
 * @description Gets the best content to display (revised if available, otherwise original).
 */
function getBestContent(entry: LeaderboardEntry): string {
  if (entry.revisedContent && entry.revisedContent !== entry.originalContent) {
    return entry.revisedContent;
  }
  return entry.originalContent || '';
}

/**
 * @description Gallery component for viewing top 3 winning submissions.
 */
export function WinningSubmissions({ promptId }: WinningSubmissionsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [winners, setWinners] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchWinners() {
      setLoading(true);
      try {
        const data = await getLeaderboard(promptId);
        // Filter to only entries with content
        const winnersWithContent = data.topThree.filter(e => e.originalContent);
        setWinners(winnersWithContent);
      } catch {
        setWinners([]);
      } finally {
        setLoading(false);
      }
    }
    fetchWinners();
  }, [promptId]);
  
  if (loading) {
    return (
      <ParchmentCard className="text-center py-4">
        <p className="font-avenir" style={getParchmentTextStyle()}>
          Loading top submissions...
        </p>
      </ParchmentCard>
    );
  }
  
  if (winners.length === 0) return null;
  
  const hasMultiple = winners.length > 1;
  const currentWinner = winners[activeIndex];
  const rankConfig = RANK_CONFIG[activeIndex];
  
  const goNext = () => setActiveIndex(i => (i + 1) % winners.length);
  const goPrev = () => setActiveIndex(i => (i - 1 + winners.length) % winners.length);
  const goTo = (index: number) => setActiveIndex(index);
  
  return (
    <div className="space-y-3">
      {/* Section title */}
      <h3
        className="font-memento text-lg uppercase tracking-wider text-center"
        style={{ color: 'rgba(245, 230, 184, 0.8)', textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}
      >
        Top Submissions
      </h3>
      
      {/* Rank tabs */}
      {hasMultiple && (
        <div className="flex justify-center gap-2">
          {winners.map((_, index) => {
            const config = RANK_CONFIG[index];
            const isActive = index === activeIndex;
            
            return (
              <button
                key={index}
                onClick={() => goTo(index)}
                className="px-3 py-1.5 rounded-lg font-avenir text-sm transition-all"
                style={{
                  background: isActive
                    ? 'rgba(200, 148, 21, 0.4)'
                    : 'rgba(0, 0, 0, 0.2)',
                  border: isActive
                    ? '1px solid rgba(200, 148, 21, 0.6)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  color: isActive ? '#f6d493' : 'rgba(245, 230, 184, 0.6)',
                }}
              >
                {config.emoji} {config.label}
              </button>
            );
          })}
        </div>
      )}
      
      {/* Main card */}
      <ParchmentCard>
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-3">
          {/* Left arrow */}
          {hasMultiple ? (
            <button
              onClick={goPrev}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:scale-110"
              style={{
                background: 'rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(42, 31, 20, 0.2)',
              }}
            >
              <span style={getParchmentTextStyle()}>←</span>
            </button>
          ) : (
            <div className="w-8" />
          )}
          
          {/* Title and score */}
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">{rankConfig.emoji}</span>
              <h3
                className="font-dutch809 text-lg"
                style={{ ...getParchmentTextStyle(), color: rankConfig.color }}
              >
                {currentWinner.displayName}
              </h3>
            </div>
            <p
              className="font-avenir text-sm mt-1"
              style={getParchmentTextStyle()}
            >
              {formatScoreDisplay(currentWinner)}
            </p>
          </div>
          
          {/* Right arrow */}
          {hasMultiple ? (
            <button
              onClick={goNext}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:scale-110"
              style={{
                background: 'rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(42, 31, 20, 0.2)',
              }}
            >
              <span style={getParchmentTextStyle()}>→</span>
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>
        
        {/* Content area */}
        <div
          className="p-4 rounded-lg max-h-48 overflow-y-auto parchment-scrollbar"
          style={{
            background: 'rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(42, 31, 20, 0.3)',
          }}
        >
          <p
            className="font-avenir text-sm leading-relaxed whitespace-pre-wrap"
            style={getParchmentTextStyle()}
          >
            {getBestContent(currentWinner) || 'No content available'}
          </p>
        </div>
        
        {/* Revision indicator */}
        {currentWinner.revisedContent && currentWinner.revisedContent !== currentWinner.originalContent && (
          <p
            className="text-center text-xs mt-2 font-avenir"
            style={{ ...getParchmentTextStyle(), opacity: 0.6 }}
          >
            Showing revised submission
          </p>
        )}
      </ParchmentCard>
    </div>
  );
}
