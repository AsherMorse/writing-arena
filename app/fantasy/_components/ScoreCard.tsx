/**
 * @fileoverview Score display card with parchment styling.
 * Shows percentage score with title and optional subtitle in a parchment panel.
 */
'use client';

import { ParchmentCard } from './ParchmentCard';
import { getParchmentTextStyle } from './parchment-styles';

interface ScoreCardProps {
  /** Optional title - omit or pass empty string for score-only display */
  title?: string;
  percentage: number;
  total: number;
  max: number;
  subtitle?: React.ReactNode;
}

/**
 * @description Displays score information in a parchment-styled card.
 */
export function ScoreCard({ title, percentage, total, max, subtitle }: ScoreCardProps) {
  return (
    <ParchmentCard variant="default" borderRadius="lg">
      <div className="text-center space-y-2 py-2">
        {title && (
          <h2 className="font-dutch809 text-3xl" style={getParchmentTextStyle()}>
            {title}
          </h2>
        )}
        <div className="text-center">
          <div
            className="font-dutch809 text-5xl mb-1"
            style={getParchmentTextStyle()}
          >
            {percentage}%
          </div>
          <div className="font-avenir text-sm" style={getParchmentTextStyle()}>
            {total}/{max} points
          </div>
        </div>
        {subtitle && <div>{subtitle}</div>}
      </div>
    </ParchmentCard>
  );
}

