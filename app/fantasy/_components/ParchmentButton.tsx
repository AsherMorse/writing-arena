/**
 * @fileoverview Parchment-styled button component for fantasy UI.
 */
'use client';

import { ReactNode, useState } from 'react';
import { getParchmentContainerStyle, getParchmentTextStyle, PaperTexture, ParchmentVariant } from './parchment-styles';

interface ParchmentButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  /** Color variant - 'golden' for submit buttons, 'default' for others */
  variant?: ParchmentVariant;
}

/**
 * @description A button styled to match the parchment UI aesthetic.
 * When disabled, only the text becomes semi-transparent, not the entire button.
 * When pressed, creates an inward press effect with shadow and text shift.
 */
export function ParchmentButton({ 
  children, 
  onClick, 
  disabled = false, 
  className = '',
  type = 'button',
  variant = 'default',
}: ParchmentButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const buttonStyle = isPressed
    ? {
        ...getParchmentContainerStyle({ variant }),
        boxShadow: 'inset 0 4px 6px rgba(0, 0, 0, 0.3)',
      }
    : getParchmentContainerStyle({ variant });

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`
        relative overflow-hidden
        font-memento text-2xl uppercase tracking-widest
        px-8 py-3 rounded-xl
        transition-all duration-100
        disabled:cursor-not-allowed
        hover:brightness-105
        ${className}
      `}
      style={buttonStyle}
    >
      <PaperTexture />
      <span 
        className="relative z-10 transition-all duration-100"
        style={{ 
          ...getParchmentTextStyle(variant),
          opacity: disabled ? 0.4 : 1,
          transform: isPressed ? 'translateY(3px)' : 'translateY(0)',
          display: 'inline-block',
        }}
      >
        {children}
      </span>
    </button>
  );
}
