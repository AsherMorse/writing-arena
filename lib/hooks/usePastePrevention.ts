import { useState, useCallback } from 'react';

interface UsePastePreventionOptions {
  showWarning?: boolean;
  warningDuration?: number;
}

/**
 * Hook for preventing paste/copy/cut operations in textareas
 * Used in writing sessions to prevent cheating
 */
export function usePastePrevention(options: UsePastePreventionOptions = {}) {
  const { showWarning = true, warningDuration = 3000 } = options;
  const [showPasteWarning, setShowPasteWarning] = useState(false);
  
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    if (showWarning) {
      setShowPasteWarning(true);
      setTimeout(() => setShowPasteWarning(false), warningDuration);
    }
  }, [showWarning, warningDuration]);
  
  const handleCut = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
  }, []);
  
  const handleCopy = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
  }, []);
  
  return {
    showPasteWarning,
    setShowPasteWarning,
    handlePaste,
    handleCut,
    handleCopy,
  };
}

