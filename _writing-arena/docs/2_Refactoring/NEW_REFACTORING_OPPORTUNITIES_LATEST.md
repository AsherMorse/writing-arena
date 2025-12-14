# New Refactoring Opportunities (Latest Review)

> Identified after fixing the grading flow issue

## 🔍 Analysis Summary

After fixing the grading flow and reviewing the codebase, I've identified **7 new refactoring opportunities** that would further improve code quality and maintainability.

---

## 47. ResultsContent Session Fetching Logic Duplication (MEDIUM PRIORITY)

**Status:** Pending

**Problem:**
`components/ranked/ResultsContent.tsx` has complex logic for fetching session from multiple sources (prop, URL params, matchState). This pattern could be reused elsewhere or extracted into a hook.

**Current Pattern:**
```typescript
// Lines 33-59: Complex session fetching logic
const sessionIdFromParams = searchParams?.get('sessionId') || '';
const matchIdFromParams = searchParams?.get('matchId') || '';
const [sessionIdFromMatch, setSessionIdFromMatch] = useState<string>('');
// ... complex useEffect to fetch sessionId from matchState
const finalSessionId = sessionIdFromParams || sessionIdFromMatch;
const { session: sessionFromHook } = useSession(finalSessionId || null);
const finalSession = sessionProp || sessionFromHook;
```

**Solution:**
Create a hook `useSessionFromParams` that handles:
- Getting sessionId from URL params
- Deriving sessionId from matchId via matchState
- Fetching session using useSession hook
- Falling back to prop if provided

**Impact:** 
- Remove ~30 lines from ResultsContent
- Reusable pattern for other components that need session from URL
- Cleaner component code

**Files:**
- `components/ranked/ResultsContent.tsx` (lines 33-59)

---

## 48. Score Fallback Pattern Standardization (LOW PRIORITY)

**Status:** Pending

**Problem:**
Score fallback patterns are inconsistent across components:
- `ResultsContent.tsx` uses `parseInt(searchParams?.get('writingScore') || '75', 10)` 
- Some components use `|| 0`, others use `|| 75`, others use `|| getDefaultScore(phase)`

**Current Pattern:**
```typescript
// ResultsContent.tsx
const writingScore = userPlayer?.phases.phase1?.score || parseInt(searchParams?.get('writingScore') || '75', 10);
const feedbackScore = (userPlayer?.phases.phase2 as any)?.score || parseInt(searchParams?.get('feedbackScore') || '80', 10);
const revisionScore = userPlayer?.phases.phase3?.score || parseInt(searchParams?.get('revisionScore') || '78', 10);
```

**Solution:**
Create utility function:
```typescript
// lib/utils/score-fallback.ts
export function getScoreWithFallback(
  sessionScore: number | undefined,
  urlParam: string | null,
  defaultScore: number
): number {
  if (sessionScore !== undefined && sessionScore !== null) return sessionScore;
  if (urlParam) return parseInt(urlParam, 10);
  return defaultScore;
}
```

**Impact:**
- Consistent fallback logic
- Easier to update default scores
- Better type safety

**Files:**
- `components/ranked/ResultsContent.tsx` (lines 76-78)
- Other components with similar patterns

---

## 49. URL Search Params Parsing Duplication (LOW PRIORITY)

**Status:** Pending

**Problem:**
Multiple components parse URL search params manually:
- `ResultsContent.tsx` - Gets multiple params individually
- `PhaseRankingsContent.tsx` - Has custom parser function
- Other components use `searchParams.get()` directly

**Current Pattern:**
```typescript
// ResultsContent.tsx - Manual parsing
const sessionIdFromParams = searchParams?.get('sessionId') || '';
const matchIdFromParams = searchParams?.get('matchId') || '';
const trait = finalSession?.config.trait || searchParams?.get('trait') || 'all';
// ... many more

// PhaseRankingsContent.tsx - Custom parser
function parsePhaseRankingsParams(searchParams: URLSearchParams) {
  return {
    phase: parseInt(searchParams.get('phase') || '1'),
    sessionId: searchParams.get('sessionId') || '',
    matchId: searchParams.get('matchId') || '',
    // ... many more
  };
}
```

**Solution:**
Create standardized parser functions in `lib/hooks/useSearchParams.ts`:
```typescript
export function parseResultsParams(searchParams: URLSearchParams) {
  return {
    sessionId: searchParams.get('sessionId') || '',
    matchId: searchParams.get('matchId') || '',
    trait: searchParams.get('trait') || 'all',
    promptType: searchParams.get('promptType') || 'narrative',
    writingScore: parseInt(searchParams.get('writingScore') || '75', 10),
    feedbackScore: parseInt(searchParams.get('feedbackScore') || '80', 10),
    revisionScore: parseInt(searchParams.get('revisionScore') || '78', 10),
    // ... etc
  };
}
```

**Impact:**
- Consistent parsing logic
- Type safety
- Easier to maintain

**Files:**
- `components/ranked/ResultsContent.tsx`
- `components/ranked/PhaseRankingsContent.tsx`
- Other components with URL param parsing

---

## 50. Console Logging Pattern Inconsistency (LOW PRIORITY)

**Status:** Pending

**Problem:**
592 console.log/error/warn calls across 70 files with inconsistent patterns:
- Some use emoji prefixes (`✅`, `❌`, `⚠️`)
- Some use context prefixes (`BATCH RANKING`, `SESSION MANAGER`)
- Some use both, some use neither
- No structured logging format

**Current Examples:**
```typescript
console.log(`✅ BATCH RANKING - Submitting phase ${options.phase} with score:`, clampScore(score));
console.log(`💾 SESSION MANAGER - Saving phase ${phase} data:`, { sessionId, userId, phase, data });
console.error('❌ RESULTS - Failed to fetch AI feedback:', error);
console.warn('⚠️ PHASE RANKINGS - No rankings found in Firestore.');
```

**Solution:**
Create a logging utility (as documented in opportunity #24):
```typescript
// lib/utils/logger.ts
export function createLogger(context: { module: string; action?: string }) {
  const prefix = `[${context.module}${context.action ? ` - ${context.action}` : ''}]`;
  return {
    info: (message: string, ...args: any[]) => console.log(`✅ ${prefix} ${message}`, ...args),
    warn: (message: string, ...args: any[]) => console.warn(`⚠️ ${prefix} ${message}`, ...args),
    error: (message: string, error?: Error | unknown, ...args: any[]) => console.error(`❌ ${prefix} ${message}`, error, ...args),
  };
}
```

**Impact:**
- Consistent logging format across 70 files
- Easier to filter/search logs
- Can add log levels, file output later
- Better debugging experience

**Files:**
- All 70 files with console calls (gradual migration)

---

## 51. Firestore Direct Queries in Components (LOW PRIORITY)

**Status:** Pending

**Problem:**
Some components still have direct Firestore queries instead of using helper functions:
- `components/ranked/WritingSessionContent.tsx` - Direct `getDoc(doc(db, 'matchStates', ...))` calls
- `components/ranked/PeerFeedbackContent.tsx` - Similar patterns
- `components/ranked/RevisionContent.tsx` - Similar patterns

**Current Pattern:**
```typescript
// WritingSessionContent.tsx
const matchRef = doc(db, 'matchStates', sessionMatchId || sessionId);
const matchDoc = await getDoc(matchRef);
if (matchDoc.exists()) {
  const matchState = matchDoc.data();
  // ... manual data extraction
}
```

**Solution:**
Use existing helper functions from `lib/utils/firestore-match-state.ts`:
- `getMatchState(matchId)` - Already exists
- `getMatchRankings(matchId, phase)` - Already exists
- `getMatchAIWritings(matchId, phase)` - Already exists

**Impact:**
- Consistent Firestore access patterns
- Better error handling
- Easier to update Firestore patterns

**Files:**
- `components/ranked/WritingSessionContent.tsx` (lines 83-110)
- `components/ranked/PeerFeedbackContent.tsx`
- `components/ranked/RevisionContent.tsx`

---

## 52. ResultsContent Complex Score Calculation Logic (MEDIUM PRIORITY)

**Status:** Pending

**Problem:**
`components/ranked/ResultsContent.tsx` has complex logic for:
- Fetching rankings from multiple phases
- Merging AI player data across phases
- Calculating composite scores
- Creating fallback data structures

**Current Pattern:**
Lines 66-180 contain complex nested logic that could be extracted.

**Solution:**
Extract to utility functions:
- `lib/utils/results-calculator.ts` - Already exists but could be enhanced
- `lib/utils/ai-player-merger.ts` - New utility for merging AI player data across phases
- `lib/utils/rankings-fetcher.ts` - New utility for fetching all phase rankings

**Impact:**
- Reduce ResultsContent from ~490 lines to ~300 lines
- Better testability
- Reusable logic

**Files:**
- `components/ranked/ResultsContent.tsx` (lines 66-180)

---

## 53. Time Color Utilities Not Fully Utilized (LOW PRIORITY)

**Status:** Pending

**Problem:**
`lib/utils/time-utils.ts` has `getTimeColor()` and `getTimeProgressColor()` functions, but:
- `PeerFeedbackContent.tsx` still has inline time color logic
- `RevisionContent.tsx` still has inline time color logic
- `WritingTimer.tsx` might have similar patterns

**Current Pattern:**
```typescript
// PeerFeedbackContent.tsx / RevisionContent.tsx
const getTimeColor = () => {
  if (timeRemaining > 30) return 'text-green-400';
  if (timeRemaining > 15) return 'text-yellow-400';
  return 'text-red-400';
};
```

**Solution:**
Replace with:
```typescript
import { getTimeColor } from '@/lib/utils/time-utils';
const timeColor = getTimeColor(timeRemaining);
```

**Impact:**
- Remove ~5 lines per component
- Consistent time color thresholds
- Easier to update thresholds globally

**Files:**
- `components/ranked/PeerFeedbackContent.tsx`
- `components/ranked/RevisionContent.tsx`
- `components/ranked/WritingTimer.tsx`

---

## Summary

**New Opportunities Identified:** 7
- **Medium Priority:** 2 (#47, #52)
- **Low Priority:** 5 (#48, #49, #50, #51, #53)

**Total Active Opportunities:** 53
- **Completed:** 46
- **Pending:** 7

