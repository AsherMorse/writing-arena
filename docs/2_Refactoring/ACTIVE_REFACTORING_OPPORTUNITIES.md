# Active Refactoring Opportunities

> Current refactoring opportunities identified in the codebase (as of latest review)

## ✅ Recently Completed

### Mock Ranking Utilities Consolidation
- ✅ Created `lib/utils/ranking-logging.ts` - Centralized logging for batch ranking operations
- ✅ Created `lib/utils/parse-rankings.ts` - Unified parsing with fallback handling
- ✅ Updated all 3 batch ranking routes to use new utilities
- **Impact:** Removed ~30 lines of duplicate code, consistent error handling

### Writing Tips Consolidation
- ✅ Created `lib/constants/writing-tips.ts` - Centralized writing tips data
- ✅ Updated `WaitingForPlayers.tsx` and `WritingSessionContent.tsx` to use constants
- **Impact:** Single source of truth for writing tips, easier to maintain

### MatchmakingContent Component Split
- ✅ Created `MatchmakingStartModal.tsx` - Start modal component (60 lines)
- ✅ Created `MatchmakingLobby.tsx` - Lobby display component (180 lines)
- ✅ Refactored `MatchmakingContent.tsx` - Reduced from 740 to 508 lines (~31% reduction)
- **Impact:** Better maintainability, clearer separation of concerns

### Component Mount Time Hook
- ✅ Created `lib/hooks/useComponentMountTime.ts` - Reusable hook for tracking component mount time
- ✅ Updated `WritingSessionContent.tsx`, `RevisionContent.tsx`, and `PeerFeedbackContent.tsx` to use hook
- **Impact:** Removed ~10 lines per component, consistent pattern, easier to test

### Writing Tips Consolidation (Complete)
- ✅ Updated `RevisionContent.tsx` to use `WRITING_TIPS_WITH_CONCLUSIONS` constant
- ✅ Updated `PeerFeedbackContent.tsx` to use `WRITING_TIPS_WITH_CONCLUSIONS` constant
- ✅ Removed duplicate inline arrays (~8 lines per component)
- **Impact:** Single source of truth, removed ~16 lines of duplicate code

### Phase Color Constants (Partial)
- ✅ Added `getPhaseColor()` and `getPhaseColorByName()` helper functions to `lib/constants/colors.ts`
- ✅ Updated `ResultsContent.tsx` to use `getPhaseColorByName()` instead of hardcoded ternary
- ✅ Updated `PhaseRankingsContent.tsx` to use `getPhaseColor()` for phase info colors
- ✅ Updated `RankedLanding.tsx` to use `getPhaseColor()` for phase timeline colors
- **Impact:** Replaced hardcoded phase colors in key components, easier to maintain theme
- **Note:** Many hardcoded color values still exist in inline styles/Tailwind classes - can be addressed incrementally

### Ranking Modal Component
- ✅ Created `components/shared/RankingModal.tsx` - Reusable ranking modal component
- ✅ Created `components/shared/PhaseWritingTipsCarousel.tsx` - Phase-specific tips carousel
- ✅ Updated `WritingSessionContent.tsx` to use RankingModal
- ✅ Updated `RevisionContent.tsx` to use RankingModal
- ✅ Updated `PeerFeedbackContent.tsx` to use RankingModal
- ✅ Fixed TypeScript type issue in `ResultsContent.tsx` (expandedPhase type)
- ✅ Removed duplicate modal code (~30 lines per component)
- ✅ Build passes successfully
- **Impact:** Removed ~90 lines of duplicate code, consistent UI, easier to update design

### Phase Duration Fix - Root Cause Resolution
- ✅ Fixed `lib/services/phase-transition.ts` to use rank-based durations instead of hardcoded defaults
- ✅ Added `getAverageRank()` helper to calculate median rank from session players
- ✅ Removed unnecessary defensive code from `WritingSessionContent.tsx`, `RevisionContent.tsx`, and `PeerFeedbackContent.tsx`
- ✅ Removed incorrect "Cloud Function" comments - issue was in client-side code, not cloud functions
- **Impact:** Fixed root cause of incorrect phase durations, removed ~70 lines of unnecessary defensive code, proper rank-based timing now works correctly

## 🔍 Analysis Summary

After analyzing the codebase, I've identified **20 active refactoring opportunities** organized by priority and impact. Some refactoring has already been completed (batch ranking handler, time utils, API helpers), but several opportunities remain.

**Last Updated:** December 2024

---

## 🔴 HIGH PRIORITY

### 1. ✅ Large Component: MatchmakingContent.tsx (740 → 508 lines) - COMPLETED

**Problem:**
`components/ranked/MatchmakingContent.tsx` is 740 lines and handles too many responsibilities:
- Queue management
- AI player selection
- Session creation
- UI rendering
- State management
- Countdown logic

**Solution:**
Break into smaller components:
- `MatchmakingQueue.tsx` - Queue joining/leaving logic
- `AIPlayerSelection.tsx` - AI student selection UI
- `MatchmakingLobby.tsx` - Player list and countdown
- `MatchmakingContent.tsx` - Orchestrates sub-components

**Impact:** Better maintainability, easier testing, clearer separation of concerns

**Files:**
- `components/ranked/MatchmakingContent.tsx`

---

### 2. Large Component: WritingSessionContent.tsx (510 lines) - PARTIALLY REFACTORED

**Status:** Already has some sub-components extracted (`WritingTimer`, `WritingEditor`, `WritingTipsCarousel`, `AIGenerationProgress`)

**Problem:**
`components/ranked/WritingSessionContent.tsx` is still 510 lines with multiple responsibilities:
- AI content generation logic (complex useEffect with Firestore operations)
- Session state management
- Submission orchestration
- Planning phase UI
- Squad member display logic

**Solution:**
Extract additional sub-components/hooks:
- `useAIGeneration.ts` - Hook for AI writing generation logic (lines 75-197)
- `useSquadMembers.ts` - Hook for squad member data transformation (lines 311-323)
- `PlanningPhaseWrapper.tsx` - Planning phase UI component
- `SquadDisplay.tsx` - Squad member list component
- `WritingSessionContent.tsx` - Orchestrates sub-components

**Impact:** Better maintainability, easier to test individual features, reduce component complexity

**Files:**
- `components/ranked/WritingSessionContent.tsx`

---

### 3. Large Component: RevisionContent.tsx (444 lines)

**Problem:**
`components/ranked/RevisionContent.tsx` is 444 lines handling:
- Revision editor
- Original content display
- Feedback display
- Submission logic
- Timer management

**Solution:**
Extract sub-components:
- `RevisionEditor.tsx` - Text editor for revisions
- `OriginalContentDisplay.tsx` - Shows original writing
- `FeedbackDisplay.tsx` - Shows peer feedback
- `RevisionContent.tsx` - Orchestrates sub-components

**Impact:** Better maintainability, clearer component boundaries

**Files:**
- `components/ranked/RevisionContent.tsx`

---

### 4. Large Component: PeerFeedbackContent.tsx (394 lines)

**Problem:**
`components/ranked/PeerFeedbackContent.tsx` is 394 lines handling:
- Feedback form inputs
- Peer writing display
- Submission logic
- Validation

**Solution:**
Extract sub-components:
- `PeerFeedbackForm.tsx` - Form inputs and validation
- `PeerWritingDisplay.tsx` - Display peer's writing
- `PeerFeedbackContent.tsx` - Orchestrates sub-components

**Impact:** Better maintainability, easier to test form logic separately

**Files:**
- `components/ranked/PeerFeedbackContent.tsx`

---

### 5. Large Component: ResultsContent.tsx (405 lines)

**Problem:**
`components/ranked/ResultsContent.tsx` is 405 lines handling:
- Results header
- Player rankings display
- Phase-by-phase breakdown
- Feedback display
- Score calculations

**Solution:**
Extract sub-components:
- `ResultsHeader.tsx` - Header with scores
- `ResultsRankings.tsx` - Player rankings display
- `ResultsBreakdown.tsx` - Phase-by-phase breakdown
- `ResultsFeedback.tsx` - Feedback display
- `ResultsContent.tsx` - Orchestrates sub-components

**Impact:** Better maintainability, easier to update individual sections

**Files:**
- `components/ranked/ResultsContent.tsx`

---

## 🟡 MEDIUM PRIORITY

### 6. Mock Ranking Fallback Warning Consolidation

**Problem:**
Similar console warning patterns repeated across batch ranking routes:
- `app/api/batch-rank-writings/route.ts` - "⚠️ MOCK RANKINGS - Using fallback scoring"
- `app/api/batch-rank-feedback/route.ts` - Similar pattern
- `app/api/batch-rank-revisions/route.ts` - Similar pattern

**Current Pattern:**
```typescript
console.warn('⚠️ BATCH RANK X - Falling back to mock rankings due to parse error');
```

**Solution:**
Create centralized warning utility:
```typescript
// lib/utils/logging.ts
export function logMockFallback(endpointName: string, reason: string): void {
  console.warn(`⚠️ ${endpointName} - Falling back to mock rankings: ${reason}`);
}

export function logParseSuccess(endpointName: string): void {
  console.log(`✅ ${endpointName} - Successfully parsed AI response`);
}
```

**Impact:** Consistent logging, easier to update warning messages

**Files:**
- `app/api/batch-rank-writings/route.ts`
- `app/api/batch-rank-feedback/route.ts`
- `app/api/batch-rank-revisions/route.ts`

---

### 7. Parse Rankings Error Handling Consolidation

**Problem:**
Similar error handling pattern in parse functions across batch ranking routes:
- All check for `!parsed || !parsed.rankings`
- All fall back to mock rankings
- Similar logging patterns

**Current Pattern:**
```typescript
function parseBatchRankings(claudeResponse: string, submissions: T[]): any[] {
  const parsed = parseClaudeJSON<{ rankings: any[] }>(claudeResponse);
  
  if (!parsed || !parsed.rankings) {
    console.warn('⚠️ BATCH RANK X - Falling back to mock rankings due to parse error');
    return generateMockRankings(submissions).rankings;
  }
  
  console.log('✅ BATCH RANK X - Successfully parsed AI response');
  // ... rest of parsing
}
```

**Solution:**
Create a wrapper utility:
```typescript
// lib/utils/parse-rankings.ts
export function parseRankingsWithFallback<TSubmission, TRanking>(
  claudeResponse: string,
  submissions: TSubmission[],
  endpointName: string,
  parseFn: (parsed: any, submissions: TSubmission[]) => TRanking[],
  generateMockFn: (submissions: TSubmission[]) => { rankings: TRanking[] }
): TRanking[] {
  const parsed = parseClaudeJSON<{ rankings: any[] }>(claudeResponse);
  
  if (!parsed || !parsed.rankings) {
    logMockFallback(endpointName, 'parse error');
    return generateMockFn(submissions).rankings;
  }
  
  logParseSuccess(endpointName);
  return parseFn(parsed, submissions);
}
```

**Impact:** Remove ~10 lines per route, consistent error handling

**Files:**
- `app/api/batch-rank-writings/route.ts`
- `app/api/batch-rank-feedback/route.ts`
- `app/api/batch-rank-revisions/route.ts`

---

### 8. formatTime Usage Audit

**Problem:**
`formatTime` utility exists in `lib/utils/time-utils.ts` but some components might still have inline implementations.

**Solution:**
- Audit all components for inline `formatTime` functions
- Replace with import from `lib/utils/time-utils.ts`
- Ensure consistent format usage (`'short'` vs `'long'`)

**Impact:** Consistent time formatting across the app

**Files to Check:**
- `components/shared/WaitingForPlayers.tsx`
- `components/ap-lang/APLangWriter.tsx`
- Any other components with time display

---

### 9. ✅ Writing Tips Data Consolidation - COMPLETED

**Status:** ✅ COMPLETE - All components now use constants

**Problem:**
Writing tips arrays were duplicated in components:
- `components/ranked/RevisionContent.tsx` - Lines 64-71 (inline `useMemo`)
- `components/ranked/PeerFeedbackContent.tsx` - Lines 60-67 (inline `useMemo`)
- Both had identical arrays that should use `WRITING_TIPS` constant

**Current Pattern:**
```typescript
const writingTips = useMemo(() => [
  { name: 'Sentence Expansion', tip: '...', example: '...', icon: '🔗' },
  { name: 'Appositives', tip: '...', example: '...', icon: '✏️' },
  // ... etc
], []);
```

**Solution:**
- Import `WRITING_TIPS` from `lib/constants/writing-tips.ts`
- Remove inline arrays from `RevisionContent.tsx` and `PeerFeedbackContent.tsx`
- Ensure all components use the same source

**Impact:** Single source of truth, easier to update tips, remove ~15 lines of duplicate code

**Files:**
- `components/ranked/RevisionContent.tsx` (lines 64-71)
- `components/ranked/PeerFeedbackContent.tsx` (lines 60-67)

---

## 🟢 LOW PRIORITY

### 10. Error Response Format Standardization

**Problem:**
Error responses vary across API routes:
- Some return `{ error: string }`
- Some return `{ error: string, details: string }`
- Some return `{ error: string }` with status codes

**Solution:**
Standardize using existing utilities:
- Use `createErrorResponse()` from `lib/utils/api-responses.ts`
- Ensure consistent error format

**Impact:** Consistent API error handling

**Files:**
- All API route files

---

### 11. Component Props Type Consolidation

**Problem:**
Similar prop types might be duplicated across components:
- Player/User types
- Session types
- Phase types

**Solution:**
- Audit for duplicate type definitions
- Consolidate into shared type files
- Use shared types across components

**Impact:** Better type safety, easier maintenance

**Files:**
- All component files

---

### 12. Constants Consolidation

**Problem:**
Magic numbers and strings might be scattered:
- Timer thresholds
- Score thresholds
- Color values
- Phase names

**Solution:**
- Audit for magic values
- Move to appropriate constants files
- Use constants instead of literals

**Impact:** Easier to update values, better maintainability

**Files:**
- All component files

---

### 13. ✅ Component Mount Time Tracking Pattern Duplication - COMPLETED

**Status:** ✅ COMPLETE - Hook created and all components updated

**Problem:**
The same pattern for tracking component mount time is duplicated across 3 components:
- `components/ranked/WritingSessionContent.tsx` (lines 282-301)
- `components/ranked/RevisionContent.tsx` (lines 229-237)
- `components/ranked/PeerFeedbackContent.tsx` (lines 202-214)

**Current Pattern:**
```typescript
const componentMountedTimeRef = useRef<number | null>(null);
useEffect(() => { 
  if (componentMountedTimeRef.current === null) 
    componentMountedTimeRef.current = Date.now(); 
}, []);

useEffect(() => {
  const timeSinceMount = componentMountedTimeRef.current 
    ? Date.now() - componentMountedTimeRef.current 
    : Infinity;
  const minPhaseAge = TIMING.MIN_PHASE_AGE;
  // ... ranking modal logic
}, [timeRemaining, hasSubmitted, ...]);
```

**Solution:**
Create a custom hook:
```typescript
// lib/hooks/useComponentMountTime.ts
export function useComponentMountTime() {
  const mountedTimeRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (mountedTimeRef.current === null) {
      mountedTimeRef.current = Date.now();
    }
  }, []);
  
  const getTimeSinceMount = useCallback(() => {
    return mountedTimeRef.current 
      ? Date.now() - mountedTimeRef.current 
      : Infinity;
  }, []);
  
  return { getTimeSinceMount };
}
```

**Impact:** Remove ~10 lines per component, consistent pattern, easier to test

**Files:**
- `components/ranked/WritingSessionContent.tsx`
- `components/ranked/RevisionContent.tsx`
- `components/ranked/PeerFeedbackContent.tsx`

---

### 14. ✅ Ranking Modal Pattern Duplication - COMPLETED

**Status:** ✅ COMPLETE - Reusable component created and all components updated

**Problem:**
Similar ranking modal UI and logic was duplicated across components:
- `components/ranked/WritingSessionContent.tsx` (lines 350-369)
- `components/ranked/RevisionContent.tsx` (lines 251-283)
- `components/ranked/PeerFeedbackContent.tsx` (lines 229-261)

**Current Pattern:**
Each has similar modal with:
- Animated emoji (📊 or ✨)
- "Time's Up!" / "Calculating..." message
- Writing tips carousel
- Loading dots animation
- Phase-specific colors

**Solution:**
Create reusable component:
```typescript
// components/shared/RankingModal.tsx
interface RankingModalProps {
  isOpen: boolean;
  timeRemaining: number;
  isSubmitting: boolean;
  phase: 1 | 2 | 3;
  variant?: 'writing' | 'feedback' | 'revision';
}
```

**Impact:** Remove ~30 lines per component, consistent UI, easier to update design

**Files:**
- `components/ranked/WritingSessionContent.tsx`
- `components/ranked/RevisionContent.tsx`
- `components/ranked/PeerFeedbackContent.tsx`

---

### 15. AI Generation Pattern Duplication

**Problem:**
Similar AI content generation patterns in multiple components:
- `components/ranked/WritingSessionContent.tsx` - AI writings generation (lines 75-197)
- `components/ranked/PeerFeedbackContent.tsx` - AI feedback generation (lines 73-124)
- `components/ranked/RevisionContent.tsx` - AI revisions generation (lines 112-151)

**Common Patterns:**
- Check if already generated (`aiXGenerated` state)
- Fetch from Firestore `matchStates`
- Generate via API calls
- Store back to Firestore
- Handle errors gracefully

**Solution:**
Create reusable hook:
```typescript
// lib/hooks/useAIContentGeneration.ts
interface AIGenerationOptions<T> {
  matchId: string;
  firestoreKey: string; // e.g., 'aiWritings.phase1'
  apiEndpoint: string;
  generateFn: (player: any) => Promise<T>;
  shouldGenerate: (matchState: any) => boolean;
}

export function useAIContentGeneration<T>(options: AIGenerationOptions<T>) {
  // ... shared logic
}
```

**Impact:** Remove ~50-80 lines per component, consistent error handling, easier to test

**Files:**
- `components/ranked/WritingSessionContent.tsx`
- `components/ranked/PeerFeedbackContent.tsx`
- `components/ranked/RevisionContent.tsx`

---

### 16. Firestore Match State Operations Duplication

**Problem:**
Similar Firestore operations for reading/updating match states:
- Reading `matchStates` collection
- Checking if document exists
- Merging arrays (aiWritings, aiFeedbacks, aiRevisions)
- Handling missing documents

**Current Pattern:**
```typescript
const { getDoc, doc, updateDoc } = await import('firebase/firestore');
const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
if (!matchDoc.exists()) return;
const matchState = matchDoc.data();
const currentArray = matchState?.aiWritings?.phase1 || [];
// ... merge logic
await updateDoc(matchRef, { 'aiWritings.phase1': mergedArray });
```

**Solution:**
Create utility functions:
```typescript
// lib/utils/firestore-match-state.ts
export async function getMatchState(matchId: string): Promise<MatchState | null>;
export async function updateMatchStateArray(
  matchId: string, 
  key: string, 
  items: any[], 
  mergeFn?: (existing: any[], newItems: any[]) => any[]
): Promise<void>;
```

**Impact:** Remove ~20 lines per usage, consistent error handling, easier to maintain

**Files:**
- `components/ranked/WritingSessionContent.tsx`
- `components/ranked/PeerFeedbackContent.tsx`
- `components/ranked/RevisionContent.tsx`
- `app/api/generate-ai-writing/route.ts`

---

### 17. Writing Tips Carousel Logic Duplication

**Problem:**
Writing tips carousel logic duplicated in:
- `components/ranked/RevisionContent.tsx` (lines 190, 260-275)
- `components/ranked/PeerFeedbackContent.tsx` (lines 185-189, 238-253)

Both use `useCarousel` hook but have inline carousel UI rendering.

**Current Pattern:**
```typescript
const { currentIndex, goTo } = useCarousel({ items: writingTips, ... });
// ... inline JSX for carousel display
```

**Solution:**
Extract to reusable component (already exists as `WritingTipsCarousel.tsx` but not used in all places):
- Use `WritingTipsCarousel` component in `RevisionContent.tsx` and `PeerFeedbackContent.tsx`
- Remove inline carousel JSX

**Impact:** Remove ~20 lines per component, consistent UI, easier to maintain

**Files:**
- `components/ranked/RevisionContent.tsx`
- `components/ranked/PeerFeedbackContent.tsx`

---

### 18. ✅ Phase-Specific Color Constants - PARTIALLY COMPLETE

**Status:** ✅ PARTIALLY COMPLETE - Key components updated, many inline styles remain

**Problem:**
Phase colors were hardcoded in multiple places:
- `#00e5e5` (cyan) for Phase 1
- `#ff5f8f` (pink) for Phase 2
- `#00d492` (green) for Phase 3

**Solution Implemented:**
- ✅ Added `getPhaseColor()` and `getPhaseColorByName()` helper functions to `lib/constants/colors.ts`
- ✅ Updated `ResultsContent.tsx` - replaced ternary with `getPhaseColorByName()`
- ✅ Updated `PhaseRankingsContent.tsx` - replaced hardcoded colors in phaseInfo
- ✅ Updated `RankedLanding.tsx` - replaced hardcoded colors in phase timeline

**Remaining Work:**
Many hardcoded color values still exist in:
- Inline styles throughout components
- Tailwind class names (e.g., `text-[#00e5e5]`)
- Background/border colors in JSX

**Impact:** Key phase color logic now uses constants, easier to maintain theme. Inline style replacements can be done incrementally.

**Files Updated:**
- `lib/constants/colors.ts` (added helpers)
- `components/ranked/ResultsContent.tsx`
- `components/ranked/PhaseRankingsContent.tsx`
- `components/ranked/RankedLanding.tsx`

---

### 19. Results Content Score Calculation Logic

**Problem:**
`components/ranked/ResultsContent.tsx` has complex score calculation and AI player data transformation logic (lines 62-155) that could be extracted.

**Current Pattern:**
- Fetch rankings from Firestore
- Transform AI player data
- Calculate composite scores
- Rank players
- Calculate rewards

**Solution:**
Extract to utility/hook:
```typescript
// lib/utils/results-calculator.ts
export function calculateMatchResults(
  matchId: string,
  userScores: { writing: number; feedback: number; revision: number }
): Promise<MatchResults>;

// lib/hooks/useMatchResults.ts
export function useMatchResults(session: GameSession | null) {
  // ... results calculation logic
}
```

**Impact:** Reduce component complexity, easier to test, reusable logic

**Files:**
- `components/ranked/ResultsContent.tsx`

---

### 20. API Route Request Body Validation Pattern

**Problem:**
Similar request body validation patterns across API routes:
- Check for required fields
- Validate types
- Return error responses

**Current Pattern:**
```typescript
const { field1, field2 } = await request.json();
if (!field1 || !field2) {
  return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
}
```

**Solution:**
Create validation utilities:
```typescript
// lib/utils/api-validation.ts
export function validateRequestBody<T>(
  body: any,
  requiredFields: (keyof T)[]
): { valid: true; data: T } | { valid: false; error: string };
```

**Impact:** Consistent validation, better error messages, less boilerplate

**Files:**
- All API route files

---

## 📊 Summary

| Priority | Opportunity | Impact | Effort | Status |
|----------|------------|--------|--------|--------|
| 🔴 HIGH | Large Component Splitting (4 components) | High | Medium | Pending |
| 🔴 HIGH | ✅ Component Mount Time Hook | Medium | Low | **COMPLETE** |
| 🟡 MEDIUM | ✅ Ranking Modal Component | Medium | Medium | **COMPLETE** |
| 🟡 MEDIUM | AI Generation Hook | High | Medium | Pending |
| 🟡 MEDIUM | Firestore Match State Utils | Medium | Low | Pending |
| 🟡 MEDIUM | ✅ Writing Tips Consolidation | Low | Low | **COMPLETE** |
| 🟡 MEDIUM | Writing Tips Carousel Usage | Low | Low | Pending |
| 🟡 MEDIUM | Mock Ranking Warning Consolidation | Medium | Low | Pending |
| 🟡 MEDIUM | Parse Rankings Error Handling | Medium | Low | Pending |
| 🟡 MEDIUM | formatTime Usage Audit | Low | Low | Pending |
| 🟢 LOW | ✅ Phase Color Constants | Low | Low | **PARTIAL** |
| 🟢 LOW | Results Calculator Extraction | Medium | Medium | Pending |
| 🟢 LOW | API Validation Utilities | Low | Low | Pending |
| 🟢 LOW | Error Response Standardization | Low | Low | Pending |
| 🟢 LOW | Component Props Type Consolidation | Low | Medium | Pending |
| 🟢 LOW | Constants Consolidation | Low | Low | Pending |

---

## 🎯 Recommended Next Steps

### Immediate Actions (Quick Wins)
1. ✅ **Component Mount Time Hook** (#13) - **COMPLETE**
2. ✅ **Writing Tips Consolidation** (#9) - **COMPLETE**
3. ✅ **Phase Color Constants** (#18) - **PARTIALLY COMPLETE** (key components done, inline styles remain)

### High Impact Refactoring
4. ✅ **Ranking Modal Component** (#14) - **COMPLETE**
5. **AI Generation Hook** (#15) - Will significantly reduce duplication
6. **Firestore Match State Utils** (#16) - Common pattern across components

### Component Splitting
7. **Break down large components** (#2-5) - One at a time, start with smallest
   - Start with `PeerFeedbackContent.tsx` (394 lines)
   - Then `RevisionContent.tsx` (444 lines)
   - Then `ResultsContent.tsx` (405 lines)
   - Finally `WritingSessionContent.tsx` (510 lines, already partially refactored)

### Polish & Consistency
8. **API Validation Utilities** (#20) - Better error handling
9. **Results Calculator Extraction** (#19) - Reduce complexity
10. **Error Response Standardization** (#10) - Consistent API

---

## ✅ Already Completed

- ✅ Batch ranking handler consolidation (`lib/utils/batch-ranking-handler.ts`)
- ✅ Time utilities (`lib/utils/time-utils.ts`)
- ✅ API helpers (`lib/utils/api-helpers.ts`)
- ✅ Mock ranking generator (`lib/utils/mock-ranking-generator.ts`)
- ✅ Index parser utilities (`lib/utils/index-parser.ts`)
- ✅ Score validation (`lib/utils/score-validation.ts`)
- ✅ Paste prevention hook (`lib/hooks/usePastePrevention.ts`)
- ✅ Component mount time hook (`lib/hooks/useComponentMountTime.ts`)
- ✅ Writing tips consolidation (all components now use constants)
- ✅ Ranking modal component (`components/shared/RankingModal.tsx`)
- ✅ Phase writing tips carousel (`components/shared/PhaseWritingTipsCarousel.tsx`)

