/**
 * @fileoverview Scroll shadow indicator component.
 * Shows shadow at bottom when there's more to scroll.
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
 * @description Wrapper that shows shadow at bottom when scrollable.
 * Automatically detects overflow and scroll position.
 */
export function ScrollShadow({ children, className = '', contentClassName = '', maxHeight }: ScrollShadowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showShadow, setShowShadow] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkOverflow = () => {
      const hasScrollableContent = container.scrollHeight > container.clientHeight;
      const atBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 2;
      setShowShadow(hasScrollableContent && !atBottom);
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
          opacity: showShadow ? 1 : 0,
          background: 'linear-gradient(to top, rgba(81, 58, 31, 0.5) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
