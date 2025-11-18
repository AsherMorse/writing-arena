import { useState, useCallback } from 'react';

/**
 * Hook for managing expandable/collapsible sections
 */
export function useExpanded<T extends string>(
  initialExpanded: T | null = null
) {
  const [expanded, setExpanded] = useState<T | null>(initialExpanded);
  
  const toggle = useCallback((key: T) => {
    setExpanded(prev => prev === key ? null : key);
  }, []);
  
  const expand = useCallback((key: T) => {
    setExpanded(key);
  }, []);
  
  const collapse = useCallback(() => {
    setExpanded(null);
  }, []);
  
  const isExpanded = useCallback((key: T) => {
    return expanded === key;
  }, [expanded]);
  
  return {
    expanded,
    toggle,
    expand,
    collapse,
    isExpanded,
  };
}

