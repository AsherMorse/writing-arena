# Remaining Refactoring Opportunities

> Additional refactoring opportunities identified after multiple rounds

## 🔍 Analysis Summary

After executing multiple rounds of refactoring, we've identified **remaining opportunities** that would further improve code quality and consistency.

---

## ✅ Already Implemented (But Not Fully Utilized)

### 1. ✅ Loading & Error State Components
**Status:** Components exist (`LoadingState.tsx`, `ErrorState.tsx`) but not all components use them

**Files Still Using Inline Loading States:**
- `app/session/[sessionId]/page.tsx` - Has inline loading/error states
- `components/ranked/PeerFeedbackContent.tsx` - Has inline loading state (line 433-441)

**Action Needed:** Update components to use shared components

---

### 2. ✅ Medal Emoji & Rank Utilities
**Status:** `lib/utils/rank-utils.ts` exists with `getMedalEmoji()`, `getRankColor()`, `getRankBgColor()`

**Usage:** Found 17 matches across 5 files - **GOOD**

---

### 3. ✅ Retry Logic Utility
**Status:** `lib/utils/retry.ts` exists with `retryWithBackoff()` and `retryUntilSuccess()`

**Action Needed:** Verify all retry patterns use this utility

---

### 4. ✅ Score Color Utilities
**Status:** `lib/utils/score-utils.ts` exists with `getScoreColor()`, `getScoreBgColor()`, `getScoreBorderColor()`

**Action Needed:** Check if `practice/ResultsContent.tsx` uses `scoreTone()` - should migrate to `getScoreColor()`

---

### 5. ✅ Player Ranking Utilities
**Status:** `lib/utils/ranking-utils.ts` exists with `rankPlayers()`, `getPlayerRank()`, `findPlayerInRankings()`

**Usage:** Found in `ResultsContent.tsx` - **GOOD**

---

### 6. ✅ Session Storage Utilities
**Status:** `lib/utils/session-storage.ts` exists

**Action Needed:** Verify all sessionStorage usage goes through utilities

---

## 🆕 New Refactoring Opportunities

### 1. 🎨 Modal Component Pattern (MEDIUM PRIORITY)

**Problem:**
Similar modal structure repeated across components:
- Ranking modals in `PeerFeedbackContent.tsx` and `RevisionContent.tsx`
- Tips modals across multiple components
- Same backdrop/centering/close pattern

**Current Code:**
```typescript
// Repeated modal pattern
{showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div className="rounded-3xl border border-blue-400/30 bg-[#141e27] p-12 shadow-2xl text-center max-w-md mx-4">
      {/* Content */}
      <button onClick={() => setShowModal(false)}>Close</button>
    </div>
  </div>
)}
```

**Solution:**
**Create:** `components/shared/Modal.tsx`
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'ranking' | 'tips';
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, variant = 'default', size = 'md' }: ModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className={`rounded-3xl border bg-[#141e27] p-12 shadow-2xl text-center mx-4 ${
          variant === 'ranking' ? 'border-blue-400/30' : 'border-white/20'
        } ${
          size === 'sm' ? 'max-w-sm' : size === 'md' ? 'max-w-md' : 'max-w-lg'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="text-3xl font-bold text-white mb-3">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
```

**Impact:** Remove ~15 lines per modal, **5+ components** simplified

---

### 2. 🔄 Async Data Fetching Hook (MEDIUM PRIORITY)

**Problem:**
Similar async data fetching patterns with loading/error states repeated:
- `PeerFeedbackContent.tsx` - Fetches peer writing
- `RevisionContent.tsx` - Fetches peer feedback
- `ResultsContent.tsx` - Fetches AI feedback

**Current Code:**
```typescript
// Repeated pattern
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await fetchSomeData();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [dependencies]);
```

**Solution:**
**Create:** `lib/hooks/useAsyncData.ts`
```typescript
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: () => fetchData() };
}
```

**Impact:** Remove ~20 lines per usage, **3+ components** simplified

---

### 3. 📊 URL Parameter Parsing Hook (LOW PRIORITY)

**Problem:**
URL parameter parsing repeated in multiple components:
- `ResultsContent.tsx` - Parses results params
- `RevisionContent.tsx` - Parses session params
- Similar patterns elsewhere

**Current Code:**
```typescript
// Repeated parsing
const matchId = searchParams.get('matchId') || '';
const trait = searchParams.get('trait');
const promptId = searchParams.get('promptId');
// ... many more
```

**Solution:**
**Create:** `lib/hooks/useSearchParams.ts`
```typescript
export function useSearchParams<T extends Record<string, string | null>>(
  parser: (params: URLSearchParams) => T
): T {
  const searchParams = useSearchParams();
  return useMemo(() => parser(searchParams), [searchParams, parser]);
}
```

**Impact:** Cleaner parameter handling, type-safe parsing

---

### 4. 🎯 Debounced Input Hook (LOW PRIORITY)

**Problem:**
Debounced input patterns for word count updates:
- `WritingSessionContent.tsx` - Updates word count on input
- Similar patterns in other session components

**Current Code:**
```typescript
// Repeated debounce pattern
useEffect(() => {
  const timer = setTimeout(() => {
    setWordCount(countWords(writingContent));
  }, 300);
  return () => clearTimeout(timer);
}, [writingContent]);
```

**Solution:**
**Create:** `lib/hooks/useDebounce.ts`
```typescript
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**Impact:** Remove ~5 lines per usage, **3+ components** simplified

---

### 5. 🎨 Button Component Variants (LOW PRIORITY)

**Problem:**
Similar button styles repeated across components:
- Primary buttons (emerald/blue gradients)
- Secondary buttons (white/10 backgrounds)
- Danger buttons (red variants)
- Icon buttons

**Solution:**
**Create:** `components/ui/Button.tsx`
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ variant = 'primary', size = 'md', isLoading, children, ...props }: ButtonProps) {
  // Standardized button styles
}
```

**Impact:** Consistent button styling, easier theme updates

---

## 📊 Refactoring Impact Summary

| Refactoring | Files Affected | Lines Saved | Priority | Status |
|------------|---------------|-------------|----------|--------|
| Update to use LoadingState/ErrorState | 2+ | ~50 | MEDIUM | 🔴 Not Started |
| Modal Component | 5+ | ~75 | MEDIUM | 🔴 Not Started |
| Async Data Fetching Hook | 3+ | ~60 | MEDIUM | 🔴 Not Started |
| URL Parameter Parsing Hook | 2+ | ~30 | LOW | 🔴 Not Started |
| Debounced Input Hook | 3+ | ~15 | LOW | 🔴 Not Started |
| Button Component Variants | 10+ | ~50 | LOW | 🔴 Not Started |

**Total Estimated Impact:**
- **~280+ lines** of duplicate code removed
- **~25+ files** simplified
- **Better consistency** across codebase
- **Easier maintenance** and testing

---

## 🚀 Recommended Implementation Order

1. **Update components to use LoadingState/ErrorState** (Quick win, high impact)
2. **Modal Component** (High reuse, affects 5+ files)
3. **Async Data Fetching Hook** (Reusable pattern)
4. **Debounced Input Hook** (Quick win)
5. **URL Parameter Parsing Hook** (Polish)
6. **Button Component Variants** (Polish, consider using a UI library)

---

## ✅ Next Steps

1. Update `PeerFeedbackContent.tsx` and `app/session/[sessionId]/page.tsx` to use `LoadingState`/`ErrorState`
2. Create `Modal` component and update ranking/tips modals
3. Create `useAsyncData` hook and refactor data fetching
4. Create `useDebounce` hook for input handling
5. Create `useSearchParams` hook for URL parsing
6. Consider creating `Button` component or adopting a UI library (shadcn/ui)

---

*Last updated: After third round of refactoring execution*

