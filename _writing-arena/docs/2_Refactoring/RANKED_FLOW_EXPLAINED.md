# Ranked Flow - What's Actually Happening

## The Simple Flow (What It Should Be)

```
1. Matchmaking → Session created → Players added → Session starts
2. Phase 1: User writes → Submits → All submit? → Phase 2
3. Phase 2: User gives feedback → Submits → All submit? → Phase 3  
4. Phase 3: User revises → Submits → All submit? → Complete
5. Results page
```

## What's Actually Happening (Current)

### 1. Matchmaking ✅
- User joins queue
- `findOrJoinSession()` creates/finds session
- Players added to session
- When 5 players → `startSession()` → Navigate to `/session/{sessionId}`
- **This is clean**

### 2. Phase 1 Component Loads
**File**: `WritingSessionContent.tsx`

**Hooks Setup**:
- `useSession(sessionId)` - Connects to session, provides `session`, `submitPhase`, `hasSubmitted`, `timeRemaining`
- `useBatchRankingSubmission(...)` - Handles batch ranking API calls
- `usePhaseTransition(...)` - Monitors for phase transitions
- `useAutoSubmit(...)` - Auto-submits when timer hits 0

**The Problem**: 4 different hooks doing different things

### 3. User Submits
**Flow**:
```
handleSubmit()
  → handleBatchSubmit() [from useBatchRankingSubmission]
    → Validates submission
    → Gets AI writings from Firestore
    → Calls /api/batch-rank-writings
    → Gets rankings back
    → Calls submitPhase(1, { score, content, wordCount })
      → sessionManager.submitPhase()
        → Updates Firestore: players.{userId}.phases.phase1 = { submitted: true, ... }
```

**The Problem**: 5 layers deep

### 4. Phase Transition Detection
**Flow**:
```
usePhaseTransition hook:
  → Monitors session via Firestore listener
  → Checks if all real players submitted
  → Calls checkAndTransitionPhase(sessionId, currentPhase)
    → Reads session from Firestore
    → Checks if all submitted
    → Calls transitionToNextPhase(sessionId, currentPhase)
      → Uses Firestore transaction
      → Updates config.phase = 2
```

**The Problem**: Logic split across hook + service, checking "all submitted" in multiple places

### 5. Phase Change Detected
**Flow**:
```
SessionManager.listenToSession():
  → Firestore listener detects config.phase changed
  → Emits onPhaseTransition event
  → Component re-renders
  → SessionPage renders PeerFeedbackContent (phase 2)
```

**This is fine** - Firestore listener automatically updates

---

## Why It's Complicated

1. **Too Many Hooks**: 4 hooks in each phase component
2. **Deep Call Stack**: Submission goes through 5 layers
3. **Split Logic**: Phase transition detection is in hook, transition is in service
4. **Duplicate Checks**: "All submitted" checked in multiple places

---

## Simplification

The flow should be:
1. Component loads → `useSession` hook connects
2. User submits → Validate → Call API → Update Firestore (`submitPhase`)
3. Session manager detects all submitted → Automatically transitions phase
4. Component re-renders → Next phase shows

**Remove**:
- `usePhaseTransition` hook (move logic into session manager)
- Complex `useBatchRankingSubmission` (simplify to just API call + update)

**Keep**:
- `useSession` hook (core session management)
- `useAutoSubmit` hook (already simplified)
- Session manager's Firestore listener (automatic updates)

