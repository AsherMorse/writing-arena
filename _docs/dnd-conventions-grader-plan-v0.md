# D&D Conventions Grader - Implementation Plan

> **Status**: Planning Complete, Ready for Implementation  
> **Last Updated**: December 16, 2025  
> **Scope**: Layer 1 (Conventions) only - Grammar, punctuation, sentence structure

---

## Overview

The D&D Conventions Grader evaluates student writing for grammar and conventions errors during adventure gameplay. Writing quality directly impacts HP (Hit Points) - poor writing deals damage, potentially leading to mission failure.

### Core Decisions

| Decision | Choice |
|----------|--------|
| **Grading System** | AlphaWrite's GrammarGuard (System 1 - direct) |
| **When to Grade** | Every turn (real-time) |
| **Categories** | All 34 available, controlled via presets |
| **HP Calculation** | Weighted by severity tier |
| **Errors Shown** | Top 2-3 prioritized by severity |
| **Feedback Display** | Separate panel from narrative (Option A) |
| **HP Recovery** | None for now |
| **Starting HP** | 100 |

---

## GrammarGuard Integration

### What is GrammarGuard?

GrammarGuard is AlphaWrite's LLM-based grammar checker that:
- Checks for 34 categories of errors
- Returns structured `Match[]` objects with:
  - `category`: Error type (SENTENCE_FRAGMENT, TYPOS, etc.)
  - `explanation_of_issue`: Student-friendly feedback
  - `substring_of_interest`: The problematic text
  - `potential_corrected_sentence`: Suggested fix

### Location

```
_alphawrite/alphawrite-2/packages/edu-core/src/grading/grammar-guard/
├── grammar-guard.ts           # Main GrammarGuardCriteria function
├── types.ts                   # GrammarGuard namespace & MatchCategory enum
├── prompts/                   # LLM prompt templates
└── dataset/                   # Category descriptions
```

### Usage Pattern

```typescript
import { GrammarGuardCriteria } from '@alphawrite/edu-core/grading/grammar-guard';
import { GrammarGuard } from '@alphawrite/edu-core/grading/grammar-guard/types';

const result = await GrammarGuardCriteria({
  text: studentResponse,
  llmCategoriesToCheck: [
    GrammarGuard.MatchCategory.SENTENCE_FRAGMENT,
    GrammarGuard.MatchCategory.RUN_ON_SENTENCE,
    // ... selected categories
  ],
  optionalInstructionsForLLMGrammarCheck: "Context for the LLM..."
}).evaluate();

// Result contains:
// - result.correct: boolean (no errors found)
// - result.metadata.aiGrammarIssues: Match[] (all errors)
```

---

## Category Presets

Four presets for different gameplay contexts:

### 1. `strict` - All 34 Categories

**Use case**: Advanced students, final missions, high-stakes scenarios

```typescript
// All categories enabled
Object.values(GrammarGuard.MatchCategory)
```

### 2. `balanced` - Structure + Major Grammar (16 categories)

**Use case**: Default for grades 5-7, normal gameplay

```typescript
[
  // Critical Structure (3)
  'SENTENCE_FRAGMENT',
  'RUN_ON_SENTENCE',
  'COMMA_SPLICE',
  
  // Major Grammar (8)
  'SUBJECT_VERB_AGREEMENT',
  'TENSE_CONSISTENCY',
  'CAPITALIZATION_ERROR',
  'PUNCTUATION',
  'APOSTROPHE_ERROR',
  'QUOTATION_ERROR',
  'VERB_FORM_ERROR',
  'MISPLACED_MODIFIER',
  
  // Common Word Issues (5)
  'TYPOS',
  'HOMOPHONE_ERROR',
  'CONFUSED_WORDS',
  'WORD_USAGE_ERROR',
  'PLURALIZATION_ERROR',
]
```

### 3. `lenient` - Critical Structure Only (5 categories)

**Use case**: Early missions, struggling students, intro levels

```typescript
[
  'SENTENCE_FRAGMENT',
  'RUN_ON_SENTENCE',
  'COMMA_SPLICE',
  'CAPITALIZATION_ERROR',  // Start of sentence
  'PUNCTUATION',           // End of sentence
]
```

### 4. `fantasy` - D&D Optimized (13 categories)

**Use case**: Default preset for D&D game

```typescript
[
  // Critical Structure
  'SENTENCE_FRAGMENT',
  'RUN_ON_SENTENCE',
  'COMMA_SPLICE',
  
  // Major Grammar
  'SUBJECT_VERB_AGREEMENT',
  'TENSE_CONSISTENCY',
  'CAPITALIZATION_ERROR',
  'PUNCTUATION',
  'APOSTROPHE_ERROR',
  'QUOTATION_ERROR',  // Important for dialogue!
  'VERB_FORM_ERROR',
  
  // Word Issues (lenient on creative language)
  'TYPOS',
  'HOMOPHONE_ERROR',
  'CONFUSED_WORDS',
]
// EXCLUDES: FACTUAL_ERROR, PASSIVE_VOICE_OVERUSE, AWKWARD_PHRASING, CLICHÉ_USAGE
```

---

## Severity Tiers

### All 34 Categories Mapped

```typescript
const ERROR_SEVERITY_TIERS = {
  // CRITICAL - Breaks sentence structure/meaning (-4 HP each)
  SENTENCE_FRAGMENT: 'critical',
  RUN_ON_SENTENCE: 'critical',
  COMMA_SPLICE: 'critical',
  UNFINISHED_THOUGHT: 'critical',
  
  // MAJOR - Significantly affects readability (-2 HP each)
  SUBJECT_VERB_AGREEMENT: 'major',
  TENSE_CONSISTENCY: 'major',
  CAPITALIZATION_ERROR: 'major',
  PUNCTUATION: 'major',
  VERB_FORM_ERROR: 'major',
  MISPLACED_MODIFIER: 'major',
  DANGLING_MODIFIER: 'major',
  PARALLELISM_ERROR: 'major',
  HOMOPHONE_ERROR: 'major',
  CONFUSED_WORDS: 'major',
  WORD_ORDER_ERROR: 'major',
  DOUBLE_NEGATIVE: 'major',
  
  // MINOR - Noticeable but doesn't break meaning (-1 HP each)
  TYPOS: 'minor',
  APOSTROPHE_ERROR: 'minor',
  QUOTATION_ERROR: 'minor',
  COLON_SEMICOLON_ERROR: 'minor',
  SPACING_ERROR: 'minor',
  ARTICLE_USAGE: 'minor',
  PREPOSITION_ERROR: 'minor',
  PLURALIZATION_ERROR: 'minor',
  WORD_USAGE_ERROR: 'minor',
  PUNCTUATION_IN_LISTS: 'minor',
  COMPARISON_ERROR: 'minor',
  AMBIGUOUS_REFERENCE: 'minor',
  
  // STYLE - Pedagogical but not game-breaking (-0.5 HP each)
  CASING: 'style',
  PASSIVE_VOICE_OVERUSE: 'style',
  AWKWARD_PHRASING: 'style',
  CLICHÉ_USAGE: 'style',
  VERBOSITY: 'style',
  REDUNDANCY: 'style',
  REPETITIONS: 'style',
  INCONSISTENT_TONE: 'style',
  FORMATTING_ERROR: 'style',
  MISC_GRAMMAR: 'style',
  COMPOUNDING: 'style',
  
  // SPECIAL
  FACTUAL_ERROR: 'minor',  // Don't want fantasy "errors" to hurt HP
};
```

---

## HP Damage Calculation

### Weighted System

```typescript
const HP_DAMAGE_WEIGHTS = {
  critical: -4,    // Fragments, run-ons, comma splices
  major: -2,       // Subject-verb, tense, caps, punctuation
  minor: -1,       // Typos, apostrophes, small issues
  style: -0.5,     // Style issues
};

const MAX_HP_DAMAGE_PER_TURN = -10;  // Cap damage per turn
```

### Calculation Logic

```typescript
function calculateHPDamage(errors: ConventionError[]): number {
  let totalDamage = 0;
  
  for (const error of errors) {
    totalDamage += HP_DAMAGE_WEIGHTS[error.severity];
  }
  
  // Cap at -10 HP per turn (prevents instant death)
  return Math.max(MAX_HP_DAMAGE_PER_TURN, totalDamage);
}
```

### Example Scenarios

| Errors | Calculation | HP Damage |
|--------|-------------|-----------|
| 0 errors | 0 | 0 |
| 1 fragment | -4 | -4 |
| 2 typos | -1 + -1 | -2 |
| 1 fragment + 1 typo | -4 + -1 | -5 |
| 3 major + 2 minor | -6 + -2 | -8 |
| 5+ critical errors | -(5 × 4) | -10 (capped) |

---

## Error Prioritization

### Show Top 2-3 Errors

```typescript
function prioritizeErrors(
  errors: ConventionError[], 
  maxToShow: number = 3
): ConventionError[] {
  const severityOrder = { critical: 0, major: 1, minor: 2, style: 3 };
  
  return errors
    .sort((a, b) => {
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, maxToShow);
}
```

### Priority Order

1. **Critical** errors always shown first (fragments, run-ons)
2. **Major** errors next (subject-verb agreement, tense)
3. **Minor** errors if space remains (typos, apostrophes)
4. **Style** errors rarely shown (verbosity, clichés)

---

## Data Structures

### Input Type

```typescript
type DnDGraderInput = {
  /** The student's written response */
  studentResponse: string;
  /** Student's grade level (5-8) */
  gradeLevel: 5 | 6 | 7 | 8;
  /** Which category preset to use */
  categoryPreset: 'strict' | 'balanced' | 'lenient' | 'fantasy';
};
```

### Output Type

```typescript
type DnDGraderResult = {
  // Overall result
  hasErrors: boolean;
  errorCount: number;
  
  // HP impact
  hpDamage: number;  // Negative value: -3, -5, -10, etc.
  
  // Errors found (all)
  allErrors: ConventionError[];
  
  // Errors to show (top 2-3)
  prioritizedErrors: ConventionError[];
  
  // Feedback message (combined top errors)
  feedbackSummary: string;
  
  // Metadata
  categoriesChecked: string[];
  gradeTimestamp: number;
};
```

### Convention Error Type

```typescript
type ConventionError = {
  // From GrammarGuard
  category: string;                  // e.g., 'SENTENCE_FRAGMENT'
  explanation: string;               // Student-friendly feedback
  substringOfInterest: string;       // The problematic text
  potentialFix?: string;             // Suggested correction
  
  // Our additions
  severity: 'critical' | 'major' | 'minor' | 'style';
  hpDamage: number;                  // Individual error's HP cost
  displayPriority: number;           // 1 = show first, 2 = show second, etc.
};
```

### Game Turn Result (UI Integration)

```typescript
type GameTurnResult = {
  // Player's writing
  playerText: string;
  
  // Grammar grading
  grammarGrade: DnDGraderResult;
  
  // HP state
  hpBefore: number;
  hpAfter: number;
  hpChange: number;
  
  // Story response (separate from grammar)
  narrativeContinuation: string;
  
  // Timestamp
  timestamp: number;
};
```

---

## File Structure

```
lib/grading/
├── dnd-conventions-grader.ts      # Main grading logic
├── dnd-conventions-config.ts      # Presets & severity tiers
├── dnd-conventions-types.ts       # TypeScript types
└── dnd-conventions-utils.ts       # Helper functions (prioritize, format)
```

---

## Implementation Phases

### Phase 1: Types & Configuration

**Create type definitions and configuration constants.**

Files:
- `lib/grading/dnd-conventions-types.ts`
- `lib/grading/dnd-conventions-config.ts`

Contents:
- All TypeScript types (`DnDGraderInput`, `DnDGraderResult`, `ConventionError`)
- `GRAMMAR_CATEGORY_PRESETS` object
- `ERROR_SEVERITY_TIERS` mapping
- `HP_DAMAGE_WEIGHTS` constants

### Phase 2: Core Grader

**Implement the main grading function.**

Files:
- `lib/grading/dnd-conventions-grader.ts`

Functions:
- `gradeDnDResponse(input: DnDGraderInput): Promise<DnDGraderResult>`
- Internal: `convertToConventionErrors()`
- Internal: `calculateHPDamage()`

### Phase 3: Utility Functions

**Helper functions for prioritization and formatting.**

Files:
- `lib/grading/dnd-conventions-utils.ts`

Functions:
- `prioritizeErrors(errors, maxToShow)`
- `formatFeedbackMessage(errors)`
- `getErrorSeverity(category)`
- `getCategoryPresets()`

### Phase 4: Testing

**Create test cases for the grader.**

Test scenarios:
1. Perfect text → 0 HP damage
2. Single fragment → -4 HP
3. Multiple minor errors → Sum of weights
4. 10+ errors → Capped at -10 HP
5. Different presets → Same text, different results
6. Edge cases (empty string, very long text)

### Phase 5: Game Integration

**Connect grader to game flow.**

Integration points:
- Call `gradeDnDResponse()` when player submits
- Update HP state based on `hpDamage`
- Display `prioritizedErrors` in feedback panel
- Show `feedbackSummary` to player
- Handle HP <= 0 (mission failure)

---

## Public API

### Main Function

```typescript
/**
 * Grade a D&D adventure response for convention errors.
 * Returns HP damage and prioritized feedback.
 * 
 * @example
 * const result = await gradeDnDResponse({
 *   studentResponse: "I draw my sword because the dragon looks dangerous",
 *   gradeLevel: 6,
 *   categoryPreset: 'fantasy',
 * });
 * 
 * console.log(result.hpDamage);        // -2
 * console.log(result.prioritizedErrors); // [{category: 'TYPOS', ...}]
 */
export async function gradeDnDResponse(
  input: DnDGraderInput
): Promise<DnDGraderResult>;
```

### Helper Exports

```typescript
/** Get all available category presets */
export function getCategoryPresets(): typeof GRAMMAR_CATEGORY_PRESETS;

/** Get severity tier for a category */
export function getErrorSeverity(
  category: string
): 'critical' | 'major' | 'minor' | 'style';

/** Format errors into a display-friendly message */
export function formatFeedbackMessage(
  errors: ConventionError[],
  maxErrors?: number
): string;

/** Prioritize errors by severity */
export function prioritizeErrors(
  errors: ConventionError[],
  maxToShow?: number
): ConventionError[];
```

---

## UI Display (Separate Panels)

### Story Panel (Left/Top)

Shows only the narrative continuation. No grammar feedback here.

```
┌─────────────────────────────────────────────┐
│  The cave echoes with your footsteps.       │
│  Water drips from stalactites above.        │
│                                             │
│  You see a faint light ahead...             │
│                                             │
│  > What do you do?                          │
│  [____________________________________]     │
└─────────────────────────────────────────────┘
```

### Feedback Panel (Right/Bottom)

Shows HP change and grammar feedback. Separate from narrative.

```
┌─────────────────────────────────────────────┐
│  ❤️ HP: 92/100  (-8 HP)                     │
│                                             │
│  📝 WRITING FEEDBACK                        │
│                                             │
│  🔴 FRAGMENT: "Because the cave looks       │
│     dark." is incomplete. You'll want to    │
│     add a main clause.                      │
│                                             │
│  🟡 TENSE: You switched from past tense     │
│     to present tense. Try to stay           │
│     consistent.                             │
│                                             │
│  (+2 more issues)                           │
└─────────────────────────────────────────────┘
```

---

## Next Steps

### Immediate (Implementation)

- [x] **Phase 1**: Create `dnd-conventions-types.ts` with all type definitions ✅
- [x] **Phase 1**: Create `dnd-conventions-config.ts` with presets & severity tiers ✅
- [x] **Phase 2**: Create `dnd-conventions-grader.ts` with main grading logic ✅
- [x] **Phase 3**: Create `dnd-conventions-utils.ts` with helper functions ✅
- [x] **Phase 4**: Write test cases for grader ✅
- [x] **Phase 4b**: Run tests (`npm install` then `npm run test -- --testPathPattern="dnd-conventions-grader" --no-watch`)
- [ ] **Phase 5**: Integrate with game UI

### After Core Implementation

- [ ] Test with real student responses from AlphaWrite data
- [ ] Tune HP damage weights based on playtesting
- [ ] Add D&D-specific context to GrammarGuard prompt
- [ ] Consider adding "revision" mechanic for HP recovery (future)

### Future Enhancements (Layer 2+)

- [ ] Quest-specific writing requirements (subordinating conjunctions, appositives)
- [ ] Narrative appropriateness checking (does response make sense in story?)
- [ ] Progressive difficulty (stricter categories as player advances)
- [ ] Vocabulary/Lexile tracking

---

## Related Documents

- `_docs/implementation-3/project-overview.md` - Overall project context
- `_docs/implementation-3/dnd-brainlift.md` - Full research & background
- `_alphawrite/alphawrite-2/packages/edu-core/src/grading/grammar-guard/` - Source code

---

**End of Implementation Plan**

