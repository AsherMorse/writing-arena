/**
 * @fileoverview Results modal shown after completing a ranked challenge.
 * Displays LP earned, final score, placement, and rank changes.
 */
'use client';

import { getParchmentContainerStyle, getParchmentTextStyle, PaperTexture } from './parchment-styles';
import { ParchmentButton } from './ParchmentButton';
import type { RankUpdateResult } from '@/lib/services/user-profile';

interface RankedResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  finalScore: number;
  originalScore: number;
  lpChange: number;
  placement: number | null;
  totalSubmissions: number;
  rankUpdate: RankUpdateResult | null;
}

const RANK_LABELS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

/**
 * @description Gets the message based on rank change type.
 */
function getRankChangeMessage(change: 'promoted' | 'demoted' | 'none' | undefined): string | null {
  if (!change || change === 'none') return null;
  if (change === 'promoted') return '🎉 Rank Up!';
  return '📉 Rank Down';
}

/**
 * @description Results modal displaying LP earned, score, placement, and rank changes.
 */
export function RankedResultsModal({
  isOpen,
  onClose,
  finalScore,
  originalScore,
  lpChange,
  placement,
  totalSubmissions,
  rankUpdate,
}: RankedResultsModalProps) {
  if (!isOpen) return null;

  const scoreImproved = finalScore > originalScore;
  const scoreDiff = finalScore - originalScore;
  const isPositiveLP = lpChange > 0;
  const isTopThree = placement !== null && placement <= 3;
  const rankChangeMessage = getRankChangeMessage(rankUpdate?.change);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl p-8 animate-in fade-in zoom-in-95 duration-300"
        style={getParchmentContainerStyle()}
        onClick={(e) => e.stopPropagation()}
      >
        <PaperTexture borderRadius="xl" />
        
        <div className="relative z-10 text-center space-y-6">
          {/* Title */}
          <div>
            <h2
              className="font-dutch809 text-3xl"
              style={getParchmentTextStyle()}
            >
              Challenge Complete!
            </h2>
            {rankChangeMessage && (
              <p
                className="font-memento text-lg mt-2 uppercase tracking-wider"
                style={{ color: rankUpdate?.change === 'promoted' ? '#16a34a' : '#d97706' }}
              >
                {rankChangeMessage}
              </p>
            )}
          </div>

          {/* Score Section */}
          <div
            className="rounded-xl p-5"
            style={{
              background: 'rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(42, 31, 20, 0.2)',
            }}
          >
            <div className="font-memento text-xs uppercase tracking-wider mb-2" style={{ ...getParchmentTextStyle(), opacity: 0.6 }}>
              Final Score
            </div>
            <div
              className="font-dutch809 text-5xl"
              style={getParchmentTextStyle()}
            >
              {finalScore}%
            </div>
            {scoreDiff !== 0 && (
              <div
                className="font-avenir text-sm mt-1"
                style={{ color: scoreImproved ? '#16a34a' : '#d97706' }}
              >
                {scoreImproved ? '+' : ''}{scoreDiff}% from revision
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* LP Earned */}
            <div
              className="rounded-xl p-4"
              style={{
                background: isPositiveLP ? 'rgba(22, 163, 74, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                border: `1px solid ${isPositiveLP ? 'rgba(22, 163, 74, 0.3)' : 'rgba(217, 119, 6, 0.3)'}`,
              }}
            >
              <div className="font-memento text-xs uppercase tracking-wider mb-1" style={{ ...getParchmentTextStyle(), opacity: 0.6 }}>
                LP Earned
              </div>
              <div
                className="font-dutch809 text-3xl"
                style={{ color: isPositiveLP ? '#16a34a' : '#d97706' }}
              >
                {isPositiveLP ? '+' : ''}{lpChange}
              </div>
            </div>

            {/* Placement */}
            <div
              className="rounded-xl p-4"
              style={{
                background: isTopThree ? 'rgba(184, 134, 11, 0.15)' : 'rgba(0, 0, 0, 0.08)',
                border: `1px solid ${isTopThree ? 'rgba(184, 134, 11, 0.4)' : 'rgba(42, 31, 20, 0.2)'}`,
              }}
            >
              <div className="font-memento text-xs uppercase tracking-wider mb-1" style={{ ...getParchmentTextStyle(), opacity: 0.6 }}>
                Placement
              </div>
              {placement !== null ? (
                <div className="flex items-center justify-center gap-1">
                  {isTopThree && (
                    <span className="text-2xl">{RANK_LABELS[placement]}</span>
                  )}
                  <span
                    className="font-dutch809 text-3xl"
                    style={getParchmentTextStyle()}
                  >
                    #{placement}
                  </span>
                </div>
              ) : (
                <div
                  className="font-dutch809 text-2xl"
                  style={{ ...getParchmentTextStyle(), opacity: 0.5 }}
                >
                  —
                </div>
              )}
              {totalSubmissions > 0 && (
                <div className="font-avenir text-xs mt-1" style={{ ...getParchmentTextStyle(), opacity: 0.5 }}>
                  of {totalSubmissions}
                </div>
              )}
            </div>
          </div>

          {/* Continue Button */}
          <ParchmentButton onClick={onClose} variant="golden" className="w-full">
            {isTopThree ? 'Continue' : 'View Results'}
          </ParchmentButton>
        </div>
      </div>
    </div>
  );
}
