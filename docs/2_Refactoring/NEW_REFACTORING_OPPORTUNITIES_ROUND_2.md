# New Refactoring Opportunities - Round 2

> Additional opportunities identified after comprehensive codebase scan

## 🔍 Analysis Summary

After scanning the codebase, I've identified **10 new refactoring opportunities** that would further improve code quality, reduce duplication, and enhance maintainability.

---

## 54. Hardcoded Color Values in Components (MEDIUM PRIORITY)

**Status:** Pending

**Problem:**
1087 hardcoded color values across 52 files:
- `#ff5f8f` (pink) - Phase 2 color
- `#00e5e5` (cyan) - Phase 1 color  
- `#ff9030` (orange) - Accent color
- `#00d492` (green) - Phase 3 color
- `#101012` (dark background)
- `rgba(255,95,143,0.3)` - Pink with opacity
- Many more inline color values

**Current Pattern:**
```typescript
// Scattered across components
className="text-[#ff5f8f]"
style={{ color: '#00e5e5' }}
bg-[rgba(255,95,143,0.15)]
border-[rgba(0,229,229,0.2)]
```

**Solution:**
Extend `lib/constants/colors.ts` with Tailwind class helpers:
```typescript
export const COLOR_CLASSES = {
  phase1: {
    text: 'text-[#00e5e5]',
    bg: 'bg-[#00e5e5]',
    border: 'border-[#00e5e5]',
    bgOpacity: (opacity: number) => `bg-[rgba(0,229,229,${opacity})]`,
  },
  phase2: {
    text: 'text-[#ff5f8f]',
    bg: 'bg-[#ff5f8f]',
    border: 'border-[#ff5f8f]',
    bgOpacity: (opacity: number) => `bg-[rgba(255,95,143,${opacity})]`,
  },
  // ... etc
} as const;
```

**Impact:**
- Consistent theming across 52 files
- Easier to update colors globally
- Better maintainability

**Files:**
- All 52 files with hardcoded colors (gradual migration)

---

## 55. Math Utility Functions Duplication (LOW PRIORITY)

**Status:** Pending

**Problem:**
27 Math operations across 12 files:
- `Math.round()` - Score rounding
- `Math.floor()` - Time calculations
- `Math.max()` / `Math.min()` - Score clamping
- `Math.ceil()` - Word count calculations

**Current Pattern:**
```typescript
// Repeated patterns
Math.round(score)
Math.floor(seconds / 60)
Math.max(0, Math.min(100, score))
```

**Solution:**
Create `lib/utils/math-utils.ts`:
```typescript
export function roundScore(score: number): number {
  return Math.round(score);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function floorDiv(dividend: number, divisor: number): number {
  return Math.floor(dividend / divisor);
}
```

**Impact:**
- Consistent math operations
- Easier to add logging/debugging
- Better testability

**Files:**
- 12 files with Math operations

---

## 56. Array/Object Utility Functions (LOW PRIORITY)

**Status:** Pending

**Problem:**
43 array/object operations across 11 files:
- `.length === 0` checks
- `Object.keys()` / `Object.values()` patterns
- `Array.isArray()` checks
- `.find()` / `.filter()` / `.map()` patterns

**Current Pattern:**
```typescript
// Repeated patterns
if (array.length === 0) return;
const keys = Object.keys(obj);
const values = Object.values(obj);
if (Array.isArray(data)) { ... }
```

**Solution:**
Create `lib/utils/array-utils.ts` and `lib/utils/object-utils.ts`:
```typescript
// array-utils.ts
export function isEmpty<T>(array: T[] | null | undefined): boolean {
  return !array || array.length === 0;
}

export function isNotEmpty<T>(array: T[] | null | undefined): boolean {
  return !!array && array.length > 0;
}

// object-utils.ts
export function isEmptyObject(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

export function getObjectKeys<T extends Record<string, any>>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}
```

**Impact:**
- Consistent array/object checks
- Better type safety
- Easier to maintain

**Files:**
- 11 files with array/object operations

---

## 57. Loading State Hook Pattern (MEDIUM PRIORITY)

**Status:** Pending

**Problem:**
57 loading state patterns across 12 files:
- `isLoading` / `setIsLoading` pairs
- `isSubmitting` / `setIsSubmitting` pairs
- Similar error state management

**Current Pattern:**
```typescript
// Repeated in multiple files
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

const fetchData = async () => {
  setIsLoading(true);
  setError(null);
  try {
    // ... fetch
  } catch (err) {
    setError(err);
  } finally {
    setIsLoading(false);
  }
};
```

**Solution:**
Create `lib/hooks/useAsyncState.ts`:
```typescript
export function useAsyncState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, execute, reset: () => { setData(null); setError(null); } };
}
```

**Impact:**
- Remove ~15 lines per component
- Consistent loading/error handling
- Better UX patterns

**Files:**
- 12 files with loading state patterns

---

## 58. Router Navigation Utilities (LOW PRIORITY)

**Status:** Pending

**Problem:**
56 router.push/replace patterns across 16 files:
- Similar URL building patterns
- Query parameter construction
- Navigation with state

**Current Pattern:**
```typescript
// Repeated patterns
router.push(`/ranked/results?matchId=${matchId}&trait=${trait}&...`);
router.push(`/ranked/phase-rankings?phase=${phase}&sessionId=${sessionId}&...`);
```

**Solution:**
Create `lib/utils/navigation-helpers.ts`:
```typescript
export function buildResultsURL(params: ResultsURLParams): string {
  // Already exists but could be enhanced
}

export function navigateToResults(router: AppRouter, params: ResultsURLParams): void {
  router.push(buildResultsURL(params));
}

export function navigateToPhaseRankings(router: AppRouter, params: PhaseRankingsParams): void {
  const url = buildPhaseRankingsURL(params);
  router.push(url);
}
```

**Impact:**
- Consistent navigation patterns
- Type-safe URL building
- Easier to update routes

**Files:**
- 16 files with router navigation

---

## 59. API Error Response Standardization (MEDIUM PRIORITY)

**Status:** Pending

**Problem:**
Similar error response patterns across 11 API routes:
- Error structure varies
- Status codes inconsistent
- Error messages not standardized

**Current Pattern:**
```typescript
// Different patterns across routes
return NextResponse.json({ error: 'Failed' }, { status: 500 });
return NextResponse.json({ error: 'API key missing' }, { status: 500 });
return createErrorResponse('Failed', 500);
```

**Solution:**
Standardize using `createErrorResponse` utility (already exists):
- Ensure all routes use it
- Add error codes/types
- Consistent error structure

**Impact:**
- Consistent API error responses
- Better error handling on client
- Easier debugging

**Files:**
- 11 API route files

---

## 60. Modal State Management Hook (LOW PRIORITY)

**Status:** Pending

**Problem:**
146 modal patterns across 18 files:
- `isOpen` / `setIsOpen` pairs
- `onClose` handlers
- Similar open/close logic

**Current Pattern:**
```typescript
// Repeated in multiple files
const [showModal, setShowModal] = useState(false);
const openModal = () => setShowModal(true);
const closeModal = () => setShowModal(false);
```

**Solution:**
Create `lib/hooks/useModal.ts`:
```typescript
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  return { isOpen, open, close, toggle };
}
```

**Impact:**
- Remove ~3 lines per modal
- Consistent modal state management
- Easier to add features (e.g., history)

**Files:**
- 18 files with modal patterns

---

## 61. Form Input Handler Pattern (LOW PRIORITY)

**Status:** Pending

**Problem:**
20 onChange/setState patterns across 8 files:
- Similar input handling
- State updates for form fields
- Validation on change

**Current Pattern:**
```typescript
// Repeated patterns
const [value, setValue] = useState('');
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

**Solution:**
Create `lib/hooks/useInput.ts`:
```typescript
export function useInput(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value);
  }, []);
  
  const reset = useCallback(() => setValue(initialValue), [initialValue]);
  
  return { value, setValue, handleChange, reset };
}
```

**Impact:**
- Consistent input handling
- Less boilerplate
- Easier to add features (validation, debouncing)

**Files:**
- 8 files with form input patterns

---

## 62. Timer/Counter Hook Pattern (LOW PRIORITY)

**Status:** Pending

**Problem:**
Similar timer patterns across components:
- Countdown timers
- Interval-based updates
- Time remaining calculations

**Current Pattern:**
```typescript
// Similar patterns in multiple files
const [timeRemaining, setTimeRemaining] = useState(initialTime);
useEffect(() => {
  const interval = setInterval(() => {
    setTimeRemaining(prev => prev - 1);
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

**Solution:**
Enhance existing `useCountdown` hook or create `useTimer`:
- Already have `useCountdown` but could be enhanced
- Add pause/resume functionality
- Better time formatting integration

**Impact:**
- Consistent timer patterns
- Better timer management
- Easier to add features

**Files:**
- Components with timer logic

---

## 63. Component Size Reduction - Large Components (HIGH PRIORITY)

**Status:** Pending

**Problem:**
Several large components still exist:
- `WritingSessionContent.tsx` - ~500 lines
- `ResultsContent.tsx` - ~490 lines
- `PeerFeedbackContent.tsx` - ~370 lines
- `RevisionContent.tsx` - ~430 lines

**Solution:**
Break down into smaller sub-components:
- Extract UI sections
- Extract hooks for logic
- Extract utilities for calculations

**Impact:**
- Better maintainability
- Easier testing
- Clearer separation of concerns

**Files:**
- Large component files

---

## Summary

**New Opportunities Identified:** 10
- **High Priority:** 1 (#63)
- **Medium Priority:** 3 (#54, #57, #59)
- **Low Priority:** 6 (#55, #56, #58, #60, #61, #62)

**Total Active Opportunities:** 63
- **Completed:** 46
- **Pending:** 17

