# New Refactoring Opportunities

> Additional refactoring opportunities identified after initial refactoring pass

## 🔍 Analysis Summary

After the initial refactoring (time utils, API helpers, scoring constants), we've identified **7 additional refactoring opportunities** that would further improve code quality and maintainability.

---

## 1. 🔄 API Routes Still Using Old Patterns (HIGH PRIORITY)

### Problem
Several API routes still use direct `process.env.ANTHROPIC_API_KEY` checks and direct `fetch()` calls instead of using centralized helpers:

**Affected Files:**
- `app/api/analyze-writing/route.ts`
- `app/api/generate-ai-writing/route.ts`
- `app/api/generate-ai-feedback/route.ts`
- `app/api/generate-ai-revision/route.ts`
- `app/api/generate-feedback/route.ts`
- `app/api/evaluate-peer-feedback/route.ts`
- `app/api/evaluate-revision/route.ts`

### Current Code
```typescript
// Repeated in multiple files
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey || apiKey === 'your_api_key_here') {
  return NextResponse.json(generateMockData(...));
}

const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({...}),
});
```

### Solution
**Update all routes to use centralized helpers:**
```typescript
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { parseClaudeJSON } from '@/lib/utils/claude-parser';

export async function POST(request: NextRequest) {
  const requestBody = await request.json();
  
  try {
    logApiKeyStatus('ENDPOINT_NAME');
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      return NextResponse.json(generateMockData(...));
    }
    
    const prompt = generatePrompt(...);
    const aiResponse = await callAnthropicAPI(apiKey, prompt, maxTokens);
    const parsed = parseClaudeJSON(aiResponse.content[0].text);
    
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(generateMockData(...));
  }
}
```

**Impact:** 
- Remove ~20 lines per file
- Consistent error handling
- Better logging
- **7 files** affected

---

## 2. 📊 Word Count Utility (MEDIUM PRIORITY)

### Problem
Word count calculation pattern repeated **15+ times**:
```typescript
content.split(/\s+/).filter((w: string) => w.length > 0).length
```

**Found in:**
- `app/api/generate-ai-writing/route.ts`
- `app/api/generate-ai-revision/route.ts`
- `components/ranked/WritingSessionContent.tsx`
- `components/ranked/RevisionContent.tsx`
- And many more...

### Solution
**Create:** `lib/utils/text-utils.ts`
```typescript
/**
 * Text utility functions
 */

export function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
}

export function countCharacters(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().length;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
```

**Usage:**
```typescript
import { countWords } from '@/lib/utils/text-utils';

const wordCount = countWords(content);
```

**Impact:** 
- Remove ~15+ duplicate calculations
- Consistent word counting logic
- Easier to modify counting rules

---

## 3. 🎲 Random Number Utilities (LOW PRIORITY)

### Problem
Math.random() patterns scattered throughout codebase (87 matches found):
- Score generation: `Math.random() * 20 + 75`
- Mock data: `Math.random() * 30 + 50`
- Various random calculations

### Solution
**Create:** `lib/utils/random-utils.ts`
```typescript
/**
 * Random number utilities for consistent mock data generation
 */

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomScore(base: number, variance: number): number {
  return Math.round(base + Math.random() * variance);
}

// Common score ranges
export function randomWritingScore(): number {
  return randomScore(60, 30); // 60-90
}

export function randomFeedbackScore(): number {
  return randomScore(75, 20); // 75-95
}
```

**Impact:** 
- More readable code
- Consistent random generation
- Easier to adjust ranges

---

## 4. 🎨 Textarea Component (MEDIUM PRIORITY)

### Problem
Same textarea className repeated **15+ times**:
```typescript
className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
```

### Solution
**Create:** `components/ui/Textarea.tsx`
```typescript
'use client';

import { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'feedback' | 'revision';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ variant = 'default', className = '', ...props }, ref) => {
    const baseClasses = 'w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      default: 'min-h-[80px]',
      feedback: 'min-h-[100px]',
      revision: 'min-h-[200px]',
    };
    
    return (
      <textarea
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
```

**Impact:** 
- Consistent styling
- Easier to update design
- **15+ files** simplified

---

## 5. 🔄 Phase Transition Hook (MEDIUM PRIORITY)

### Problem
Similar phase transition logic repeated in 3 components:
- `WritingSessionContent.tsx` (Phase 1 → 2)
- `PeerFeedbackContent.tsx` (Phase 2 → 3)
- `RevisionContent.tsx` (Phase 3 → Results)

**Common Pattern:**
```typescript
useEffect(() => {
  if (!session || !hasSubmitted()) return;
  if (config?.phase !== currentPhase) return;
  
  const allPlayers = Object.values(players || {});
  const realPlayers = allPlayers.filter((p: any) => !p.isAI);
  const submittedRealPlayers = realPlayers.filter(
    (p: any) => p.phases[`phase${currentPhase}`]?.submitted
  );
  
  if (submittedRealPlayers.length === realPlayers.length && !coordination?.allPlayersReady) {
    // Transition logic...
  }
}, [session, ...]);
```

### Solution
**Create:** `lib/hooks/usePhaseTransition.ts`
```typescript
import { useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';
import { SCORING } from '@/lib/constants/scoring';

interface UsePhaseTransitionOptions {
  session: GameSession | null;
  currentPhase: 1 | 2 | 3;
  nextPhase: 2 | 3 | 'results';
  hasSubmitted: () => boolean;
  fallbackDelay?: number;
}

export function usePhaseTransition({
  session,
  currentPhase,
  nextPhase,
  hasSubmitted,
  fallbackDelay = 10000,
}: UsePhaseTransitionOptions) {
  useEffect(() => {
    if (!session || !hasSubmitted()) return;
    if (session.config?.phase !== currentPhase) return;
    
    const { players, coordination, sessionId } = session;
    const allPlayers = Object.values(players || {});
    const realPlayers = allPlayers.filter((p: any) => !p.isAI);
    const submittedRealPlayers = realPlayers.filter(
      (p: any) => p.phases[`phase${currentPhase}` as keyof typeof p.phases]?.submitted
    );
    
    if (submittedRealPlayers.length === realPlayers.length && !coordination?.allPlayersReady) {
      const fallbackTimer = setTimeout(async () => {
        try {
          const sessionRef = doc(db, 'sessions', sessionId);
          const phaseDurations: Record<number, number> = {
            2: SCORING.PHASE2_DURATION,
            3: SCORING.PHASE3_DURATION,
          };
          
          if (nextPhase === 'results') {
            // Handle results transition
            return;
          }
          
          await updateDoc(sessionRef, {
            'coordination.allPlayersReady': true,
            'config.phase': nextPhase,
            'config.phaseDuration': phaseDurations[nextPhase],
            [`timing.phase${nextPhase}StartTime`]: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          console.error('Phase transition failed:', error);
        }
      }, fallbackDelay);
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [session, currentPhase, nextPhase, hasSubmitted, fallbackDelay]);
}
```

**Impact:** 
- Remove ~50 lines per component
- Consistent transition logic
- **3 files** simplified

---

## 6. 📝 Mock Data Generation Utilities (LOW PRIORITY)

### Problem
Mock data generation functions scattered across API routes with similar patterns:
- `generateMockRankings()`
- `generateMockFeedback()`
- `generateMockAIWriting()`
- `generateMockRevision()`

### Solution
**Create:** `lib/utils/mock-data.ts`
```typescript
import { randomScore, randomInt } from './random-utils';
import { SCORING } from '@/lib/constants/scoring';

export function generateMockRanking(playerId: string, playerName: string, baseScore: number = 75): any {
  const score = randomScore(baseScore, 20);
  return {
    playerId,
    playerName,
    score: Math.min(score, SCORING.MAX_SCORE),
    rank: 0, // Will be set after sorting
    strengths: ['Mock scoring - enable AI for accurate feedback'],
    improvements: ['Enable AI evaluation for real feedback'],
  };
}

export function generateMockFeedback(baseScore: number = 75): any {
  return {
    overallScore: randomScore(baseScore, 20),
    strengths: ['Mock feedback'],
    improvements: ['Enable AI for accurate feedback'],
  };
}

// ... other mock generators
```

**Impact:** 
- Consistent mock data
- Easier to update mock behavior
- **7+ files** simplified

---

## 7. 🎯 Loading State Hook (LOW PRIORITY)

### Problem
Loading state patterns repeated across components:
```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // ... fetch logic
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### Solution
**Create:** `lib/hooks/useAsync.ts`
```typescript
import { useState, useEffect, useCallback } from 'react';

interface UseAsyncOptions<T> {
  asyncFn: () => Promise<T>;
  immediate?: boolean;
  dependencies?: any[];
}

export function useAsync<T>({ asyncFn, immediate = true, dependencies = [] }: UseAsyncOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);
  
  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);
  
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate, ...dependencies]);
  
  return { data, loading, error, execute };
}
```

**Usage:**
```typescript
const { data, loading, error } = useAsync({
  asyncFn: () => fetchPeerFeedback(matchId, userId),
  dependencies: [matchId, userId],
});
```

**Impact:** 
- Consistent loading patterns
- Less boilerplate
- **10+ components** could benefit

---

## 📊 Refactoring Impact Summary

| Refactoring | Files Affected | Lines Saved | Priority | Status |
|------------|---------------|-------------|----------|--------|
| API Routes Standardization | 7 | ~140 | HIGH | 🔴 Not Started |
| Word Count Utility | 15+ | ~30 | MEDIUM | 🔴 Not Started |
| Textarea Component | 15+ | ~300 chars/file | MEDIUM | 🔴 Not Started |
| Phase Transition Hook | 3 | ~150 | MEDIUM | 🔴 Not Started |
| Random Utilities | 20+ | ~50 | LOW | 🔴 Not Started |
| Mock Data Utilities | 7+ | ~100 | LOW | 🔴 Not Started |
| Loading State Hook | 10+ | ~200 | LOW | 🔴 Not Started |

**Total Estimated Impact:**
- **~670+ lines** of duplicate code removed
- **~67+ files** simplified
- **Better consistency** across codebase
- **Easier maintenance** and testing

---

## 🚀 Recommended Implementation Order

1. **API Routes Standardization** (High impact, affects many files)
2. **Word Count Utility** (Quick win, used everywhere)
3. **Textarea Component** (UI consistency)
4. **Phase Transition Hook** (Complex but high value)
5. **Random Utilities** (Polish)
6. **Mock Data Utilities** (Polish)
7. **Loading State Hook** (Nice to have)

---

## ✅ Next Steps

1. Update API routes to use centralized helpers
2. Create text utilities for word counting
3. Extract Textarea component
4. Create phase transition hook
5. Add random and mock utilities
6. Create loading state hook
7. Update tests
8. Update documentation

---

*Last updated: 2024 - After initial refactoring pass*

