/**
 * Auto-save hook for saving draft content to sessionStorage
 * Prevents data loss if user navigates away or refreshes
 */

import { useEffect, useRef, useState } from 'react';
import { setSessionStorage, getSessionStorage } from '@/lib/utils/session-storage';

interface UseAutoSaveOptions {
  /** Unique key for this draft (e.g., sessionId-phase) */
  key: string;
  /** Content to auto-save */
  content: string;
  /** Debounce delay in milliseconds (default: 1000) */
  debounceMs?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Auto-save content to sessionStorage with debouncing
 * Returns restored content on first mount
 */
export function useAutoSave({ key, content, debounceMs = 1000, enabled = true }: UseAutoSaveOptions): string | null {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const storageKey = `draft-${key}`;
  const [restoredContent] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return getSessionStorage<string>(storageKey);
  });
  const previousContentRef = useRef<string>(content);
  
  // Auto-save with debouncing
  useEffect(() => {
    if (!enabled || !key) return;
    
    // Don't save if content hasn't changed
    if (content === previousContentRef.current) return;
    previousContentRef.current = content;
    
    // Don't save empty content
    if (!content || content.trim() === '') return;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setSessionStorage(storageKey, content);
    }, debounceMs);
    
    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, storageKey, debounceMs, enabled, key]);
  
  // Clear draft when content is submitted (empty)
  useEffect(() => {
    if (enabled && (!content || content.trim() === '')) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(storageKey);
      }
    }
  }, [content, storageKey, enabled]);
  
  return restoredContent;
}

/**
 * Clear a saved draft
 */
export function clearDraft(key: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(`draft-${key}`);
}

