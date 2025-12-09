/**
 * @fileoverview Hints sidebar card with parchment styling and paper texture.
 */
'use client';

import { ParchmentCard } from './ParchmentCard';
import { getParchmentTextStyle, ParchmentVariant } from './parchment-styles';

interface HintsCardProps {
  hints: string[];
  /** Color variant */
  variant?: ParchmentVariant;
}

/**
 * @description Displays writing hints in a parchment-styled sidebar card.
 */
export function HintsCard({ hints, variant = 'default' }: HintsCardProps) {
  return (
    <ParchmentCard title="Hints" variant={variant}>
      <ul className="space-y-2">
        {hints.map((hint, index) => (
          <li
            key={index}
            className="font-avenir text-sm leading-relaxed flex items-start gap-2"
            style={getParchmentTextStyle(variant)}
          >
            <span>•</span>
            <span>{hint}</span>
          </li>
        ))}
      </ul>
    </ParchmentCard>
  );
}
