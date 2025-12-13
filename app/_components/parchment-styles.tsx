/**
 * @fileoverview Centralized parchment UI styling constants and components.
 * Used across all parchment-styled components for consistent fantasy aesthetic.
 * Supports multiple variants and sizes for flexible application.
 */
'use client';

import { CSSProperties } from 'react';

/** Parchment color palette */
export const PARCHMENT_COLORS = {
  default: {
    backgroundStart: '#f3ce83',
    backgroundEnd: '#e1bc72',
    border: '#2a1f14',
    text: '#2d2d2d',
  },
  golden: {
    backgroundStart: '#ffc940',
    backgroundEnd: '#c89415',
    border: '#2a1f14',
    text: '#2d2d2d',
  },
  light: {
    backgroundStart: '#f5e6c8',
    backgroundEnd: '#e8d9b5',
    border: '#2a1f14',
    text: '#2d2d2d',
  },
} as const;

/** Border radius options */
export const PARCHMENT_RADIUS = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
} as const;

/** Paper texture configuration */
export const PAPER_TEXTURE_CONFIG = {
  url: '/textures/paper-1.png',
  size: '200px 200px',
  opacity: 0.35,
} as const;

export type ParchmentVariant = keyof typeof PARCHMENT_COLORS;
export type ParchmentRadius = keyof typeof PARCHMENT_RADIUS;

interface ParchmentStyleOptions {
  variant?: ParchmentVariant;
  insetTop?: number;
  insetBottom?: number;
  insetTopOpacity?: number;
  insetBottomOpacity?: number;
}

/**
 * @description Generates parchment container styles with customizable variants.
 */
export function getParchmentContainerStyle(options: ParchmentStyleOptions = {}): CSSProperties {
  const {
    variant = 'default',
    insetTop = 3,
    insetBottom = 3,
    insetTopOpacity = 0.4,
    insetBottomOpacity = 0.4,
  } = options;

  const colors = PARCHMENT_COLORS[variant];

  return {
    background: `linear-gradient(180deg, ${colors.backgroundStart} 0%, ${colors.backgroundEnd} 100%)`,
    border: `2px solid ${colors.border}`,
    boxShadow: `
      inset 0 ${insetTop}px 0 rgba(255, 255, 255, ${insetTopOpacity}),
      inset 0 -${insetBottom}px 0 rgba(0, 0, 0, ${insetBottomOpacity})
    `,
  };
}

/**
 * @description Generates parchment text styles with embossed effect.
 */
export function getParchmentTextStyle(variant: ParchmentVariant = 'default'): CSSProperties {
  const colors = PARCHMENT_COLORS[variant];
  return {
    color: colors.text,
    textShadow: '0 1px 0 rgba(255, 255, 255, 0.6)',
  };
}

/** Base parchment container styles (default variant) */
export const PARCHMENT_CONTAINER_STYLE: CSSProperties = getParchmentContainerStyle();

/** Parchment text styles with embossed effect (default variant) */
export const PARCHMENT_TEXT_STYLE: CSSProperties = getParchmentTextStyle();

interface PaperTextureProps {
  className?: string;
  borderRadius?: ParchmentRadius;
}

/**
 * @description Paper texture overlay component using a tileable paper grain image.
 * Supports customizable border radius.
 */
export function PaperTexture({ className = '', borderRadius = 'lg' }: PaperTextureProps) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${PARCHMENT_RADIUS[borderRadius]} ${className}`}
      style={{
        backgroundImage: `url(${PAPER_TEXTURE_CONFIG.url})`,
        backgroundRepeat: 'repeat',
        backgroundSize: PAPER_TEXTURE_CONFIG.size,
        opacity: PAPER_TEXTURE_CONFIG.opacity,
      }}
    />
  );
}
