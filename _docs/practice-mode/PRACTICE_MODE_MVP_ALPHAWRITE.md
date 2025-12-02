# Practice Mode MVP — AlphaWrite Integration

**Version**: 1.0  
**Started**: December 1, 2024  
**Target**: Demo-ready in 1-2 days  
**Philosophy**: Extract proven content from AlphaWrite instead of building from scratch

---

## ✅ Decisions Complete

See [PRACTICE_MODE_DECISIONS.md](./PRACTICE_MODE_DECISIONS.md) for full rationale.

**Key decisions:**
- ✅ Phase 2: Pre-generated AI examples (from AlphaWrite test data)
- ✅ Mastery: Binary (90%+ = ★ mastered, <90% = ☆ not)
- ✅ LP: Score-based, but mastered lessons don't give LP
- ✅ Score tracking: Best score (can't lose mastery in MVP)
- ✅ **Grading: Extract AlphaWrite grader configs + use Claude Sonnet 4**

---

## 🎯 MVP Scope

| What's In | What's Deferred |
|-----------|-----------------|
| 2 lessons (Because/But/So, Appositive) | Other 13 lessons |
| Full 3-phase flow (Write → Review → Revise) | Historical review pool |
| Binary mastery (★/☆ per lesson) | Gap detection from ranked |
| Category mastery progress display | "Sentence Pro" badge |
| Score-based LP (mastered = no LP) | LP re-open via gap detection |
| **AlphaWrite grader configs** | Custom content creation |
| **AlphaWrite test cases for validation** | - |
| Reuse existing `sessions` collection | New Firestore collections |
| Solo practice (no opponents) | - |

---

## 📋 Phase 0: Extract AlphaWrite Content

### Source Files Location

```
_alphawrite/alphawrite-2/packages/edu-core/src/
├── activities/
│   ├── 11-basic-conjunctions/
│   │   ├── grader.config.ts        ← Grading rules, examples, feedback
│   │   └── evals/test-data.ts      ← Test cases
│   ├── 12-identify-appositives/
│   │   ├── grader.config.ts
│   │   └── evals/test-data.ts
│   └── 13-write-appositives/
│       ├── grader.config.ts
│       └── evals/test-data.ts
└── grading/
    └── adaptive-grader/
        ├── prompt.ts               ← System prompt builder
        ├── types.ts                ← Response schemas
        └── global-config.ts        ← Grade-level adjustments
```

### Lesson 1: Because/But/So

**Source**: `11-basic-conjunctions/grader.config.ts`

- [x] Copy `grader.config.ts` to `lib/constants/grader-configs/basic-conjunctions.ts`
- [x] Extract positive/negative examples for UI display
- [x] Extract grading principles for evaluation prompt
- [x] Copy test cases from `evals/test-data.ts` for validation

**Expected config structure:**
```typescript
{
  nameOfActivity: 'Because, But, So',
  goalForThisExercise: {
    primaryGoal: "...",
    secondaryGoals: ["..."],
  },
  howTheActivityWorks: "Students complete a sentence stem ending with 'because', 'but', or 'so'.",
  importantPrinciplesForGrading: [
    "'because' must explain why something is true",
    "'but' must show a clear change of direction or contrast",
    "'so' must connect to a logical consequence",
  ],
  positiveExamples: [...],
  negativeExamples: [...],
  feedbackPromptOverrides: {...},
}
```

### Lesson 2: Appositive

**Sources**: 
- `13-write-appositives/new-graders/word/grader.config.ts` (production)

- [x] Copy grader config → `lib/constants/grader-configs/write-appositives.ts`
- [x] Decision: Using write activity for MVP
- [x] Extract examples for UI
- [x] Copy test cases for validation

### Prompt Variations ✅

- [x] Created 6 prompts for Because/But/So in `lib/constants/practice-lessons.ts`
- [x] Created 5 prompts for Appositives in `lib/constants/practice-lessons.ts`

### Phase 2 AI Examples ✅

- [x] Created 6 examples for Because/But/So (3 correct, 3 incorrect)
- [x] Created 5 examples for Appositives (3 correct, 2 incorrect)
- [x] Stored in `lib/constants/practice-examples.ts`

---

## 📋 Phase 1: Types & Constants ✅

### Types (Added to existing)

- [x] Extended `SessionConfig` in `lib/types/session.ts`:
  ```typescript
  lessonId?: string;
  lessonCategory?: 'sentence' | 'paragraph' | 'essay';
  ```
- [x] Extended `GameSession` with `practiceResult`:
  ```typescript
  practiceResult?: { lessonId: string; score: number; mastered: boolean; };
  ```
- [x] Added `LessonMasteryStatus` interface to `lib/types/index.ts`
- [x] Extended `UserProfile` with `practiceMastery` map

### Constants

- [x] Created `lib/constants/practice-lessons.ts`:
  - [x] `PRACTICE_LESSONS` — 2 available + 5 coming-soon
  - [x] `PRACTICE_LP_REWARDS` — score-to-LP mapping
  - [x] `PRACTICE_PHASE_DURATIONS` — { phase1: 3, phase2: 1, phase3: 2 }
  - [x] `MASTERY_THRESHOLD` = 90
  - [x] Helper functions: `calculatePracticeLP`, `checkMastery`, `getAvailableLessons`, `getLesson`, `getRandomPrompt`
- [x] Created `lib/constants/grader-configs/`:
  - [x] `types.ts` — `ActivityGraderConfig`, `GradingResult`, `GradingRemark`
  - [x] `basic-conjunctions.ts` — 5 positive, 2 negative examples, 4 common mistakes
  - [x] `write-appositives.ts` — 5 positive, 1 negative examples, 2 common mistakes
  - [x] `index.ts` — exports + `getGraderConfig(lessonId)`
- [x] Created `lib/constants/practice-examples.ts`:
  - [x] `PHASE2_EXAMPLES` — 6 per lesson for review phase
  - [x] `getPhase2Examples(lessonId)`, `getRandomPhase2Examples(lessonId, count)`

---

## 📋 Phase 2: Services ✅

### Mastery Service

- [x] Created `lib/services/practice-mastery.ts`:
  - [x] `updateMastery(uid, lessonId, score)` — updates on any attempt, tracks best/last score
  - [x] `isMastered(uid, lessonId)` — returns boolean
  - [x] `getUserMasteryStatus(uid)` — returns all lesson statuses
  - [x] `getLessonMasteryStatus(uid, lessonId)` — returns single lesson
  - [x] `canEarnLP(uid, lessonId)` — false if already mastered
  - [x] `calculateLPForSession(uid, lessonId, score)` — returns LP earned
  - [x] `getCategoryMasteryProgress(uid, category, lessonIds)` — e.g., "2/5 mastered"

### Modify Existing Services

- [x] Added to `lib/services/user-profile.ts`:
  - [x] `updateUserStatsAfterPractice(uid, lpChange, wordCount)` — LP only, no XP/points
- [x] Reuse `lib/services/writing-sessions.ts`:
  - [x] `saveWritingSession()` works as-is (mode: 'practice')

### LP Calculation

- [x] Already in `lib/constants/practice-lessons.ts`:
  - [x] `calculatePracticeLP(score, isMastered)` — returns 0 if mastered
  - [x] `checkMastery(score)` — returns score >= 90

---

## 📋 Phase 3: Hooks ✅

- [x] Created `lib/hooks/usePracticeLesson.ts`:
  - [x] `usePracticeLesson(lessonId)` — returns lesson, prompt, phase state, timer
  - [x] Actions: `startSession()`, `nextPhase()`, `pauseTimer()`, `resumeTimer()`, `resetSession()`
  - [x] Helpers: `formatTimeRemaining()`, `getPhaseName()`, `getDefaultPhaseDuration()`
- [x] Created `lib/hooks/usePracticeMastery.ts`:
  - [x] `usePracticeMastery()` — all lessons: masteryStatus, checkLessonMastery, getBestScore
  - [x] `useLessonMastery(lessonId)` — single lesson: status, recordAttempt(score)
  - [x] Helper: `getCategoryMasterySummary(masteryStatus, category)`

---

## 📋 Phase 4: UI Components ✅

### Lesson Selection (Landing)

- [x] Create `components/practice/LessonCard.tsx`:
  - [x] Lesson title, category, duration
  - [x] Mastery indicator (★ mastered / ☆ not)
  - [x] "LP Available" badge (if not mastered)
  - [x] Best score display
  - [x] "Start" button
- [x] Modify `components/practice/PracticeLanding.tsx`:
  - [x] Show available lessons (2 for MVP)
  - [x] Category sections (Sentence / Paragraph / Essay)
  - [x] Show "Coming soon" for other lessons
  - [x] Category mastery progress

### Session Components

- [x] Create `components/practice/PracticeSessionContent.tsx`:
  - [x] Adapt from `WritingSessionContent.tsx`
  - [x] Shorter phase durations (3/1/2 min)
  - [x] No AI opponents (solo mode)
  - [x] Example sidebar (from AlphaWrite examples)
- [x] Create `components/practice/ExampleSidebar.tsx`:
  - [x] Show annotated example (from grader config)
  - [x] Toggle show/hide
- [x] Create `components/practice/SkillFocusBanner.tsx`:
  - [x] Current skill name
  - [x] Goal description (from grader config)

### Phase 2 (Review Pre-generated Examples)

- [x] Create `components/practice/PracticeReviewPhase.tsx`:
  - [x] Display pre-generated AI example (from AlphaWrite test data)
  - [x] Quick feedback form
  - [x] Timer (1 min)

### Results

- [x] Create `components/practice/PracticeResultsContent.tsx`:
  - [x] Phase scores breakdown
  - [x] Composite score
  - [x] Mastery status (★ Mastered! / Keep practicing)
  - [x] LP earned (or "Already mastered - no LP")
  - [x] Best score update notification
- [x] Create `components/practice/MasteryDisplay.tsx`:
  - [x] ★ filled if mastered, ☆ empty if not
  - [x] "First time mastered!" celebration

---

## 📋 Phase 5: Pages & Routes ✅

- [x] Modify `app/practice/page.tsx`:
  - [x] Render updated `PracticeLanding` with lesson cards
- [x] Create `app/practice/[lessonId]/page.tsx`:
  - [x] Lesson entry/start screen
  - [x] Show mastery status, best score, LP availability
- [x] Create `app/practice/[lessonId]/session/page.tsx`:
  - [x] 3-phase session flow
- [x] Create `app/practice/[lessonId]/results/page.tsx`:
  - [x] Results with mastery display

---

## 📋 Phase 6: AlphaWrite-Style Grading API

### Overview

Use Claude Sonnet 4 with AlphaWrite's grader config pattern:

```
┌─────────────────────────────────────────────────────┐
│  Student Submission                                   │
│         ↓                                            │
│  ┌──────────────┐    ┌──────────────┐              │
│  │ Grader       │ → │ Prompt       │              │
│  │ Config       │    │ Builder      │              │
│  │ (AlphaWrite) │    └──────────────┘              │
│  └──────────────┘           ↓                       │
│                      ┌──────────────┐              │
│                      │ Claude       │              │
│                      │ Sonnet 4     │              │
│                      └──────────────┘              │
│                             ↓                       │
│                      { isCorrect, remarks, score }  │
└─────────────────────────────────────────────────────┘
```

### Evaluation Endpoint ✅

- [x] Created `/api/evaluate-practice/route.ts`:
  - [x] Accept: `{ lessonId, question, studentAnswer, grade? }`
  - [x] Load grader config by lessonId
  - [x] Build system prompt from config
  - [x] Call Claude Sonnet 4 with structured output (tool use)
  - [x] Return: `{ isCorrect, score, remarks, solution }`
  - [x] **Tested and working!**

### Grading Implementation

**Implementation**: See `lib/grading/practice-grader.ts`

```typescript
// Usage example
const result = await gradePracticeSubmission({
  lessonId: 'basic-conjunctions',
  question: 'The dog barked loudly because _____',
  studentAnswer: 'it saw the mailman coming.',
  grade: 9,  // Default is grade 9 for middle/high school
});

// Result:
// { isCorrect: true, score: 100, remarks: [], solution: '' }
```

### System Prompt Builder ✅

- [x] Created `lib/grading/prompt-builder.ts`:
  - [x] `buildSystemPrompt(config, grade)` — full TWR-style prompt
  - [x] `buildUserPrompt(question, studentAnswer, questionLabel)`
  - [x] Includes positive/negative examples, grading principles
  - [x] **Grade levels adjusted for 7-12** (Level 1: 7-9, Level 2: 10-12)

---

## 📊 Progress Tracker

| Phase | Items | Status |
|-------|-------|--------|
| Phase 0: Extract Content | 6 | ✅ Complete |
| Phase 1: Types | 6 | ✅ Complete |
| Phase 2: Services | 6 | ✅ Complete |
| Phase 3: Hooks | 2 | ✅ Complete |
| Phase 4: UI | 9 | ✅ Complete |
| Phase 5: Pages | 4 | ✅ Complete |
| Phase 6: Grading API | 3 | ✅ Complete |
| **Total** | **~36 items** | ✅ **All Complete** |

---

## 🔄 MVP → Full Version Path

When MVP is done, adding more lessons is straightforward:

1. **Add more lessons** → Extract more grader configs from AlphaWrite
2. **Activities available in AlphaWrite:**
   - Subordinating Conjunctions → `14-subordinating-conjunctions/`
   - Kernel Expansion → `16-kernel-expansion/`
   - Fragment or Sentence → `02-fragment-or-sentence/`
   - Topic Sentence → `19-identify-topic-sentence/`
   - Transition Words → `31-using-transition-words/`

3. **Add category mastery badges** → Query all lessons in category
4. **Add gap detection** → Hook into ranked results

**No refactoring needed** — MVP architecture scales directly with more AlphaWrite configs.

---

## 📝 AlphaWrite Source Reference

### Grader Config Files to Extract

| Lesson | AlphaWrite Path | Priority |
|--------|-----------------|----------|
| Because/But/So | `activities/11-basic-conjunctions/grader.config.ts` | MVP |
| Identify Appositives | `activities/12-identify-appositives/grader.config.ts` | MVP |
| Write Appositives | `activities/13-write-appositives/grader.config.ts` | MVP |
| Subordinating Conjunctions | `activities/14-subordinating-conjunctions/grader.config.ts` | V1 |
| Kernel Expansion | `activities/16-kernel-expansion/grader.config.ts` | V1 |
| Fragment or Sentence | `activities/02-fragment-or-sentence/grader.config.ts` | V1 |
| Topic Sentence | `activities/19-identify-topic-sentence/grader.config.ts` | V1 |
| Transition Words | `activities/31-using-transition-words/grader.config.ts` | V1 |

### Core Grading Infrastructure

| File | Purpose |
|------|---------|
| `grading/adaptive-grader/prompt.ts` | Reference for prompt construction |
| `grading/adaptive-grader/types.ts` | Response schemas |
| `grading/adaptive-grader/global-config.ts` | Grade-level adjustments |

### Test Data for Validation

| Activity | Test Data Path |
|----------|----------------|
| Because/But/So | `activities/11-basic-conjunctions/evals/test-data.ts` |
| Appositives | `activities/12-identify-appositives/evals/test-data.ts` |
| Write Appositives | `activities/13-write-appositives/evals/test-data.ts` |

---

## 💰 Cost Estimation

| Model | Input | Output | Est. Cost per Grading |
|-------|-------|--------|----------------------|
| Claude Sonnet 4 | $3/1M tokens | $15/1M tokens | ~$0.01-0.03 |

Typical grading call: ~1,500 input tokens, ~300 output tokens.

**Per practice session (3 phases):**
- Phase 1 (Write): 1 grading call
- Phase 2 (Review): 0 calls (pre-generated)
- Phase 3 (Revise): 1 grading call
- **Total: ~$0.02-0.06 per session**

---

## ✅ Why This Approach

| Factor | Build from Scratch | Extract from AlphaWrite |
|--------|-------------------|------------------------|
| Content creation | High effort | Copy/paste |
| Grading quality | Untested | Battle-tested |
| Feedback quality | Must design | Ready to use |
| Test coverage | Must write | Already exists |
| Time to MVP | 3-4 days | 1-2 days |
| Maintenance | You own it | Based on proven patterns |

---

## 📁 Files Created (Backend Complete)

### Constants (`lib/constants/`)
| File | Purpose |
|------|---------|
| `grader-configs/types.ts` | `ActivityGraderConfig`, `GradingResult` interfaces |
| `grader-configs/basic-conjunctions.ts` | Because/But/So grading config |
| `grader-configs/write-appositives.ts` | Appositive grading config |
| `grader-configs/index.ts` | Exports + `getGraderConfig(lessonId)` |
| `practice-lessons.ts` | Lesson definitions, prompts, LP rewards, mastery threshold |
| `practice-examples.ts` | Phase 2 review examples |

### Grading (`lib/grading/`)
| File | Purpose |
|------|---------|
| `prompt-builder.ts` | `buildSystemPrompt()`, `buildUserPrompt()` |
| `practice-grader.ts` | `gradePracticeSubmission()` — Claude Sonnet 4 |

### Services (`lib/services/`)
| File | Purpose |
|------|---------|
| `practice-mastery.ts` | Mastery tracking: `updateMastery`, `isMastered`, etc. |
| `user-profile.ts` | Added `updateUserStatsAfterPractice()` |

### Hooks (`lib/hooks/`)
| File | Purpose |
|------|---------|
| `usePracticeLesson.ts` | Lesson state, timer, phase management |
| `usePracticeMastery.ts` | Mastery state, `recordAttempt()` |

### Types (`lib/types/`)
| File | Changes |
|------|---------|
| `session.ts` | Added `lessonId`, `lessonCategory`, `practiceResult` |
| `index.ts` | Added `LessonMasteryStatus`, `practiceMastery` field |

### API (`app/api/`)
| File | Purpose |
|------|---------|
| `evaluate-practice/route.ts` | POST endpoint for grading submissions |

### Components (`components/practice/`)
| File | Purpose |
|------|---------|
| `MasteryDisplay.tsx` | Star-based mastery indicator (★/☆) |
| `LessonCard.tsx` | Lesson card with mastery status |
| `PracticeLanding.tsx` | Landing page with lesson selection |
| `SkillFocusBanner.tsx` | Skill name and goal display |
| `ExampleSidebar.tsx` | Annotated examples from grader config |
| `PracticeReviewPhase.tsx` | Phase 2 review component |
| `PracticeSessionContent.tsx` | Main 3-phase session flow |
| `PracticeResultsContent.tsx` | Results with mastery display |

### Pages (`app/practice/`)
| File | Purpose |
|------|---------|
| `page.tsx` | Landing page (renders PracticeLanding) |
| `[lessonId]/page.tsx` | Lesson entry/start screen |
| `[lessonId]/session/page.tsx` | 3-phase session flow |
| `[lessonId]/results/page.tsx` | Results with mastery |

---

## References

- [AlphaWrite Integration Analysis](../curriculum/alphawrite/alphawrite-integration-analysis.md)
- [Grader Extraction Guide](../curriculum/alphawrite/grader-extraction-guide.md)
- [Practice Mode Decisions](./PRACTICE_MODE_DECISIONS.md)

