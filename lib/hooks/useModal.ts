import { useState, useCallback } from 'react';

/**
 * Hook for managing modal open/close state
 * Provides consistent modal state management across components
 * 
 * @param initialState - Initial open state (default: false)
 * @returns Object with isOpen state and open/close/toggle functions
 * 
 * @example
 * ```tsx
 * const { isOpen, open, close, toggle } = useModal();
 * 
 * return (
 *   <>
 *     <button onClick={open}>Open Modal</button>
 *     <Modal isOpen={isOpen} onClose={close}>Content</Modal>
 *   </>
 * );
 * ```
 */
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  return { 
    isOpen, 
    open, 
    close, 
    toggle,
    setIsOpen, // Allow direct control if needed
  };
}

