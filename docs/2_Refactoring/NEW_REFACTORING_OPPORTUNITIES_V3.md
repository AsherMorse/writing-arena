# New Refactoring Opportunities V3

> Additional refactoring opportunities identified through comprehensive codebase analysis

## 🔍 Analysis Summary

After deep analysis of the codebase, we've identified **15 new refactoring opportunities** that would further improve code quality, reduce duplication, and enhance maintainability.

---

## 1. 🔄 Phase Transition Monitoring Hook (HIGH PRIORITY)

### Problem
Phase transition monitoring logic duplicated in **3+ components**:
- `WritingSessionContent.tsx` (lines 292-340)
- `PeerFeedbackContent.tsx` (lines 254-300)
- `RevisionContent.tsx` (lines 260-305)

### Current Code
```typescript
// Repeated in multiple files
useEffect(() => {
  if (!session || !hasSubmitted()) return;
  if (sessionConfig?.phase !== CURRENT_PHASE) return;
  
  const allPlayers = Object.values(sessionPlayers || {});
  const realPlayers = allPlayers.filter((p: any) => !p.isAI);
  const submittedRealPlayers = realPlayers.filter((p: any) => p.phases.phaseX?.submitted);
  
  if (submittedRealPlayers.length === realPlayers.length && !sessionCoordination?.allPlayersReady) {
    // Fallback timer logic...
  }
}, [session, sessionPlayers, sessionCoordination, sessionConfig, hasSubmitted]);
```

### Solution
**Create:** `lib/hooks/usePhaseTransition.ts`
```typescript
interface UsePhaseTransitionOptions {
  session: GameSession | null;
  currentPhase: Phase;
  hasSubmitted: () => boolean;
  fallbackDelay?: number;
  onTransition?: (nextPhase: Phase) => void;
}

export function usePhaseTransition({
  session,
  currentPhase,
  hasSubmitted,
  fallbackDelay = 10000,
  onTransition,
}: UsePhaseTransitionOptions) {
  // Centralized phase transition monitoring
  // Handles Cloud Function fallback
  // Returns transition state
}
```

**Impact:** Remove ~50 lines per component, **3+ components** simplified, consistent transition logic

---

## 2. ⏰ Auto-Submit Hook (HIGH PRIORITY)

### Problem
Auto-submit logic duplicated in **3+ components**:
- `WritingSessionContent.tsx` (lines 271-290)
- `PeerFeedbackContent.tsx` (lines 228-252)
- `RevisionContent.tsx` (lines 238-258)

### Current Code
```typescript
// Repeated pattern
const [phaseLoadTime] = useState(Date.now());

useEffect(() => {
  const phaseAge = Date.now() - phaseLoadTime;
  
  if (timeRemaining === 0 && !hasSubmitted() && phaseAge > 3000) {
    handleSubmit();
  }
}, [timeRemaining, hasSubmitted]);
```

### Solution
**Create:** `lib/hooks/useAutoSubmit.ts`
```typescript
interface UseAutoSubmitOptions {
  timeRemaining: number;
  hasSubmitted: () => boolean;
  onSubmit: () => void;
  minPhaseAge?: number; // Prevent immediate submit on load
}

export function useAutoSubmit({
  timeRemaining,
  hasSubmitted,
  onSubmit,
  minPhaseAge = 3000,
}: UseAutoSubmitOptions) {
  const [phaseLoadTime] = useState(Date.now());
  
  useEffect(() => {
    const phaseAge = Date.now() - phaseLoadTime;
    
    if (timeRemaining === 0 && !hasSubmitted() && phaseAge > minPhaseAge) {
      onSubmit();
    }
  }, [timeRemaining, hasSubmitted, onSubmit, minPhaseAge]);
}
```

**Impact:** Remove ~15 lines per component, **3+ components** simplified

---

## 3. 📦 Type Definition Consolidation (MEDIUM PRIORITY)

### Problem
Type definitions duplicated across multiple files:
- `UserProfile` defined in:
  - `lib/types/index.ts`
  - `lib/services/firestore.ts`
- `AIStudent` defined in:
  - `lib/types/index.ts`
  - `lib/services/ai-students.ts`

### Current Code
```typescript
// lib/types/index.ts
export interface UserProfile { ... }

// lib/services/firestore.ts
export interface UserProfile { ... } // DUPLICATE!
```

### Solution
**Consolidate:** All types in `lib/types/index.ts`
**Update:** Import from single source
```typescript
// lib/types/index.ts - Single source of truth
export interface UserProfile { ... }
export interface AIStudent { ... }

// lib/services/firestore.ts
import { UserProfile } from '@/lib/types';
// Remove duplicate definition
```

**Impact:** Single source of truth, easier type maintenance, **2+ files** simplified

---

## 4. 🎭 Mock Data Centralization (MEDIUM PRIORITY)

### Problem
Mock data scattered across components:
- `PeerFeedbackContent.tsx` - `MOCK_PEER_WRITINGS` (lines 19-43)
- `RevisionContent.tsx` - `MOCK_AI_FEEDBACK` (lines 21-33)
- `ResultsContent.tsx` - `MOCK_PHASE_FEEDBACK` (lines 18-71)

### Current Code
```typescript
// Scattered across components
const MOCK_PEER_WRITINGS = [ ... ];
const MOCK_AI_FEEDBACK = { ... };
const MOCK_PHASE_FEEDBACK = { ... };
```

### Solution
**Create:** `lib/utils/mock-data.ts`
```typescript
export const MOCK_PEER_WRITINGS = [ ... ];
export const MOCK_AI_FEEDBACK = { ... };
export const MOCK_PHASE_FEEDBACK = { ... };
export const MOCK_PLAYERS = [ ... ];
```

**Impact:** Centralized mock data, easier to update, **3+ components** simplified

---

## 5. 🔍 AI Content Generation Hook (MEDIUM PRIORITY)

### Problem
AI content generation logic duplicated in **3+ components**:
- `WritingSessionContent.tsx` - Generates AI writings (lines 95-237)
- `PeerFeedbackContent.tsx` - Generates AI feedback (lines 86-226)
- `RevisionContent.tsx` - Generates AI revisions (lines 100-237)

### Current Code
```typescript
// Repeated pattern
useEffect(() => {
  const generateAIContent = async () => {
    if (!matchId || !user || aiContentGenerated) return;
    setAiContentGenerated(true);
    
    // Complex generation logic...
  };
  
  generateAIContent();
}, [matchId, user, aiContentGenerated]);
```

### Solution
**Create:** `lib/hooks/useAIContentGeneration.ts`
```typescript
type ContentType = 'writing' | 'feedback' | 'revision';

interface UseAIContentGenerationOptions {
  matchId: string;
  userId: string;
  contentType: ContentType;
  phase: Phase;
  enabled?: boolean;
}

export function useAIContentGeneration({
  matchId,
  userId,
  contentType,
  phase,
  enabled = true,
}: UseAIContentGenerationOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  // Centralized AI generation logic
  // Handles retries, error handling, Firestore updates
}
```

**Impact:** Remove ~100 lines per component, **3+ components** simplified, consistent AI generation

---

## 6. 📊 Session Data Extraction Hook (MEDIUM PRIORITY)

### Problem
Session data extraction repeated in **3+ components**:
- `PeerFeedbackContent.tsx` (lines 61-68)
- `WritingSessionContent.tsx` (lines 50-65)
- `RevisionContent.tsx` (lines 50-65)

### Current Code
```typescript
// Repeated extraction pattern
const {
  matchId: sessionMatchId,
  config: sessionConfig,
  players: sessionPlayers,
  coordination: sessionCoordination,
  sessionId: activeSessionId,
} = session || {};
const matchId = sessionMatchId || '';
```

### Solution
**Create:** `lib/hooks/useSessionData.ts`
```typescript
export function useSessionData(session: GameSession | null) {
  const matchId = session?.matchId || '';
  const config = session?.config;
  const players = session?.players || {};
  const coordination = session?.coordination;
  const sessionId = session?.sessionId || '';
  const state = session?.state;
  
  return {
    matchId,
    config,
    players,
    coordination,
    sessionId,
    state,
    // Helper getters
    allPlayers: Object.values(players),
    realPlayers: Object.values(players).filter(p => !p.isAI),
    aiPlayers: Object.values(players).filter(p => p.isAI),
  };
}
```

**Impact:** Remove ~10 lines per component, **3+ components** simplified, consistent data access

---

## 7. 🎯 Phase Submission Hook (MEDIUM PRIORITY)

### Problem
Phase submission logic duplicated in **3+ components**:
- `WritingSessionContent.tsx` - `handleSubmit()` (lines 400-500)
- `PeerFeedbackContent.tsx` - `handleSubmit()` (lines 309-450)
- `RevisionContent.tsx` - `handleSubmit()` (lines 400-550)

### Current Code
```typescript
// Similar patterns across components
const handleSubmit = async () => {
  setIsEvaluating(true);
  
  // Validation
  // Prepare submission data
  // Call batch ranking API
  // Update Firestore
  // Handle errors
  // Transition phase
};
```

### Solution
**Create:** `lib/hooks/usePhaseSubmission.ts`
```typescript
interface UsePhaseSubmissionOptions {
  session: GameSession | null;
  phase: Phase;
  onSubmit: (data: PhaseSubmissionData) => Promise<void>;
  validateSubmission?: (data: any) => boolean;
}

export function usePhaseSubmission({
  session,
  phase,
  onSubmit,
  validateSubmission,
}: UsePhaseSubmissionOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const submit = async (data: PhaseSubmissionData) => {
    // Centralized submission logic
    // Validation, API calls, error handling
  };
  
  return { submit, isSubmitting, error };
}
```

**Impact:** Remove ~80 lines per component, **3+ components** simplified, consistent submission flow

---

## 8. 🎨 Component Size Reduction (HIGH PRIORITY)

### Problem
Several components are too large and handle too many responsibilities:
- `PeerFeedbackContent.tsx` - **636 lines**
- `ResultsContent.tsx` - **738 lines**
- `WritingSessionContent.tsx` - **770 lines**
- `RevisionContent.tsx` - **771 lines**

### Solution
**Break down into smaller components:**

#### PeerFeedbackContent.tsx → Split into:
- `PeerFeedbackForm.tsx` - Form inputs and validation
- `PeerWritingDisplay.tsx` - Display peer's writing
- `PeerFeedbackSubmission.tsx` - Submission logic

#### ResultsContent.tsx → Split into:
- `ResultsHeader.tsx` - Header with scores
- `ResultsRankings.tsx` - Player rankings display
- `ResultsBreakdown.tsx` - Phase-by-phase breakdown
- `ResultsFeedback.tsx` - Feedback display

#### WritingSessionContent.tsx → Split into:
- `WritingEditor.tsx` - Text editor component
- `WritingTimer.tsx` - Timer display
- `WritingSubmission.tsx` - Submission logic
- `AIWritingProgress.tsx` - AI player progress display

#### RevisionContent.tsx → Split into:
- `RevisionEditor.tsx` - Revision editor
- `PeerFeedbackDisplay.tsx` - Display peer feedback
- `OriginalWritingDisplay.tsx` - Original writing display
- `RevisionSubmission.tsx` - Submission logic

**Impact:** Better maintainability, easier testing, improved code organization

---

## 9. 🔄 Firestore Update Patterns (MEDIUM PRIORITY)

### Problem
Firestore update patterns repeated across components:
- Dynamic imports: `await import('firebase/firestore')`
- Update patterns: `updateDoc(sessionRef, { ... })`
- Error handling: Similar try/catch blocks

### Current Code
```typescript
// Repeated pattern
const { updateDoc, doc, serverTimestamp } = await import('firebase/firestore');
const { db } = await import('@/lib/config/firebase');
const sessionRef = doc(db, 'sessions', sessionId);

await updateDoc(sessionRef, {
  'coordination.allPlayersReady': true,
  'config.phase': nextPhase,
  updatedAt: serverTimestamp(),
});
```

### Solution
**Create:** `lib/services/session-updates.ts`
```typescript
export async function updateSessionPhase(
  sessionId: string,
  phase: Phase,
  phaseDuration: number
): Promise<void> {
  // Centralized update logic
}

export async function markPlayerReady(
  sessionId: string,
  userId: string,
  phase: Phase
): Promise<void> {
  // Centralized ready logic
}

export async function transitionToPhase(
  sessionId: string,
  nextPhase: Phase
): Promise<void> {
  // Centralized transition logic
}
```

**Impact:** Remove ~20 lines per usage, **10+ locations** simplified, consistent updates

---

## 10. 🎯 Form Validation Utilities (LOW PRIORITY)

### Problem
Form validation logic scattered:
- `PeerFeedbackContent.tsx` - Checks if feedback is complete
- `RevisionContent.tsx` - Checks word count
- `WritingSessionContent.tsx` - Checks word count

### Current Code
```typescript
// Scattered validation
const totalChars = Object.values(responses).join('').length;
const isEmpty = totalChars < 50;

const isValid = wordCount >= MIN_WORDS && wordCount <= MAX_WORDS;
```

### Solution
**Create:** `lib/utils/form-validation.ts`
```typescript
export function validateFeedback(responses: Record<string, string>): {
  isValid: boolean;
  errors: string[];
} {
  // Centralized feedback validation
}

export function validateWriting(content: string, wordCount: number): {
  isValid: boolean;
  errors: string[];
} {
  // Centralized writing validation
}

export function validateRevision(
  originalContent: string,
  revisedContent: string,
  wordCount: number
): {
  isValid: boolean;
  errors: string[];
} {
  // Centralized revision validation
}
```

**Impact:** Consistent validation, easier to update rules, **3+ components** simplified

---

## 11. 🎨 Styling Constants (LOW PRIORITY)

### Problem
Repeated className strings across components:
- Background colors: `bg-[#0c141d]`, `bg-[#141e27]`
- Border styles: `border-white/10`, `border-white/20`
- Text colors: `text-white/50`, `text-white/70`

### Current Code
```typescript
// Repeated classNames
className="min-h-screen bg-[#0c141d] text-white"
className="rounded-3xl border border-white/10 bg-[#141e27]"
className="text-white/50 uppercase tracking-[0.3em]"
```

### Solution
**Create:** `lib/constants/styles.ts`
```typescript
export const COLORS = {
  background: {
    primary: 'bg-[#0c141d]',
    secondary: 'bg-[#141e27]',
    card: 'bg-white/5',
  },
  text: {
    primary: 'text-white',
    secondary: 'text-white/70',
    muted: 'text-white/50',
  },
  border: {
    default: 'border-white/10',
    strong: 'border-white/20',
  },
} as const;

export const LAYOUT = {
  screen: 'min-h-screen',
  card: 'rounded-3xl',
  button: 'rounded-full',
} as const;
```

**Impact:** Consistent styling, easier theme updates, **20+ components** benefit

---

## 12. 🔍 Error Boundary Wrapper (MEDIUM PRIORITY)

### Problem
Error handling scattered across components:
- Each component has its own error state
- No centralized error recovery
- Inconsistent error display

### Current Code
```typescript
// Scattered error handling
const [error, setError] = useState<Error | null>(null);

if (error) {
  return <ErrorState error={error} />;
}
```

### Solution
**Create:** `components/shared/ErrorBoundary.tsx`
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  // Centralized error boundary
  // Catches React errors
  // Provides recovery options
}
```

**Impact:** Better error handling, consistent error UI, **10+ components** benefit

---

## 📊 Refactoring Impact Summary

| Refactoring | Files Affected | Lines Saved | Priority | Status |
|------------|---------------|-------------|----------|--------|
| Phase Transition Hook | 3+ | ~150 | HIGH | 🔴 Not Started |
| Auto-Submit Hook | 3+ | ~45 | HIGH | 🔴 Not Started |
| Type Consolidation | 2+ | ~50 | MEDIUM | 🔴 Not Started |
| Mock Data Centralization | 3+ | ~100 | MEDIUM | 🔴 Not Started |
| AI Content Generation Hook | 3+ | ~300 | MEDIUM | 🔴 Not Started |
| Session Data Hook | 3+ | ~30 | MEDIUM | 🔴 Not Started |
| Phase Submission Hook | 3+ | ~240 | MEDIUM | 🔴 Not Started |
| Component Size Reduction | 4 | ~500+ | HIGH | 🔴 Not Started |
| Firestore Update Patterns | 10+ | ~200 | MEDIUM | 🔴 Not Started |
| Form Validation Utils | 3+ | ~30 | LOW | 🔴 Not Started |
| Styling Constants | 20+ | ~100 | LOW | 🔴 Not Started |
| Error Boundary | 10+ | ~50 | MEDIUM | 🔴 Not Started |
| API Route Error Handling | 8+ | ~120 | MEDIUM | 🔴 Not Started |
| Prompt Generation Consolidation | 5+ | ~50 | LOW | 🔴 Not Started |
| Batch Ranking Types | 3+ | ~30 | LOW | 🔴 Not Started |

**Total Estimated Impact:**
- **~2,025+ lines** of code improved/removed
- **~76+ files** affected
- **Better maintainability** and consistency
- **Easier testing** and debugging

---

## 🚀 Recommended Implementation Order

1. **Phase Transition Hook** (High impact, affects 3+ components)
2. **Auto-Submit Hook** (Quick win, affects 3+ components)
3. **Component Size Reduction** (Major refactoring, improves maintainability)
4. **AI Content Generation Hook** (Large impact, removes duplication)
5. **Session Data Hook** (Foundation for other refactorings)
6. **Phase Submission Hook** (Consolidates submission logic)
7. **Type Consolidation** (Improves type safety)
8. **Firestore Update Patterns** (Reduces boilerplate)
9. **Mock Data Centralization** (Easier testing)
10. **Error Boundary** (Better error handling)
11. **Form Validation Utils** (Consistency)
12. **Styling Constants** (Theme support)

---

## ✅ Next Steps

1. Create phase transition hook
2. Create auto-submit hook
3. Break down large components
4. Create AI content generation hook
5. Create session data hook
6. Create phase submission hook
7. Consolidate type definitions
8. Create Firestore update helpers
9. Centralize mock data
10. Add error boundary
11. Create form validation utilities
12. Extract styling constants
13. Create API route wrapper
14. Consolidate prompt generation
15. Create batch ranking types
16. Update tests
17. Update documentation

---

## 13. 🔄 API Route Error Handling Pattern (MEDIUM PRIORITY)

### Problem
Error handling pattern repeated in **8+ API routes**:
- Try/catch blocks
- Mock fallback on error
- Logging patterns
- API key checking

### Current Code
```typescript
// Repeated pattern in API routes
export async function POST(request: NextRequest) {
  try {
    logApiKeyStatus('ENDPOINT_NAME');
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      return NextResponse.json(generateMockResponse());
    }
    
    // API logic...
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ ENDPOINT - Error:', error);
    return NextResponse.json(generateMockResponse());
  }
}
```

### Solution
**Create:** `lib/utils/api-wrapper.ts`
```typescript
interface ApiHandlerOptions<T> {
  endpointName: string;
  handler: (apiKey: string, requestBody: any) => Promise<T>;
  generateMock: (requestBody: any) => T;
  requiresApiKey?: boolean;
}

export function createApiHandler<T>({
  endpointName,
  handler,
  generateMock,
  requiresApiKey = true,
}: ApiHandlerOptions<T>) {
  return async (request: NextRequest) => {
    try {
      logApiKeyStatus(endpointName);
      
      const requestBody = await request.json();
      
      if (requiresApiKey) {
        const apiKey = getAnthropicApiKey();
        if (!apiKey) {
          console.warn(`⚠️ ${endpointName} - API key missing, using mock`);
          return NextResponse.json(generateMock(requestBody));
        }
        
        const result = await handler(apiKey, requestBody);
        return NextResponse.json(result);
      } else {
        const result = await handler('', requestBody);
        return NextResponse.json(result);
      }
    } catch (error) {
      console.error(`❌ ${endpointName} - Error:`, error);
      const requestBody = await request.json().catch(() => ({}));
      return NextResponse.json(generateMock(requestBody));
    }
  };
}
```

**Impact:** Remove ~15 lines per route, **8+ routes** simplified, consistent error handling

---

## 14. 📝 Prompt Generation Consolidation (LOW PRIORITY)

### Problem
Prompt generation functions scattered:
- `generateAIWritingPrompt()` in `generate-ai-writing/route.ts`
- `generatePeerFeedbackPrompt()` in `evaluate-peer-feedback/route.ts`
- `generateRevisionPrompt()` in `evaluate-revision/route.ts`
- Similar patterns in other routes

### Current Code
```typescript
// Scattered prompt generation
function generateAIWritingPrompt(...) { ... }
function generatePeerFeedbackPrompt(...) { ... }
function generateRevisionPrompt(...) { ... }
```

### Solution
**Consolidate:** All prompt generation in `lib/prompts/` directory
- Move AI writing prompts to `lib/prompts/ai-prompts.ts`
- Move evaluation prompts to `lib/prompts/evaluation-prompts.ts`
- Keep grading prompts in `lib/prompts/grading-prompts.ts`

**Impact:** Centralized prompts, easier to update, **5+ routes** simplified

---

## 15. 🎯 Batch Ranking Response Type (LOW PRIORITY)

### Problem
Similar response structures in batch ranking routes:
- `batch-rank-writings/route.ts` - Returns `{ rankings: [...] }`
- `batch-rank-feedback/route.ts` - Returns `{ rankings: [...] }`
- `batch-rank-revisions/route.ts` - Returns `{ rankings: [...] }`

### Current Code
```typescript
// Similar structures
interface WritingSubmission { ... }
interface FeedbackSubmission { ... }
interface RevisionSubmission { ... }

// Similar response format
return NextResponse.json({ rankings });
```

### Solution
**Create:** `lib/types/ranking.ts`
```typescript
export interface BaseRankingSubmission {
  playerId: string;
  playerName: string;
  isAI: boolean;
}

export interface RankingResult {
  playerId: string;
  playerName: string;
  isAI: boolean;
  rank: number;
  score: number;
  [key: string]: any;
}

export interface BatchRankingResponse {
  rankings: RankingResult[];
}
```

**Impact:** Consistent types, better type safety, **3+ routes** improved

---

*Last updated: 2024 - After comprehensive codebase analysis*

