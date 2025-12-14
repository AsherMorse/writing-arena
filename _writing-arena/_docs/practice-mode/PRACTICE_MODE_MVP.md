# Practice Mode MVP Checklist

**Version**: 1.1  
**Started**: November 30, 2024  
**Target**: Demo-ready in 1-2 days  
**Philosophy**: MVP architecture = Full architecture (just fewer lessons)

---

## ✅ Decisions Complete

See [PRACTICE_MODE_DECISIONS.md](./PRACTICE_MODE_DECISIONS.md) for full rationale.

**Key decisions:**
- ✅ Phase 2: Pre-generated AI examples
- ✅ Mastery: Binary (90%+ = ★ mastered, <90% = ☆ not)
- ✅ LP: Score-based, but mastered lessons don't give LP
- ✅ Score tracking: Best score (can't lose mastery in MVP)
- ✅ Prompts: 3 per MVP lesson, 1 per other lesson (19 total for MVP)

---

## 🎯 MVP Scope

| What's In | What's Deferred |
|-----------|-----------------|
| 2 lessons (Because/But/So, Appositive) | Other 13 lessons |
| Full 3-phase flow (Write → Review → Revise) | Historical review pool |
| Binary mastery (★/☆ per lesson) | Gap detection from ranked |
| Category mastery progress display | "Sentence Pro" badge |
| Score-based LP (mastered = no LP) | LP re-open via gap detection |
| Pre-generated AI examples for Phase 2 |  |
| Reuse existing `sessions` collection | New Firestore collections |
| Solo practice (no opponents) | - |

---

## 📋 Phase 0: Content (Do First!)

### Lesson 1: Because/But/So (Sentence)
- [ ] Write 3 prompt variations (instruction + context)
- [ ] Create annotated example showing correct connector usage
- [ ] Define evaluation criteria (what counts as correct usage)
- [ ] Create 2-3 pre-generated AI examples for Phase 2 review

### Lesson 2: Appositive (Sentence)
- [ ] Write 3 prompt variations (instruction + context)
- [ ] Create annotated example showing correct appositive usage
- [ ] Define evaluation criteria
- [ ] Create 2-3 pre-generated AI examples for Phase 2 review

### Phase 2 AI Examples Pool
- [ ] Generate 2-3 examples per lesson showing skill usage (good + needs improvement)
- [ ] Store in constants file (can move to Firestore later)

---

## 📋 Phase 1: Types & Constants

### Types (Add to existing)
- [ ] Extend `WritingSession` interface with optional practice fields:
  ```typescript
  lessonId?: string;
  lessonCategory?: 'sentence' | 'paragraph' | 'essay';
  mastered?: boolean;  // 90%+ = true
  ```
- [ ] Extend `UserProfile` interface with mastery tracking:
  ```typescript
  practiceMastery?: {
    [lessonId: string]: {
      mastered: boolean;      // 90%+ achieved
      bestScore: number;      // Highest score
      completedAt: Timestamp; // When first mastered
      attempts: number;       // Total attempts
    };
  };
  ```

### Constants
- [ ] Create `lib/constants/practice-lessons.ts`:
  - [ ] `PRACTICE_LESSONS` map with lesson definitions
  - [ ] `PRACTICE_LP_REWARDS` score-to-LP mapping (per spec)
  - [ ] `PRACTICE_PHASE_DURATIONS` (3/1/2 min)
  - [ ] `MASTERY_THRESHOLD` = 90
  - [ ] `PHASE2_EXAMPLES` - pre-generated AI examples per lesson

---

## 📋 Phase 2: Services

### Mastery Service
- [ ] Create `lib/services/practice-mastery.ts`:
  - [ ] `updateMastery(uid, lessonId, score)` - updates mastery status on any attempt
  - [ ] `isMastered(uid, lessonId)` - returns boolean
  - [ ] `getUserMasteryStatus(uid)` - returns all lesson statuses
  - [ ] `canEarnLP(uid, lessonId)` - false if already mastered

### Modify Existing Services
- [ ] Modify `lib/services/user-profile.ts`:
  - [ ] `updateUserStatsAfterPractice(uid, lpChange, wordCount)` - no XP, no points
- [ ] Reuse `lib/services/writing-sessions.ts`:
  - [ ] `saveWritingSession()` works as-is (mode: 'practice')

### LP Calculation
- [ ] Create `lib/utils/practice-scoring.ts`:
  - [ ] `calculatePracticeLP(score, isMastered)` - returns 0 if mastered, else score-based
  - [ ] `checkMastery(score)` - returns score >= 90

---

## 📋 Phase 3: Hooks

- [ ] Create `lib/hooks/usePracticeLesson.ts`:
  - [ ] Load lesson by ID from constants
  - [ ] Track current phase (1/2/3)
  - [ ] Handle phase transitions
  - [ ] Calculate time remaining
- [ ] Create `lib/hooks/usePracticeMastery.ts`:
  - [ ] Fetch user's mastery status
  - [ ] Check if lesson is mastered
  - [ ] Check if LP is available

---

## 📋 Phase 4: UI Components

### Lesson Selection (Landing)
- [ ] Create `components/practice/LessonCard.tsx`:
  - [ ] Lesson title, category, duration
  - [ ] Mastery indicator (★ mastered / ☆ not)
  - [ ] "LP Available" badge (if not mastered)
  - [ ] Best score display
  - [ ] "Start" button
- [ ] Modify `components/practice/PracticeLanding.tsx`:
  - [ ] Show available lessons (2 for MVP)
  - [ ] Category sections (Sentence / Paragraph / Essay)
  - [ ] Show "Coming soon" for other lessons
  - [ ] Category mastery progress (e.g., "1/5 Sentence skills mastered")

### Session Components
- [ ] Create `components/practice/PracticeSessionContent.tsx`:
  - [ ] Adapt from `WritingSessionContent.tsx`
  - [ ] Shorter phase durations (3/1/2 min)
  - [ ] No AI opponents (solo mode)
  - [ ] Example sidebar
- [ ] Create `components/practice/ExampleSidebar.tsx`:
  - [ ] Show annotated example
  - [ ] Toggle show/hide
- [ ] Create `components/practice/SkillFocusBanner.tsx`:
  - [ ] Current skill name
  - [ ] Goal description

### Phase 2 (Pre-generated Examples)
- [ ] Create `components/practice/PracticeReviewPhase.tsx`:
  - [ ] Display pre-generated AI example
  - [ ] Quick feedback form (identify skill usage, suggest improvements)
  - [ ] Timer (1 min)

### Results
- [ ] Create `components/practice/PracticeResultsContent.tsx`:
  - [ ] Phase scores breakdown
  - [ ] Composite score
  - [ ] Mastery status (★ Mastered! / Keep practicing)
  - [ ] LP earned (or "Already mastered - no LP")
  - [ ] Best score update notification
- [ ] Create `components/practice/MasteryDisplay.tsx`:
  - [ ] ★ filled if mastered, ☆ empty if not
  - [ ] "First time mastered!" celebration

---

## 📋 Phase 5: Pages & Routes

- [ ] Modify `app/practice/page.tsx`:
  - [ ] Render updated `PracticeLanding` with lesson cards
- [ ] Create `app/practice/[lessonId]/page.tsx`:
  - [ ] Lesson entry/start screen
  - [ ] Show mastery status, best score, LP availability
- [ ] Create `app/practice/[lessonId]/session/page.tsx`:
  - [ ] 3-phase session flow
- [ ] Create `app/practice/[lessonId]/results/page.tsx`:
  - [ ] Results with mastery display

---

## 📋 Phase 6: Evaluation (API)

### Evaluation Endpoint
- [ ] Create `/api/evaluate-practice/route.ts`:
  - [ ] Accept: content, lessonId, phase
  - [ ] Skill-specific evaluation prompt
  - [ ] Return: score (0-100), feedback, skillAnalysis

### LLM Prompt
- [ ] Create `lib/prompts/practice-evaluation.ts`:
  - [ ] Skill-specific evaluation criteria per lesson
  - [ ] Return structured JSON

---

## 📊 Progress Tracker

| Phase | Items | Status |
|-------|-------|--------|
| Phase 0: Content | 8 | 🔴 Not Started |
| Phase 1: Types | 5 | 🔴 Not Started |
| Phase 2: Services | 6 | 🔴 Not Started |
| Phase 3: Hooks | 2 | 🔴 Not Started |
| Phase 4: UI | 9 | 🔴 Not Started |
| Phase 5: Pages | 4 | 🔴 Not Started |
| Phase 6: API | 2 | 🔴 Not Started |
| **Total** | **~36 items** | - |

---

## 🔄 MVP → Full Version Path

When MVP is done, adding full version is just:

1. **Add more lessons** → Add to `PRACTICE_LESSONS` constant + prompts
2. **Add category mastery badges** → Query all lessons in category, check if all mastered
3. **Add gap detection (V1)** → Hook into ranked results, re-open mastered lessons for LP
4. **Add more Phase 2 examples** → Expand pre-generated pool or move to Firestore

**No refactoring needed** - MVP architecture scales directly.

---

## 📝 Implementation Notes

### Architecture Decisions (from DECISIONS.md)
- Using existing `sessions` collection (mode: 'practice')
- Mastery stored in user profile as `practiceMastery` map
- Phase 2 uses pre-generated AI examples (stored in constants for MVP)
- LP is score-based, but mastered lessons give 0 LP
- Track best score (can't lose mastery in MVP)
- 90% = mastery threshold

### Simplifications from Original Spec
- ~~Tier I/II/III badges~~ → Binary mastery (★/☆)
- ~~Async peer review pool~~ → Pre-generated examples
- ~~Gap detection~~ → V1 feature
