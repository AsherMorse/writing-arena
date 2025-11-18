# Refactoring Opportunities

## 🔍 Analysis Summary

Identified **8 major refactoring opportunities** across the codebase that would improve maintainability, reduce duplication, and enhance consistency.

---

## 1. ⏰ Time Utilities (HIGH PRIORITY)

### Problem
`formatTime` and `getTimeColor` functions are duplicated across 3+ components:
- `WritingSessionContent.tsx`
- `PeerFeedbackContent.tsx`
- `RevisionContent.tsx`

### Current Code
```typescript
// Repeated in multiple files
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getTimeColor = () => {
  if (timeRemaining > 30) return 'text-green-400';
  if (timeRemaining > 15) return 'text-yellow-400';
  return 'text-red-400';
};
```

### Solution
**Create:** `lib/utils/time-utils.ts`
```typescript
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getTimeColor(seconds: number, thresholds?: { green: number; yellow: number }): string {
  const { green = 30, yellow = 15 } = thresholds || {};
  if (seconds > green) return 'text-green-400';
  if (seconds > yellow) return 'text-yellow-400';
  return 'text-red-400';
}

export function getTimeProgressColor(seconds: number, thresholds?: { green: number; yellow: number }): string {
  const { green = 30, yellow = 15 } = thresholds || {};
  if (seconds > green) return 'bg-green-400';
  if (seconds > yellow) return 'bg-yellow-400';
  return 'bg-red-400';
}
```

**Impact:** Remove ~30 lines of duplicate code, ensure consistent time formatting

---

## 2. 🔑 API Key Validation (HIGH PRIORITY)

### Problem
Same API key check pattern repeated in **11 API route files**:
- `batch-rank-writings/route.ts`
- `batch-rank-feedback/route.ts`
- `batch-rank-revisions/route.ts`
- `analyze-writing/route.ts`
- `generate-ai-writing/route.ts`
- `generate-ai-feedback/route.ts`
- `generate-ai-revision/route.ts`
- `generate-feedback/route.ts`
- `evaluate-peer-feedback/route.ts`
- `evaluate-revision/route.ts`
- `seed-ai-students/route.ts`

### Current Code
```typescript
// Repeated in every API route
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey || apiKey === 'your_api_key_here') {
  return NextResponse.json(generateMockRankings(...));
}
```

### Solution
**Create:** `lib/utils/api-helpers.ts`
```typescript
export function getAnthropicApiKey(): string | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    return null;
  }
  return apiKey;
}

export function isApiKeyConfigured(): boolean {
  return getAnthropicApiKey() !== null;
}

export function logApiKeyStatus(context: string): void {
  const apiKey = getAnthropicApiKey();
  const hasKey = !!apiKey;
  const keyLength = apiKey?.length || 0;
  const keyPrefix = apiKey?.substring(0, 8) || 'none';
  
  console.log(`🔍 ${context} - API Key Check:`, {
    hasKey,
    keyLength,
    keyPrefix: `${keyPrefix}...`,
  });
  
  if (!hasKey) {
    console.warn(`⚠️ ${context} - API key missing, using fallback`);
  }
}
```

**Impact:** Remove ~33 lines of duplicate code, consistent error handling

---

## 3. 📝 Textarea Component (MEDIUM PRIORITY)

### Problem
Same textarea className repeated **15+ times** across components:
```typescript
className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
```

### Solution
**Create:** `components/ui/Textarea.tsx`
```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'feedback' | 'revision';
}

export function Textarea({ variant = 'default', className = '', ...props }: TextareaProps) {
  const baseClasses = "w-full p-3 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    default: "bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 min-h-[80px]",
    feedback: "bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 min-h-[80px]",
    revision: "text-lg leading-relaxed resize-none focus:outline-none text-gray-800 font-serif min-h-[450px]",
  };
  
  return (
    <textarea
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
```

**Impact:** Consistent styling, easier to update, reduce ~200+ characters per usage

---

## 4. 🎲 Score Calculation Constants (MEDIUM PRIORITY)

### Problem
Magic numbers scattered throughout:
- Default scores: `75`, `80`, `85`, `90`, `95`
- Random ranges: `Math.random() * 20 + 75`, `60 + Math.random() * 30`
- Score thresholds: `30`, `15`, `60`
- Fallback scores: `data.score || 75`

### Solution
**Create:** `lib/constants/scoring.ts`
```typescript
export const SCORING = {
  // Default fallback scores
  DEFAULT_WRITING_SCORE: 75,
  DEFAULT_FEEDBACK_SCORE: 80,
  DEFAULT_REVISION_SCORE: 78,
  
  // Score ranges
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  
  // Mock scoring ranges (conservative)
  MOCK_MIN: 30,
  MOCK_MAX: 85,
  MOCK_BASE_MIN: 30,
  MOCK_BASE_MAX: 50,
  MOCK_RANDOM_MAX: 15,
  
  // Time thresholds (seconds)
  TIME_GREEN_THRESHOLD: 30,
  TIME_YELLOW_THRESHOLD: 15,
  TIME_PHASE1_GREEN: 60,
  
  // Phase durations (seconds)
  PHASE1_DURATION: 120,
  PHASE2_DURATION: 90,
  PHASE3_DURATION: 90,
} as const;

export function getDefaultScore(phase: 1 | 2 | 3): number {
  switch (phase) {
    case 1: return SCORING.DEFAULT_WRITING_SCORE;
    case 2: return SCORING.DEFAULT_FEEDBACK_SCORE;
    case 3: return SCORING.DEFAULT_REVISION_SCORE;
  }
}

export function clampScore(score: number): number {
  return Math.max(SCORING.MIN_SCORE, Math.min(SCORING.MAX_SCORE, Math.round(score)));
}
```

**Impact:** Single source of truth, easier to adjust scoring, better maintainability

---

## 5. 🔄 API Error Handling Pattern (MEDIUM PRIORITY)

### Problem
Similar error handling pattern repeated in all API routes:
```typescript
try {
  // API call
} catch (error) {
  console.error('Error...', error);
  return NextResponse.json(generateMockRankings(...));
}
```

### Solution
**Create:** `lib/utils/api-error-handler.ts`
```typescript
import { NextResponse } from 'next/server';

export function handleApiError<T>(
  context: string,
  error: unknown,
  fallback: () => T
): NextResponse<T> {
  console.error(`❌ ${context} - Error:`, error);
  
  if (error instanceof Error) {
    console.error(`   Message: ${error.message}`);
    if ('stack' in error) {
      console.error(`   Stack: ${error.stack}`);
    }
  }
  
  return NextResponse.json(fallback());
}

export async function callAnthropicAPI(
  apiKey: string,
  prompt: string,
  maxTokens: number = 2000
): Promise<any> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API request failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}
```

**Impact:** Consistent error handling, better error messages, reduce ~50 lines per API route

---

## 6. 🎨 Modal Component Pattern (LOW PRIORITY)

### Problem
Similar modal structure repeated:
- Ranking modals in `PeerFeedbackContent.tsx` and `RevisionContent.tsx`
- Loading modals across components
- Same backdrop/centering pattern

### Current Code
```typescript
{showRankingModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div className="rounded-3xl border border-blue-400/30 bg-[#141e27] p-12 shadow-2xl text-center max-w-md mx-4">
      {/* content */}
    </div>
  </div>
)}
```

### Solution
**Enhance:** `components/ui/Modal.tsx` (already exists, but add variants)
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  variant?: 'default' | 'ranking' | 'loading' | 'error';
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, variant = 'default', title, children, onClose }: ModalProps) {
  if (!isOpen) return null;
  
  const variantClasses = {
    default: "border-white/20 bg-[#141e27]",
    ranking: "border-blue-400/30 bg-[#141e27]",
    loading: "border-emerald-400/30 bg-[#141e27]",
    error: "border-red-400/30 bg-[#141e27]",
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className={`rounded-3xl border p-12 shadow-2xl text-center max-w-md mx-4 ${variantClasses[variant]}`}>
        {title && <h2 className="text-3xl font-bold text-white mb-3">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
```

**Impact:** Consistent modal styling, easier to maintain

---

## 7. 📊 Batch Ranking Response Parser (MEDIUM PRIORITY)

### Problem
Similar JSON parsing logic in:
- `batch-rank-writings/route.ts`
- `batch-rank-feedback/route.ts`
- `batch-rank-revisions/route.ts`

### Current Code
```typescript
// Repeated pattern
const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
if (jsonMatch) {
  const parsed = JSON.parse(jsonMatch[0]);
  // Map indices...
}
```

### Solution
**Create:** `lib/utils/claude-parser.ts`
```typescript
export function parseClaudeJSON<T>(claudeResponse: string): T | null {
  try {
    const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in Claude response');
      return null;
    }
    
    return JSON.parse(jsonMatch[0]) as T;
  } catch (error) {
    console.error('❌ Error parsing Claude JSON:', error);
    return null;
  }
}

export function mapRankingsToPlayers<T extends { playerId?: string }>(
  rankings: any[],
  submissions: Array<{ playerId: string; [key: string]: any }>,
  mapper: (ranking: any, index: number, actualPlayer: typeof submissions[0]) => T
): T[] {
  return rankings.map((ranking, idx) => {
    let writerIndex = idx;
    
    // Extract index from playerId if it's in format "writer_index_X"
    if (ranking.playerId && typeof ranking.playerId === 'string') {
      const match = ranking.playerId.match(/writer_index_(\d+)/);
      if (match) {
        writerIndex = parseInt(match[1]);
      }
    }
    
    const actualPlayer = submissions[writerIndex];
    return mapper(ranking, idx, actualPlayer);
  });
}
```

**Impact:** Consistent parsing, better error handling, reduce ~30 lines per route

---

## 8. 🎯 Phase Transition Fallback Logic (MEDIUM PRIORITY)

### Problem
Similar phase transition fallback logic in:
- `WritingSessionContent.tsx` (lines 283-339)
- `PeerFeedbackContent.tsx` (lines 242-288)
- `RevisionContent.tsx` (lines 251-296)

### Current Code
```typescript
// Repeated pattern
useEffect(() => {
  if (!session || !hasSubmitted()) return;
  if (sessionConfig?.phase !== X) return;
  
  const allPlayers = Object.values(sessionPlayers || {});
  const realPlayers = allPlayers.filter((p: any) => !p.isAI);
  const submittedRealPlayers = realPlayers.filter((p: any) => p.phases.phaseX?.submitted);
  
  if (submittedRealPlayers.length === realPlayers.length && !sessionCoordination?.allPlayersReady) {
    // Fallback timer...
  }
}, [session, ...]);
```

### Solution
**Create:** `lib/hooks/usePhaseTransition.ts`
```typescript
export function usePhaseTransition(
  session: GameSession | null,
  targetPhase: Phase,
  nextPhase: Phase,
  nextPhaseDuration: number
) {
  const { sessionId, config, players, coordination } = session || {};
  
  useEffect(() => {
    if (!session || !hasSubmitted()) return;
    if (config?.phase !== targetPhase) return;
    
    const allPlayers = Object.values(players || {});
    const realPlayers = allPlayers.filter((p: any) => !p.isAI);
    const submittedRealPlayers = realPlayers.filter(
      (p: any) => p.phases[`phase${targetPhase}` as keyof typeof p.phases]?.submitted
    );
    
    if (submittedRealPlayers.length === realPlayers.length && !coordination?.allPlayersReady) {
      const fallbackTimer = setTimeout(async () => {
        // Transition logic...
      }, 10000);
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [session, config, players, coordination, targetPhase, nextPhase, nextPhaseDuration]);
}
```

**Impact:** Remove ~50 lines per component, consistent transition logic

---

## 📊 Refactoring Impact Summary

| Refactoring | Files Affected | Lines Saved | Priority |
|------------|---------------|-------------|----------|
| Time Utilities | 3 | ~30 | HIGH |
| API Key Validation | 11 | ~33 | HIGH |
| Textarea Component | 5+ | ~200 chars/file | MEDIUM |
| Score Constants | 10+ | ~50 | MEDIUM |
| API Error Handling | 11 | ~50/file | MEDIUM |
| Modal Patterns | 3 | ~20/file | LOW |
| Batch Ranking Parser | 3 | ~30/file | MEDIUM |
| Phase Transition Hook | 3 | ~50/file | MEDIUM |

**Total Estimated Impact:**
- **~500+ lines** of duplicate code removed
- **~15+ files** simplified
- **Better maintainability** and consistency
- **Easier testing** with extracted utilities

---

## 🚀 Recommended Implementation Order

1. **Time Utilities** (Quick win, high impact)
2. **API Key Validation** (High impact, affects many files)
3. **Score Constants** (Foundation for other refactorings)
4. **API Error Handling** (Improves reliability)
5. **Batch Ranking Parser** (Reduces complexity)
6. **Phase Transition Hook** (Complex but high value)
7. **Textarea Component** (Nice to have)
8. **Modal Patterns** (Polish)

---

## ✅ Next Steps

1. Create utility files for time, API helpers, constants
2. Update components to use new utilities
3. Add tests for extracted utilities
4. Update documentation
5. Remove duplicate code

