# Ranked Flow - Final Explanation

## The Flow (What Actually Happens)

### 1. Matchmaking ✅ SIMPLE
- User joins queue → Session created/found
- Players added to session
- When 5 players → Session starts → Navigate to `/session/{sessionId}`

### 2. Phase Component Loads
**What happens**:
- `useSession(sessionId)` hook connects to session
- Provides: `session`, `submitPhase`, `hasSubmitted`, `timeRemaining`
- Component renders based on `session.config.phase`

### 3. User Submits
**What happens**:
```
handleSubmit()
  → useBatchRankingSubmission.submit()
    → Validates
    → Gets AI submissions from Firestore
    → Calls batch ranking API
    → Gets rankings
    → Calls submitPhase(phase, data)
      → Updates Firestore: players.{userId}.phases.phase{phase} = { submitted: true, ... }
```

**After submission**: Firestore updated, user's submission marked as submitted

### 4. Phase Transition
**What happens**:
- `usePhaseTransition` hook (in PeerFeedbackContent & RevisionContent) monitors session
- When it detects all players submitted → Calls `checkAndTransitionPhase()`
- `checkAndTransitionPhase()` uses Firestore transaction to update `config.phase`
- All clients see phase change via Firestore listener
- Component re-renders → Next phase shows

**Note**: `WritingSessionContent` doesn't use `usePhaseTransition` - phase transition happens automatically when Firestore updates

### 5. Auto-Submit ✅ SIMPLE
- Timer hits 0 → `useAutoSubmit` hook calls `handleSubmit()`
- One ref prevents duplicate submissions
- Done

---

## Why It Seems Complicated

1. **Multiple hooks** - But each does one thing:
   - `useSession` - Session connection
   - `useBatchRankingSubmission` - Batch ranking API calls
   - `usePhaseTransition` - Phase transition detection (only in 2/3 phases)
   - `useAutoSubmit` - Auto-submit on timer

2. **Deep call stack** - But it's actually:
   - Component → Hook → API → Firestore
   - Each layer has a purpose

3. **Phase transition logic** - Split between:
   - Hook (monitors)
   - Service (transitions)
   - But this is intentional - hook monitors, service transitions

---

## The Flow Is Actually Simple

```
1. Component loads → useSession connects
2. User submits → API called → Firestore updated
3. All submitted? → Phase transitions (automatic)
4. Component re-renders → Next phase shows
```

**That's it.** The hooks are just abstractions to make the code reusable.

---

## What Could Be Simplified

1. **Remove unused import** - `usePhaseTransition` imported but not used in `WritingSessionContent.tsx`
2. **Consolidate phase transition** - Move detection into session manager's listener
3. **Simplify `useBatchRankingSubmission`** - It's doing a lot, but it's reusable

But honestly, the flow is pretty clean. The complexity comes from:
- Reusability (hooks work for all 3 phases)
- Error handling (retries, fallbacks)
- Race condition prevention (transactions)

These are **good** complexities, not bad ones.

