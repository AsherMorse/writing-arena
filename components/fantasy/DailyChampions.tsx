/**
 * @fileoverview Daily Champions component showing top 3 students for today's challenges.
 * Features tabbed interface for paragraph and essay modes with parchment styling.
 */

'use client';

import { useState, useEffect } from 'react';
import { getDailyTopThree, type DailyChampion } from '@/lib/services/ranked-leaderboard';

type Mode = 'paragraph' | 'essay';

interface ChampionData {
  paragraph: DailyChampion[];
  essay: DailyChampion[];
}

const RANK_MEDALS = ['🥇', '🥈', '🥉'] as const;
const RANK_COLORS = ['#b8860b', '#6b7280', '#92400e'] as const;

/**
 * @description Paper texture overlay matching FantasyHomeContent style.
 */
function PaperTexture({ className = '' }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: 'url(/textures/paper-1.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        opacity: 0.6,
      }}
    />
  );
}

/**
 * @description Displays top 3 students for today's paragraph and essay challenges.
 * Shows tabbed interface to switch between modes.
 */
export function DailyChampions() {
  const [activeMode, setActiveMode] = useState<Mode>('paragraph');
  const [champions, setChampions] = useState<ChampionData>({ paragraph: [], essay: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChampions() {
      try {
        // Fetch top 3 by daily LP earned for both modes
        const [paragraphTop3, essayTop3] = await Promise.all([
          getDailyTopThree('paragraph'),
          getDailyTopThree('essay'),
        ]);

        setChampions({
          paragraph: paragraphTop3,
          essay: essayTop3,
        });
      } catch (error) {
        console.error('Failed to fetch champions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchChampions();
  }, []);

  // Don't render if no champions in either mode
  const hasChampions = champions.paragraph.length > 0 || champions.essay.length > 0;
  if (!loading && !hasChampions) return null;

  const displayChampions = champions[activeMode];

  return (
    <div
      className="relative rounded-lg overflow-hidden mt-6"
      style={{
        width: '514px',
        background: 'linear-gradient(to bottom, #f5e6c8, #e8d4a8)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
        border: '3px solid #3a2010',
      }}
    >
      <PaperTexture className="rounded-lg" />

      {/* Header with tabs */}
      <div className="relative px-4 py-3">
        <h3
          className="text-center font-memento font-semibold text-sm uppercase tracking-wider mb-2"
          style={{ color: '#2a1a0f' }}
        >
          Today&apos;s Champions
        </h3>
        <div className="flex items-center justify-center gap-2">
          <TabButton
            isActive={activeMode === 'paragraph'}
            onClick={() => setActiveMode('paragraph')}
            label="Paragraph"
          />
          <TabButton
            isActive={activeMode === 'essay'}
            onClick={() => setActiveMode('essay')}
            label="Essay"
          />
        </div>
      </div>

      {/* Divider */}
      <div
        className="relative mx-4"
        style={{
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(58, 32, 16, 0.25), transparent)',
        }}
      />

      {/* Champions display */}
      <div className="relative px-6 py-4">
        {loading ? (
          <div className="flex justify-center py-2">
            <span
              className="text-sm font-avenir"
              style={{ color: 'rgba(42, 26, 15, 0.5)' }}
            >
              Loading champions...
            </span>
          </div>
        ) : displayChampions.length === 0 ? (
          <div className="flex justify-center py-2">
            <span
              className="text-sm font-avenir"
              style={{ color: 'rgba(42, 26, 15, 0.5)' }}
            >
              No champions yet today
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {displayChampions.map((champion, index) => (
              <ChampionEntry key={champion.rank} champion={champion} index={index} />
            ))}
            {/* Fill empty slots if less than 3 */}
            {displayChampions.length < 3 &&
              Array.from({ length: 3 - displayChampions.length }).map((_, i) => (
                <EmptySlot key={`empty-${i}`} index={displayChampions.length + i} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * @description Tab button for switching between paragraph and essay modes.
 */
function TabButton({
  isActive,
  onClick,
  label,
}: {
  isActive: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded-md font-memento text-sm uppercase tracking-wide transition-all"
      style={{
        background: isActive
          ? 'rgba(42, 26, 15, 0.15)'
          : 'transparent',
        color: isActive ? '#2a1a0f' : 'rgba(42, 26, 15, 0.5)',
        border: isActive
          ? '1px solid rgba(42, 26, 15, 0.2)'
          : '1px solid transparent',
      }}
    >
      {label}
    </button>
  );
}

/**
 * @description Displays a single champion entry with medal, name, and daily LP earned.
 */
function ChampionEntry({
  champion,
  index,
}: {
  champion: DailyChampion;
  index: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl w-8 text-center">{RANK_MEDALS[index]}</span>
      <span
        className="font-avenir text-sm font-medium flex-1"
        style={{ color: RANK_COLORS[index] }}
      >
        {champion.displayName}
      </span>
      <span
        className="font-memento text-xs"
        style={{ color: '#2a1a0f' }}
      >
        {champion.dailyLP} LP
      </span>
    </div>
  );
}

/**
 * @description Empty placeholder for unfilled champion slots.
 */
function EmptySlot({ index }: { index: number }) {
  return (
    <div className="flex items-center gap-3 opacity-30">
      <span className="text-xl w-8 text-center">{RANK_MEDALS[index]}</span>
      <span
        className="font-avenir text-sm flex-1"
        style={{ color: 'rgba(42, 26, 15, 0.5)' }}
      >
        —
      </span>
    </div>
  );
}
