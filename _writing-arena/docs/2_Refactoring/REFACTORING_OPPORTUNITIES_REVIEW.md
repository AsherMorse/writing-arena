# Refactoring Opportunities Review

**Date:** December 2024  
**Status:** Comprehensive codebase review completed

---

## 📊 Summary

After reviewing the codebase, I've identified **15 refactoring opportunities** organized by priority and impact. Some refactoring has already been completed (time-utils, paste prevention hook, batch ranking handler), but several opportunities remain.

---

## 🔴 HIGH PRIORITY

### 1. FormatTime Duplication (2 files)

**Problem:**
`formatTime` function still duplicated in:
- `components/shared/WaitingForPlayers.tsx` (lines 87-91)
- `components/ap-lang/APLangWriter.tsx` (lines 7-11) - slightly different format (MM:SS vs M:SS)

**Current Code:**
```typescript
// WaitingForPlayers.tsx
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// APLangWriter.tsx - Different format!
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
```

**Solution:**
- Update `lib/utils/time-utils.ts` to support both formats
- Add optional `format` parameter: `'short' | 'long'`
- Replace both implementations

**Impact:** Remove ~10 lines, ensure consistent formatting

---

### 2. Paste Handler Still Inline (1 file)

**Problem:**
Paste prevention handlers still inline in:
- `components/quick-match/SessionContent.tsx` (lines 55-56)

**Current Code:**
```typescript
const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => { 
  event.preventDefault(); 
  setShowPasteWarning(true); 
  setTimeout(() => setShowPasteWarning(false), 2500); 
};
const handleCut = (event: React.ClipboardEvent<HTMLTextAreaElement>) => { 
  event.preventDefault(); 
};
```

**Solution:**
- Use existing `usePastePrevention` hook
- Already imported but not used (line 7)

**Impact:** Remove ~5 lines, consistent behavior

---

### 3. Index Parsing Duplication (2 files)

**Problem:**
Similar off-by-one error handling duplicated in:
- `app/api/batch-rank-feedback/route.ts` (lines 19-72)
- `app/api/batch-rank-revisions/route.ts` (lines 17-76)

**Note:** `batch-rank-writings` already uses `mapRankingsToPlayers` helper, but feedback/revision routes have custom parsing.

**Current Pattern:**
```typescript
// Repeated in both files
let index = ranking.evaluatorIndex !== undefined ? ranking.evaluatorIndex : -1;

// Fix off-by-one errors
if (index === submissions.length) {
  index = index - 1;
}

if (index < 0 || index >= submissions.length) {
  // Fallback by name...
}
```

**Solution:**
- Create `lib/utils/index-parser.ts` with `fixIndexAndMap` utility
- Handles off-by-one errors, bounds checking, name fallback
- Use in both routes

**Impact:** Remove ~40 lines per file, consistent error handling

---

### 4. Large Component: MatchmakingContent.tsx (740 lines)

**Problem:**
`components/ranked/MatchmakingContent.tsx` is 740 lines - handles too many responsibilities:
- Queue management
- AI player selection
- Session creation
- UI rendering
- State management

**Solution:**
Break into smaller components:
- `MatchmakingQueue.tsx` - Queue joining/leaving logic
- `AIPlayerSelection.tsx` - AI student selection UI
- `MatchmakingLobby.tsx` - Player list and countdown
- `MatchmakingContent.tsx` - Orchestrates sub-components

**Impact:** Better maintainability, easier testing, clearer separation of concerns

---

### 5. Large Component: WritingSessionContent.tsx (592 lines)

**Problem:**
`components/ranked/WritingSessionContent.tsx` is 592 lines - complex component with:
- Writing editor
- Timer display
- AI content generation
- Submission logic
- Phase transition monitoring

**Solution:**
Extract sub-components:
- `WritingEditor.tsx` - Textarea with paste prevention
- `WritingTimer.tsx` - Timer display with color coding
- `WritingTips.tsx` - Tips carousel sidebar
- `WritingSessionContent.tsx` - Orchestrates sub-components

**Impact:** Better maintainability, easier to test individual pieces

---

## 🟡 MEDIUM PRIORITY

### 6. Color Constants Centralization

**Problem:**
Hardcoded color values scattered throughout:
- `#ff9030` (orange) - 50+ occurrences
- `#00e5e5` (cyan) - 40+ occurrences  
- `#ff5f8f` (pink) - 30+ occurrences
- `#00d492` (green) - 20+ occurrences

**Current Usage:**
```typescript
// Scattered across components
style={{ color: '#ff9030' }}
className="text-[#00e5e5]"
bg-[rgba(255,144,48,0.12)]
```

**Solution:**
Create `lib/constants/colors.ts`:
```typescript
export const COLORS = {
  primary: {
    orange: '#ff9030',
    cyan: '#00e5e5',
    pink: '#ff5f8f',
    green: '#00d492',
  },
  // With opacity variants
  primaryWithOpacity: {
    orange: (opacity: number) => `rgba(255,144,48,${opacity})`,
    // ...
  }
} as const;
```

**Impact:** Easier theme changes, consistent colors, better maintainability

---

### 7. Magic Numbers for Timing

**Problem:**
Hardcoded timing values:
- `3000` (minPhaseAge) - 3+ occurrences
- `6000` (carousel interval) - 2+ occurrences
- `300` (AP Lang warning threshold) - 1 occurrence
- `2500` (paste warning duration) - varies

**Current Code:**
```typescript
const minPhaseAge = 3000;
interval: 6000,
timeRemaining < 300
setTimeout(() => setShowPasteWarning(false), 2500);
```

**Solution:**
Add to `lib/constants/scoring.ts` or create `lib/constants/timing.ts`:
```typescript
export const TIMING = {
  MIN_PHASE_AGE: 3000,
  CAROUSEL_INTERVAL: 6000,
  AP_LANG_WARNING_THRESHOLD: 300,
  PASTE_WARNING_DURATION: 2500,
} as const;
```

**Impact:** Single source of truth, easier to adjust

---

### 8. Phase Color Logic Duplication

**Problem:**
Phase color calculation repeated in:
- `PeerFeedbackContent.tsx` (line 224)
- `WritingSessionContent.tsx` (line 389)
- `RevisionContent.tsx` (line 246)

**Current Code:**
```typescript
// Similar pattern in all three
const timeColor = timeRemaining > SCORING.TIME_PHASE2_GREEN 
  ? '#ff5f8f' 
  : timeRemaining > SCORING.TIME_PHASE2_GREEN / 2 
    ? '#ff9030' 
    : '#ff5f8f';
```

**Solution:**
Create `lib/utils/phase-colors.ts`:
```typescript
export function getPhaseTimeColor(
  phase: 1 | 2 | 3,
  timeRemaining: number
): string {
  const thresholds = {
    1: SCORING.TIME_PHASE1_GREEN,
    2: SCORING.TIME_PHASE2_GREEN,
    3: SCORING.TIME_PHASE3_GREEN,
  };
  
  const colors = {
    1: { green: '#00e5e5', yellow: '#ff9030', red: '#ff5f8f' },
    2: { green: '#ff5f8f', yellow: '#ff9030', red: '#ff5f8f' },
    3: { green: '#00d492', yellow: '#ff9030', red: '#ff5f8f' },
  };
  
  const threshold = thresholds[phase];
  if (timeRemaining > threshold) return colors[phase].green;
  if (timeRemaining > threshold / 2) return colors[phase].yellow;
  return colors[phase].red;
}
```

**Impact:** Remove ~10 lines per component, consistent color logic

---

### 9. Mock Data Scattered

**Problem:**
Mock data defined inline in components:
- `PhaseRankingsContent.tsx` - Mock players array
- `ResultsContent.tsx` - Mock phase feedback
- Various test files

**Solution:**
Create `lib/utils/mock-data.ts`:
```typescript
export const MOCK_PLAYERS = [ ... ];
export const MOCK_PHASE_FEEDBACK = { ... };
export const MOCK_RANKINGS = [ ... ];
```

**Impact:** Centralized mock data, easier to update for testing

---

### 10. require() in Prompts.ts

**Problem:**
Dynamic require in `lib/utils/prompts.ts` (line 170):
```typescript
const { getRandomPromptByRank } = require('./rank-prompt-filtering');
```

**Solution:**
Use static import:
```typescript
import { getRandomPromptByRank } from './rank-prompt-filtering';
```

**Impact:** Better TypeScript support, tree-shaking, static analysis

---

## 🟢 LOW PRIORITY

### 11. Type Definition Consolidation

**Problem:**
Some interfaces defined in multiple places:
- `FeedbackSubmission` in `batch-rank-feedback/route.ts`
- `RevisionSubmission` in `batch-rank-revisions/route.ts`
- Similar patterns could be shared

**Solution:**
Create shared types in `lib/types/submissions.ts`:
```typescript
export interface BaseSubmission {
  playerId: string;
  playerName: string;
  isAI: boolean;
}

export interface FeedbackSubmission extends BaseSubmission {
  responses: { ... };
  peerWriting: string;
}
```

**Impact:** Better type safety, easier maintenance

---

### 12. Error Message Consistency

**Problem:**
Error messages formatted inconsistently:
- Some use emoji prefixes (⚠️, ❌, ✅)
- Some use different formats
- Some are user-facing, some are logs

**Solution:**
Create `lib/utils/error-messages.ts`:
```typescript
export const ERROR_MESSAGES = {
  API_KEY_MISSING: 'API key missing - Set ANTHROPIC_API_KEY environment variable',
  INVALID_SUBMISSION: 'Invalid submission data',
  // ...
} as const;
```

**Impact:** Consistent error handling, easier i18n later

---

### 13. Animation Delay Constants

**Problem:**
Animation delays hardcoded:
- `animationDelay: '0ms'`
- `animationDelay: '150ms'`
- `animationDelay: '300ms'`

**Solution:**
Create `lib/constants/animations.ts`:
```typescript
export const ANIMATION_DELAYS = {
  DOT_1: '0ms',
  DOT_2: '150ms',
  DOT_3: '300ms',
} as const;
```

**Impact:** Consistent animations, easier to adjust

---

### 14. Max Width Constants

**Problem:**
`max-w-[1200px]` repeated 10+ times across components

**Solution:**
Add to Tailwind config or create constant:
```typescript
// tailwind.config.ts
maxWidth: {
  'content': '1200px',
}
```

**Impact:** Consistent layout, easier responsive adjustments

---

### 15. Word Count Calculation

**Problem:**
Word count calculation logic duplicated:
- `countWords()` utility exists but not always used
- Some components use `split(/\s+/).filter(Boolean).length`

**Solution:**
- Ensure all components use `countWords()` from `lib/utils/text-utils.ts`
- Add validation for edge cases

**Impact:** Consistent word counting, better handling of edge cases

---

## 📈 Impact Summary

| Priority | Count | Estimated LOC Reduction | Files Affected |
|----------|-------|-------------------------|----------------|
| High     | 5     | ~200 lines              | 8 files        |
| Medium   | 5     | ~150 lines              | 15+ files      |
| Low      | 5     | ~50 lines               | 10+ files      |
| **Total**| **15**| **~400 lines**          | **33+ files**  |

---

## 🎯 Recommended Implementation Order

1. **Quick Wins** (1-2 hours):
   - FormatTime duplication (#1)
   - Paste handler inline (#2)
   - require() in prompts.ts (#10)

2. **Medium Effort** (4-6 hours):
   - Index parsing duplication (#3)
   - Color constants (#6)
   - Phase color logic (#8)

3. **Large Refactoring** (1-2 days):
   - Component breakdown (#4, #5)
   - Magic numbers (#7)
   - Mock data (#9)

4. **Polish** (as needed):
   - Type consolidation (#11)
   - Error messages (#12)
   - Other low-priority items

---

## ✅ Already Completed

These refactorings have already been done:
- ✅ Time utilities (`lib/utils/time-utils.ts`)
- ✅ Paste prevention hook (`lib/hooks/usePastePrevention.ts`)
- ✅ Batch ranking handler (`lib/utils/batch-ranking-handler.ts`)
- ✅ Scoring constants (`lib/constants/scoring.ts`)

---

## 📝 Notes

- Some refactoring opportunities are documented in existing docs but not yet implemented
- Focus on high-priority items first for maximum impact
- Consider breaking large refactorings into smaller PRs
- Test thoroughly after each refactoring

