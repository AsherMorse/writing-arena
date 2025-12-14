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

interface ParchmentCardWithLineProps {
  children: ReactNode;
  /** Title displayed above the horizontal divider line */
  title: string;
  className?: string;
  /** Class name for the scrollable content area (e.g., max-h-[400px] overflow-y-auto) */
  contentClassName?: string;
  /** Color variant */
  variant?: ParchmentVariant;
  /** Border radius size */
  borderRadius?: ParchmentRadius;
  /** Removes inset shadows for nested cards */
  flat?: boolean;
}

/**
 * @description Parchment card with a title and horizontal divider line underneath.
 * Used for feedback cards like "Your Writing", "Score Breakdown", "Things to Fix".
 */
export function ParchmentCardWithLine({ 
  children, 
  title,
  className = '',
  contentClassName = '',
  variant = 'default',
  borderRadius = 'lg',
  flat = false,
}: ParchmentCardWithLineProps) {
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
      <div className={`relative z-10 p-5 ${needsHeightInherit ? 'h-full flex flex-col' : ''}`}>
        <div
          className="text-base uppercase tracking-widest mb-2 pb-2 font-memento border-b shrink-0"
          style={{ ...getParchmentTextStyle(variant), borderColor: 'rgba(139, 99, 52, 0.3)' }}
        >
          {title}
        </div>
        <div className={`pt-2 ${needsHeightInherit ? 'flex-1 min-h-0' : ''} ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
