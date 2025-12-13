/**
 * @fileoverview Scroll shadow indicator component.
 * Shows shadows at top/bottom when content is cut off.
 */
'use client';

import { useRef, useState, useEffect, ReactNode } from 'react';

interface ScrollShadowProps {
  children: ReactNode;
  /** Classes for the outer wrapper (layout: flex-1, w-80, etc.) */
  className?: string;
  /** Classes for the scrollable content area (spacing: space-y-4, etc.) */
  contentClassName?: string;
  /** Max height constraint (e.g., "400px" or "calc(100vh - 250px)") */
  maxHeight?: string;
}

/**
 * @description Wrapper that shows shadows at top/bottom when content is cut off.
 * Automatically detects overflow and scroll position.
 */
export function ScrollShadow({ children, className = '', contentClassName = '', maxHeight }: ScrollShadowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkOverflow = () => {
      const hasScrollableContent = container.scrollHeight > container.clientHeight;
      const atTop = container.scrollTop <= 2;
      const atBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 2;
      setShowTopShadow(hasScrollableContent && !atTop);
      setShowBottomShadow(hasScrollableContent && !atBottom);
    };

    checkOverflow();
    container.addEventListener('scroll', checkOverflow);
    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', checkOverflow);
      resizeObserver.disconnect();
    };
  }, [children]);

  return (
    <div className={`relative ${className}`}>
      {/* Top shadow indicator */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-12 z-10 transition-opacity duration-200"
        style={{
          opacity: showTopShadow ? 1 : 0,
          background: 'linear-gradient(to bottom, rgba(81, 58, 31, 0.5) 0%, transparent 100%)',
        }}
      />
      
      <div
        ref={containerRef}
        className={`overflow-y-auto parchment-scrollbar ${contentClassName}`}
        style={{ maxHeight }}
      >
        {children}
      </div>
      
      {/* Bottom shadow indicator */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 transition-opacity duration-200"
        style={{
          opacity: showBottomShadow ? 1 : 0,
          background: 'linear-gradient(to top, rgba(81, 58, 31, 0.5) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
