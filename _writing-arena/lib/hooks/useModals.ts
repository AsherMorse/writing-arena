import { useState, useCallback } from 'react';

/**
 * Hook for managing multiple modal states
 * 
 * Provides backward-compatible modal state management for tips and ranking modals.
 * This hook centralizes the common pattern of managing multiple modal states.
 * 
 * @returns Object with modal states and controls
 * 
 * @example
 * ```tsx
 * const { showTipsModal, setShowTipsModal, showRankingModal, setShowRankingModal, closeAllModals } = useModals();
 * 
 * return (
 *   <>
 *     <button onClick={() => setShowTipsModal(true)}>Show Tips</button>
 *     <button onClick={() => setShowRankingModal(true)}>Show Ranking</button>
 *     <button onClick={closeAllModals}>Close All</button>
 *     <Modal isOpen={showTipsModal} onClose={() => setShowTipsModal(false)}>Tips</Modal>
 *     <Modal isOpen={showRankingModal} onClose={() => setShowRankingModal(false)}>Ranking</Modal>
 *   </>
 * );
 * ```
 */
export function useModals() {
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  
  const closeAllModals = useCallback(() => {
    setShowTipsModal(false);
    setShowRankingModal(false);
  }, []);
  
  return {
    showTipsModal,
    setShowTipsModal,
    showRankingModal,
    setShowRankingModal,
    closeAllModals,
  };
}
