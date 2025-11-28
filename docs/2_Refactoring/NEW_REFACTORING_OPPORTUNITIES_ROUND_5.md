# New Refactoring Opportunities - Round 5

> Additional opportunities identified after comprehensive codebase analysis

## 🔍 Analysis Summary

After analyzing large files, duplicate patterns, and code organization, I've identified **12 new refactoring opportunities** that would further improve code quality, reduce duplication, and enhance maintainability.

**Last Updated:** January 2025

---

## 🔴 HIGH PRIORITY

### 75. Large Service File: session-manager.ts (549 lines)

**Status:** Pending

**Problem:**
`lib/services/session-manager.ts` is 549 lines and handles multiple responsibilities:
- Session joining/leaving
- Heartbeat management
- Session state synchronization
- Event handling
- Periodic refresh logic
- Reconnection logic

**Solution:**
Break into smaller modules:
- `lib/services/session/SessionConnection.ts` - Connection management and heartbeat
- `lib/services/session/SessionState.ts` - State synchronization and listeners
- `lib/services/session/SessionEvents.ts` - Event handling system
- `lib/services/session-manager.ts` - Orchestrates sub-modules

**Impact:** Better maintainability, easier testing, clearer separation of concerns

**Files:**
- `lib/services/session-manager.ts`

---

### 76. Large Utility File: twr-prompts.ts (512 lines)

**Status:** Pending

**Problem:**
`lib/utils/twr-prompts.ts` is 512 lines with multiple prompt generation functions:
- `generateTWRWritingPrompt()` (~150 lines)
- `generateTWRFeedbackPrompt()` (~120 lines)
- `generateTWRPeerFeedbackPrompt()` (~100 lines)
- `generateTWRRevisionPrompt()` (~100 lines)
- Similar structure across all functions

**Solution:**
Split into focused modules:
- `lib/prompts/twr-writing.ts` - Writing analysis prompts
- `lib/prompts/twr-feedback.ts` - Feedback generation prompts
- `lib/prompts/twr-peer-feedback.ts` - Peer feedback prompts
- `lib/prompts/twr-revision.ts` - Revision evaluation prompts
- `lib/prompts/twr-common.ts` - Shared TWR methodology text and constants
- `lib/utils/twr-prompts.ts` - Re-exports for backward compatibility

**Impact:** Easier to maintain, faster to find specific prompts, better organization

**Files:**
- `lib/utils/twr-prompts.ts`

---

### 77. Large Component: MatchmakingContent.tsx (508 lines)

**Status:** Partially Refactored

**Problem:**
`components/ranked/MatchmakingContent.tsx` is still 508 lines even after extracting `MatchmakingStartModal` and `MatchmakingLobby`. It still handles:
- Queue management logic
- AI player selection and backfill
- Session creation orchestration
- Countdown management
- Complex state management

**Solution:**
Extract additional hooks/components:
- `useMatchmakingQueue.ts` - Hook for queue joining/leaving logic
- `useAIPlayerBackfill.ts` - Hook for AI player selection and backfill
- `useMatchmakingCountdown.ts` - Hook for countdown logic
- `MatchmakingContent.tsx` - Orchestrates hooks and sub-components

**Impact:** Better separation of concerns, easier to test queue logic separately

**Files:**
- `components/ranked/MatchmakingContent.tsx`

---

### 78. Large Service File: firestore.ts (390 lines)

**Status:** Pending

**Problem:**
`lib/services/firestore.ts` is 390 lines with multiple responsibilities:
- User profile operations (create, get, update)
- Writing session operations (save, get, count)
- Conversation operations (save, update, get)
- Stats operations
- Multiple helper functions

**Solution:**
Split into focused modules:
- `lib/services/user-profile.ts` - User profile CRUD operations
- `lib/services/writing-sessions.ts` - Writing session operations
- `lib/services/conversations.ts` - Conversation operations
- `lib/services/user-stats.ts` - Stats operations
- `lib/services/firestore.ts` - Re-exports or shared utilities

**Impact:** Better organization, easier to find specific operations, reduced file size

**Files:**
- `lib/services/firestore.ts`

---

## 🟡 MEDIUM PRIORITY

### 79. Loading/Error State Pattern Duplication (32 matches)

**Status:** Pending

**Problem:**
32 loading/error state patterns across 7 files with similar structure:
- `const [isLoading, setIsLoading] = useState(false)`
- `const [error, setError] = useState<Error | null>(null)`
- Similar try-catch-finally patterns

**Current Pattern:**
```typescript
// Repeated in multiple files
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

const handleAction = async () => {
  setIsLoading(true);
  setError(null);
  try {
    // ... action
  } catch (err) {
    setError(err instanceof Error ? err : new Error(String(err)));
  } finally {
    setIsLoading(false);
  }
};
```

**Solution:**
Create `useAsyncState` hook (similar to `useAsyncData` but for manual execution):
```typescript
// lib/hooks/useAsyncState.ts
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

**Impact:** Remove ~15 lines per usage, consistent loading/error handling

**Files:**
- `components/auth/AuthContent.tsx`
- `components/ap-lang/APLangWriter.tsx`
- `components/ap-lang/APLangGrader.tsx`
- `components/dashboard/MatchSelectionModal.tsx`
- Others with loading/error patterns

---

### 80. Large Component: LandingContent.tsx (322 lines)

**Status:** Pending

**Problem:**
`components/landing/LandingContent.tsx` is 322 lines handling:
- Header navigation
- Hero section
- Mode cards (Quick Match, Ranked, Practice)
- Features section
- Rank progression display
- Footer

**Solution:**
Extract sub-components:
- `LandingHeader.tsx` - Header with navigation
- `LandingHero.tsx` - Hero section with CTA
- `LandingModes.tsx` - Mode cards display
- `LandingFeatures.tsx` - Features section
- `LandingRanks.tsx` - Rank progression display
- `LandingContent.tsx` - Orchestrates sub-components

**Impact:** Better maintainability, easier to update individual sections

**Files:**
- `components/landing/LandingContent.tsx`

---

### 81. Large Component: AuthContent.tsx (311 lines)

**Status:** Pending

**Problem:**
`components/auth/AuthContent.tsx` is 311 lines handling:
- Sign in/sign up form
- Google sign-in
- Demo account handling
- Error display
- Loading states
- Redirect logic

**Solution:**
Extract sub-components/hooks:
- `AuthForm.tsx` - Sign in/sign up form
- `AuthSocialButtons.tsx` - Google sign-in and demo buttons
- `useAuthRedirect.ts` - Hook for redirect logic
- `AuthContent.tsx` - Orchestrates sub-components

**Impact:** Better separation of concerns, easier to test form logic

**Files:**
- `components/auth/AuthContent.tsx`

---

### 82. Fetch Pattern Duplication (15 matches)

**Status:** Pending

**Problem:**
15 direct `fetch()` calls across 8 files with similar patterns:
- Similar error handling
- Similar response parsing
- Similar loading state management

**Current Pattern:**
```typescript
// Repeated in multiple files
const response = await fetch('/api/...', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ... }),
});

if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.error || 'Failed');
}

const data = await response.json();
```

**Solution:**
Create `useApiCall` hook or `apiClient` utility:
```typescript
// lib/hooks/useApiCall.ts
export function useApiCall() {
  const call = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed: ${response.statusText}`);
    }

    return response.json();
  }, []);

  return { call };
}
```

**Impact:** Consistent API error handling, easier to add interceptors/retry logic

**Files:**
- `components/improve/ImproveChatInterface.tsx`
- `components/ranked/PeerFeedbackContent.tsx`
- `components/ranked/WritingSessionContent.tsx`
- `components/ranked/RevisionContent.tsx`
- Others with fetch calls

---

### 83. Large Prompt File: grading-prompts.ts (481 lines)

**Status:** Pending

**Problem:**
`lib/prompts/grading-prompts.ts` is 481 lines with multiple prompt functions:
- `getPhase1WritingPrompt()` (~150 lines)
- `getPhase2PeerFeedbackPrompt()` (~150 lines)
- `getPhase3RevisionPrompt()` (~150 lines)
- Similar structure across all functions

**Solution:**
Split into focused modules:
- `lib/prompts/phase1-writing.ts` - Phase 1 writing evaluation prompts
- `lib/prompts/phase2-peer-feedback.ts` - Phase 2 peer feedback prompts
- `lib/prompts/phase3-revision.ts` - Phase 3 revision prompts
- `lib/prompts/grading-common.ts` - Shared grading rubric and criteria
- `lib/prompts/grading-prompts.ts` - Re-exports for backward compatibility

**Impact:** Easier to maintain, faster to find specific prompts

**Files:**
- `lib/prompts/grading-prompts.ts`

---

## 🟢 LOW PRIORITY

### 84. Console Logging Standardization (106+ matches)

**Status:** Pending

**Problem:**
106+ console.log/warn/error calls across 20+ files with inconsistent patterns:
- Some use emoji prefixes: `console.log('✅ ...')`, `console.error('❌ ...')`
- Some use context prefixes: `console.log('📊 IMPROVE ANALYZE - ...')`
- Some use plain text: `console.log('...')`
- No centralized logging utility

**Current Patterns:**
```typescript
console.log('✅ IMPROVE CHAT - API key found');
console.error('❌ IMPROVE CHAT - API key missing');
console.warn('⚠️ WAITING - Failed to load party members');
console.log('📊 IMPROVE ANALYZE - Request received:', {...});
```

**Solution:**
Create centralized logging utility:
```typescript
// lib/utils/logger.ts
export const logger = {
  info: (context: string, message: string, data?: any) => {
    console.log(`✅ ${context} - ${message}`, data || '');
  },
  error: (context: string, message: string, error?: any) => {
    console.error(`❌ ${context} - ${message}`, error || '');
  },
  warn: (context: string, message: string, data?: any) => {
    console.warn(`⚠️ ${context} - ${message}`, data || '');
  },
  debug: (context: string, message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 ${context} - ${message}`, data || '');
    }
  },
};
```

**Impact:** Consistent logging format, easier to filter/search logs, can add log levels/environment filtering

**Files:**
- All files with console.log/warn/error (20+ files)

---

### 85. Router Navigation Pattern Duplication (56+ matches)

**Status:** Pending

**Problem:**
56+ `router.push()` calls across 16+ files with inconsistent patterns:
- Some use direct paths: `router.push('/dashboard')`
- Some use template strings: `router.push(\`/session/${sessionId}\`)`
- Some use URL builders: `router.push(buildResultsURL(...))`
- Some handle errors, some don't

**Current Patterns:**
```typescript
router.push('/dashboard');
router.push(`/session/${sessionId}`);
router.push(`/ranked/results?sessionId=${sessionId}`);
router.push(buildResultsURL({ matchId, trait, ... }));
```

**Solution:**
Create navigation utilities:
```typescript
// lib/utils/navigation.ts
export const navigation = {
  dashboard: () => '/dashboard',
  session: (sessionId: string) => `/session/${sessionId}`,
  results: (params: ResultsParams) => buildResultsURL(params),
  ranked: () => '/ranked',
  improve: () => '/improve',
  // ... etc
};

// Usage:
router.push(navigation.dashboard());
router.push(navigation.session(sessionId));
```

**Impact:** Consistent navigation, easier to update routes, centralized route management

**Files:**
- 16+ files with router.push calls

---

### 86. Firestore Query Pattern Duplication

**Status:** Pending

**Problem:**
Similar Firestore query patterns with error handling duplicated in `firestore.ts`:
- `getCompletedRankedMatches()` and `countCompletedRankedMatches()` have similar error handling for `failed-precondition`
- Similar query construction patterns

**Current Pattern:**
```typescript
// Repeated error handling
try {
  const q = query(..., where('mode', '==', 'ranked'), ...);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(...);
} catch (error: any) {
  if (error?.code === 'failed-precondition') {
    // Fallback query without mode filter
    const q = query(..., where('userId', '==', uid), ...);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(...).filter(s => s.mode === 'ranked');
  }
  throw error;
}
```

**Solution:**
Create Firestore query helper:
```typescript
// lib/utils/firestore-query.ts
export async function queryWithFallback<T>(
  primaryQuery: () => Promise<T[]>,
  fallbackQuery: () => Promise<T[]>,
  filterFn?: (item: T) => boolean
): Promise<T[]> {
  try {
    return await primaryQuery();
  } catch (error: any) {
    if (error?.code === 'failed-precondition') {
      const results = await fallbackQuery();
      return filterFn ? results.filter(filterFn) : results;
    }
    throw error;
  }
}
```

**Impact:** Remove ~20 lines per usage, consistent error handling

**Files:**
- `lib/services/firestore.ts`

---

### 87. Component State Initialization Pattern Duplication

**Status:** Pending

**Problem:**
Similar state initialization patterns across components:
- Multiple `useState` calls for related state
- Similar initialization logic

**Current Pattern:**
```typescript
// Repeated in multiple components
const [showModal1, setShowModal1] = useState(false);
const [showModal2, setShowModal2] = useState(false);
const [showModal3, setShowModal3] = useState(false);
const [showModal4, setShowModal4] = useState(false);
```

**Solution:**
Create `useModals` hook (already exists but could be enhanced):
```typescript
// lib/hooks/useModals.ts (enhance existing)
export function useModals(modalNames: string[]) {
  const modals = modalNames.reduce((acc, name) => {
    acc[name] = useModal(false);
    return acc;
  }, {} as Record<string, ReturnType<typeof useModal>>);
  
  return modals;
}
```

**Impact:** Cleaner state management for multiple modals

**Files:**
- Components with multiple modal states

---

## 📊 Summary

| Priority | Opportunity | Impact | Effort | Status |
|----------|------------|--------|--------|--------|
| 🔴 HIGH | Large Service: session-manager.ts (#75) | High | Medium | Pending |
| 🔴 HIGH | Large Utility: twr-prompts.ts (#76) | Medium | Low | Pending |
| 🔴 HIGH | Large Component: MatchmakingContent.tsx (#77) | High | Medium | Pending |
| 🔴 HIGH | Large Service: firestore.ts (#78) | Medium | Medium | Pending |
| 🟡 MEDIUM | Loading/Error State Pattern (#79) | Medium | Low | Pending |
| 🟡 MEDIUM | Large Component: LandingContent.tsx (#80) | Medium | Low | Pending |
| 🟡 MEDIUM | Large Component: AuthContent.tsx (#81) | Medium | Low | Pending |
| 🟡 MEDIUM | Fetch Pattern Duplication (#82) | Medium | Low | Pending |
| 🟡 MEDIUM | Large Prompt File: grading-prompts.ts (#83) | Medium | Low | Pending |
| 🟢 LOW | Console Logging Standardization (#84) | Medium | Medium | Pending |
| 🟢 LOW | Router Navigation Pattern (#85) | Medium | Medium | Pending |
| 🟢 LOW | Firestore Query Pattern (#86) | Low | Low | Pending |
| 🟢 LOW | Component State Initialization (#87) | Low | Low | Pending |

---

## 🎯 Recommended Next Steps

### Immediate Actions (Quick Wins)
1. **Loading/Error State Pattern (#79)** - Create `useAsyncState` hook
2. **Fetch Pattern Duplication (#82)** - Create `useApiCall` hook
3. **Firestore Query Pattern (#86)** - Create query helper utility

### High Impact Refactoring
1. **twr-prompts.ts (#76)** - Split into focused modules
2. **grading-prompts.ts (#83)** - Split into focused modules
3. **LandingContent.tsx (#80)** - Extract sub-components
4. **AuthContent.tsx (#81)** - Extract sub-components

### Large File Refactoring
1. **session-manager.ts (#75)** - Break into smaller modules
2. **firestore.ts (#78)** - Split into focused services
3. **MatchmakingContent.tsx (#77)** - Extract hooks

---

**Total New Opportunities:** 13

