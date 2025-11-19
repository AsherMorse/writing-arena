# Current Refactoring Opportunities

> Comprehensive analysis of refactoring opportunities identified in the current codebase

## 🔍 Analysis Summary

After analyzing the codebase, I've identified **8 major refactoring opportunities** that would improve maintainability, reduce duplication, and enhance code quality.

---

## 1. 🔄 Batch Ranking API Routes Consolidation (HIGH PRIORITY)

### Problem
The three batch ranking API routes (`batch-rank-writings`, `batch-rank-feedback`, `batch-rank-revisions`) have nearly identical structure:

**Duplicated Patterns:**
- Same error handling pattern (try-catch with fallback to mock)
- Same API key checking logic
- Same request body parsing
- Similar response structure
- Similar mock generation pattern

**Files:**
- `app/api/batch-rank-writings/route.ts` (162 lines)
- `app/api/batch-rank-feedback/route.ts` (134 lines)
- `app/api/batch-rank-revisions/route.ts` (146 lines)

### Current Code Pattern
```typescript
// Repeated in all three files
export async function POST(request: NextRequest) {
  const requestBody = await request.json();
  const { writings/feedbackSubmissions/revisionSubmissions } = requestBody;
  
  try {
    logApiKeyStatus('BATCH RANK X');
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      return NextResponse.json(generateMockRankings(...));
    }
    
    const prompt = getPhaseXPrompt(...);
    const aiResponse = await callAnthropicAPI(apiKey, prompt, maxTokens);
    const rankings = parseBatchRankings(aiResponse.content[0].text, submissions);
    
    return NextResponse.json(rankings);
  } catch (error) {
    console.error('❌ BATCH RANK X - Error:', error);
    return NextResponse.json(generateMockRankings(...));
  }
}
```

### Solution
**Create:** `lib/utils/batch-ranking-handler.ts`
```typescript
interface BatchRankingOptions<TSubmission, TRanking> {
  endpointName: string;
  requestBodyKey: string; // 'writings' | 'feedbackSubmissions' | 'revisionSubmissions'
  getPrompt: (submissions: TSubmission[], ...args: any[]) => string;
  parseRankings: (claudeResponse: string, submissions: TSubmission[]) => TRanking[];
  generateMockRankings: (submissions: TSubmission[]) => { rankings: TRanking[] };
  maxTokens?: number;
  additionalPromptArgs?: any[];
}

export function createBatchRankingHandler<TSubmission, TRanking>(
  options: BatchRankingOptions<TSubmission, TRanking>
) {
  return async (request: NextRequest) => {
    const requestBody = await request.json();
    const submissions = requestBody[options.requestBodyKey];
    
    try {
      logApiKeyStatus(options.endpointName);
      const apiKey = getAnthropicApiKey();
      if (!apiKey) {
        return NextResponse.json(options.generateMockRankings(submissions));
      }
      
      const prompt = options.getPrompt(submissions, ...(options.additionalPromptArgs || []));
      const aiResponse = await callAnthropicAPI(apiKey, prompt, options.maxTokens || 3000);
      const rankings = options.parseRankings(aiResponse.content[0].text, submissions);
      
      return NextResponse.json({ rankings });
    } catch (error) {
      console.error(`❌ ${options.endpointName} - Error:`, error);
      return NextResponse.json(options.generateMockRankings(submissions));
    }
  };
}
```

**Then simplify routes:**
```typescript
// app/api/batch-rank-writings/route.ts
import { createBatchRankingHandler } from '@/lib/utils/batch-ranking-handler';
import { getPhase1WritingPrompt } from '@/lib/prompts/grading-prompts';

export const POST = createBatchRankingHandler({
  endpointName: 'BATCH RANK WRITINGS',
  requestBodyKey: 'writings',
  getPrompt: (writings, prompt, promptType, trait) => 
    getPhase1WritingPrompt(writings, prompt, promptType, trait),
  parseRankings: parseBatchRankings,
  generateMockRankings: generateMockRankings,
  maxTokens: 3000,
  additionalPromptArgs: ['prompt', 'promptType', 'trait'],
});
```

**Impact:** 
- Remove ~100 lines of duplicate code
- Single source of truth for batch ranking logic
- Easier to add new batch ranking endpoints
- Consistent error handling

---

## 2. 📤 Batch Ranking Submission Hook (HIGH PRIORITY)

### Problem
Batch ranking submission logic is duplicated across **3 components** with nearly identical patterns:

**Duplicated Logic:**
- Fetch AI submissions from Firestore
- Prepare user + AI submissions array
- Call batch ranking API
- Parse rankings and find user's score
- Store rankings in Firestore
- Submit phase with score
- Fallback to individual evaluation on error

**Files:**
- `components/ranked/WritingSessionContent.tsx` (lines 292-434)
- `components/ranked/PeerFeedbackContent.tsx` (lines 209-329)
- `components/ranked/RevisionContent.tsx` (lines 231-417)

### Current Code Pattern
```typescript
// Repeated in all three components
const handleSubmit = async () => {
  try {
    // Get AI submissions from Firestore
    const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
    const matchState = matchDoc.data();
    const aiSubmissions = matchState?.aiX?.phaseY || [];
    
    // Prepare all submissions
    const allSubmissions = [
      { playerId: user.uid, ...userSubmission },
      ...aiSubmissions
    ];
    
    // Call batch ranking API
    const response = await fetch('/api/batch-rank-X', {...});
    const data = await response.json();
    const rankings = data.rankings;
    
    // Find your ranking
    const yourRanking = rankings.find(r => r.playerId === user.uid);
    const score = yourRanking.score;
    
    // Store rankings
    await updateDoc(matchRef, { 'rankings.phaseY': rankings });
    
    // Submit phase
    await submitPhase(Y, { ...submissionData, score });
  } catch (error) {
    // Fallback to individual evaluation
    // ...
  }
};
```

### Solution
**Create:** `lib/hooks/useBatchRankingSubmission.ts`
```typescript
interface UseBatchRankingSubmissionOptions<TSubmission, TSubmissionData> {
  phase: number;
  matchId: string;
  userId: string;
  endpoint: string; // '/api/batch-rank-writings' | '/api/batch-rank-feedback' | '/api/batch-rank-revisions'
  firestoreKey: string; // 'aiWritings.phase1' | 'aiFeedbacks.phase2' | 'aiRevisions.phase3'
  rankingsKey: string; // 'rankings.phase1' | 'rankings.phase2' | 'rankings.phase3'
  prepareUserSubmission: () => TSubmission;
  prepareSubmissionData: (score: number) => TSubmissionData;
  submitPhase: (phase: number, data: TSubmissionData) => Promise<void>;
  fallbackEvaluation?: () => Promise<number>;
  validateSubmission?: () => boolean;
}

export function useBatchRankingSubmission<TSubmission, TSubmissionData>(
  options: UseBatchRankingSubmissionOptions<TSubmission, TSubmissionData>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const submit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validation
      if (options.validateSubmission && !options.validateSubmission()) {
        throw new Error('Invalid submission');
      }
      
      // Get AI submissions from Firestore
      const { getDoc, doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/config/firebase');
      
      const matchDoc = await getDoc(doc(db, 'matchStates', options.matchId));
      if (!matchDoc.exists()) throw new Error('Match state not found');
      
      const matchState = matchDoc.data();
      const aiSubmissions = getNestedValue(matchState, options.firestoreKey) || [];
      
      if (aiSubmissions.length === 0) {
        throw new Error('AI submissions not available');
      }
      
      // Prepare all submissions
      const userSubmission = options.prepareUserSubmission();
      const allSubmissions = [userSubmission, ...aiSubmissions];
      
      // Call batch ranking API
      const response = await fetch(options.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [getRequestBodyKey(options.endpoint)]: allSubmissions,
          ...getAdditionalBodyParams(options.endpoint, matchState),
        }),
      });
      
      const data = await response.json();
      const rankings = data.rankings;
      
      // Find user's ranking
      const yourRanking = rankings.find((r: any) => r.playerId === options.userId);
      if (!yourRanking) throw new Error('Your ranking not found');
      
      const score = yourRanking.score;
      
      // Store rankings in Firestore
      const matchRef = doc(db, 'matchStates', options.matchId);
      await updateDoc(matchRef, {
        [options.rankingsKey]: rankings,
      });
      
      // Submit phase
      await options.submitPhase(options.phase, options.prepareSubmissionData(score));
      
    } catch (error) {
      console.error(`❌ Batch ranking failed:`, error);
      setError(error as Error);
      
      // Fallback to individual evaluation if provided
      if (options.fallbackEvaluation) {
        try {
          const fallbackScore = await options.fallbackEvaluation();
          await options.submitPhase(
            options.phase,
            options.prepareSubmissionData(fallbackScore)
          );
        } catch (fallbackError) {
          console.error('❌ Fallback evaluation failed:', fallbackError);
          throw fallbackError;
        }
      } else {
        throw error;
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return { submit, isSubmitting, error };
}
```

**Impact:**
- Remove ~120 lines per component (360+ lines total)
- Consistent submission flow across all phases
- Easier to add new phases
- Centralized error handling and fallback logic

---

## 3. 🎭 Mock Ranking Generation Consolidation (MEDIUM PRIORITY)

### Problem
Mock ranking generation functions have similar patterns but are duplicated:

**Files:**
- `app/api/batch-rank-writings/route.ts` - `generateMockRankings()`
- `app/api/batch-rank-feedback/route.ts` - `generateMockFeedbackRankings()`
- `app/api/batch-rank-revisions/route.ts` - `generateMockRevisionRankings()`

**Common Patterns:**
- Check for empty submissions
- Generate scores based on submission quality
- Sort by score and assign ranks
- Generate strengths/improvements arrays

### Solution
**Create:** `lib/utils/mock-ranking-generator.ts`
```typescript
interface MockRankingOptions {
  isEmpty: (submission: any) => boolean;
  calculateScore: (submission: any) => number;
  generateStrengths: (submission: any, isEmpty: boolean) => string[];
  generateImprovements: (submission: any, isEmpty: boolean) => string[];
  generateTraitFeedback?: (submission: any, isEmpty: boolean) => any;
}

export function generateMockRankings<TSubmission>(
  submissions: TSubmission[],
  options: MockRankingOptions
): { rankings: any[] } {
  const rankings = submissions.map((submission, index) => {
    const isEmpty = options.isEmpty(submission);
    
    const score = isEmpty ? 0 : options.calculateScore(submission);
    const strengths = options.generateStrengths(submission, isEmpty);
    const improvements = options.generateImprovements(submission, isEmpty);
    const traitFeedback = options.generateTraitFeedback
      ? options.generateTraitFeedback(submission, isEmpty)
      : undefined;
    
    return {
      ...submission,
      score,
      rank: 0, // Will be set after sorting
      strengths,
      improvements,
      ...(traitFeedback && { traitFeedback }),
    };
  });
  
  // Sort by score and assign ranks
  rankings.sort((a, b) => b.score - a.score);
  rankings.forEach((ranking, index) => {
    ranking.rank = index + 1;
  });
  
  return { rankings };
}
```

**Impact:**
- Remove ~60 lines of duplicate code
- Consistent mock scoring logic
- Easier to update mock generation behavior

---

## 4. 🎨 Component Size Reduction (MEDIUM PRIORITY)

### Problem
Several components are still quite large and handle multiple responsibilities:

**Files:**
- `components/ranked/WritingSessionContent.tsx` - **722 lines**
- `components/ranked/PeerFeedbackContent.tsx` - **555 lines**
- `components/ranked/RevisionContent.tsx` - **707 lines**
- `components/ranked/ResultsContent.tsx` - **686 lines**

### Solution
**Break down into smaller, focused components:**

#### WritingSessionContent.tsx → Split into:
- `WritingEditor.tsx` - Text editor with paste prevention
- `WritingTimer.tsx` - Timer display with progress bar
- `AIGenerationManager.tsx` - AI writing generation logic
- `SquadTracker.tsx` - Player word count tracker sidebar

#### PeerFeedbackContent.tsx → Split into:
- `PeerWritingDisplay.tsx` - Display peer's writing
- `FeedbackForm.tsx` - Feedback questions form
- `FeedbackSubmission.tsx` - Submission logic (can use hook from #2)

#### RevisionContent.tsx → Split into:
- `FeedbackDisplay.tsx` - AI and peer feedback display
- `RevisionEditor.tsx` - Original + revised content editor
- `RevisionSubmission.tsx` - Submission logic (can use hook from #2)

#### ResultsContent.tsx → Split into:
- `ResultsHeader.tsx` - Header with composite score
- `PhaseBreakdown.tsx` - Phase-by-phase score breakdown
- `RankingsDisplay.tsx` - Player rankings table
- `FeedbackDisplay.tsx` - AI feedback for each phase

**Impact:**
- Easier to test individual components
- Better code organization
- Improved maintainability
- Reusable components

---

## 5. 🔄 AI Generation Logic Consolidation (MEDIUM PRIORITY)

### Problem
AI generation logic is duplicated across components:

**Patterns:**
- Generate AI submissions when phase starts
- Store in Firestore `matchStates` collection
- Handle loading states
- Error handling and fallbacks

**Files:**
- `WritingSessionContent.tsx` - AI writing generation (lines 104-251)
- `PeerFeedbackContent.tsx` - AI feedback generation (lines 64-143)
- `RevisionContent.tsx` - AI revision generation (lines 142-222)

### Solution
**Create:** `lib/hooks/useAIGeneration.ts`
```typescript
interface UseAIGenerationOptions<TSubmission> {
  matchId: string;
  firestoreKey: string; // 'aiWritings.phase1' | 'aiFeedbacks.phase2' | 'aiRevisions.phase3'
  generateSubmission: (aiPlayer: any, ...args: any[]) => Promise<TSubmission>;
  getAIPlayers: (matchState: any) => any[];
  getRequiredData: (matchState: any) => any;
  enabled?: boolean;
}

export function useAIGeneration<TSubmission>(
  options: UseAIGenerationOptions<TSubmission>
) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!options.enabled || !options.matchId) return;
    
    const generate = async () => {
      setIsGenerating(true);
      setError(null);
      
      try {
        const { getDoc, doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/config/firebase');
        
        // Check if already generated
        const matchDoc = await getDoc(doc(db, 'matchStates', options.matchId));
        if (matchDoc.exists()) {
          const existing = getNestedValue(matchDoc.data(), options.firestoreKey);
          if (existing && existing.length > 0) {
            return; // Already generated
          }
        }
        
        const matchState = matchDoc.exists() ? matchDoc.data() : {};
        const aiPlayers = options.getAIPlayers(matchState);
        const requiredData = options.getRequiredData(matchState);
        
        // Generate submissions in parallel
        const promises = aiPlayers.map(async (aiPlayer, index) => {
          const submission = await options.generateSubmission(aiPlayer, requiredData);
          setProgress(((index + 1) / aiPlayers.length) * 100);
          return submission;
        });
        
        const submissions = await Promise.all(promises);
        
        // Store in Firestore
        const matchRef = doc(db, 'matchStates', options.matchId);
        await updateDoc(matchRef, {
          [options.firestoreKey]: submissions,
        });
        
      } catch (err) {
        console.error('❌ AI generation failed:', err);
        setError(err as Error);
      } finally {
        setIsGenerating(false);
      }
    };
    
    generate();
  }, [options.matchId, options.enabled]);
  
  return { isGenerating, progress, error };
}
```

**Impact:**
- Remove ~100 lines per component (300+ lines total)
- Consistent AI generation logic
- Better error handling
- Reusable for future phases

---

## 6. 📝 Firestore Helper Utilities (LOW PRIORITY)

### Problem
Firestore operations are scattered with repeated patterns:
- Getting match state documents
- Updating nested fields
- Checking document existence
- Error handling

### Solution
**Create:** `lib/utils/firestore-helpers.ts` (extend existing)
```typescript
export async function getMatchState(matchId: string) {
  const { getDoc, doc } = await import('firebase/firestore');
  const { db } = await import('@/lib/config/firebase');
  
  const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
  if (!matchDoc.exists()) {
    throw new Error('Match state not found');
  }
  return matchDoc.data();
}

export async function updateMatchState(
  matchId: string,
  updates: Record<string, any>
) {
  const { doc, updateDoc } = await import('firebase/firestore');
  const { db } = await import('@/lib/config/firebase');
  
  const matchRef = doc(db, 'matchStates', matchId);
  await updateDoc(matchRef, updates);
}

export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
```

**Impact:**
- Cleaner code
- Consistent error handling
- Easier to update Firestore patterns

---

## 7. 🎯 Empty Submission Validation (LOW PRIORITY)

### Problem
Empty submission validation logic is duplicated:
- Check if content is empty
- Check word count
- Return early with 0 score

**Files:**
- `WritingSessionContent.tsx` (lines 298-312)
- `PeerFeedbackContent.tsx` (lines 214-228)
- `RevisionContent.tsx` (lines 236-251)

### Solution
**Create:** `lib/utils/submission-validation.ts`
```typescript
export function validateWritingSubmission(
  content: string,
  wordCount: number
): { isValid: boolean; isEmpty: boolean } {
  const isEmpty = !content || content.trim().length === 0 || wordCount === 0;
  return { isValid: !isEmpty, isEmpty };
}

export function validateFeedbackSubmission(
  responses: Record<string, string>
): { isValid: boolean; isEmpty: boolean } {
  const totalChars = Object.values(responses).join('').length;
  const isEmpty = totalChars < 50;
  return { isValid: !isEmpty, isEmpty };
}

export function validateRevisionSubmission(
  originalContent: string,
  revisedContent: string,
  wordCount: number
): { isValid: boolean; isEmpty: boolean; unchanged: boolean } {
  const isEmpty = !revisedContent || revisedContent.trim().length === 0 || wordCount === 0;
  const unchanged = revisedContent === originalContent;
  return { isValid: !isEmpty && !unchanged, isEmpty, unchanged };
}
```

**Impact:**
- Consistent validation logic
- Easier to update validation rules
- Remove ~15 lines per component

---

## 8. 🔧 Error Boundary and Fallback Patterns (LOW PRIORITY)

### Problem
Error handling and fallback patterns are inconsistent:
- Some use try-catch with fallback
- Some just log errors
- Some have multiple fallback levels
- Error messages vary

### Solution
**Create:** `lib/utils/error-handling.ts`
```typescript
export interface FallbackOptions {
  onError?: (error: Error) => void;
  fallback?: () => Promise<any>;
  errorMessage?: string;
}

export async function withFallback<T>(
  operation: () => Promise<T>,
  options: FallbackOptions = {}
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(options.errorMessage || 'Operation failed:', error);
    options.onError?.(error as Error);
    
    if (options.fallback) {
      return await options.fallback();
    }
    
    throw error;
  }
}
```

**Impact:**
- Consistent error handling
- Easier to add error tracking
- Better error messages

---

## 📊 Summary

| Priority | Opportunity | Impact | Effort |
|----------|------------|--------|--------|
| HIGH | Batch Ranking API Consolidation | ~100 lines removed | Medium |
| HIGH | Batch Ranking Submission Hook | ~360 lines removed | High |
| MEDIUM | Mock Ranking Generation | ~60 lines removed | Low |
| MEDIUM | Component Size Reduction | Better organization | High |
| MEDIUM | AI Generation Consolidation | ~300 lines removed | Medium |
| LOW | Firestore Helper Utilities | Cleaner code | Low |
| LOW | Empty Submission Validation | ~45 lines removed | Low |
| LOW | Error Boundary Patterns | Consistency | Low |

**Total Potential Impact:**
- **~865 lines of code removed**
- **Improved maintainability**
- **Better code organization**
- **Consistent patterns across codebase**

---

## 🎯 Recommended Implementation Order

1. **Start with #2 (Batch Ranking Submission Hook)** - Highest impact, reduces duplication in components
2. **Then #1 (Batch Ranking API Consolidation)** - Simplifies API routes
3. **Then #3 (Mock Ranking Generation)** - Quick win, low effort
4. **Then #5 (AI Generation Consolidation)** - Reduces component complexity
5. **Finally #4 (Component Size Reduction)** - Improves long-term maintainability

The LOW priority items (#6, #7, #8) can be done incrementally as opportunities arise.

