# Additional Refactoring Opportunities

> More refactoring opportunities identified after initial execution

## 🔍 Analysis Summary

After executing the initial refactoring opportunities, we've identified **8 additional refactoring opportunities** that would further improve code quality.

---

## 1. 📋 Paste/Copy/Cut Handler Utilities (MEDIUM PRIORITY)

### Problem
Paste prevention handlers repeated in **4+ components**:
- `WritingSessionContent.tsx`
- `PeerFeedbackContent.tsx`
- `RevisionContent.tsx`
- `practice/SessionContent.tsx`
- `quick-match/SessionContent.tsx`

### Current Code
```typescript
// Repeated in multiple files
const handlePaste = (e: React.ClipboardEvent) => {
  e.preventDefault();
  setShowPasteWarning(true);
  setTimeout(() => setShowPasteWarning(false), 3000);
};

const handleCut = (e: React.ClipboardEvent) => {
  e.preventDefault();
};

const handleCopy = (e: React.ClipboardEvent) => {
  e.preventDefault();
};
```

### Solution
**Create:** `lib/hooks/usePastePrevention.ts`
```typescript
import { useState, useCallback } from 'react';

export function usePastePrevention(showWarning: boolean = true) {
  const [showPasteWarning, setShowPasteWarning] = useState(false);
  
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    if (showWarning) {
      setShowPasteWarning(true);
      setTimeout(() => setShowPasteWarning(false), 3000);
    }
  }, [showWarning]);
  
  const handleCut = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
  }, []);
  
  const handleCopy = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
  }, []);
  
  return {
    showPasteWarning,
    handlePaste,
    handleCut,
    handleCopy,
  };
}
```

**Impact:** Remove ~15 lines per component, **5 files** simplified

---

## 2. 🎯 Score Calculation Utilities (MEDIUM PRIORITY)

### Problem
Composite score calculation repeated in **2+ components**:
- `ResultsContent.tsx` - Calculates composite score
- Similar weight calculations scattered

### Current Code
```typescript
// Repeated calculation
const compositeScore = 
  (phase1Score * 0.4) + 
  (phase2Score * 0.3) + 
  (phase3Score * 0.3);
```

### Solution
**Create:** `lib/utils/score-calculator.ts`
```typescript
import { SCORING } from '@/lib/constants/scoring';

export const PHASE_WEIGHTS = {
  PHASE1: 0.4,
  PHASE2: 0.3,
  PHASE3: 0.3,
} as const;

export function calculateCompositeScore(
  phase1Score: number,
  phase2Score: number,
  phase3Score: number
): number {
  return Math.round(
    (phase1Score * PHASE_WEIGHTS.PHASE1) +
    (phase2Score * PHASE_WEIGHTS.PHASE2) +
    (phase3Score * PHASE_WEIGHTS.PHASE3)
  );
}

export function calculateLPChange(rank: number, totalPlayers: number = 5): number {
  const lpChanges: Record<number, number> = {
    1: 35,
    2: 22,
    3: 12,
    4: -5,
    5: -15,
  };
  return lpChanges[rank] || 0;
}
```

**Impact:** Centralized scoring logic, easier to adjust weights

---

## 3. 🔄 Navigation Utilities (LOW PRIORITY)

### Problem
Results page navigation with URL params repeated in **3+ components**:
- `WritingSessionContent.tsx`
- `PeerFeedbackContent.tsx`
- `RevisionContent.tsx`

### Current Code
```typescript
// Repeated navigation pattern
router.push(
  `/ranked/results?matchId=${matchId}&trait=${trait}&promptId=${promptId}&promptType=${promptType}&originalContent=${encodeURIComponent(originalContent)}&revisedContent=${encodeURIComponent(revisedContent)}&wordCount=${wordCount}&revisedWordCount=${wordCountRevised}&aiScores=${aiScores}&writingScore=${yourScore}&feedbackScore=${feedbackScore}&revisionScore=${clampScore(revisionScore)}`
);
```

### Solution
**Create:** `lib/utils/navigation.ts`
```typescript
import { clampScore } from '@/lib/constants/scoring';

interface ResultsParams {
  matchId: string;
  trait: string;
  promptId: string;
  promptType: string;
  originalContent: string;
  revisedContent: string;
  wordCount: number;
  revisedWordCount: number;
  writingScore: number;
  feedbackScore: number;
  revisionScore: number;
  aiScores?: string;
}

export function buildResultsURL(params: ResultsParams): string {
  const queryParams = new URLSearchParams({
    matchId: params.matchId,
    trait: params.trait,
    promptId: params.promptId,
    promptType: params.promptType,
    originalContent: encodeURIComponent(params.originalContent),
    revisedContent: encodeURIComponent(params.revisedContent),
    wordCount: params.wordCount.toString(),
    revisedWordCount: params.revisedWordCount.toString(),
    writingScore: params.writingScore.toString(),
    feedbackScore: params.feedbackScore.toString(),
    revisionScore: clampScore(params.revisionScore).toString(),
    ...(params.aiScores && { aiScores: params.aiScores }),
  });
  
  return `/ranked/results?${queryParams.toString()}`;
}
```

**Impact:** Cleaner navigation code, easier to modify URL structure

---

## 4. 🎨 Skill Level Utilities (MEDIUM PRIORITY)

### Problem
`getSkillLevelFromRank()` and related functions duplicated in **3 API routes**:
- `generate-ai-writing/route.ts`
- `generate-ai-feedback/route.ts`
- `generate-ai-revision/route.ts`

### Current Code
```typescript
// Repeated in 3 files
function getSkillLevelFromRank(rank: string): string {
  if (rank.includes('Bronze')) return 'beginner';
  if (rank.includes('Silver')) return 'intermediate';
  if (rank.includes('Gold')) return 'proficient';
  if (rank.includes('Platinum')) return 'advanced';
  return 'intermediate';
}
```

### Solution
**Create:** `lib/utils/skill-level.ts`
```typescript
export function getSkillLevelFromRank(rank: string): 'beginner' | 'intermediate' | 'proficient' | 'advanced' | 'expert' | 'master' {
  if (rank.includes('Bronze')) return 'beginner';
  if (rank.includes('Silver')) return 'intermediate';
  if (rank.includes('Gold')) return 'proficient';
  if (rank.includes('Platinum')) return 'advanced';
  if (rank.includes('Diamond')) return 'expert';
  if (rank.includes('Master') || rank.includes('Grand')) return 'master';
  return 'intermediate';
}

export function getGradeLevelFromRank(rank: string): string {
  if (rank.includes('Bronze')) return '6th';
  if (rank.includes('Silver')) return '7th-8th';
  if (rank.includes('Gold')) return '9th-10th';
  if (rank.includes('Platinum')) return '11th';
  if (rank.includes('Diamond')) return '12th';
  if (rank.includes('Master') || rank.includes('Grand')) return '12th';
  return '7th-8th';
}
```

**Impact:** Remove ~30 lines, **3 files** simplified

---

## 5. 📝 Time Formatting in Practice/Quick Match (LOW PRIORITY)

### Problem
`formatTime()` function still duplicated in:
- `practice/SessionContent.tsx`
- `quick-match/SessionContent.tsx`

### Current Code
```typescript
// Still using local formatTime instead of utility
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

### Solution
**Update:** Import from `lib/utils/time-utils.ts`
```typescript
import { formatTime } from '@/lib/utils/time-utils';
```

**Impact:** Remove ~5 lines per file, consistent formatting

---

## 6. 🔄 Firestore Operation Helpers (MEDIUM PRIORITY)

### Problem
Similar Firestore read/write patterns repeated:
- Getting match state: `getDoc(doc(db, 'matchStates', matchId))`
- Updating session: `updateDoc(sessionRef, {...})`
- Checking document existence

### Solution
**Create:** `lib/utils/firestore-helpers.ts`
```typescript
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';

export async function getMatchState(matchId: string) {
  const matchRef = doc(db, 'matchStates', matchId);
  const matchDoc = await getDoc(matchRef);
  return matchDoc.exists() ? matchDoc.data() : null;
}

export async function updateSessionPhase(
  sessionId: string,
  phase: number,
  phaseDuration: number
) {
  const sessionRef = doc(db, 'sessions', sessionId);
  await updateDoc(sessionRef, {
    'config.phase': phase,
    'config.phaseDuration': phaseDuration,
    [`timing.phase${phase}StartTime`]: serverTimestamp(),
    'coordination.allPlayersReady': true,
    updatedAt: serverTimestamp(),
  });
}
```

**Impact:** Reduce boilerplate, **10+ locations** simplified

---

## 7. 🎨 Modal State Management (LOW PRIORITY)

### Problem
Modal state patterns repeated:
```typescript
const [showTipsModal, setShowTipsModal] = useState(false);
const [showRankingModal, setShowRankingModal] = useState(false);
```

### Solution
**Create:** `lib/hooks/useModals.ts`
```typescript
import { useState } from 'react';

export function useModals() {
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  
  return {
    showTipsModal,
    setShowTipsModal,
    showRankingModal,
    setShowRankingModal,
    closeAllModals: () => {
      setShowTipsModal(false);
      setShowRankingModal(false);
    },
  };
}
```

**Impact:** Cleaner component code, **5+ components** simplified

---

## 8. 📊 Results URL Parameter Parsing (LOW PRIORITY)

### Problem
Results page parsing URL params repeated pattern:
```typescript
const matchId = searchParams.get('matchId');
const trait = searchParams.get('trait');
const promptId = searchParams.get('promptId');
// ... many more
```

### Solution
**Create:** `lib/utils/results-params.ts`
```typescript
export interface ResultsURLParams {
  matchId: string;
  trait: string;
  promptId: string;
  promptType: string;
  originalContent: string;
  revisedContent: string;
  wordCount: number;
  revisedWordCount: number;
  writingScore: number;
  feedbackScore: number;
  revisionScore: number;
  aiScores?: string;
}

export function parseResultsParams(searchParams: URLSearchParams): ResultsURLParams {
  return {
    matchId: searchParams.get('matchId') || '',
    trait: searchParams.get('trait') || 'all',
    promptId: searchParams.get('promptId') || '',
    promptType: searchParams.get('promptType') || 'narrative',
    originalContent: decodeURIComponent(searchParams.get('originalContent') || ''),
    revisedContent: decodeURIComponent(searchParams.get('revisedContent') || ''),
    wordCount: parseInt(searchParams.get('wordCount') || '0', 10),
    revisedWordCount: parseInt(searchParams.get('revisedWordCount') || '0', 10),
    writingScore: parseInt(searchParams.get('writingScore') || '0', 10),
    feedbackScore: parseInt(searchParams.get('feedbackScore') || '0', 10),
    revisionScore: parseInt(searchParams.get('revisionScore') || '0', 10),
    aiScores: searchParams.get('aiScores') || undefined,
  };
}
```

**Impact:** Cleaner parameter handling, **2+ components** simplified

---

## 📊 Refactoring Impact Summary

| Refactoring | Files Affected | Lines Saved | Priority | Status |
|------------|---------------|-------------|----------|--------|
| Paste Prevention Hook | 5 | ~75 | MEDIUM | 🔴 Not Started |
| Score Calculator | 2+ | ~30 | MEDIUM | 🔴 Not Started |
| Navigation Utilities | 3+ | ~50 | LOW | 🔴 Not Started |
| Skill Level Utilities | 3 | ~30 | MEDIUM | 🔴 Not Started |
| Time Formatting (Practice/Quick) | 2 | ~10 | LOW | 🔴 Not Started |
| Firestore Helpers | 10+ | ~100 | MEDIUM | 🔴 Not Started |
| Modal State Hook | 5+ | ~25 | LOW | 🔴 Not Started |
| Results Params Parser | 2+ | ~40 | LOW | 🔴 Not Started |

**Total Estimated Impact:**
- **~360+ lines** of duplicate code removed
- **~28+ files** simplified
- **Better consistency** across codebase
- **Easier maintenance** and testing

---

## 🚀 Recommended Implementation Order

1. **Skill Level Utilities** (Quick win, affects 3 files)
2. **Paste Prevention Hook** (High reuse, 5 files)
3. **Score Calculator** (Foundation for scoring)
4. **Firestore Helpers** (Reduces boilerplate)
5. **Time Formatting** (Quick cleanup)
6. **Navigation Utilities** (Polish)
7. **Modal State Hook** (Polish)
8. **Results Params Parser** (Polish)

---

## ✅ Next Steps

1. Create skill level utilities
2. Extract paste prevention hook
3. Create score calculator
4. Add Firestore helpers
5. Update remaining time formatting
6. Add navigation utilities
7. Extract modal state hook
8. Create results params parser
9. Update tests
10. Update documentation

---

*Last updated: 2024 - After initial refactoring execution*

