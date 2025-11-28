import React from 'react';

interface ConditionalRenderProps {
  condition: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Component for conditional rendering with optional fallback
 * Provides a cleaner API for conditional rendering patterns
 * 
 * @example
 * ```tsx
 * <ConditionalRender 
 *   condition={!isLoading && !!data} 
 *   fallback={<LoadingState />}
 * >
 *   <Results data={data} />
 * </ConditionalRender>
 * ```
 */
export function ConditionalRender({ condition, fallback, children }: ConditionalRenderProps) {
  if (!condition) {
    return <>{fallback}</> || null;
  }
  return <>{children}</>;
}

