/**
 * @fileoverview Writing prompt card with parchment styling and paper texture.
 */
'use client';

import { ParchmentCard } from './ParchmentCard';
import { getParchmentTextStyle, ParchmentVariant } from './parchment-styles';

interface PromptCardProps {
  prompt: string;
  /** Color variant */
  variant?: ParchmentVariant;
}

/**
 * @description Displays a writing prompt in a parchment-styled card.
 */
export function PromptCard({ prompt, variant = 'default' }: PromptCardProps) {
  return (
    <ParchmentCard title="Your Quest" variant={variant}>
      <p
        className="text-lg leading-relaxed font-avenir"
        style={getParchmentTextStyle(variant)}
      >
        {prompt}
      </p>
    </ParchmentCard>
  );
}
