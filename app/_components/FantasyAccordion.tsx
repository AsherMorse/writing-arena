/**
 * @fileoverview Collapsible accordion component with fantasy dark/gold styling.
 * Used for essay practice mode to match its visual theme.
 */
'use client';

import { ReactNode, useState } from 'react';

interface FantasyAccordionProps {
  /** Title displayed on the accordion trigger button */
  title: string;
  /** Content shown when accordion is expanded */
  children: ReactNode;
  /** Controlled open state */
  isOpen: boolean;
  /** Callback when accordion is toggled */
  onToggle: () => void;
  /** Max height of content when expanded (CSS value) */
  maxHeight?: string;
  /** Optional className for the container */
  className?: string;
}

/**
 * @description Lightbulb icon for inspiration
 */
function LightbulbIcon() {
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
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

/**
 * @description Chevron icon for expand/collapse indicator
 */
function ChevronIcon({ isOpen }: { isOpen: boolean }) {
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
      className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/**
 * @description Collapsible accordion with fantasy dark/gold styling.
 * Matches the essay practice page visual theme.
 */
export function FantasyAccordion({
  title,
  children,
  isOpen,
  onToggle,
  maxHeight = '300px',
  className = '',
}: FantasyAccordionProps) {
  return (
    <div className={className}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full cursor-pointer select-none rounded-xl transition-all duration-200 ${
          isOpen ? 'rounded-b-none' : ''
        }`}
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(246, 212, 147, 0.3)',
          borderBottom: isOpen ? 'none' : '1px solid rgba(246, 212, 147, 0.3)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span 
            className="font-avenir text-sm uppercase tracking-wider flex items-center gap-2"
            style={{ color: '#f6d493' }}
          >
            <LightbulbIcon />
            {title}
          </span>
          <span style={{ color: '#f6d493' }}>
            <ChevronIcon isOpen={isOpen} />
          </span>
        </div>
      </button>

      {/* Content panel */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out rounded-b-xl"
        style={{
          maxHeight: isOpen ? maxHeight : '0',
          opacity: isOpen ? 1 : 0,
          background: isOpen ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
          border: isOpen ? '1px solid rgba(246, 212, 147, 0.3)' : 'none',
          borderTop: 'none',
        }}
      >
        <div 
          className="px-4 py-3 overflow-y-auto"
          style={{ 
            maxHeight: `calc(${maxHeight} - 24px)`,
            color: 'rgba(245, 230, 184, 0.9)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
