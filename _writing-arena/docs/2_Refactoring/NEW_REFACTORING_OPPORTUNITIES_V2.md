# New Refactoring Opportunities (V2)

> Additional refactoring opportunities identified after comprehensive analysis

## 🔍 Analysis Summary

After analyzing the codebase more deeply, we've identified **8 new refactoring opportunities** that would further improve code quality and consistency.

---

## 1. 🔄 Async Data Fetching Pattern (MEDIUM PRIORITY)

### Problem
Similar async data fetching patterns with loading/error states repeated in **3+ components**:
- `practice/ResultsContent.tsx` - Analyzes writing with loading state
- `quick-match/ResultsContent.tsx` - Analyzes match with loading state  
- `ranked/ResultsContent.tsx` - Fetches AI feedback with loading state

### Current Code
```typescript
// Repeated in practice/ResultsContent.tsx and quick-match/ResultsContent.tsx
const [isAnalyzing, setIsAnalyzing] = useState(true);
const [feedback, setFeedback] = useState<any>(null);

useEffect(() => {
  const analyzeWriting = async () => {
    try {
      const response = await fetch('/api/analyze-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, trait, promptType }),
      });
      const data = await response.ok ? await response.json() : null;
      if (!data) throw new Error('analysis failed');
      
      setTimeout(() => {
        setFeedback(data);
        setIsAnalyzing(false);
      }, 1200);
    } catch (error) {
      setTimeout(() => {
        setFeedback(generateMockFeedback(wordCount));
        setIsAnalyzing(false);
      }, 1200);
    }
  };
  analyzeWriting();
}, [dependencies]);
```

### Solution
**Update:** `lib/hooks/useAsyncData.ts` (already exists, but needs adoption)
**Create:** `components/shared/AnalyzingState.tsx` for consistent analyzing UI

```typescript
// components/shared/AnalyzingState.tsx
export function AnalyzingState({ message = 'Analyzing...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#141e27] text-3xl">🤖</div>
        <h2 className="text-2xl font-semibold">{message}</h2>
        <p className="text-sm text-white/60">AI is evaluating your response...</p>
        <div className="flex gap-2">
          {[0, 150, 300].map(delay => (
            <span key={delay} className="h-2 w-2 animate-bounce rounded-full bg-emerald-300" style={{ animationDelay: `${delay}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Impact:** Remove ~30 lines per component, **3+ components** simplified, consistent analyzing UI

---

## 2. 🎯 Player Display Component (MEDIUM PRIORITY)

### Problem
Similar player card/display rendering repeated in **4+ components**:
- `ResultsContent.tsx` - Player ranking cards
- `quick-match/ResultsContent.tsx` - Player scoreboard cards
- `WaitingForPlayers.tsx` - Player slot cards
- `PhaseRankingsContent.tsx` - Player ranking display

### Current Code
```typescript
// Repeated player card pattern
{players.map((player) => (
  <div className={`rounded-2xl border px-5 py-4 ${
    player.isYou ? 'border-emerald-300/40 bg-emerald-400/10' : 'border-white/10 bg-white/5'
  }`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-3xl">{player.avatar}</span>
        <div>
          <div className={`font-bold ${player.isYou ? 'text-emerald-200' : 'text-white'}`}>
            {player.name}
          </div>
          <div className="text-xs text-white/50">{player.wordCount} words</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-2xl font-semibold ${player.isYou ? 'text-emerald-200' : 'text-white'}`}>
          {player.score}
        </div>
      </div>
    </div>
  </div>
))}
```

### Solution
**Create:** `components/shared/PlayerCard.tsx`
```typescript
interface PlayerCardProps {
  player: {
    name: string;
    avatar: string;
    score?: number;
    wordCount?: number;
    rank?: number;
    isYou?: boolean;
    isAI?: boolean;
  };
  variant?: 'default' | 'compact' | 'ranking';
  showRank?: boolean;
  showWordCount?: boolean;
}

export function PlayerCard({ player, variant = 'default', showRank, showWordCount }: PlayerCardProps) {
  // Standardized player card rendering
}
```

**Impact:** Remove ~20 lines per usage, **4+ components** simplified, consistent player display

---

## 3. 📊 URL Parameter Parsing Hook (LOW PRIORITY)

### Problem
URL parameter parsing repeated in **3+ components**:
- `practice/ResultsContent.tsx` - Parses trait, promptType, content, wordCount
- `quick-match/ResultsContent.tsx` - Similar parsing
- `ranked/ResultsContent.tsx` - Uses session but has fallback URL parsing

### Current Code
```typescript
// Repeated parsing pattern
const searchParams = useSearchParams();
const trait = searchParams.get('trait');
const promptType = searchParams.get('promptType');
const content = searchParams.get('content') || '';
const wordCount = parseInt(searchParams.get('wordCount') || '0');
```

### Solution
**Create:** `lib/hooks/useSearchParams.ts`
```typescript
import { useSearchParams as useNextSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export function useSearchParams<T>(
  parser: (params: URLSearchParams) => T
): T {
  const searchParams = useNextSearchParams();
  return useMemo(() => parser(searchParams), [searchParams, parser]);
}

// Usage:
const params = useSearchParams((params) => ({
  trait: params.get('trait'),
  promptType: params.get('promptType'),
  content: params.get('content') || '',
  wordCount: parseInt(params.get('wordCount') || '0'),
}));
```

**Impact:** Type-safe parameter parsing, **3+ components** simplified

---

## 4. 🎨 Player Mapping Utility (LOW PRIORITY)

### Problem
Similar player transformation/mapping patterns repeated:
- `WritingSessionContent.tsx` - Maps players to `membersWithCounts` and `partyMembers`
- `MatchmakingContent.tsx` - Maps AI students to player format
- `ResultsContent.tsx` - Transforms players for display

### Current Code
```typescript
// Repeated mapping pattern
const membersWithCounts = players.map((player, index) => {
  const isYou = player.userId === user?.uid;
  const aiIndex = players.filter((p, i) => i < index && p.isAI).length;
  
  return {
    name: player.displayName,
    avatar: player.avatar,
    rank: player.rank,
    userId: player.userId,
    isYou,
    isAI: player.isAI,
    wordCount: isYou ? wordCount : (player.isAI ? aiWordCounts[aiIndex] || 0 : 0),
  };
});
```

### Solution
**Create:** `lib/utils/player-mapper.ts`
```typescript
export interface PlayerDisplay {
  name: string;
  avatar: string;
  rank: string;
  userId: string;
  isYou: boolean;
  isAI: boolean;
  wordCount?: number;
  score?: number;
}

export function mapPlayersToDisplay(
  players: Array<{ userId: string; displayName: string; avatar: string; rank: string; isAI: boolean }>,
  currentUserId: string,
  wordCounts?: number[]
): PlayerDisplay[] {
  return players.map((player, index) => ({
    name: player.displayName,
    avatar: player.avatar,
    rank: player.rank,
    userId: player.userId,
    isYou: player.userId === currentUserId,
    isAI: player.isAI,
    wordCount: wordCounts?.[index],
  }));
}
```

**Impact:** Remove ~10 lines per usage, **3+ components** simplified

---

## 5. ⏱️ Timer Management Hook (LOW PRIORITY)

### Problem
Timer/interval management patterns repeated across **10+ components**:
- `setTimeout` for delays
- `setInterval` for periodic updates
- Cleanup patterns

### Current Code
```typescript
// Repeated timer patterns
useEffect(() => {
  const timer = setTimeout(() => {
    setFeedback(data);
    setIsAnalyzing(false);
  }, 1200);
  return () => clearTimeout(timer);
}, [dependencies]);

useEffect(() => {
  const interval = setInterval(() => {
    // Update something
  }, 2000);
  return () => clearInterval(interval);
}, [dependencies]);
```

### Solution
**Create:** `lib/hooks/useTimer.ts`
```typescript
export function useTimeout(callback: () => void, delay: number | null) {
  useEffect(() => {
    if (delay === null) return;
    const timer = setTimeout(callback, delay);
    return () => clearTimeout(timer);
  }, [callback, delay]);
}

export function useInterval(callback: () => void, delay: number | null) {
  useEffect(() => {
    if (delay === null) return;
    const interval = setInterval(callback, delay);
    return () => clearInterval(interval);
  }, [callback, delay]);
}
```

**Impact:** Cleaner timer management, **10+ components** simplified

---

## 6. 🎨 Results Page Layout Component (LOW PRIORITY)

### Problem
Similar results page layout structure repeated in **3 components**:
- `practice/ResultsContent.tsx`
- `quick-match/ResultsContent.tsx`
- `ranked/ResultsContent.tsx`

### Current Code
```typescript
// Repeated layout structure
<div className="min-h-screen bg-[#0c141d] text-white">
  <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
    <section className="flex flex-col gap-4 sm:flex-row sm:justify-end">
      {/* Action buttons */}
    </section>
    <section className="rounded-3xl border border-white/10 bg-[#141e27] p-8">
      {/* Score display */}
    </section>
    {/* More sections... */}
  </main>
</div>
```

### Solution
**Create:** `components/shared/ResultsLayout.tsx`
```typescript
interface ResultsLayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function ResultsLayout({ children, actions }: ResultsLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0c141d] text-white">
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
        {actions && (
          <section className="flex flex-col gap-4 sm:flex-row sm:justify-end">
            {actions}
          </section>
        )}
        {children}
      </main>
    </div>
  );
}
```

**Impact:** Consistent layout, **3 components** simplified

---

## 7. 🔄 Mock Data Generation Utilities (LOW PRIORITY)

### Problem
Mock feedback/data generation functions scattered:
- `practice/ResultsContent.tsx` - `generateMockFeedback()`
- `quick-match/ResultsContent.tsx` - Fallback score generation
- Similar patterns elsewhere

### Current Code
```typescript
// Repeated mock generation
const generateMockFeedback = (words: number) => {
  const base = Math.min(100, Math.max(45, 60 + words / 8));
  return {
    overallScore: Math.round(base),
    xpEarned: Math.round(base * 1.2),
    traits: { /* ... */ },
    strengths: [/* ... */],
    improvements: [/* ... */],
  };
};
```

### Solution
**Update:** `lib/utils/mock-data.ts` (already exists, expand it)
```typescript
export function generateMockPracticeFeedback(wordCount: number): PracticeFeedback {
  // Centralized mock feedback generation
}

export function generateMockQuickMatchResults(wordCount: number, aiScores: number[]): QuickMatchResults {
  // Centralized mock results generation
}
```

**Impact:** Centralized mock data, easier to update, **3+ components** simplified

---

## 8. 🎯 Score Display Component (LOW PRIORITY)

### Problem
Similar score display patterns repeated:
- Score with label
- Trait breakdown displays
- Medal/rank displays

### Current Code
```typescript
// Repeated score display
<div>
  <div className="text-xs uppercase tracking-[0.3em] text-white/50">Overall score</div>
  <div className={`mt-3 text-5xl font-semibold ${getScoreColor(feedback.overallScore)}`}>
    {feedback.overallScore}
  </div>
  <p className="mt-1 text-xs text-white/50">out of 100</p>
</div>
```

### Solution
**Create:** `components/shared/ScoreDisplay.tsx`
```typescript
interface ScoreDisplayProps {
  label: string;
  score: number;
  maxScore?: number;
  variant?: 'large' | 'medium' | 'small';
  showLabel?: boolean;
}

export function ScoreDisplay({ label, score, maxScore = 100, variant = 'large', showLabel = true }: ScoreDisplayProps) {
  // Standardized score display
}
```

**Impact:** Consistent score displays, **5+ components** simplified

---

## 📊 Refactoring Impact Summary

| Refactoring | Files Affected | Lines Saved | Priority | Status |
|------------|---------------|-------------|----------|--------|
| Async Data Fetching Hook Adoption | 3+ | ~90 | MEDIUM | 🔴 Not Started |
| Player Display Component | 4+ | ~80 | MEDIUM | 🔴 Not Started |
| URL Parameter Parsing Hook | 3+ | ~30 | LOW | 🔴 Not Started |
| Player Mapping Utility | 3+ | ~30 | LOW | 🔴 Not Started |
| Timer Management Hook | 10+ | ~50 | LOW | 🔴 Not Started |
| Results Page Layout | 3+ | ~40 | LOW | 🔴 Not Started |
| Mock Data Generation | 3+ | ~40 | LOW | 🔴 Not Started |
| Score Display Component | 5+ | ~50 | LOW | 🔴 Not Started |

**Total Estimated Impact:**
- **~410+ lines** of duplicate code removed
- **~34+ files** simplified
- **Better consistency** across codebase
- **Easier maintenance** and testing

---

## 🚀 Recommended Implementation Order

1. **Adopt useAsyncData hook** (High impact, affects 3+ files)
2. **Create Player Display Component** (High reuse, affects 4+ files)
3. **Create URL Parameter Parsing Hook** (Quick win)
4. **Create Player Mapping Utility** (Quick win)
5. **Create Timer Management Hook** (Polish)
6. **Create Results Layout Component** (Polish)
7. **Expand Mock Data Utilities** (Polish)
8. **Create Score Display Component** (Polish)

---

## ✅ Next Steps

1. Update `practice/ResultsContent.tsx` and `quick-match/ResultsContent.tsx` to use `useAsyncData` hook
2. Create `AnalyzingState` component for consistent analyzing UI
3. Create `PlayerCard` component for consistent player display
4. Create `useSearchParams` hook for type-safe URL parsing
5. Create `mapPlayersToDisplay` utility function
6. Create `useTimer` hook for timer management
7. Create `ResultsLayout` component
8. Expand `mock-data.ts` with more utilities
9. Create `ScoreDisplay` component

---

*Last updated: After comprehensive codebase analysis*

