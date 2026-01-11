# Checkpoint System Implementation Plan

**Goal**: Implement a checkpoint/respawn system so players can recover from death without losing all progress.

**Status**: Planning

---

## Design Decisions

| Decision | Choice |
|----------|--------|
| **Checkpoint triggers** | Every 5 turns (fallback) OR AI tags `[CHECKPOINT]` |
| **HP at respawn** | Always 70% (not preserved from checkpoint) |
| **State saved** | Messages, storySummary (NOT health) |
| **AI checkpoint logic** | AI decides "safe moments" on the fly |
| **Respawn UX** | Modal with "what went wrong" feedback |

---

## Implementation Overview

### Files to Modify

| File | Changes |
|------|---------|
| `demo/src/app/api/story/route.ts` | Add `[CHECKPOINT]` to prompt, parse tag |
| `demo/src/app/game/[sessionId]/page.tsx` | Checkpoint state, respawn logic, modal UI |

### New Components

- **Respawn Modal** - "You Died" with feedback and continue button

---

## Server-Side Implementation

### 1. Update System Prompt (`route.ts`)

Add checkpoint instructions to `SYSTEM_PROMPT`:

```typescript
CHECKPOINTS:
Add [CHECKPOINT] when the player reaches a natural safe moment:
- Entering a new area or chamber
- Successfully avoiding or escaping danger
- Completing a conversation or negotiation
- Finding temporary shelter or hiding spot
- Any moment of relative calm between dangers

Do NOT checkpoint during:
- Active combat or chase sequences
- Immediate danger situations
- Mid-action moments

Place [CHECKPOINT] at the END of your response, after the narrative.
```

### 2. Parse `[CHECKPOINT]` Tag (`route.ts`)

Add to the bracket parsing section (after DAMAGE/END parsing):

```typescript
const checkpointMatch = bracketBuffer.match(/\[CHECKPOINT\]/i);

if (checkpointMatch) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "checkpoint" })}\n\n`));
}
```

---

## Client-Side Implementation

### 1. New State Variables (`page.tsx`)

```typescript
// Checkpoint state
type CheckpointState = {
  messages: Message[];
  storySummary: string;
  savedAt: number;
};

// In component:
const [checkpointState, setCheckpointState] = useState<CheckpointState | null>(null);
const [turnsSinceCheckpoint, setTurnsSinceCheckpoint] = useState(0);
const [showRespawnModal, setShowRespawnModal] = useState(false);
const [deathFeedback, setDeathFeedback] = useState<{ score?: number; errors?: GraderError[] } | null>(null);
```

### 2. Checkpoint Event Handler

Handle `checkpoint` event in the streaming loop:

```typescript
} else if (data.type === "checkpoint") {
  // Save checkpoint
  setCheckpointState({
    messages: [...messages, /* current AI message */],
    storySummary,
    savedAt: Date.now(),
  });
  setTurnsSinceCheckpoint(0);
  // Optional: show brief toast "Checkpoint saved"
}
```

### 3. Turn Count Fallback

After each successful turn (after stream completes):

```typescript
// Increment turn counter
const newTurnCount = turnsSinceCheckpoint + 1;
setTurnsSinceCheckpoint(newTurnCount);

// Auto-checkpoint every 5 turns if no AI checkpoint
if (newTurnCount >= 5 && !receivedCheckpoint) {
  setCheckpointState({
    messages: messages, // current state
    storySummary,
    savedAt: Date.now(),
  });
  setTurnsSinceCheckpoint(0);
}
```

### 4. Death → Respawn Flow

Modify death handling to show respawn modal instead of ending:

```typescript
// When death is triggered (HP = 0 or END:DEATH)
if (checkpointState) {
  // Has checkpoint → show respawn modal
  setDeathFeedback({
    score: currentScore,
    errors: lastErrors,
  });
  setShowRespawnModal(true);
} else {
  // No checkpoint → permanent death (game over)
  setEnding({ outcome: "DEATH", title, message });
}
```

### 5. Respawn Function

```typescript
const respawnAtCheckpoint = () => {
  if (!checkpointState) return;
  
  // Restore state
  setMessages(checkpointState.messages);
  setStorySummary(checkpointState.storySummary);
  
  // Reset health to 70%
  setHealth(70);
  
  // Clear death state
  setShowRespawnModal(false);
  setDeathFeedback(null);
  setEnding(null);
  
  // Reset turn counter
  setTurnsSinceCheckpoint(0);
};
```

### 6. Respawn Modal UI

```tsx
{showRespawnModal && (
  <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-md w-full text-center">
      {/* Death Title */}
      <h2 className="text-3xl text-red-400 font-medium mb-4">You Died</h2>
      
      {/* What went wrong */}
      {deathFeedback && (
        <div className="mb-6 text-left bg-neutral-950 rounded-xl p-4">
          <p className="text-neutral-500 text-sm mb-2">What went wrong:</p>
          {deathFeedback.score !== undefined && (
            <p className="text-neutral-300 mb-2">
              Writing Score: <span className="text-red-400">{deathFeedback.score}</span>
            </p>
          )}
          {deathFeedback.errors && deathFeedback.errors.length > 0 && (
            <ul className="space-y-1">
              {deathFeedback.errors.slice(0, 3).map((error, idx) => (
                <li key={idx} className="text-neutral-400 text-sm">
                  {SEVERITY_ICONS[error.severity]} {error.explanation}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {/* Respawn message */}
      <p className="text-neutral-400 mb-8">
        Returning to last checkpoint...
      </p>
      
      {/* Continue button */}
      <button
        onClick={respawnAtCheckpoint}
        className="bg-amber-500 hover:bg-amber-400 text-neutral-900 px-10 py-4 rounded-xl text-lg font-medium transition-colors w-full"
      >
        Continue
      </button>
    </div>
  </div>
)}
```

---

## Implementation Steps

### Phase 1: Server-Side (15 min)
- [ ] Add `[CHECKPOINT]` instructions to `SYSTEM_PROMPT`
- [ ] Add checkpoint tag parsing in bracket handler
- [ ] Send `{ type: "checkpoint" }` event

### Phase 2: Client State (15 min)
- [ ] Add `CheckpointState` type
- [ ] Add state variables: `checkpointState`, `turnsSinceCheckpoint`, `showRespawnModal`, `deathFeedback`
- [ ] Handle `checkpoint` event in stream loop

### Phase 3: Turn Tracking (10 min)
- [ ] Increment turn counter after each successful turn
- [ ] Auto-checkpoint at 5 turns if no AI checkpoint

### Phase 4: Death Flow (20 min)
- [ ] Modify death trigger to check for checkpoint
- [ ] Show respawn modal instead of ending (if checkpoint exists)
- [ ] Implement `respawnAtCheckpoint` function
- [ ] Track last errors/score for feedback

### Phase 5: Respawn Modal UI (15 min)
- [ ] Create respawn modal component
- [ ] Show "what went wrong" feedback
- [ ] Continue button triggers respawn

### Phase 6: Testing (15 min)
- [ ] Test AI checkpoint triggers
- [ ] Test 5-turn fallback
- [ ] Test respawn restores correct state
- [ ] Test HP resets to 70%
- [ ] Test death without checkpoint → game over

---

## Edge Cases to Handle

| Case | Expected Behavior |
|------|-------------------|
| Death before any checkpoint | Permanent death (game over screen) |
| Multiple deaths in a row | Each respawn goes to same checkpoint |
| Checkpoint during loading | Wait for load to complete |
| Page refresh after checkpoint | Checkpoint persists (localStorage) |

---

## Future Enhancements

- [ ] "Checkpoint saved" toast notification
- [ ] Visual indicator showing checkpoint exists
- [ ] Multiple checkpoint slots (undo multiple deaths)
- [ ] Checkpoint persistence to database (v1)

---

## References

- [Game Design Doc - Section 4: Checkpoint & Death](../game-design-doc.md)
- [MVP - M1c: Save & Checkpoint System](./mvp.md)
