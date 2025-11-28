# New Refactoring Opportunities - Round 6

> Additional refactoring opportunities identified through comprehensive codebase analysis

## 🔍 Analysis Summary

After analyzing the codebase, we've identified **8 new refactoring opportunities** that would further improve code quality, reduce duplication, and enhance maintainability.

---

## 🔴 HIGH PRIORITY

### 88. AP Lang Components - Timer Pattern Duplication

**Status:** Pending

**Problem:**
`APLangWriter.tsx` implements its own timer logic instead of using the existing `useCountdown` hook:
- Custom timer state management
- Manual interval setup/cleanup
- Similar countdown logic already exists in `useCountdown`

**Current Pattern:**
```typescript
// APLangWriter.tsx (lines 14-32)
const [timeRemaining, setTimeRemaining] = useState(AP_LANG_TIME_LIMIT);
const timerRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  if (!hasStarted || timeRemaining <= 0) {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    return;
  }
  timerRef.current = setInterval(() => {
    setTimeRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
  }, 1000);
  return () => { if (timerRef.current) clearInterval(timerRef.current); };
}, [hasStarted, timeRemaining]);
```

**Solution:**
Replace with `useCountdown` hook:
```typescript
import { useCountdown } from '@/lib/hooks/useCountdown';

const { timeRemaining, start, pause, reset } = useCountdown({
  initialTime: AP_LANG_TIME_LIMIT,
  autoStart: false,
  onComplete: () => {
    // Handle time up
  },
});
```

**Impact:** Remove ~15 lines, consistent timer behavior, easier to maintain

**Files:**
- `components/ap-lang/APLangWriter.tsx`

---

### 89. AP Lang Components - Direct Fetch Instead of useApiCall

**Status:** Pending

**Problem:**
Both `APLangWriter.tsx` and `APLangGrader.tsx` use direct `fetch()` calls instead of the standardized `useApiCall` hook:
- Inconsistent error handling
- Manual response parsing
- No standardized error messages

**Current Pattern:**
```typescript
// APLangWriter.tsx and APLangGrader.tsx
const response = await fetch('/api/ap-lang/...', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ... }),
});

if (!response.ok) throw new Error('Failed to...');
const data = await response.json();
```

**Solution:**
Use `useApiCall` hook:
```typescript
import { useApiCall } from '@/lib/hooks/useApiCall';

const { call } = useApiCall();

const data = await call('/api/ap-lang/generate-prompt', {
  method: 'POST',
  body: JSON.stringify({ ... }),
});
```

**Impact:** Consistent API error handling, better error messages, remove ~5 lines per usage

**Files:**
- `components/ap-lang/APLangWriter.tsx`
- `components/ap-lang/APLangGrader.tsx`

---

## 🟡 MEDIUM PRIORITY

### 90. Timer/Counter Hook Pattern - Inline setInterval Usage

**Status:** Pending

**Problem:**
Multiple components use `setInterval` directly for animations/updates instead of reusable hooks:
- `WritingSessionContent.tsx` - AI word count animation
- `quick-match/SessionContent.tsx` - AI word count updates
- `practice/SessionContent.tsx` - Similar patterns
- `APLangWriter.tsx` - Timer countdown

**Current Pattern:**
```typescript
// Repeated in multiple files
useEffect(() => {
  const interval = setInterval(() => {
    setAiWordCounts(prevCounts => {
      // Update logic
    });
  }, 1000);
  return () => clearInterval(interval);
}, [dependencies]);
```

**Solution:**
Create `useInterval` hook for reusable interval logic:
```typescript
// lib/hooks/useInterval.ts
export function useInterval(
  callback: () => void,
  delay: number | null,
  dependencies: any[] = []
) {
  useEffect(() => {
    if (delay === null) return;
    const interval = setInterval(callback, delay);
    return () => clearInterval(interval);
  }, [delay, ...dependencies]);
}
```

**Impact:** Remove ~5 lines per usage, consistent interval handling, easier to test

**Files:**
- `components/ranked/WritingSessionContent.tsx`
- `components/quick-match/SessionContent.tsx`
- `components/practice/SessionContent.tsx`
- `components/ap-lang/APLangWriter.tsx`

---

### 91. Word Count Tracking Pattern - Not Using useDebounce

**Status:** Pending

**Problem:**
Some components still track word count with inline `useEffect` + `setTimeout` instead of using `useDebounce`:
- `quick-match/SessionContent.tsx` - Direct useEffect with setTimeout
- `practice/SessionContent.tsx` - Similar pattern

**Current Pattern:**
```typescript
// quick-match/SessionContent.tsx
useEffect(() => {
  setWordCount(countWords(writingContent));
}, [writingContent]);
```

**Note:** `WritingSessionContent.tsx` already uses `useDebounce` correctly.

**Solution:**
Use `useDebounce` hook:
```typescript
import { useDebounce } from '@/lib/hooks/useDebounce';
import { countWords } from '@/lib/utils/text-utils';

const debouncedContent = useDebounce(writingContent, 300);
useEffect(() => {
  setWordCount(countWords(debouncedContent));
}, [debouncedContent]);
```

**Impact:** Consistent debouncing behavior, better performance, remove ~2 lines

**Files:**
- `components/quick-match/SessionContent.tsx`
- `components/practice/SessionContent.tsx`

---

### 92. Form State Management - Multiple useState Calls

**Status:** Pending

**Problem:**
Components like `APLangGrader.tsx` and `AuthContent.tsx` use multiple `useState` calls for form fields that could be consolidated:
- `APLangGrader.tsx` - essayType, prompt, essay states
- `AuthContent.tsx` - email, password, displayName states

**Current Pattern:**
```typescript
// APLangGrader.tsx
const [essayType, setEssayType] = useState<EssayType>('argument');
const [prompt, setPrompt] = useState('');
const [essay, setEssay] = useState('');
```

**Solution:**
Create `useForm` hook for managing form state:
```typescript
// lib/hooks/useForm.ts
export function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  
  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const reset = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);
  
  return { values, setValue, reset, setValues };
}
```

**Impact:** Cleaner form state management, easier to add validation, remove ~3 lines per form field

**Files:**
- `components/ap-lang/APLangGrader.tsx`
- `components/auth/AuthContent.tsx` (if not already using useInput)

---

### 93. Loading State Pattern - Inline setIsLoading

**Status:** Pending

**Problem:**
Multiple components manage loading states manually with `useState`:
- `APLangWriter.tsx` - isGenerating, isGrading states
- `APLangGrader.tsx` - isGrading state
- Other components with similar patterns

**Current Pattern:**
```typescript
const [isGrading, setIsGrading] = useState(false);

const handleGrade = async () => {
  setIsGrading(true);
  try {
    // ... operation
  } finally {
    setIsGrading(false);
  }
};
```

**Solution:**
Use `useAsyncState` hook (already exists):
```typescript
import { useAsyncState } from '@/lib/hooks/useAsyncState';

const { isLoading, execute } = useAsyncState();

const handleGrade = async () => {
  await execute(async () => {
    // ... operation
  });
};
```

**Impact:** Consistent loading state management, automatic error handling, remove ~3 lines per usage

**Files:**
- `components/ap-lang/APLangWriter.tsx`
- `components/ap-lang/APLangGrader.tsx`
- Other components with manual loading states

---

## 🟢 LOW PRIORITY

### 94. Error State Pattern - Inline useState for Errors

**Status:** Pending

**Problem:**
Components use `useState` for error messages instead of using `useAsyncState` which includes error handling:
- `APLangWriter.tsx` - error state
- `APLangGrader.tsx` - error state

**Current Pattern:**
```typescript
const [error, setError] = useState<string | null>(null);

try {
  // ... operation
} catch (err) {
  setError(err instanceof Error ? err.message : 'An error occurred');
}
```

**Solution:**
Use `useAsyncState` or `useAsyncStateWithStringError`:
```typescript
import { useAsyncStateWithStringError } from '@/lib/hooks/useAsyncState';

const { error, execute } = useAsyncStateWithStringError();

await execute(async () => {
  // ... operation
});
```

**Impact:** Consistent error handling, automatic error state management

**Files:**
- `components/ap-lang/APLangWriter.tsx`
- `components/ap-lang/APLangGrader.tsx`

---

### 95. Component Size - MatchmakingContent.tsx (500 lines)

**Status:** Pending

**Problem:**
`components/ranked/MatchmakingContent.tsx` is 500 lines and could potentially be split further:
- Already extracted hooks (useMatchmakingQueue, useAIPlayerBackfill, useMatchmakingCountdown)
- Still contains significant UI logic
- Could extract lobby UI, start modal, player list components

**Solution:**
Consider extracting:
- `MatchmakingLobby.tsx` - Already exists but could be enhanced
- `MatchmakingPlayerList.tsx` - Player display logic
- `MatchmakingStartModal.tsx` - Already exists
- `MatchmakingStatus.tsx` - Status display logic

**Impact:** Better separation of concerns, easier to maintain

**Files:**
- `components/ranked/MatchmakingContent.tsx`

---

### 96. Conditional Rendering Pattern - Repeated if/return Patterns

**Status:** Pending

**Problem:**
Many components use similar conditional rendering patterns:
- Early returns for loading/error states
- Conditional rendering based on state
- Empty state handling

**Current Pattern:**
```typescript
if (isLoading) return <LoadingState />;
if (error) return <ErrorState error={error} />;
if (!data) return <EmptyState />;
```

**Solution:**
Create `ConditionalRender` component or utility:
```typescript
// components/shared/ConditionalRender.tsx
interface ConditionalRenderProps {
  condition: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function ConditionalRender({ condition, fallback, children }: ConditionalRenderProps) {
  if (!condition) return <>{fallback}</> || null;
  return <>{children}</>;
}
```

**Impact:** Cleaner conditional rendering, consistent patterns

**Files:**
- Multiple components with conditional rendering

---

## 📊 Summary

| Priority | Opportunity | Impact | Effort | Status |
|----------|------------|--------|--------|--------|
| 🔴 HIGH | AP Lang Timer Pattern (#88) | Medium | Low | Pending |
| 🔴 HIGH | AP Lang Fetch Pattern (#89) | Medium | Low | Pending |
| 🟡 MEDIUM | Timer/Counter Hook Pattern (#90) | Medium | Low | Pending |
| 🟡 MEDIUM | Word Count Tracking (#91) | Low | Low | Pending |
| 🟡 MEDIUM | Form State Management (#92) | Medium | Medium | Pending |
| 🟡 MEDIUM | Loading State Pattern (#93) | Medium | Low | Pending |
| 🟢 LOW | Error State Pattern (#94) | Low | Low | Pending |
| 🟢 LOW | MatchmakingContent Size (#95) | Medium | Medium | Pending |
| 🟢 LOW | Conditional Rendering (#96) | Low | Low | Pending |

---

## 📝 Notes

- Most opportunities are low-effort improvements that would increase consistency
- AP Lang components are good candidates for standardization
- Timer patterns could benefit from reusable hooks
- Form state management could be improved with a dedicated hook

