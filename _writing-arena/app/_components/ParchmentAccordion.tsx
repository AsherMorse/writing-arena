/**
 * @fileoverview Collapsible parchment-styled accordion component.
 * Inspired by AlphaWrite's InspirationAccordion with fantasy parchment aesthetic.
 */
'use client';

import { ReactNode } from 'react';
import { getParchmentContainerStyle, getParchmentTextStyle, PaperTexture, ParchmentVariant } from './parchment-styles';

/** Icon type for accordion */
type AccordionIcon = 'lightbulb' | 'wrench';

interface ParchmentAccordionProps {
  /** Title displayed on the accordion trigger button */
  title: string;
  /** Content shown when accordion is expanded */
  children: ReactNode;
  /** Controlled open state */
  isOpen: boolean;
  /** Callback when accordion is toggled */
  onToggle: () => void;
  /** Icon to display (lightbulb for hints, wrench for fixes) */
  icon?: AccordionIcon;
  /** Color variant */
  variant?: ParchmentVariant;
  /** Max height of content when expanded (CSS value) */
  maxHeight?: string;
  /** Optional className for the container */
  className?: string;
}

/**
 * @description Lightbulb icon for inspiration/hints
 */
function LightbulbIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

/**
 * @description Wrench icon for things to fix
 */
function WrenchIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

/**
 * @description Renders the appropriate icon based on type
 */
function AccordionIconComponent({ icon }: { icon: AccordionIcon }) {
  if (icon === 'wrench') return <WrenchIcon />;
  return <LightbulbIcon />;
}

/**
 * @description Chevron icon for expand/collapse indicator
 */
function ChevronIcon({ isOpen, className = '' }: { isOpen: boolean; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${className}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/**
 * @description Collapsible accordion with parchment styling.
 * Features smooth height animation and scrollable content area.
 */
export function ParchmentAccordion({
  title,
  children,
  isOpen,
  onToggle,
  icon = 'lightbulb',
  variant = 'default',
  maxHeight = '300px',
  className = '',
}: ParchmentAccordionProps) {
  const textStyle = getParchmentTextStyle(variant);
  const containerStyle = getParchmentContainerStyle({ variant, insetTop: 2, insetBottom: 2 });

  return (
    <div className={className}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={onToggle}
        className={`relative w-full overflow-hidden cursor-pointer select-none rounded-xl transition-all duration-200`}
        style={{
          ...containerStyle,
          borderBottomLeftRadius: isOpen ? 0 : undefined,
          borderBottomRightRadius: isOpen ? 0 : undefined,
          borderBottom: isOpen ? 'none' : containerStyle.border,
        }}
      >
        <PaperTexture borderRadius="lg" />
        <div className="relative z-10 flex items-center justify-between px-4 py-3">
          <span 
            className="font-memento text-sm uppercase tracking-widest flex items-center gap-2"
            style={textStyle}
          >
            <AccordionIconComponent icon={icon} />
            {title}
          </span>
          <span style={textStyle}>
              <ChevronIcon isOpen={isOpen} />
            </span>
        </div>
      </button>

      {/* Content panel */}
      <div
        className="relative overflow-hidden transition-all duration-300 ease-out rounded-b-xl"
        style={{
          maxHeight: isOpen ? maxHeight : '0',
          opacity: isOpen ? 1 : 0,
          ...(isOpen ? {
            ...containerStyle,
            borderTop: 'none',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          } : {}),
        }}
      >
        <PaperTexture borderRadius="lg" />
        <div 
          className="relative z-10 px-4 py-3 overflow-y-auto parchment-scrollbar"
          style={{ maxHeight: `calc(${maxHeight} - 24px)` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

