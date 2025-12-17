# D&D Conventions Grader - Implementation Plan

> **Status**: Planning Complete, Ready for Implementation  
> **Last Updated**: December 16, 2025  
> **Scope**: Full 3-Layer Evaluation System

---

## Overview

The D&D Grader evaluates student writing across three layers during adventure gameplay. Writing quality directly impacts HP (Hit Points) - poor writing deals damage, potentially leading to mission failure.

## Implementation Context

### Existing Codebase
This plan extends an existing Next.js + TypeScript project located at:
- Workspace: `writing-arena/demo/` (or `dnd-grader/`)
- Grading modules: `lib/grading/` or `src/lib/grading/`

### Layer 1 Already Implemented
The following files exist and should be extended (not replaced):
- `grammar-guard-prompt.ts` - LLM prompt for grammar checking
- `grammar-guard-service.ts` - Anthropic API integration
- `dnd-conventions-*.ts` - Types, config, grader, utils

### What to Build (Phases 5-10)
1. Pre-validation (`layers/pre-validation.ts`)
2. Combined prompt for all 3 layers (`layers/combined-prompt.ts`)
3. Response parser (`layers/response-parser.ts`)
4. Unified entry point (`dnd-grader.ts`)
5. Tests covering all layers

### Three-Layer Architecture

| Layer | Name | What It Checks | When to Block |
|-------|------|----------------|---------------|
| **Layer 1** | Conventions | Grammar, spelling, punctuation | Never blocks, only HP damage |
| **Layer 2** | Quest Requirements | Valid action, gibberish, off-topic | Blocks turn, requires rewrite |
| **Layer 3** | Narrative Appropriateness | Plausibility, anachronisms, physics | Blocks turn, requires rewrite |

### Core Decisions

| Decision | Choice |
|----------|--------|
| **Grading System** | Combined LLM call for all 3 layers |
| **When to Grade** | Every turn (real-time) |
| **Categories** | Layer 1: 34 grammar categories, Layer 2: 5 categories, Layer 3: 5 categories |
| **HP Calculation** | Weighted by severity tier |
| **Errors Shown** | Top 2-3 prioritized by severity |
| **Feedback Display** | Separate panel from narrative (Option A) |
| **HP Recovery** | None for now |
| **Starting HP** | 100 |
| **Pre-validation** | Programmatic checks before LLM call |

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

## Layer 2: Quest Requirements

Layer 2 catches responses that aren't valid player actions—gibberish, non-actions, off-topic responses, and inappropriate content. These **block the turn** and require a rewrite.

### Categories

```typescript
const QUEST_REQUIREMENT_CATEGORIES = {
  // BLOCKING - Player cannot proceed until fixed
  
  GIBBERISH_INPUT: {
    description: 'Random characters, keyboard mashing, nonsense words',
    examples: ['asdfghjkl', 'aaaaaaaa', 'xyzzy123!!!', 'lol haha nothing'],
    severity: 'blocking',
    feedback: "I couldn't understand your response. Please write a clear action for your character.",
  },
  
  NOT_A_PLAYER_ACTION: {
    description: 'Response describes what NPCs do, narrates events, or is not a player action',
    examples: [
      'The dragon flies away',           // Narrating NPC
      'And then the quest was complete', // Narrating story
      'The sword glows brightly',        // Describing environment
      "I'm bored",                        // Meta-commentary
    ],
    severity: 'blocking',
    feedback: "Your response should describe what YOUR character does. What action do you take?",
  },
  
  TOO_SHORT: {
    description: 'Single word or minimal responses that lack substance',
    examples: ['attack', 'yes', 'no', 'ok', 'idk'],
    minWords: 3,  // Configurable threshold
    severity: 'blocking',
    feedback: "Your response is too short. Describe your action in more detail.",
  },
  
  OFF_TOPIC: {
    description: 'Response completely unrelated to current quest or scene',
    examples: [
      'I want to play Fortnite',
      "What's for lunch?",
      'My favorite color is blue',
    ],
    severity: 'blocking',
    feedback: "Let's stay focused on the adventure! What does your character do next?",
  },
  
  INAPPROPRIATE_CONTENT: {
    description: 'Harmful, excessively violent, sexual, or otherwise inappropriate content',
    examples: [
      'I kill everyone in the village',      // Excessive violence
      'I say bad words to the merchant',     // Attempting inappropriate content
      // Actual inappropriate content not listed
    ],
    severity: 'blocking',
    feedback: "That action isn't appropriate for this adventure. Try something heroic instead!",
  },
};
```

### Pre-Validation (Before LLM)

Some Layer 2 checks can be done programmatically to save LLM calls:

```typescript
function preValidateResponse(text: string): PreValidationResult {
  // 1. Empty or whitespace only
  if (!text.trim()) {
    return { valid: false, category: 'GIBBERISH_INPUT', reason: 'empty' };
  }
  
  // 2. Too short (configurable, default 3 words)
  const words = text.trim().split(/\s+/);
  if (words.length < MIN_WORD_COUNT) {
    return { valid: false, category: 'TOO_SHORT', reason: `only ${words.length} words` };
  }
  
  // 3. Repeated characters (keyboard mashing)
  if (/(.)\1{4,}/.test(text)) {  // 5+ repeated chars
    return { valid: false, category: 'GIBBERISH_INPUT', reason: 'repeated characters' };
  }
  
  // 4. No vowels (gibberish detection)
  const alphaOnly = text.replace(/[^a-zA-Z]/g, '');
  if (alphaOnly.length > 5 && !/[aeiouAEIOU]/.test(alphaOnly)) {
    return { valid: false, category: 'GIBBERISH_INPUT', reason: 'no vowels' };
  }
  
  // 5. Duplicate of previous response
  if (isDuplicateOfPrevious(text)) {
    return { valid: false, category: 'GIBBERISH_INPUT', reason: 'duplicate' };
  }
  
  return { valid: true };
}
```

---

## Layer 3: Narrative Appropriateness

Layer 3 catches responses that are valid player actions but don't make sense within the story context. These also **block the turn** with a gentler redirect.

### Categories

```typescript
const NARRATIVE_CATEGORIES = {
  // BLOCKING - Makes no sense in context
  
  IMPOSSIBLE_ACTION: {
    description: 'Action physically impossible in the game world',
    examples: [
      'I fly to the moon',                    // No flight ability
      'I teleport to the castle',             // No teleport
      'I lift the mountain',                  // Beyond physical ability
    ],
    severity: 'blocking',
    feedback: "That action isn't possible right now. What else could your character try?",
  },
  
  ANACHRONISM: {
    description: 'Using technology/concepts that don\'t exist in fantasy setting',
    examples: [
      'I pull out my phone and call for help',
      'I drive my car to the village',
      'I check Google for directions',
      'I take a photo of the map',
    ],
    severity: 'blocking',
    feedback: "That doesn't exist in this medieval fantasy world. What would your character actually do?",
  },
  
  OUT_OF_CHARACTER: {
    description: 'Acting against established character abilities or class',
    examples: [
      'I cast a fireball' /* when playing a non-magic class */,
      'I pick the lock' /* when playing a character with no thief skills */,
    ],
    severity: 'warning',  // May just trigger reminder, not full block
    feedback: "Your character might not have that ability. Try something that fits your class!",
    requiresContext: true,  // Needs character sheet info
  },
  
  PHYSICS_BREAK: {
    description: 'Defying basic physics without magical explanation',
    examples: [
      'I walk through the wall',
      'I catch the falling boulder with one hand',
      'I jump over the 100-foot chasm',
    ],
    severity: 'blocking',
    feedback: "That would be impossible, even for a hero. What else could you try?",
  },
  
  META_GAMING: {
    description: 'Referencing game mechanics or real world inappropriately',
    examples: [
      'I roll a 20',
      'What level is this enemy?',
      'I save my game',
      'I check my inventory menu',
    ],
    severity: 'warning',  // Gentle redirect, not hard block
    feedback: "Stay in character! Describe what your character does, not game actions.",
  },
};
```

### Context-Aware Checking

Layer 3 requires game context to evaluate properly:

```typescript
type NarrativeContext = {
  // Current scene
  currentLocation: string;
  sceneDescription: string;
  availableExits: string[];
  npcsPresent: string[];
  
  // Character info (for OUT_OF_CHARACTER checks)
  characterClass?: string;
  characterAbilities?: string[];
  inventoryItems?: string[];
  
  // Quest state
  currentObjective?: string;
  questConstraints?: string[];  // e.g., "must not harm villagers"
};
```

---

## Severity Tiers

### Layer 1: Grammar Categories (34 total)

```typescript
const LAYER1_SEVERITY_TIERS = {
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

### Layer 2: Quest Requirement Categories (5 total)

```typescript
const LAYER2_SEVERITY_TIERS = {
  // BLOCKING - Turn is rejected, must rewrite (no HP damage on block)
  GIBBERISH_INPUT: 'blocking',
  NOT_A_PLAYER_ACTION: 'blocking',
  TOO_SHORT: 'blocking',
  OFF_TOPIC: 'blocking',
  INAPPROPRIATE_CONTENT: 'blocking',
};

// HP damage only applies if response passes validation
// (i.e., blocking errors don't take HP, they just require rewrite)
```

### Layer 3: Narrative Categories (5 total)

```typescript
const LAYER3_SEVERITY_TIERS = {
  // BLOCKING - Action makes no sense, must rewrite
  IMPOSSIBLE_ACTION: 'blocking',
  ANACHRONISM: 'blocking',
  PHYSICS_BREAK: 'blocking',
  
  // WARNING - Gentle redirect, slight HP penalty
  OUT_OF_CHARACTER: 'warning',  // -2 HP
  META_GAMING: 'warning',        // -1 HP
};
```

---

## HP Damage Calculation

### Weighted System (All Layers)

```typescript
const HP_DAMAGE_WEIGHTS = {
  // Layer 1: Grammar errors
  critical: -4,    // Fragments, run-ons, comma splices
  major: -2,       // Subject-verb, tense, caps, punctuation
  minor: -1,       // Typos, apostrophes, small issues
  style: -0.5,     // Style issues
  
  // Layer 2: Quest requirement violations
  blocking: 0,     // No HP damage - turn is rejected, must rewrite
  
  // Layer 3: Narrative issues
  warning: -2,     // Gentle penalty for OUT_OF_CHARACTER, META_GAMING
};

const MAX_HP_DAMAGE_PER_TURN = -10;  // Cap damage per turn
```

### Damage Flow Logic

```typescript
type DamageResult = {
  accepted: boolean;        // Was the turn accepted?
  hpDamage: number;         // HP lost (0 if rejected)
  blockingReason?: string;  // Why turn was rejected
  errors: GraderError[];    // All errors found
};

function evaluateTurn(response: string, context: GameContext): DamageResult {
  // STEP 1: Pre-validation (programmatic)
  const preCheck = preValidateResponse(response);
  if (!preCheck.valid) {
    return {
      accepted: false,
      hpDamage: 0,  // No damage on block
      blockingReason: preCheck.reason,
      errors: [{ layer: 2, category: preCheck.category }],
    };
  }
  
  // STEP 2: LLM evaluation (single call for all 3 layers)
  const llmResult = await evaluateWithLLM(response, context);
  
  // STEP 3: Check for blocking errors (Layer 2 + Layer 3)
  const blockingErrors = llmResult.errors.filter(e => 
    e.severity === 'blocking'
  );
  
  if (blockingErrors.length > 0) {
    return {
      accepted: false,
      hpDamage: 0,  // No damage on block
      blockingReason: blockingErrors[0].feedback,
      errors: llmResult.errors,
    };
  }
  
  // STEP 4: Calculate HP damage from non-blocking errors
  const hpDamage = calculateHPDamage(llmResult.errors);
  
  return {
    accepted: true,
    hpDamage: Math.max(MAX_HP_DAMAGE_PER_TURN, hpDamage),
    errors: llmResult.errors,
  };
}
```

### Example Scenarios

| Scenario | Layer | Result | HP Damage |
|----------|-------|--------|-----------|
| Clean response, good grammar | - | Accepted | 0 |
| "asdfghjkl" | L2 | **Blocked** | 0 (must rewrite) |
| "attack" (too short) | L2 | **Blocked** | 0 (must rewrite) |
| "I pull out my phone" | L3 | **Blocked** | 0 (must rewrite) |
| "I cast fireball" (not a mage) | L3 | Accepted w/warning | -2 |
| 1 sentence fragment | L1 | Accepted | -4 |
| 2 typos | L1 | Accepted | -2 |
| Fragment + 2 typos + meta-gaming | L1+L3 | Accepted | -4 + -2 + -2 = -8 |
| 5+ critical grammar errors | L1 | Accepted | -10 (capped) |

### Why Block Instead of Damage?

**Blocking** for Layer 2/3 violations instead of HP damage because:

1. **Gibberish/off-topic**: No educational value in accepting nonsense
2. **Impossible actions**: Can't continue story with "I fly to Mars"
3. **Better UX**: Clear feedback + immediate retry > silent HP drain
4. **Prevents gaming**: Can't intentionally write gibberish to "fail fast"

**Warning-only** for some Layer 3 issues (OUT_OF_CHARACTER, META_GAMING):
- Still valid player input, just needs gentle redirect
- Small HP penalty encourages staying in character
- Story can still continue

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
  /** Which category preset to use for Layer 1 */
  categoryPreset: 'strict' | 'balanced' | 'lenient' | 'fantasy';
  /** Game context for Layer 2/3 evaluation */
  gameContext: NarrativeContext;
  /** Previous responses (for duplicate detection) */
  previousResponses?: string[];
};

type NarrativeContext = {
  // Current scene
  currentLocation: string;
  sceneDescription: string;
  availableExits?: string[];
  npcsPresent?: string[];
  
  // Character info (for OUT_OF_CHARACTER checks)
  characterClass?: string;
  characterAbilities?: string[];
  inventoryItems?: string[];
  
  // Quest state
  currentObjective?: string;
  questConstraints?: string[];  // e.g., "must not harm villagers"
};
```

### Output Type

```typescript
type DnDGraderResult = {
  // Overall result
  accepted: boolean;             // Was the turn accepted?
  blockingReason?: string;       // Why turn was rejected (if blocked)
  
  // HP impact (only if accepted)
  hpDamage: number;              // Negative value: -3, -5, -10, etc. (0 if blocked)
  
  // Errors by layer
  layer1Errors: ConventionError[];    // Grammar errors
  layer2Errors: QuestError[];         // Quest requirement violations
  layer3Errors: NarrativeError[];     // Narrative appropriateness issues
  
  // All errors combined (sorted by priority)
  allErrors: GraderError[];
  
  // Errors to show (top 2-3)
  prioritizedErrors: GraderError[];
  
  // Feedback message (combined top errors)
  feedbackSummary: string;
  
  // Metadata
  gradeTimestamp: number;
  evaluationMethod: 'prevalidation' | 'llm';
};
```

### Error Types (Per Layer)

```typescript
// Base error structure
type GraderError = {
  layer: 1 | 2 | 3;
  category: string;
  explanation: string;           // Student-friendly feedback
  severity: 'blocking' | 'critical' | 'major' | 'minor' | 'style' | 'warning';
  hpDamage: number;
  displayPriority: number;
};

// Layer 1: Grammar/Convention Error
type ConventionError = GraderError & {
  layer: 1;
  substringOfInterest: string;   // The problematic text
  potentialFix?: string;         // Suggested correction
  severity: 'critical' | 'major' | 'minor' | 'style';
};

// Layer 2: Quest Requirement Error
type QuestError = GraderError & {
  layer: 2;
  severity: 'blocking';
  category: 'GIBBERISH_INPUT' | 'NOT_A_PLAYER_ACTION' | 'TOO_SHORT' | 'OFF_TOPIC' | 'INAPPROPRIATE_CONTENT';
};

// Layer 3: Narrative Error
type NarrativeError = GraderError & {
  layer: 3;
  severity: 'blocking' | 'warning';
  category: 'IMPOSSIBLE_ACTION' | 'ANACHRONISM' | 'OUT_OF_CHARACTER' | 'PHYSICS_BREAK' | 'META_GAMING';
  suggestedAlternative?: string;  // "Instead, try..."
};
```

### Game Turn Result (UI Integration)

```typescript
type GameTurnResult = {
  // Player's writing
  playerText: string;
  
  // Grading result (all 3 layers)
  gradeResult: DnDGraderResult;
  
  // HP state
  hpBefore: number;
  hpAfter: number;
  hpChange: number;
  
  // Story response (only if accepted)
  narrativeContinuation?: string;
  
  // If blocked, what to show
  blockFeedback?: string;
  
  // Timestamp
  timestamp: number;
};
```

---

## Combined LLM Evaluation

### Single-Call Architecture

Instead of 3 separate LLM calls, we use **one combined prompt** that evaluates all layers efficiently:

```typescript
async function evaluateWithLLM(
  response: string,
  context: NarrativeContext,
  gradeLevel: number,
  grammarCategories: string[]
): Promise<LLMEvaluationResult> {
  const systemPrompt = buildCombinedSystemPrompt(context, gradeLevel, grammarCategories);
  const userPrompt = `Student response: "${response}"`;
  
  const result = await callLLM({ systemPrompt, userPrompt });
  return parseCombinedResponse(result);
}
```

### Combined System Prompt Structure

```markdown
You are evaluating a student's D&D adventure response across THREE dimensions:

## CONTEXT
Location: {currentLocation}
Scene: {sceneDescription}
Character: {characterClass} with abilities: {characterAbilities}
Objective: {currentObjective}

## EVALUATION CRITERIA

### LAYER 1: Writing Conventions (Grammar)
Check for these specific issues: {grammarCategories}
[GrammarGuard instructions here...]

### LAYER 2: Quest Requirements
Check if the response is:
- A valid player action (not narration, not NPC action)
- Substantive (not single word, not gibberish)
- On-topic (related to current scene/quest)
- Appropriate (no harmful/inappropriate content)

### LAYER 3: Narrative Appropriateness
Check if the action is:
- Possible in a medieval fantasy world (no modern tech)
- Physically plausible (no impossible feats without magic)
- Within character capabilities (matches class/abilities)
- In-character (not meta-gaming or breaking 4th wall)

## OUTPUT FORMAT
Return JSON with structure:
{
  "layer1": {
    "errors": [{ "category": "...", "explanation": "...", "substring": "...", "fix": "..." }]
  },
  "layer2": {
    "valid": true/false,
    "error": { "category": "...", "explanation": "..." } | null
  },
  "layer3": {
    "errors": [{ "category": "...", "explanation": "...", "suggestion": "..." }]
  }
}
```

### Response Parsing

```typescript
function parseCombinedResponse(llmOutput: string): LLMEvaluationResult {
  const parsed = JSON.parse(llmOutput);
  
  return {
    layer1Errors: parsed.layer1.errors.map(e => ({
      layer: 1,
      category: e.category,
      explanation: e.explanation,
      substringOfInterest: e.substring,
      potentialFix: e.fix,
      severity: LAYER1_SEVERITY_TIERS[e.category],
      hpDamage: HP_DAMAGE_WEIGHTS[LAYER1_SEVERITY_TIERS[e.category]],
    })),
    
    layer2Error: parsed.layer2.valid ? null : {
      layer: 2,
      category: parsed.layer2.error.category,
      explanation: parsed.layer2.error.explanation,
      severity: 'blocking',
      hpDamage: 0,
    },
    
    layer3Errors: parsed.layer3.errors.map(e => ({
      layer: 3,
      category: e.category,
      explanation: e.explanation,
      suggestedAlternative: e.suggestion,
      severity: LAYER3_SEVERITY_TIERS[e.category],
      hpDamage: HP_DAMAGE_WEIGHTS[LAYER3_SEVERITY_TIERS[e.category]],
    })),
  };
}
```

### Benefits of Combined Call

1. **Latency**: 1 LLM call instead of 3 (~500ms vs ~1500ms)
2. **Cost**: Shared context, less token overhead
3. **Consistency**: LLM sees full picture, better judgment calls
4. **Context**: Grammar checking can consider narrative context (e.g., intentional dialect)

---

## File Structure

```
lib/grading/
├── dnd-grader.ts                  # Main entry point
├── dnd-grader-types.ts            # All TypeScript types
├── dnd-grader-config.ts           # Presets & severity tiers (all layers)
├── dnd-grader-utils.ts            # Helper functions
├── layers/
│   ├── pre-validation.ts          # Layer 2 programmatic checks
│   ├── combined-prompt.ts         # Combined LLM prompt builder
│   └── response-parser.ts         # Parse LLM response
└── grammar-guard/
    ├── grammar-guard-prompt.ts    # Ported from AlphaWrite
    └── grammar-guard-examples.json # Few-shot examples
```

---

## Implementation Phases

### Phase 1: Types & Configuration ✅ (Layer 1 Complete)

**Create type definitions and configuration constants.**

Files:
- `lib/grading/dnd-conventions-types.ts` ✅
- `lib/grading/dnd-conventions-config.ts` ✅

Contents:
- All TypeScript types (`DnDGraderInput`, `DnDGraderResult`, `ConventionError`)
- `GRAMMAR_CATEGORY_PRESETS` object
- `ERROR_SEVERITY_TIERS` mapping
- `HP_DAMAGE_WEIGHTS` constants

### Phase 2: Core Grader (Layer 1) ✅

**Implement the main grading function for grammar.**

Files:
- `lib/grading/dnd-conventions-grader.ts` ✅

Functions:
- `gradeDnDResponse(input: DnDGraderInput): Promise<DnDGraderResult>`
- Internal: `convertToConventionErrors()`
- Internal: `calculateHPDamage()`

### Phase 3: Utility Functions ✅

**Helper functions for prioritization and formatting.**

Files:
- `lib/grading/dnd-conventions-utils.ts` ✅

Functions:
- `prioritizeErrors(errors, maxToShow)`
- `formatFeedbackMessage(errors)`
- `getErrorSeverity(category)`
- `getCategoryPresets()`

### Phase 4: Testing (Layer 1) ✅

**Create test cases for the grader.**

Test scenarios:
1. Perfect text → 0 HP damage ✅
2. Single fragment → -4 HP ✅
3. Multiple minor errors → Sum of weights ✅
4. 10+ errors → Capped at -10 HP ✅
5. Different presets → Same text, different results ✅
6. Edge cases (empty string, very long text) ✅

### Phase 5: Pre-Validation (Layer 2 Fast Path) 🔲 NEW

**Implement programmatic checks that run before LLM.**

Files:
- `lib/grading/layers/pre-validation.ts`

Functions:
- `preValidateResponse(text, previousResponses)`
  - Empty/whitespace check
  - Minimum word count (default: 3)
  - Repeated character detection
  - No vowels detection (gibberish)
  - Duplicate response detection

### Phase 6: Combined LLM Prompt 🔲 NEW

**Build the unified prompt for all 3 layers.**

Files:
- `lib/grading/layers/combined-prompt.ts`

Functions:
- `buildCombinedSystemPrompt(context, gradeLevel, grammarCategories)`
- `buildUserPrompt(studentResponse)`

### Phase 7: Response Parser 🔲 NEW

**Parse the combined LLM response into structured errors.**

Files:
- `lib/grading/layers/response-parser.ts`

Functions:
- `parseCombinedResponse(llmOutput)`
- `validateLLMResponse(parsed)` (schema validation)

### Phase 8: Unified Grader 🔲 NEW

**Main entry point combining all layers.**

Files:
- `lib/grading/dnd-grader.ts`

Functions:
- `gradeDnDTurn(input: DnDGraderInput): Promise<DnDGraderResult>`
  1. Run pre-validation
  2. If failed, return blocking result
  3. Call LLM with combined prompt
  4. Parse response
  5. Check for blocking errors (Layer 2/3)
  6. Calculate HP damage
  7. Return result

### Phase 9: Testing (Full 3-Layer) 🔲 NEW

**Test cases for all layers together.**

Test scenarios:
1. Gibberish input → Blocked (pre-validation)
2. Too short → Blocked (pre-validation)
3. "The dragon flies away" → Blocked (NOT_A_PLAYER_ACTION)
4. "I pull out my phone" → Blocked (ANACHRONISM)
5. "I fly to the moon" → Blocked (IMPOSSIBLE_ACTION)
6. "I cast fireball" as warrior → Warning + -2 HP (OUT_OF_CHARACTER)
7. "I roll a 20" → Warning + -1 HP (META_GAMING)
8. Clean response with typo → Accepted, -1 HP
9. Multiple layer violations → Most severe shown first

### Phase 10: Game Integration 🔲

**Connect grader to game flow.**

Integration points:
- Call `gradeDnDTurn()` when player submits
- If blocked: Show `blockingReason`, don't advance story
- If accepted: Update HP, continue narrative
- Display `prioritizedErrors` in feedback panel
- Handle HP <= 0 (mission failure)

---

## Public API

### Main Function (3-Layer)

```typescript
/**
 * Grade a D&D adventure response across all 3 layers.
 * Returns whether turn is accepted, HP damage, and prioritized feedback.
 * 
 * @example
 * const result = await gradeDnDTurn({
 *   studentResponse: "I draw my sword and approach the dragon carefully.",
 *   gradeLevel: 6,
 *   categoryPreset: 'fantasy',
 *   gameContext: {
 *     currentLocation: "Dragon's Lair",
 *     sceneDescription: "A massive red dragon blocks your path...",
 *     characterClass: "Warrior",
 *     characterAbilities: ["sword fighting", "shield block"],
 *   },
 * });
 * 
 * if (result.accepted) {
 *   console.log('HP damage:', result.hpDamage);  // -2
 *   // Continue with narrative
 * } else {
 *   console.log('Blocked:', result.blockingReason);
 *   // Prompt for rewrite
 * }
 */
export async function gradeDnDTurn(
  input: DnDGraderInput
): Promise<DnDGraderResult>;
```

### Layer 1 Only (Legacy/Testing)

```typescript
/**
 * Grade for conventions only (Layer 1).
 * Use gradeDnDTurn for full 3-layer evaluation.
 */
export async function gradeDnDResponse(
  input: Omit<DnDGraderInput, 'gameContext'>
): Promise<DnDGraderResult>;
```

### Helper Exports

```typescript
/** Run pre-validation checks (Layer 2 fast path) */
export function preValidateResponse(
  text: string,
  previousResponses?: string[]
): PreValidationResult;

/** Get all available category presets for Layer 1 */
export function getCategoryPresets(): typeof GRAMMAR_CATEGORY_PRESETS;

/** Get severity tier for any category (all layers) */
export function getErrorSeverity(
  category: string,
  layer?: 1 | 2 | 3
): 'blocking' | 'critical' | 'major' | 'minor' | 'style' | 'warning';

/** Format errors into a display-friendly message */
export function formatFeedbackMessage(
  errors: GraderError[],
  maxErrors?: number
): string;

/** Prioritize errors by severity (all layers) */
export function prioritizeErrors(
  errors: GraderError[],
  maxToShow?: number
): GraderError[];

/** Check if any error is blocking */
export function hasBlockingErrors(errors: GraderError[]): boolean;
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

### Feedback Panel - Turn Accepted (HP Damage)

Shows HP change and grammar feedback when turn is accepted.

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

### Feedback Panel - Turn Blocked (Requires Rewrite)

Shows blocking reason when turn cannot proceed.

```
┌─────────────────────────────────────────────┐
│  ⚠️ HOLD ON!                                │
│                                             │
│  Your response can't be used right now.     │
│                                             │
│  ❌ "I pull out my phone and call for       │
│      backup"                                │
│                                             │
│  Phones don't exist in this medieval        │
│  fantasy world! What would your character   │
│  actually do?                               │
│                                             │
│  💡 Try: "I call out to my companions for   │
│     help" or "I blow my signal horn"        │
│                                             │
│  [Try Again]                                │
└─────────────────────────────────────────────┘
```

### Feedback Panel - Gibberish Blocked

```
┌─────────────────────────────────────────────┐
│  ❌ INVALID INPUT                           │
│                                             │
│  I couldn't understand your response.       │
│                                             │
│  Please write a clear action describing     │
│  what your character does next.             │
│                                             │
│  💡 Example: "I carefully search the        │
│     room for hidden passages."              │
│                                             │
│  [Try Again]                                │
└─────────────────────────────────────────────┘
```

### Feedback Panel - Warning (Minor Narrative Issue)

Shows warning but still accepts the turn with HP penalty.

```
┌─────────────────────────────────────────────┐
│  ❤️ HP: 96/100  (-4 HP)                     │
│                                             │
│  ⚡ NARRATIVE NOTE                          │
│                                             │
│  🟠 "I cast a fireball" - Your character    │
│     is a Warrior, not a Mage. That spell    │
│     might not work as expected!             │
│                                             │
│  📝 WRITING FEEDBACK                        │
│                                             │
│  🟡 TYPO: "firebll" should be "fireball"    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Next Steps

### Layer 1 (Complete) ✅

- [x] **Phase 1**: Create `dnd-conventions-types.ts` with all type definitions
- [x] **Phase 1**: Create `dnd-conventions-config.ts` with presets & severity tiers
- [x] **Phase 2**: Create `dnd-conventions-grader.ts` with main grading logic
- [x] **Phase 3**: Create `dnd-conventions-utils.ts` with helper functions
- [x] **Phase 4**: Write test cases for grader
- [x] **Phase 4b**: Run tests and verify

### Layer 2 + 3 (Next Up)

- [ ] **Phase 5**: Implement `pre-validation.ts` for programmatic checks
- [ ] **Phase 6**: Build `combined-prompt.ts` for unified LLM evaluation
- [ ] **Phase 7**: Create `response-parser.ts` to parse LLM output
- [ ] **Phase 8**: Build unified `dnd-grader.ts` entry point
- [ ] **Phase 9**: Write comprehensive tests for all 3 layers

### Game Integration

- [ ] **Phase 10**: Connect grader to game UI flow
- [ ] Handle blocking responses (show feedback, require rewrite)
- [ ] Update HP state and display
- [ ] Handle HP <= 0 (mission failure state)

### After Core Implementation

- [ ] Test with real student responses from AlphaWrite data
- [ ] Tune HP damage weights based on playtesting
- [ ] Add character-specific context for OUT_OF_CHARACTER detection
- [ ] Consider adding "revision" mechanic for HP recovery

### Future Enhancements

- [ ] Quest-specific writing requirements (subordinating conjunctions, appositives)
- [ ] Progressive difficulty (stricter categories as player advances)
- [ ] Vocabulary/Lexile tracking
- [ ] Achievement system for good writing streaks

---

## Complete Category Reference

### Layer 1: Grammar/Conventions (34 categories)

| Category | Severity | HP Damage | Example |
|----------|----------|-----------|---------|
| **Critical (4)** |
| SENTENCE_FRAGMENT | critical | -4 | "Because the dragon." |
| RUN_ON_SENTENCE | critical | -4 | "I run the dragon chases me" |
| COMMA_SPLICE | critical | -4 | "I ran, the dragon followed" |
| UNFINISHED_THOUGHT | critical | -4 | "I was going to but then" |
| **Major (12)** |
| SUBJECT_VERB_AGREEMENT | major | -2 | "The warriors runs" |
| TENSE_CONSISTENCY | major | -2 | "I walked then I run" |
| CAPITALIZATION_ERROR | major | -2 | "i cast a spell" |
| PUNCTUATION | major | -2 | Missing period |
| VERB_FORM_ERROR | major | -2 | "I have went" |
| MISPLACED_MODIFIER | major | -2 | "Flying quickly, the tree..." |
| DANGLING_MODIFIER | major | -2 | "Walking home, the rain..." |
| PARALLELISM_ERROR | major | -2 | "I like to run and swimming" |
| HOMOPHONE_ERROR | major | -2 | "their/there/they're" |
| CONFUSED_WORDS | major | -2 | "effect/affect" |
| WORD_ORDER_ERROR | major | -2 | "I slowly the potion drank" |
| DOUBLE_NEGATIVE | major | -2 | "I don't have no sword" |
| **Minor (12)** |
| TYPOS | minor | -1 | "swrod" for "sword" |
| APOSTROPHE_ERROR | minor | -1 | "its/it's" |
| QUOTATION_ERROR | minor | -1 | Missing closing quote |
| COLON_SEMICOLON_ERROR | minor | -1 | Incorrect ; usage |
| SPACING_ERROR | minor | -1 | Double spaces |
| ARTICLE_USAGE | minor | -1 | "a apple" |
| PREPOSITION_ERROR | minor | -1 | "depend of" |
| PLURALIZATION_ERROR | minor | -1 | "two sword" |
| WORD_USAGE_ERROR | minor | -1 | "literally" misuse |
| PUNCTUATION_IN_LISTS | minor | -1 | "apples oranges" |
| COMPARISON_ERROR | minor | -1 | "more better" |
| AMBIGUOUS_REFERENCE | minor | -1 | "he said to him that he..." |
| FACTUAL_ERROR | minor | -1 | (lenient in fantasy) |
| **Style (11)** |
| CASING | style | -0.5 | "SUDDENLY the dragon" |
| PASSIVE_VOICE_OVERUSE | style | -0.5 | Excessive passive voice |
| AWKWARD_PHRASING | style | -0.5 | Hard to read sentence |
| CLICHÉ_USAGE | style | -0.5 | "It was a dark and stormy" |
| VERBOSITY | style | -0.5 | Too many words |
| REDUNDANCY | style | -0.5 | "I retreated back" |
| REPETITIONS | style | -0.5 | Same word repeated |
| INCONSISTENT_TONE | style | -0.5 | Switching formal/informal |
| FORMATTING_ERROR | style | -0.5 | Weird formatting |
| MISC_GRAMMAR | style | -0.5 | Other issues |
| COMPOUNDING | style | -0.5 | "fire ball" vs "fireball" |

### Layer 2: Quest Requirements (5 categories)

| Category | Severity | Result | Example |
|----------|----------|--------|---------|
| GIBBERISH_INPUT | blocking | Turn rejected | "asdfghjkl" |
| NOT_A_PLAYER_ACTION | blocking | Turn rejected | "The dragon flies away" |
| TOO_SHORT | blocking | Turn rejected | "attack" |
| OFF_TOPIC | blocking | Turn rejected | "What's for lunch?" |
| INAPPROPRIATE_CONTENT | blocking | Turn rejected | Harmful content |

### Layer 3: Narrative Appropriateness (5 categories)

| Category | Severity | HP Damage | Example |
|----------|----------|-----------|---------|
| IMPOSSIBLE_ACTION | blocking | 0 (rejected) | "I fly to the moon" |
| ANACHRONISM | blocking | 0 (rejected) | "I pull out my phone" |
| PHYSICS_BREAK | blocking | 0 (rejected) | "I lift the mountain" |
| OUT_OF_CHARACTER | warning | -2 | "I cast fireball" (as warrior) |
| META_GAMING | warning | -1 | "I roll a 20" |

### Summary

| Layer | Categories | Blocking | HP Damage Range |
|-------|------------|----------|-----------------|
| Layer 1 (Grammar) | 34 | No | -0.5 to -4 per error |
| Layer 2 (Quest) | 5 | Yes | 0 (must rewrite) |
| Layer 3 (Narrative) | 5 | 3 block, 2 warn | 0 to -2 |
| **Total** | **44** | | **Max -10 per turn** |

---

## Related Documents

- `_docs/implementation-3/project-overview.md` - Overall project context
- `_docs/implementation-3/dnd-brainlift.md` - Full research & background
- `_alphawrite/alphawrite-2/packages/edu-core/src/grading/grammar-guard/` - GrammarGuard source

---

**End of Implementation Plan**

