import { useState } from 'react';

/**
 * Hook for managing multiple modal states
 * Common pattern across components
 */
export function useModals() {
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  
  return {
    showTipsModal,
    setShowTipsModal,
    showRankingModal,
    setShowRankingModal,
    closeAllModals: () => {
      setShowTipsModal(false);
      setShowRankingModal(false);
    },
  };
}

