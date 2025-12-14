# Ranked Flow - Complete Simplified Review

## The Flow Should Be Simple

```
1. User joins queue → Session created/found
2. Players added → Session updated  
3. Session starts → Phase 1 begins
4. User writes → Submits → Phase transitions
5. Phase 2 → User gives feedback → Submits → Phase transitions
6. Phase 3 → User revises → Submits → Session completes
7. Results page shows
```

## Current Flow (What Actually Happens)

### Step 1: Matchmaking ✅ CLEAN
- User joins queue
- Session created/found immediately
- Players added to session as they join
- When 5 players → Session starts
- Navigate to `/session/{sessionId}`

### Step 2: Phase 1 - Writing ❌ TOO COMPLICATED
**Current Flow**:
```
Component loads
  → useSession hook connects
  → useBatchRankingSubmission hook setup
  → usePhaseTransition hook setup  
  → useAutoSubmit hook setup
  → User writes
  → handleSubmit() called
    → handleBatchSubmit() called
      → useBatchRankingSubmission.submit()
        → Validates
        → Gets AI writings from Firestore
        → Calls /api/batch-rank-writings
        → Gets rankings
        → Calls submitPhase()
          → sessionManager.submitPhase()
            → Updates Firestore
  → usePhaseTransition detects all submitted
    → Calls checkAndTransitionPhase()
      → Calls transitionToNextPhase()
        → Updates Firestore config.phase = 2
  → Firestore listener detects change
  → Component re-renders → Phase 2 shows
```

**Problems**:
- 4 different hooks doing different things
- Submission goes through 5 layers
- Phase transition is split across hook + service
- Auto-submit has complex ref tracking

### Step 3: Phase Transition ❌ SPLIT LOGIC
- `usePhaseTransition` hook monitors session
- Checks if all submitted
- Calls `checkAndTransitionPhase` service
- Which calls `transitionToNextPhase` service
- Which uses transaction to update

**Should be**: One function that checks and transitions

---

## Simplified Flow (What It Should Be)

### Phase Component Pattern
```typescript
// Component loads
const { session, submitPhase, hasSubmitted, timeRemaining } = useSession(sessionId);

// User submits
const handleSubmit = async () => {
  if (hasSubmitted()) return;
  
  // 1. Validate
  const validation = validateSubmission();
  if (!validation.isValid) {
    await submitPhase(phase, { score: 0, ...emptyData });
    return;
  }
  
  // 2. Get AI submissions
  const aiSubmissions = await getAISubmissions(matchId, phase);
  
  // 3. Call API
  const rankings = await callBatchRankingAPI([userSubmission, ...aiSubmissions]);
  
  // 4. Update Firestore
  await submitPhase(phase, { score: rankings.find(r => r.playerId === userId).score });
  
  // 5. Check if all submitted → transition (automatic via Firestore listener)
};

// Auto-submit when timer hits 0
useEffect(() => {
  if (timeRemaining === 0 && !hasSubmitted()) {
    handleSubmit();
  }
}, [timeRemaining, hasSubmitted]);

// Phase transition happens automatically when Firestore updates
// No need for separate hook - just listen to session.config.phase
```

### Phase Transition (Simplified)
```typescript
// After submitPhase() updates Firestore:
// - All clients see the update via Firestore listener
// - One client detects all submitted
// - Calls transitionToNextPhase() (transaction)
// - Firestore updates config.phase
// - All clients see phase change → Component re-renders → Next phase shows
```

---

## Simplification Plan

1. ✅ **Auto-Submit** - Simplified to 40 lines, one ref
2. **Submission Flow** - Consolidate into one function
3. **Phase Transition** - Move logic into session manager, remove separate hook
4. **Remove Duplicate Checks** - Single source of truth
