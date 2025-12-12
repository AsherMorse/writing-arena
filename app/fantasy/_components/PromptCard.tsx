/**
 * @fileoverview Writing prompt card with parchment styling and paper texture.
 * Supports split prompt format with collapsible hint section.
 */
'use client';

import { useState } from 'react';
import { ParchmentCard } from './ParchmentCard';
import { getParchmentTextStyle, ParchmentVariant } from './parchment-styles';

interface PromptCardProps {
  /** Full prompt text (used if promptQuestion not provided) */
  prompt?: string;
  /** Main question portion of the prompt */
  promptQuestion?: string;
  /** Optional hint/suggestions (shown in collapsible dropdown) */
  promptHint?: string;
  /** Color variant */
  variant?: ParchmentVariant;
}

/**
 * @description Displays a writing prompt in a parchment-styled card.
 * If promptQuestion and promptHint are provided, shows hint in a collapsible dropdown.
 * Falls back to displaying the full prompt string if split format not provided.
 */
export function PromptCard({ 
  prompt, 
  promptQuestion, 
  promptHint,
  variant = 'default' 
}: PromptCardProps) {
  const [isHintOpen, setIsHintOpen] = useState(false);
  
  // Determine what to display
  const question = promptQuestion || prompt || '';
  const hint = promptHint || '';
  const hasHint = hint.length > 0;

  return (
    <ParchmentCard title="Your Quest" variant={variant}>
      <p
        className="text-lg leading-relaxed font-avenir"
        style={getParchmentTextStyle(variant)}
      >
        {question}
      </p>
      
      {hasHint && (
        <div className="mt-3">
          <button
            onClick={() => setIsHintOpen(!isHintOpen)}
            className="flex items-center gap-2 text-sm font-avenir transition-opacity hover:opacity-100"
            style={{ 
              ...getParchmentTextStyle(variant),
              opacity: 0.7,
            }}
          >
            <span
              className="inline-block transition-transform duration-200"
              style={{ transform: isHintOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              ▸
            </span>
            <span>Need a hint?</span>
          </button>
          
          <div
            className="overflow-hidden transition-all duration-200 ease-in-out"
            style={{
              maxHeight: isHintOpen ? '200px' : '0',
              opacity: isHintOpen ? 1 : 0,
            }}
          >
            <p
              className="mt-2 text-base leading-relaxed font-avenir italic pl-5"
              style={{ 
                ...getParchmentTextStyle(variant),
                opacity: 0.85,
              }}
            >
              {hint}
            </p>
          </div>
        </div>
      )}
    </ParchmentCard>
  );
}
