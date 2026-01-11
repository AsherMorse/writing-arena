# 3-Layer Grader Flow

This document explains how the D&D grader evaluates student responses across three dimensions: grammar, quest requirements, and narrative appropriateness.

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           gradeDnDTurn()                                    │
│                         (dnd-grader.ts)                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: PRE-VALIDATION                                                     │
│  (pre-validation.ts)                                                        │
│                                                                             │
│  Fast programmatic checks — NO LLM call:                                    │
│  • Empty/whitespace? ❌ BLOCK                                               │
│  • Only punctuation? ❌ BLOCK                                               │
│  • Repeated char ("aaaaa")? ❌ BLOCK                                        │
│  • Keyboard mashing ("asdfgh")? ❌ BLOCK                                    │
│  • No vowels? ❌ BLOCK                                                      │
│  • < 3 words? ❌ BLOCK                                                      │
│  • Duplicate of previous response? ❌ BLOCK                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                              │
                    │ valid                        │ invalid
                    ▼                              ▼
           Continue to Step 2            Return BLOCKED result
                    │                    (no HP damage, can't continue)
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: BUILD PROMPT                                                       │
│  (combined-prompt.ts)                                                       │
│                                                                             │
│  Build ONE big prompt with sections for all 3 layers:                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │ GAME CONTEXT: location, scene, character, inventory...      │           │
│  ├─────────────────────────────────────────────────────────────┤           │
│  │ LAYER 1: Grammar categories to check (14 types)             │           │
│  ├─────────────────────────────────────────────────────────────┤           │
│  │ LAYER 2: Quest requirements (valid player action?)          │           │
│  ├─────────────────────────────────────────────────────────────┤           │
│  │ LAYER 3: Narrative appropriateness (possible in world?)     │           │
│  ├─────────────────────────────────────────────────────────────┤           │
│  │ OUTPUT FORMAT: Expected JSON structure                      │           │
│  └─────────────────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: CALL LLM  ← ← ← ← ← ← ← ← ← SLOWEST PART (Opus 4.5)               │
│  (dnd-grader.ts)                                                            │
│                                                                             │
│  client.messages.create({                                                   │
│    model: 'claude-opus-4-5-20251101',  ← Could use Sonnet instead!         │
│    system: combinedPrompt,                                                  │
│    messages: [{ role: 'user', content: studentResponse }]                   │
│  })                                                                         │
│                                                                             │
│  Returns JSON with all 3 layers evaluated in ONE call                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: PARSE RESPONSE                                                     │
│  (response-parser.ts)                                                       │
│                                                                             │
│  Extract JSON from LLM output (handles markdown code blocks)                │
│  Parse into structured errors for each layer:                               │
│                                                                             │
│  {                                                                          │
│    layer1Errors: [{ category, explanation, substring, fix }],              │
│    layer2Error: { category, explanation } | null,                          │
│    layer3Errors: [{ category, explanation, suggestion }]                   │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 5: CHECK FOR BLOCKERS                                                 │
│                                                                             │
│  Layer 2 blocking?                                                          │
│  • GIBBERISH_INPUT, NOT_A_PLAYER_ACTION, OFF_TOPIC,                        │
│    INAPPROPRIATE_CONTENT → BLOCK (can't continue)                          │
│                                                                             │
│  Layer 3 blocking?                                                          │
│  • IMPOSSIBLE_ACTION, ANACHRONISM, PHYSICS_BREAK                           │
│    → BLOCK with suggested alternative                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                              │
                    │ no blockers                  │ has blocker
                    ▼                              ▼
           Continue to Step 6            Return BLOCKED result
                    │                    (+ suggestion for Layer 3)
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 6: CALCULATE HP DAMAGE                                                │
│                                                                             │
│  Layer 1 Grammar:                                                           │
│  • major errors (fragments, run-ons) → -2 HP each                          │
│  • minor errors (typos, punctuation) → -1 HP each                          │
│  • Capped at MAX_HP_DAMAGE_PER_TURN                                        │
│                                                                             │
│  Layer 3 Warnings (non-blocking):                                           │
│  • OUT_OF_CHARACTER → -2 HP                                                │
│  • META_GAMING → -1 HP                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 7: RETURN RESULT                                                      │
│                                                                             │
│  {                                                                          │
│    accepted: true,                                                          │
│    hpDamage: -3,                                                           │
│    score: 70,                 // 100 - (damage * 10)                       │
│    errors: [...],             // All errors combined                        │
│    feedback: [...],           // Top 3 prioritized explanations            │
│    feedbackSummary: "🟠 ..."  // Formatted string for display              │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The 3 Layers

| Layer | Purpose | Categories | Severity |
|-------|---------|------------|----------|
| **L1: Grammar** | Writing conventions | 14 categories (fragments, typos, punctuation, etc.) | minor/major → HP damage |
| **L2: Quest** | Valid player action? | GIBBERISH, NOT_A_PLAYER_ACTION, OFF_TOPIC, INAPPROPRIATE | Always **blocking** |
| **L3: Narrative** | Makes sense in world? | IMPOSSIBLE_ACTION, ANACHRONISM, PHYSICS_BREAK, OUT_OF_CHARACTER, META_GAMING | blocking OR warning |

---

## Key Characteristics

### Single LLM Call
All 3 layers are evaluated in **one LLM call** using a combined prompt. This is more efficient than 3 separate calls, but still slow when using Opus.

### Current Model
- **Grader**: Claude Opus 4.5 (`claude-opus-4-5-20251101`)
- **Narrator**: Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)

### Performance Bottleneck
The grader uses Opus 4.5, which is:
- ~5-10x slower than Sonnet
- ~5x more expensive than Sonnet
- Excellent for complex reasoning, but possibly overkill for grammar checking

### Speed Optimization Options
1. **Switch to Sonnet 4.5** — One-line change, 5-10x faster, likely sufficient quality
2. **Switch to Haiku** — Even faster/cheaper, may sacrifice some accuracy
3. **Parallel execution** — Run grading and story generation simultaneously
4. **Use dedicated grammar API** — Wire up to GrammarGuard service (per MVP doc)

---

## Files

| File | Purpose |
|------|---------|
| `dnd-grader.ts` | Main entry point, orchestrates all steps |
| `layers/pre-validation.ts` | Fast programmatic checks (Step 1) |
| `layers/combined-prompt.ts` | Builds LLM prompt for all 3 layers (Step 2) |
| `layers/response-parser.ts` | Parses LLM JSON output (Step 4) |
| `dnd-grader-config.ts` | HP damage weights, severity tiers, feedback |
| `dnd-grader-types.ts` | TypeScript type definitions |

---

**Last Updated**: January 2026
