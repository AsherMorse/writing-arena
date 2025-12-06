/**
 * @fileoverview Medieval-styled button component with gold borders and warm glow effects.
 */

'use client';

import Link from 'next/link';

interface FantasyButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'large';
}

/**
 * @description Renders a fantasy-styled button with ornate borders.
 * Can render as a link or button depending on props.
 */
export function FantasyButton({ 
  href, 
  onClick, 
  children, 
  className = '',
  variant = 'primary',
  size = 'default'
}: FantasyButtonProps) {
  const sizeStyles = size === 'large' 
    ? 'px-8 py-3 text-lg md:text-xl tracking-[0.1em]'
    : 'px-10 py-4 text-sm tracking-[0.08em]';

  const baseStyles = `
    relative inline-flex items-center justify-center
    ${sizeStyles}
    font-memento font-black uppercase font-bold
    transition-all duration-200
    cursor-pointer
    rounded-md
  `;

  const variantStyles = variant === 'primary' 
    ? {
        background: '#2a1a0f',
        border: '1px solid rgba(201, 168, 76, 0.75)',
        color: '#f5e6b8',
        boxShadow: `
          inset 0 0 15px rgba(201, 168, 76, 0.15),
          inset 0 1px 0 rgba(201, 168, 76, 0.3),
          0 4px 12px rgba(0, 0, 0, 0.5)
        `,
      }
    : {
        background: '#3d2817',
        border: '1px solid #8b7355',
        color: '#f5e6b8',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
      };

  const hoverStyles = {
    '--hover-shadow': variant === 'primary'
      ? `inset 0 0 30px rgba(201, 168, 76, 0.25), 0 6px 20px rgba(0, 0, 0, 0.5)`
      : `inset 0 0 15px rgba(201, 168, 76, 0.1), 0 4px 12px rgba(0, 0, 0, 0.4)`,
  };

  const content = (
    <span className="relative" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>
      {children}
    </span>
  );

  const combinedClassName = `${baseStyles} ${className} group hover:scale-[1.02] active:scale-[0.98]`;

  if (href) {
    return (
      <Link 
        href={href}
        className={combinedClassName}
        style={{
          ...variantStyles,
          ...hoverStyles as React.CSSProperties,
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <button 
      onClick={onClick}
      className={combinedClassName}
      style={{
        ...variantStyles,
        ...hoverStyles as React.CSSProperties,
      }}
    >
      {content}
    </button>
  );
}

