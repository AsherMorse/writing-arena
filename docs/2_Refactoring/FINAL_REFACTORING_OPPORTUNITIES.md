# Final Refactoring Opportunities

> Additional refactoring opportunities identified after second round

## 🔍 Analysis Summary

After executing two rounds of refactoring, we've identified **6 more refactoring opportunities** that would further improve code quality and consistency.

---

## 1. 🎨 Loading & Error State Components (MEDIUM PRIORITY)

### Problem
Loading and error state rendering repeated in **5+ components**:
- `WritingSessionContent.tsx`
- `PeerFeedbackContent.tsx`
- `RevisionContent.tsx`
- `ResultsContent.tsx`
- `MatchmakingContent.tsx`

### Current Code
```typescript
// Repeated in multiple files
const renderLoadingState = () => (
  <div className="min-h-screen bg-[#0c141d] text-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
      <p className="text-white text-xl">Loading...</p>
    </div>
  </div>
);

const renderErrorState = () => (
  <div className="min-h-screen bg-[#0c141d] text-white flex items-center justify-center">
    <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-md">
      <div className="text-6xl mb-4">❌</div>
      <h1 className="text-white text-2xl font-bold mb-2">Error</h1>
      <p className="text-white/70 mb-6">{error.message}</p>
      <button onClick={() => router.push('/dashboard')}>Return to Dashboard</button>
    </div>
  </div>
);
```

### Solution
**Create:** `components/shared/LoadingState.tsx` and `components/shared/ErrorState.tsx`
```typescript
// components/shared/LoadingState.tsx
export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-[#0c141d] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-xl">{message}</p>
      </div>
    </div>
  );
}

// components/shared/ErrorState.tsx
export function ErrorState({ 
  error, 
  onRetry, 
  retryLabel = 'Return to Dashboard' 
}: { 
  error: Error | string; 
  onRetry?: () => void;
  retryLabel?: string;
}) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <div className="min-h-screen bg-[#0c141d] text-white flex items-center justify-center">
      <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-md">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-white text-2xl font-bold mb-2">Error</h1>
        <p className="text-white/70 mb-6">{errorMessage}</p>
        {onRetry && (
          <button onClick={onRetry} className="...">
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
```

**Impact:** Remove ~50 lines per component, **5+ components** simplified

---

## 2. 🏆 Medal Emoji Utility (LOW PRIORITY)

### Problem
Medal emoji logic repeated in **3+ components**:
- `ResultsContent.tsx`
- `PhaseRankingsContent.tsx`
- `quick-match/ResultsContent.tsx`

### Current Code
```typescript
// Repeated in multiple files
const getMedalEmoji = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};
```

### Solution
**Create:** `lib/utils/rank-utils.ts`
```typescript
export function getMedalEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

export function getRankColor(rank: number): string {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-gray-300';
  if (rank === 3) return 'text-orange-400';
  return 'text-white/60';
}
```

**Impact:** Remove ~5 lines per component, **3+ components** simplified

---

## 3. 🔄 Retry Logic Utility (MEDIUM PRIORITY)

### Problem
Retry logic for async operations repeated in **2+ components**:
- `PeerFeedbackContent.tsx` - Retries loading peer writing (5 attempts)
- Similar patterns elsewhere

### Current Code
```typescript
// Repeated retry pattern
const MAX_RETRIES = 5;
for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
  const result = await someAsyncOperation();
  if (result) {
    break;
  }
  console.log(`Attempt ${attempt + 1}/${MAX_RETRIES}, retrying...`);
  await new Promise((resolve) => setTimeout(resolve, 1500));
}
```

### Solution
**Create:** `lib/utils/retry.ts`
```typescript
interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  onRetry?: (attempt: number) => void;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T | null> {
  const { maxAttempts = 5, delayMs = 1500, onRetry } = options;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await fn();
      if (result) return result;
    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${maxAttempts} failed:`, error);
    }
    
    if (attempt < maxAttempts - 1) {
      onRetry?.(attempt + 1);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return null;
}
```

**Impact:** Remove ~15 lines per usage, **2+ components** simplified

---

## 4. 🎨 Score Color Utility (LOW PRIORITY)

### Problem
Score color/tone logic repeated in **2+ components**:
- `practice/ResultsContent.tsx` - `scoreTone()` function
- Similar patterns elsewhere

### Current Code
```typescript
// Repeated in practice/ResultsContent.tsx
const scoreTone = (score: number) => {
  if (score >= 90) return 'text-emerald-200';
  if (score >= 75) return 'text-blue-200';
  if (score >= 60) return 'text-yellow-200';
  return 'text-orange-200';
};
```

### Solution
**Create:** `lib/utils/score-utils.ts`
```typescript
export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-200';
  if (score >= 75) return 'text-blue-200';
  if (score >= 60) return 'text-yellow-200';
  return 'text-orange-200';
}

export function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500/20';
  if (score >= 75) return 'bg-blue-500/20';
  if (score >= 60) return 'bg-yellow-500/20';
  return 'bg-orange-500/20';
}
```

**Impact:** Remove ~5 lines per component, **2+ components** simplified

---

## 5. 📊 Player Ranking Utilities (MEDIUM PRIORITY)

### Problem
Player ranking and sorting logic repeated in **3+ components**:
- `ResultsContent.tsx` - Sorts players by composite score
- `PhaseRankingsContent.tsx` - Similar ranking logic
- `quick-match/ResultsContent.tsx` - Similar sorting

### Current Code
```typescript
// Repeated sorting pattern
const rankings = allPlayers
  .sort((a, b) => b.compositeScore - a.compositeScore)
  .map((player, index) => ({ ...player, position: index + 1 }));

const yourRank = rankings.find(p => p.isYou)?.position || 5;
```

### Solution
**Create:** `lib/utils/ranking-utils.ts`
```typescript
export interface RankablePlayer {
  isYou?: boolean;
  compositeScore?: number;
  score?: number;
  [key: string]: any;
}

export function rankPlayers<T extends RankablePlayer>(
  players: T[],
  scoreKey: 'compositeScore' | 'score' = 'compositeScore'
): Array<T & { position: number }> {
  return players
    .sort((a, b) => (b[scoreKey] || 0) - (a[scoreKey] || 0))
    .map((player, index) => ({ ...player, position: index + 1 }));
}

export function getPlayerRank<T extends RankablePlayer>(
  players: Array<T & { position: number }>,
  userId?: string
): number {
  const player = players.find(p => p.isYou || p.userId === userId);
  return player?.position || players.length;
}
```

**Impact:** Remove ~10 lines per component, **3+ components** simplified

---

## 6. 🗄️ Session Storage Cleanup (LOW PRIORITY)

### Problem
Session storage operations still scattered in **2+ components**:
- `ResultsContent.tsx` - Fallback to sessionStorage
- `RevisionContent.tsx` - Stores feedback in sessionStorage

### Current Code
```typescript
// Still using sessionStorage as fallback
const phase1Storage = sessionStorage.getItem(`${matchId}-phase1-feedback`);
sessionStorage.setItem(`${matchId}-phase3-feedback`, JSON.stringify(data));
```

### Solution
**Create:** `lib/utils/session-storage.ts` (or remove entirely if migrating to Firestore)
```typescript
// Centralized session storage helpers
export function getSessionStorage(key: string): any | null {
  if (typeof window === 'undefined') return null;
  const item = sessionStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}

export function setSessionStorage(key: string, value: any): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function clearSessionStorage(key: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(key);
}
```

**Impact:** Better abstraction, easier to migrate away from sessionStorage

---

## 📊 Refactoring Impact Summary

| Refactoring | Files Affected | Lines Saved | Priority | Status |
|------------|---------------|-------------|----------|--------|
| Loading/Error Components | 5+ | ~250 | MEDIUM | 🔴 Not Started |
| Medal Emoji Utility | 3+ | ~15 | LOW | 🔴 Not Started |
| Retry Logic Utility | 2+ | ~30 | MEDIUM | 🔴 Not Started |
| Score Color Utility | 2+ | ~10 | LOW | 🔴 Not Started |
| Player Ranking Utils | 3+ | ~30 | MEDIUM | 🔴 Not Started |
| Session Storage Cleanup | 2+ | ~20 | LOW | 🔴 Not Started |

**Total Estimated Impact:**
- **~355+ lines** of duplicate code removed
- **~17+ files** simplified
- **Better consistency** across codebase
- **Easier maintenance** and testing

---

## 🚀 Recommended Implementation Order

1. **Loading/Error Components** (High visual impact, affects 5+ files)
2. **Retry Logic Utility** (Reusable pattern)
3. **Player Ranking Utils** (Common operation)
4. **Medal Emoji Utility** (Quick win)
5. **Score Color Utility** (Quick win)
6. **Session Storage Cleanup** (Polish, consider removing entirely)

---

## ✅ Next Steps

1. Create loading and error state components
2. Extract retry logic utility
3. Create ranking utilities
4. Add medal emoji utility
5. Add score color utility
6. Clean up session storage usage
7. Update tests
8. Update documentation

---

*Last updated: 2024 - After second round of refactoring execution*

