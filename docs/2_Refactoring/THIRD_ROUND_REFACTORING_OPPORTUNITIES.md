# Third Round Refactoring Opportunities

> Additional refactoring opportunities identified after third round

## 🔍 Analysis Summary

After executing three rounds of refactoring, we've identified **7 more refactoring opportunities** that would further improve code quality and consistency.

---

## 1. ⏱️ Countdown Timer Hook (MEDIUM PRIORITY)

### Problem
Countdown timer logic repeated in **3+ components**:
- `MatchmakingContent.tsx` - Countdown for match start
- `useSession.ts` - Time remaining calculation
- Similar patterns in phase components

### Current Code
```typescript
// Repeated in multiple files
const [countdown, setCountdown] = useState<number | null>(null);

useEffect(() => {
  if (countdown === null) return;
  
  if (countdown <= 0) {
    // Handle countdown complete
    return;
  }
  
  const timer = setInterval(() => {
    setCountdown(prev => {
      if (prev === null || prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  
  return () => clearInterval(timer);
}, [countdown]);
```

### Solution
**Create:** `lib/hooks/useCountdown.ts`
```typescript
import { useState, useEffect, useCallback } from 'react';

interface UseCountdownOptions {
  initialValue?: number;
  onComplete?: () => void;
  interval?: number;
}

export function useCountdown(options: UseCountdownOptions = {}) {
  const { initialValue = null, onComplete, interval = 1000 } = options;
  const [countdown, setCountdown] = useState<number | null>(initialValue);
  
  const start = useCallback((value: number) => {
    setCountdown(value);
  }, []);
  
  const stop = useCallback(() => {
    setCountdown(null);
  }, []);
  
  const reset = useCallback((value?: number) => {
    setCountdown(value ?? initialValue ?? null);
  }, [initialValue]);
  
  useEffect(() => {
    if (countdown === null || countdown <= 0) {
      if (countdown === 0 && onComplete) {
        onComplete();
      }
      return;
    }
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [countdown, onComplete, interval]);
  
  return {
    countdown,
    start,
    stop,
    reset,
    isActive: countdown !== null && countdown > 0,
  };
}
```

**Impact:** Remove ~20 lines per component, **3+ components** simplified

---

## 2. 🎨 Tip Carousel Hook (LOW PRIORITY)

### Problem
Tip carousel rotation logic repeated in **2+ components**:
- `MatchmakingContent.tsx` - Writing Revolution tips carousel
- `WaitingForPlayers.tsx` - Similar tip rotation

### Current Code
```typescript
// Repeated in multiple files
const [currentTipIndex, setCurrentTipIndex] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTipIndex(prev => (prev + 1) % writingTips.length);
  }, 5000);
  
  return () => clearInterval(interval);
}, [writingTips.length]);
```

### Solution
**Create:** `lib/hooks/useCarousel.ts`
```typescript
import { useState, useEffect } from 'react';

interface UseCarouselOptions {
  items: any[];
  interval?: number;
  autoPlay?: boolean;
}

export function useCarousel<T>(options: UseCarouselOptions) {
  const { items, interval = 5000, autoPlay = true } = options;
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const next = () => {
    setCurrentIndex(prev => (prev + 1) % items.length);
  };
  
  const prev = () => {
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
  };
  
  const goTo = (index: number) => {
    setCurrentIndex(index % items.length);
  };
  
  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;
    
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [items.length, interval, autoPlay]);
  
  return {
    currentIndex,
    currentItem: items[currentIndex],
    next,
    prev,
    goTo,
  };
}
```

**Impact:** Remove ~10 lines per component, **2+ components** simplified

---

## 3. 📝 Form Validation Utilities (MEDIUM PRIORITY)

### Problem
Form validation logic scattered across **3+ components**:
- `PeerFeedbackContent.tsx` - `isFormComplete()` function
- `RevisionContent.tsx` - Empty/unchanged checks
- `WritingSessionContent.tsx` - Empty submission checks

### Current Code
```typescript
// Repeated validation patterns
const isFormComplete = () => {
  return Object.values(responses).every(response => response.trim().length > 10);
};

const isEmpty = !content || content.trim().length === 0 || wordCount === 0;
const unchanged = revisedContent === originalContent;
```

### Solution
**Create:** `lib/utils/validation.ts`
```typescript
/**
 * Form validation utilities
 */

export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

export function isMinLength(value: string, minLength: number): boolean {
  return value.trim().length >= minLength;
}

export function isFormComplete(
  responses: Record<string, string>,
  minLength: number = 10
): boolean {
  return Object.values(responses).every(response => 
    isMinLength(response, minLength)
  );
}

export function isUnchanged(original: string, revised: string): boolean {
  return original.trim() === revised.trim();
}

export function hasMinimumWords(content: string, minWords: number): boolean {
  const words = content.trim().split(/\s+/).filter(w => w.length > 0);
  return words.length >= minWords;
}

export function validateSubmission(
  content: string,
  wordCount: number,
  minWords: number = 1
): { isValid: boolean; error?: string } {
  if (isEmpty(content)) {
    return { isValid: false, error: 'Content cannot be empty' };
  }
  
  if (wordCount < minWords) {
    return { isValid: false, error: `Minimum ${minWords} word(s) required` };
  }
  
  return { isValid: true };
}
```

**Impact:** Remove ~15 lines per component, **3+ components** simplified

---

## 4. 🔄 Firestore Update Helpers (MEDIUM PRIORITY)

### Problem
Firestore update patterns with `serverTimestamp()` repeated in **5+ components**:
- `WritingSessionContent.tsx`
- `PeerFeedbackContent.tsx`
- `RevisionContent.tsx`
- `ResultsContent.tsx`
- Similar patterns elsewhere

### Current Code
```typescript
// Repeated pattern
const { updateDoc, doc, serverTimestamp } = await import('firebase/firestore');
const matchRef = doc(db, 'matchStates', matchId);

await updateDoc(matchRef, {
  'rankings.phase1': rankings,
  updatedAt: serverTimestamp(),
});
```

### Solution
**Create:** `lib/utils/firestore-helpers.ts`
```typescript
import { doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';

/**
 * Update match state document with automatic timestamp
 */
export async function updateMatchState(
  matchId: string,
  updates: Record<string, any>
): Promise<void> {
  const matchRef = doc(db, 'matchStates', matchId);
  await updateDoc(matchRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update session document with automatic timestamp
 */
export async function updateSession(
  sessionId: string,
  updates: Record<string, any>
): Promise<void> {
  const sessionRef = doc(db, 'sessions', sessionId);
  await updateDoc(sessionRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update rankings for a specific phase
 */
export async function updatePhaseRankings(
  matchId: string,
  phase: 1 | 2 | 3,
  rankings: any[]
): Promise<void> {
  await updateMatchState(matchId, {
    [`rankings.phase${phase}`]: rankings,
  });
}
```

**Impact:** Remove ~5 lines per usage, **5+ components** simplified

---

## 5. 🎯 Avatar & Display Name Utilities (LOW PRIORITY)

### Problem
Avatar and display name fallback logic repeated in **5+ components**:
- `MatchmakingContent.tsx` - `userAvatar` fallback
- `ResultsContent.tsx` - Player avatar fallbacks
- Similar patterns throughout

### Current Code
```typescript
// Repeated fallback patterns
const userAvatar = typeof userProfile?.avatar === 'string' 
  ? userProfile.avatar 
  : '🌿';

const avatar = player.avatar || (player.isAI ? '🤖' : '👤');
const displayName = player.displayName || 'Unknown Player';
```

### Solution
**Create:** `lib/utils/player-utils.ts`
```typescript
/**
 * Player utility functions
 */

export function getPlayerAvatar(
  avatar: string | null | undefined,
  isAI: boolean = false,
  fallback: string = '👤'
): string {
  if (avatar && typeof avatar === 'string') {
    return avatar;
  }
  
  if (isAI) {
    return '🤖';
  }
  
  return fallback;
}

export function getPlayerDisplayName(
  displayName: string | null | undefined,
  fallback: string = 'Unknown Player'
): string {
  return displayName || fallback;
}

export function getPlayerRank(
  rank: string | null | undefined,
  fallback: string = 'Silver III'
): string {
  return rank || fallback;
}

export function normalizePlayerAvatar(avatar: any): string {
  if (typeof avatar === 'string') {
    return avatar;
  }
  
  if (avatar && typeof avatar === 'object' && avatar.emoji) {
    return avatar.emoji;
  }
  
  return '🌿';
}
```

**Impact:** Remove ~5 lines per component, **5+ components** simplified

---

## 6. 📊 Expandable Section Hook (LOW PRIORITY)

### Problem
Expandable/collapsible section state management repeated in **2+ components**:
- `ResultsContent.tsx` - `expandedPhase` state
- Similar patterns elsewhere

### Current Code
```typescript
// Repeated pattern
const [expandedPhase, setExpandedPhase] = useState<string | null>('writing');

const togglePhase = (phase: string) => {
  setExpandedPhase(prev => prev === phase ? null : phase);
};

const isExpanded = (phase: string) => expandedPhase === phase;
```

### Solution
**Create:** `lib/hooks/useExpanded.ts`
```typescript
import { useState, useCallback } from 'react';

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
```

**Impact:** Remove ~10 lines per component, **2+ components** simplified

---

## 7. 🎨 Animation Utilities (LOW PRIORITY)

### Problem
Animation class combinations repeated in **3+ components**:
- Loading spinners
- Bounce animations
- Pulse effects
- Similar patterns

### Current Code
```typescript
// Repeated animation patterns
className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"
className="animate-bounce"
className="animate-pulse"
```

### Solution
**Create:** `lib/utils/animation-utils.ts`
```typescript
/**
 * Animation utility classes
 */

export const ANIMATIONS = {
  spin: 'animate-spin',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  ping: 'animate-ping',
} as const;

export function getSpinnerClasses(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const sizes = {
    sm: 'h-8 w-8 border',
    md: 'h-16 w-16 border-b-2',
    lg: 'h-24 w-24 border-b-4',
  };
  
  return `${ANIMATIONS.spin} rounded-full ${sizes[size]} border-white`;
}

export function getBounceDelay(index: number): string {
  return `style={{ animationDelay: '${index * 150}ms' }}`;
}

export function getLoadingDots(): string {
  return 'flex gap-2';
}
```

**Impact:** Better consistency, easier to update animations globally

---

## 📊 Refactoring Impact Summary

| Refactoring | Files Affected | Lines Saved | Priority | Status |
|------------|---------------|-------------|----------|--------|
| Countdown Timer Hook | 3+ | ~60 | MEDIUM | 🔴 Not Started |
| Tip Carousel Hook | 2+ | ~20 | LOW | 🔴 Not Started |
| Form Validation Utils | 3+ | ~45 | MEDIUM | 🔴 Not Started |
| Firestore Update Helpers | 5+ | ~25 | MEDIUM | 🔴 Not Started |
| Avatar & Display Name Utils | 5+ | ~25 | LOW | 🔴 Not Started |
| Expandable Section Hook | 2+ | ~20 | LOW | 🔴 Not Started |
| Animation Utilities | 3+ | ~15 | LOW | 🔴 Not Started |

**Total Estimated Impact:**
- **~210+ lines** of duplicate code removed
- **~23+ files** simplified
- **Better consistency** across codebase
- **Easier maintenance** and testing

---

## 🚀 Recommended Implementation Order

1. **Form Validation Utils** (High impact, affects 3+ files)
2. **Firestore Update Helpers** (Common operation, affects 5+ files)
3. **Countdown Timer Hook** (Reusable pattern)
4. **Avatar & Display Name Utils** (Quick win)
5. **Tip Carousel Hook** (Quick win)
6. **Expandable Section Hook** (Quick win)
7. **Animation Utilities** (Polish)

---

## ✅ Next Steps

1. Create form validation utilities
2. Create Firestore update helpers
3. Create countdown timer hook
4. Create avatar/display name utilities
5. Create tip carousel hook
6. Create expandable section hook
7. Create animation utilities
8. Update components to use new utilities
9. Update tests
10. Update documentation

---

*Last updated: 2024 - After third round of refactoring execution*

