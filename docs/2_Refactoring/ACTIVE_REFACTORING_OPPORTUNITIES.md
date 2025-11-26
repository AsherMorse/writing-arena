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

## 🔍 Analysis Summary

After analyzing the codebase, I've identified **12 active refactoring opportunities** organized by priority and impact. Some refactoring has already been completed (batch ranking handler, time utils, API helpers), but several opportunities remain.

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

### 2. Large Component: WritingSessionContent.tsx (593 lines)

**Problem:**
`components/ranked/WritingSessionContent.tsx` is 593 lines with multiple responsibilities:
- Writing editor
- Timer display
- AI content generation
- Submission logic
- Phase transition monitoring
- Planning phase UI

**Solution:**
Extract sub-components:
- `WritingEditor.tsx` - Textarea with paste prevention
- `WritingTimer.tsx` - Timer display with color coding
- `WritingTips.tsx` - Tips carousel sidebar
- `AIGenerationProgress.tsx` - AI writing generation UI
- `WritingSessionContent.tsx` - Orchestrates sub-components

**Impact:** Better maintainability, easier to test individual features

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

### 9. Writing Tips Data Consolidation

**Problem:**
Writing tips/concepts arrays are duplicated across components:
- `components/shared/WaitingForPlayers.tsx` - `writingConcepts` array
- `components/ranked/WritingSessionContent.tsx` - `writingTips` array
- Similar structure, potentially different content

**Solution:**
Create centralized writing tips data:
```typescript
// lib/constants/writing-tips.ts
export const WRITING_TIPS = [
  { name: 'Sentence Expansion', tip: '...', example: '...', icon: '🔗' },
  { name: 'Appositives', tip: '...', example: '...', icon: '✏️' },
  // ... etc
] as const;
```

**Impact:** Single source of truth, easier to update tips

**Files:**
- `components/shared/WaitingForPlayers.tsx`
- `components/ranked/WritingSessionContent.tsx`

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

## 📊 Summary

| Priority | Opportunity | Impact | Effort | Status |
|----------|------------|--------|--------|--------|
| 🔴 HIGH | Large Component Splitting (5 components) | High | Medium | Pending |
| 🟡 MEDIUM | Mock Ranking Warning Consolidation | Medium | Low | Pending |
| 🟡 MEDIUM | Parse Rankings Error Handling | Medium | Low | Pending |
| 🟡 MEDIUM | formatTime Usage Audit | Low | Low | Pending |
| 🟡 MEDIUM | Writing Tips Consolidation | Low | Low | Pending |
| 🟢 LOW | Error Response Standardization | Low | Low | Pending |
| 🟢 LOW | Component Props Type Consolidation | Low | Medium | Pending |
| 🟢 LOW | Constants Consolidation | Low | Low | Pending |

---

## 🎯 Recommended Next Steps

1. **Start with High Priority**: Break down large components one at a time
2. **Quick Wins**: Consolidate mock ranking warnings and parse error handling
3. **Audit**: Check formatTime usage and consolidate writing tips
4. **Polish**: Standardize error responses and consolidate types/constants

---

## ✅ Already Completed

- ✅ Batch ranking handler consolidation (`lib/utils/batch-ranking-handler.ts`)
- ✅ Time utilities (`lib/utils/time-utils.ts`)
- ✅ API helpers (`lib/utils/api-helpers.ts`)
- ✅ Mock ranking generator (`lib/utils/mock-ranking-generator.ts`)
- ✅ Index parser utilities (`lib/utils/index-parser.ts`)
- ✅ Score validation (`lib/utils/score-validation.ts`)
- ✅ Paste prevention hook (`lib/hooks/usePastePrevention.ts`)

