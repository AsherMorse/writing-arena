/**
 * @fileoverview Writing editor textarea with parchment styling and paper texture.
 */
'use client';

import { getParchmentContainerStyle, getParchmentTextStyle, PaperTexture, ParchmentVariant } from './parchment-styles';

export const MIN_WORDS = 20;
export const MAX_CHARS = 5000;
export const DEFAULT_MAX_WORDS = 150;

interface WritingEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  showRequirements?: boolean;
  minWords?: number;
  maxWords?: number;
  /** Number of visible text rows */
  rows?: number;
  /** Color variant */
  variant?: ParchmentVariant;
  /** Prevent pasting */
  preventPaste?: boolean;
}

/**
 * @description A textarea component styled as parchment paper for writing responses.
 */
export function WritingEditor({ 
  value, 
  onChange, 
  disabled, 
  placeholder, 
  showRequirements = true,
  minWords = MIN_WORDS,
  maxWords = DEFAULT_MAX_WORDS,
  rows = 8,
  variant = 'default',
  preventPaste = false,
}: WritingEditorProps) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;
  const meetsMinimum = wordCount >= minWords;
  const underMax = charCount <= MAX_CHARS;

  const handleChange = (text: string) => {
    if (text.length <= MAX_CHARS) {
      onChange(text);
    }
  };

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        ...getParchmentContainerStyle({ variant }),
        padding: '12px',
      }}
    >
      <PaperTexture />
      <div className="relative z-10">
        {/* Wrapper for textarea with rounded corners and overflow hidden to clip scrollbar */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: '2px solid rgba(61, 50, 37, 0.4)',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onPaste={preventPaste ? (e) => e.preventDefault() : undefined}
        disabled={disabled}
        placeholder={placeholder}
            spellCheck={false}
            rows={rows}
            className="block w-full p-4 text-lg leading-relaxed resize-none focus:outline-none font-avenir parchment-scrollbar"
        style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#2d2d2d',
        }}
      />
        </div>
        <div className="flex justify-end mt-2 text-sm font-avenir px-1">
          <span style={getParchmentTextStyle(variant)}>
            Word Count: {wordCount}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * @description Utility function to count words in a string.
 */
export function getWordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
