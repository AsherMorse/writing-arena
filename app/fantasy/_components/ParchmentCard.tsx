/**
 * @fileoverview Parchment-styled card component for fantasy UI.
 * Provides a warm, aged paper aesthetic with embossed borders and paper texture.
 */
'use client';

import { ReactNode } from 'react';
import { getParchmentContainerStyle, getParchmentTextStyle, PaperTexture, ParchmentVariant, ParchmentRadius } from './parchment-styles';

interface ParchmentCardProps {
  children: ReactNode;
  className?: string;
  /** Optional title displayed in small-caps at the top */
  title?: string;
  /** Color variant */
  variant?: ParchmentVariant;
  /** Border radius size */
  borderRadius?: ParchmentRadius;
  /** Removes inset shadows for nested cards */
  flat?: boolean;
}

/**
 * @description A reusable card component with parchment/aged paper styling.
 * Features warm beige background, dark embossed borders, paper texture, and optional title.
 */
export function ParchmentCard({ 
  children, 
  className = '', 
  title,
  variant = 'default',
  borderRadius = 'lg',
  flat = false,
}: ParchmentCardProps) {
  // Check if height/flex classes are passed to enable proper inheritance
  const needsHeightInherit = className.includes('h-full') || className.includes('flex');
  
  return (
    <div
      className={`relative rounded-xl overflow-hidden ${className}`}
      style={getParchmentContainerStyle({ 
        variant,
        insetTop: flat ? 0 : 3,
        insetBottom: flat ? 0 : 3,
      })}
    >
      <PaperTexture borderRadius={borderRadius} />
      <div className={`relative z-10 ${needsHeightInherit ? 'h-full flex flex-col' : ''}`}>
        {title && (
          <div
            className="font-memento text-xs uppercase tracking-widest px-5 pt-4 pb-2"
            style={getParchmentTextStyle(variant)}
          >
            {title}
          </div>
        )}
        <div className={`${title ? 'px-5 pb-4' : 'p-5'} ${needsHeightInherit ? 'flex-1 flex items-center' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
