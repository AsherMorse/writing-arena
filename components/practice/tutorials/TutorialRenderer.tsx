/**
 * @fileoverview Tutorial renderer component for practice activities.
 * Renders markdown content with placeholder support and styled blockquotes.
 */

'use client';

import { ReactNode, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

interface TutorialRendererProps {
  /** Raw markdown content */
  markdown: string;
  /** Optional placeholder components to inject into the markdown */
  placeholders?: Record<string, ReactNode>;
  /** Callback when user clicks "Got it" */
  onComplete: () => void;
  /** Lesson name for the header */
  lessonName: string;
}

/**
 * @description Renders tutorial markdown content with placeholder support.
 * Handles blockquote styling (blue) and {{ placeholder }} replacement.
 */
export function TutorialRenderer({
  markdown,
  placeholders = {},
  onComplete,
  lessonName,
}: TutorialRendererProps) {
  /**
   * @description Process markdown to split by placeholders.
   * Returns array of { type: 'text' | 'placeholder', content: string }
   */
  const segments = useMemo(() => {
    if (Object.keys(placeholders).length === 0) {
      return [{ type: 'text' as const, content: markdown }];
    }

    const result: Array<{ type: 'text' | 'placeholder'; content: string }> = [];
    const placeholderPattern = /\{\{\s*(\w+)\s*\}\}/g;
    let lastIndex = 0;
    let match;

    while ((match = placeholderPattern.exec(markdown)) !== null) {
      // Add text before the placeholder
      if (match.index > lastIndex) {
        result.push({
          type: 'text',
          content: markdown.slice(lastIndex, match.index),
        });
      }

      // Add the placeholder
      result.push({
        type: 'placeholder',
        content: match[1], // The placeholder name (e.g., "topic")
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last placeholder
    if (lastIndex < markdown.length) {
      result.push({
        type: 'text',
        content: markdown.slice(lastIndex),
      });
    }

    return result;
  }, [markdown, placeholders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[rgba(255,144,48,0.15)] px-3 py-1 text-xs font-medium text-[#ff9030]">
            Phase 1: Review
          </span>
          <span className="text-sm text-[rgba(255,255,255,0.5)]">
            Learning the concept...
          </span>
        </div>
      </div>

      {/* Tutorial Card */}
      <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-6">
        {/* Card Header */}
        <div className="flex items-center gap-2 text-[#ff9030]">
          <span className="text-lg">📚</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider">
            {lessonName}
          </span>
        </div>

        {/* Content */}
        <div className="mt-4 rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-5">
          <div className="tutorial-content prose prose-invert prose-sm max-w-none">
            {segments.map((segment, index) => {
              if (segment.type === 'placeholder') {
                const placeholderContent = placeholders[segment.content];
                if (placeholderContent) {
                  return (
                    <div key={index} className="my-4">
                      {placeholderContent}
                    </div>
                  );
                }
                // Fallback: render as styled badge if placeholder not provided
                return (
                  <span
                    key={index}
                    className="inline-block rounded bg-[rgba(0,229,229,0.15)] px-2 py-0.5 text-xs text-[#00e5e5]"
                  >
                    {segment.content}
                  </span>
                );
              }

              return (
                <ReactMarkdown
                  key={index}
                  components={{
                    // Style headings
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold text-white mt-6 mb-3 first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-semibold text-white mt-5 mb-2">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-medium text-white mt-4 mb-2">
                        {children}
                      </h3>
                    ),
                    // Style paragraphs
                    p: ({ children }) => (
                      <p className="text-sm leading-relaxed text-[rgba(255,255,255,0.8)] mb-3">
                        {children}
                      </p>
                    ),
                    // Hide blockquotes - they contain duplicate audio/TTS content
                    blockquote: () => null,
                    // Style lists
                    ul: ({ children }) => (
                      <ul className="list-disc pl-6 space-y-2 text-sm text-[rgba(255,255,255,0.8)] mb-3">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-6 space-y-2 text-sm text-[rgba(255,255,255,0.8)] mb-3">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm text-[rgba(255,255,255,0.8)] pl-1">
                        {children}
                      </li>
                    ),
                    // Style inline code
                    code: ({ children }) => (
                      <code className="rounded bg-[rgba(255,255,255,0.1)] px-1.5 py-0.5 text-xs text-[#00e5e5]">
                        {children}
                      </code>
                    ),
                    // Style bold and italic
                    strong: ({ children }) => (
                      <strong className="font-semibold text-white">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-[rgba(255,255,255,0.9)]">
                        {children}
                      </em>
                    ),
                    // Style horizontal rules
                    hr: () => (
                      <hr className="my-4 border-[rgba(255,255,255,0.1)]" />
                    ),
                  }}
                >
                  {segment.content}
                </ReactMarkdown>
              );
            })}
          </div>
        </div>

        {/* Got it Button */}
        <button
          onClick={onComplete}
          className="mt-6 w-full rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] py-3 text-sm font-medium text-[#101012] transition hover:bg-[#33ebeb]"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
