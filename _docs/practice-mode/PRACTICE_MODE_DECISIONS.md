# Practice Mode: Pre-Build Decisions

**Status**: ✅ Decisions complete  
**Last Updated**: December 2, 2024

---

## 🔴 Critical Decisions (MVP)

### 1. Phase 2 Approach (Peer Review)

In solo practice, what does the student review in Phase 2?

| Option | Pros | Cons |
|--------|------|------|
| A. Skip Phase 2 | Faster MVP, simpler flow | Loses peer review skill practice |
| B. Curated examples | Quality controlled, teachable | Need to create/curate content upfront |
| **✅ C. AI-generated examples** | Infinite variety, controllable quality | Need to pre-generate |
| D. Historical pool | Real student work | Cold start, quality control needed |

**Decision**: AI-generated examples, **pre-generated pool** (not on-the-fly)  
**Rationale**: Good to have practice > none. Pre-generating avoids LLM latency during session.

---

### 2. Prompts Per Lesson

How many different prompts does each lesson have?

| Option | Pros | Cons |
|--------|------|------|
| A. 1 prompt (MVP) | Fast to build | Repetitive on retries |
| **✅ B. 3 prompts** | Some variety | 45 prompts to write (15 lessons × 3) |
| C. 5 prompts | Good variety | 75 prompts to write |
| D. Infinite (AI-generated) | Never repeats | Inconsistent difficulty, more LLM calls |

**Decision**: 
- **MVP**: 19 prompts total (3 prompts × 2 MVP lessons + 1 prompt × 13 other lessons)
- **Full version**: 45 prompts total (3 prompts × 15 lessons)

**Rationale**: More prompts is better for variety. 45 is manageable.

---

### 3. Badge/Mastery Logic

~~What earns badge tiers I/II/III?~~ **SIMPLIFIED: Binary mastery system**

| Option | Pros | Cons |
|--------|------|------|
| A. Skill usage count (I/II/III tiers) | Clear, mechanical | Complex, doesn't measure quality |
| **✅ B. Score threshold (binary)** | Simple, measures quality | Less granular |
| C. Both | Comprehensive | Too complex |
| D. Consistency | Proves mastery | Requires many sessions |

**Decision**: Binary mastery per lesson
- **90%+ score** = ★ Mastered (lesson complete)
- **<90% score** = ☆ Not mastered (keep practicing)

**Category Mastery**: All 5 lessons in category at ★ = "Sentence Pro" / "Paragraph Pro" / "Essay Pro"

**Visual**: Simple filled star (★) or empty star (☆). No progress bars, no tiers I/II/III.

**Rationale**: 90% is the mastery threshold. Simpler than tier system, less code.

---

### 4. LP System

How does practice LP work?

| Question | Decision |
|----------|----------|
| Does practice LP contribute to rank promotion? | **Yes** |
| Daily/weekly LP cap from practice? | **No cap** |
| LP formula (score → LP)? | **Use spec** (95+=15, 90-94=13, 85-89=11, etc.) |
| **Mastered lessons give LP?** | **No** - once mastered (90%+), lesson is locked from LP |
| **How does locked lesson re-open?** | **V1**: Gap detection (2 consecutive ranked failures) |

**Anti-grinding mechanism**: Mastered lessons don't award LP. You can replay for practice but no LP reward. Lesson re-opens for LP only when gap detection triggers in V1.

**Rationale**: Prevents LP grinding while still rewarding skill-building.

---

### 5. Score Tracking

| Question | Decision |
|----------|----------|
| Track "best score" or "latest score"? | **Best score (MVP)** |
| Can you lose mastery on poor retry? | **No (MVP)** - best score preserved |
| Cooldown between retries? | **None** |

**Rationale**: For MVP, students can't lose mastery. Encourages experimentation without fear. V1 may revisit if gap detection shows skill regression.

---

## 🟡 Important Decisions (V1 / Post-MVP)

### 6. Lessons ↔ TWR Traits Mapping

Do practice lessons affect the 5 TWR trait scores on profile?

**Decision**: **Completely separate** (Option A)  
**Rationale**: Not using trait scores anywhere currently. Logic for modifying trait scores not well defined. Can revisit later.

---

### 7. Lesson Unlock Progression

Are all lessons available immediately?

**Decision**: **All unlocked** with suggested path (Sentence → Paragraph → Essay)  
**Rationale**: Don't want to block advanced users. Maybe add gating test in future.

---

### 8. Gap Detection Integration

| Question | Decision |
|----------|----------|
| Detect skill gaps from ranked matches? | **Yes** (V1) |
| Auto-recommend lessons based on gaps? | **Yes** (V1) |
| Alert threshold? | **2 consecutive failures** in ranked |
| Re-open mastered lessons for LP? | **Yes** - gap detection unlocks LP reward again |

**Timeline**: V1 (after MVP demo)

**Rationale**: Creates practice ↔ ranked feedback loop. Practice → Master → Ranked → Fail skill → Practice re-opens → Repeat.

---

## 🟢 Deferrable Decisions (Later)

### 9. Teacher Features

| Feature | Include? |
|---------|----------|
| Teacher sees student practice progress | Later |
| Teacher can assign specific lessons | Later |
| Class-wide practice dashboard | Later |

---

### 10. Grade/Difficulty Levels

| Question | Decision |
|----------|----------|
| Lessons differentiated by grade? | No |
| Difficulty scaling within lessons? | No (not for MVP) |
| Prompts scale by user rank? | No (not for MVP) |

---

## 🔵 Architectural Refactoring (December 2024)

### 11. Phase Ordering (Review → Write → Revise)

**Status**: ✅ Decided  
**Date**: December 2, 2024

The original flow had students write first, then review examples. This is being changed to follow the "I Do, We Do, You Do" (Gradual Release of Responsibility) pedagogy.

#### Original Flow
```
Phase 1 (Write, 3 min) → Phase 2 (Review, 1 min) → Phase 3 (Revise, 2 min)
```

#### New Flow
```
Review Phase (1 min) → Write Phase (3 min) → Revise Phase (2 min)
```

| Option | Flow | Rationale |
|--------|------|-----------|
| A. Write first | Write → Review → Revise | Students attempt cold before seeing examples |
| **✅ B. Review first** | Review → Write → Revise | Model examples before independent practice |

**Decision**: Review phase comes first

**Rationale**:
- Follows "Gradual Release of Responsibility" pedagogy (I Do → We Do → You Do)
- Students see examples BEFORE attempting their own writing
- Review phase is lower cognitive load (multiple-choice), serves as warm-up
- Examples prime pattern recognition before independent practice
- Reduces "blank page anxiety"
- Sets clear success criteria before the writing task
- The sidebar examples (`ExampleSidebar`) remain visible during writing for reference

---

### 12. Phase Naming Convention

**Status**: ✅ Decided  
**Date**: December 2, 2024

Rename from numeric `phase1`/`phase2`/`phase3` to semantic names that describe purpose rather than order.

| Old Name | New Name | Purpose |
|----------|----------|---------|
| `phase1` | `reviewPhase` | Evaluate examples, learn the concept |
| `phase2` | `writePhase` | Independent writing practice |
| `phase3` | `revisePhase` | Improve based on feedback |

**Affected Code**:
- `SessionPhase` type in `PracticeSessionContent.tsx`
- `PracticePhase` type in `usePracticeLesson.ts`
- `phaseDurations` object in `practice-lessons.ts`
- Score state variables (`phase1Score` → `writeScore`, etc.)
- Results page URL params

**Rationale**: 
- Self-documenting code
- Doesn't imply order (allows reordering without renaming)
- Clearer intent when reading code

---

### 13. Instruction Cards in Review Phase

**Status**: ✅ Decided  
**Date**: December 2, 2024

Add teaching content (instruction cards) to the review phase before or alongside example evaluation.

| Option | Description | Effort |
|--------|-------------|--------|
| A. Intro cards before examples | 1-2 cards explaining concept, then evaluations | Low |
| **✅ B. Integrated teaching** | Each item can be instruction OR example | Low |
| C. Separate tutorial mode | Full teaching section, then review | Medium |

**Decision**: Option B - Union type for `ReviewItem`

**Implementation**:
```typescript
type ReviewItem = 
  | { type: 'instruction'; title: string; content: string; tip?: string; }
  | { type: 'example'; example: Phase2Example; };
```

**Content Source**:
- Instruction content comes from existing `grader-configs/*.ts`:
  - `howTheActivityWorks` → "How this works" card
  - `commonMistakesToAnticipate` → "Watch out for" tips
  - `positiveExamples` / `negativeExamples` → Teaching examples

**AlphaWrite Compatibility**:
- AlphaWrite grader configs use the exact same `ActivityGraderConfig` structure
- Content transfers directly when importing lessons from AlphaWrite
- No custom content needed per lesson - extract from grader config

**Rationale**:
- The instructional content already exists in grader configs (designed to explain concepts to AI, works for humans too)
- Low implementation effort (~100 lines delta)
- Scales well to 40+ AlphaWrite lessons
- Students get concept explanation before evaluation

---

### 14. Score State Management Across Phases

**Status**: ✅ Decided  
**Date**: December 2, 2024

How scores are stored between phases to display during revision.

| Phase | Scores Generated | Stored In State | Used For |
|-------|------------------|-----------------|----------|
| Review | `reviewFeedback[]` | `reviewFeedback` | Calculated to `reviewScore` at submit |
| Write | `writeScore`, `writeRemarks` | `writeScore`, `writeRemarks` | Shown during Revise phase |
| Revise | `reviseScore`, `reviseRemarks` | Calculated at submit | Final results |

**Key Insight**: `writeScore` and `writeRemarks` must be stored as React state (not calculated inline) because they're displayed during the Revise phase as:
- "Your original response" with score badge
- "Feedback to consider" list from remarks

**Variable Renaming**:
```typescript
// Old
const [phase1Score, setPhase1Score] = useState<number | null>(null);
const [phase1Remarks, setPhase1Remarks] = useState<GradingRemark[]>([]);

// New
const [writeScore, setWriteScore] = useState<number | null>(null);
const [writeRemarks, setWriteRemarks] = useState<GradingRemark[]>([]);
```

**Composite Score** (unchanged logic):
```typescript
const compositeScore = Math.round(
  (reviewScore ?? 0) * 0.2 + (writeScore ?? 0) * 0.4 + (reviseScore ?? 0) * 0.4
);
```

---

## 📋 Final Summary

| Decision | MVP | V1 |
|----------|-----|-----|
| Phase 2 content | Pre-generated AI examples | Same |
| Prompts | 19 total | 45 total |
| Mastery | Binary (90%+ = ★) | Same |
| LP from mastered | No | Re-opens via gap detection |
| Score tracking | Best score | May add regression |
| Gap detection | ❌ Not included | ✅ Included |
| Category mastery display | ✅ Show progress | Same |
| **Phase order** | **Review → Write → Revise** | Same |
| **Phase naming** | **Semantic (reviewPhase, writePhase, revisePhase)** | Same |
| **Instruction cards** | **Integrated in review phase** | Same |

---

## 📝 Implementation Checklist (Phase Refactor)

When implementing the phase reordering:

- [ ] **Types & Constants**
  - [ ] Rename `phaseDurations` keys: `phase1` → `writePhase`, `phase2` → `reviewPhase`, `phase3` → `revisePhase`
  - [ ] Update `PRACTICE_PHASE_DURATIONS` default values
  - [ ] Update `SessionPhase` type in `PracticeSessionContent.tsx`
  - [ ] Update `PracticePhase` type in `usePracticeLesson.ts`

- [ ] **Review Phase (now first)**
  - [ ] Add `ReviewItem` union type to `practice-examples.ts`
  - [ ] Create `buildReviewSequence()` function
  - [ ] Update `PracticeReviewPhase.tsx` to handle instruction vs example cards
  - [ ] Pull instruction content from grader configs

- [ ] **State Variables**
  - [ ] Rename `phase1Score` → `writeScore`
  - [ ] Rename `phase1Remarks` → `writeRemarks`
  - [ ] Rename `phase3Remarks` → `reviseRemarks`

- [ ] **Flow Logic**
  - [ ] Update `handleStart()` to begin with `reviewPhase`
  - [ ] Update `handlePhaseComplete()` for new order
  - [ ] Update `usePracticeLesson.startSession()` to start with review time
  - [ ] Update `usePracticeLesson.nextPhase()` for new transitions

- [ ] **UI Updates**
  - [ ] Update ready screen phase cards order
  - [ ] Update results page param names
  - [ ] Update any phase-specific colors/labels

---

## 📝 Additional Notes

_Add any other decisions, constraints, or context here._
