# Practice Mode Implementation Checklist (Full Version)

**Version**: 1.2  
**Started**: November 30, 2024  
**Status**: MVP Complete, V1 In Progress

---

## ⚡ MVP Complete!

**See [PRACTICE_MODE_MVP_ALPHAWRITE.md](./PRACTICE_MODE_MVP_ALPHAWRITE.md) for the completed MVP.**

MVP is demo-ready with 2 lessons (Because/But/So, Appositives). The architecture uses AlphaWrite grader configs + Claude Sonnet 4 for evaluation.

**Current path:**
1. ~~Complete MVP (2 lessons, ~36 items)~~ ✅ Done
2. **Gap detection (V1 priority!)** — Creates the ranked ↔ practice feedback loop
3. Add remaining lessons using AlphaWrite extraction (this doc, Phase 0)
4. Add category mastery badges

---

## 📋 Phase 0: Content & Lesson Design

> **Approach:** Extract grader configs from AlphaWrite instead of creating content from scratch.
> See [AlphaWrite Integration Analysis](../implementation-explanation/curriculum/alphawrite/alphawrite-integration-analysis.md) for coverage mapping.
>
> **Per lesson:** Extract grader config + create Phase 2 review examples

### Sentence Lessons (Bronze Skills) - 5 lessons

#### Because/But/So Lesson ✅ (MVP Complete)
> Extracted from `11-basic-conjunctions/grader.config.ts`
> See [PRACTICE_MODE_MVP_ALPHAWRITE.md](./PRACTICE_MODE_MVP_ALPHAWRITE.md)

#### Appositive Lesson ✅ (MVP Complete)
> Extracted from `13-write-appositives/grader.config.ts`
> See [PRACTICE_MODE_MVP_ALPHAWRITE.md](./PRACTICE_MODE_MVP_ALPHAWRITE.md)

#### Sentence Expansion Lesson
- [ ] Extract `16-kernel-expansion/grader.config.ts` → `lib/constants/grader-configs/kernel-expansion.ts`
- [ ] Extract `15-combine-sentences/grader.config.ts` (optional secondary activity)
- [ ] Add to `PRACTICE_LESSONS` in `practice-lessons.ts`
- [ ] Create Phase 2 review examples

#### Subordinating Conjunction Lesson
- [ ] Extract `14-subordinating-conjunctions/grader.config.ts` → `lib/constants/grader-configs/subordinating-conjunctions.ts`
- [ ] Add to `PRACTICE_LESSONS`
- [ ] Create Phase 2 review examples

#### Fragment/Run-on Lesson
- [ ] Extract `02-fragment-or-sentence/grader.config.ts` → `lib/constants/grader-configs/fragment-or-sentence.ts`
- [ ] ⚠️ Note: AlphaWrite covers fragments only, run-on detection needs custom implementation
- [ ] Add to `PRACTICE_LESSONS`
- [ ] Create Phase 2 review examples

---

### Paragraph Lessons (Silver Skills) - 5 lessons

#### Topic Sentence Lesson
- [ ] Extract `19-identify-topic-sentence/grader.config.ts` → `lib/constants/grader-configs/topic-sentence.ts`
- [ ] Optional: `25-make-topic-sentences/grader.config.ts`
- [ ] Add to `PRACTICE_LESSONS`
- [ ] Create Phase 2 review examples

#### Supporting Details Lesson
- [ ] Extract `22-eliminate-irrelevant-sentences/grader.config.ts` → `lib/constants/grader-configs/supporting-details.ts`
- [ ] Optional: `28-writing-spos/grader.config.ts`
- [ ] Add to `PRACTICE_LESSONS`
- [ ] Create Phase 2 review examples

#### Concluding Sentence Lesson
- [ ] Extract `24-write-cs-from-details/grader.config.ts` → `lib/constants/grader-configs/concluding-sentence.ts`
- [ ] Add to `PRACTICE_LESSONS`
- [ ] Create Phase 2 review examples

#### Internal Transitions Lesson
- [ ] Extract `31-using-transition-words/grader.config.ts` → `lib/constants/grader-configs/internal-transitions.ts`
- [ ] Optional: `32-finishing-transition-words/grader.config.ts`
- [ ] Add to `PRACTICE_LESSONS`
- [ ] Create Phase 2 review examples

#### Paragraph Coherence Lesson
- [ ] ⚠️ Implicit coverage in AlphaWrite only
- [ ] Consider combining `22-eliminate-irrelevant-sentences` + `30-elaborate-paragraphs`
- [ ] May need custom grader config
- [ ] Add to `PRACTICE_LESSONS`
- [ ] Create Phase 2 review examples

---

### Essay Lessons (Gold Skills) - 5 lessons

> ⚠️ **Note:** AlphaWrite has limited essay-level coverage. These lessons may require custom grader configs.

#### Thesis Development Lesson
- [ ] Partial: `39-write-t-from-topic/grader.config.ts`
- [ ] Partial: `34-distinguish-g-s-t/grader.config.ts`
- [ ] May need custom grader config for full thesis evaluation
- [ ] Create Phase 2 review examples

#### Paragraph Transitions Lesson
- [ ] Partial: `50-pre-transition-outline/grader.config.ts` (in progress in AlphaWrite)
- [ ] May need custom grader config
- [ ] Create Phase 2 review examples

#### Introduction Structure Lesson
- [ ] Partial: `38-write-introductory-sentences/grader.config.ts`
- [ ] Partial: `36-write-g-s-from-t/grader.config.ts`
- [ ] May need custom grader config
- [ ] Create Phase 2 review examples

#### Conclusion Structure Lesson
- [ ] Extract `37-craft-conclusion-from-gst/grader.config.ts`
- [ ] May need augmentation for full structure evaluation
- [ ] Create Phase 2 review examples

#### Multi-Idea Development Lesson
- [ ] Partial: `40-match-details-pro-con/grader.config.ts`
- [ ] 🔴 Limited AlphaWrite coverage - likely needs custom grader config
- [ ] Create Phase 2 review examples

---

## 📋 Phase 1: Data Schema & Constants (V1)

> ✅ MVP infrastructure complete. See `lib/constants/grader-configs/` for pattern.

### Completed in MVP
- ✅ `lib/constants/grader-configs/types.ts` — `ActivityGraderConfig`, `GradingResult`
- ✅ `lib/constants/grader-configs/basic-conjunctions.ts` — Because/But/So config
- ✅ `lib/constants/grader-configs/write-appositives.ts` — Appositive config
- ✅ `lib/constants/practice-lessons.ts` — Lesson definitions, LP rewards
- ✅ `lib/constants/practice-examples.ts` — Phase 2 examples

### Additional for V1
- [ ] Add `skillGaps` field to user profile (for gap detection)
- [ ] Design gap → lesson mapping
- [ ] Expand `PRACTICE_LESSONS` with remaining lessons (add to existing file)
- [ ] Add `GAP_TO_LESSON_MAP` for gap detection routing

---

## 📋 Phase 2: Services & Hooks (V1)

> ✅ MVP services complete. See `lib/services/practice-mastery.ts` for pattern.

### Completed in MVP
- ✅ `lib/services/practice-mastery.ts` — Full mastery tracking
- ✅ `lib/grading/practice-grader.ts` — Claude Sonnet 4 evaluation
- ✅ `lib/grading/prompt-builder.ts` — AlphaWrite-style prompts
- ✅ `lib/hooks/usePracticeLesson.ts` — Lesson state management
- ✅ `lib/hooks/usePracticeMastery.ts` — Mastery hooks

### Gap Detection Service
- [ ] Create `lib/services/skill-gaps.ts`:
  - [ ] `detectGapsFromRanked(matchResult)` - analyze ranked performance
  - [ ] `updateUserGaps(uid, gaps)` - store detected gaps
  - [ ] `getRecommendedLessons(uid)` - based on gaps
  - [ ] `reopenLessonForLP(uid, lessonId)` - when gap detected

### Category Mastery Service
- [ ] Extend `lib/services/practice-mastery.ts`:
  - [ ] `getCategoryProgress(uid, category)` - X/5 mastered
  - [ ] `checkCategoryMastery(uid, category)` - all 5 at ★?
  - [ ] `awardCategoryBadge(uid, category)` - "Sentence Pro" etc.

### Hooks
- [ ] Create `lib/hooks/useSkillGaps.ts`
- [ ] Create `lib/hooks/useCategoryMastery.ts`

---

## 📋 Phase 3: UI Components (V1)

> ✅ MVP components complete. See `components/practice/` for pattern.

### Completed in MVP
- ✅ `components/practice/MasteryDisplay.tsx` — Star-based mastery indicator
- ✅ `components/practice/LessonCard.tsx` — Lesson card with mastery status
- ✅ `components/practice/PracticeLanding.tsx` — Landing with lesson selection
- ✅ `components/practice/SkillFocusBanner.tsx` — Skill name and goal
- ✅ `components/practice/ExampleSidebar.tsx` — Annotated examples
- ✅ `components/practice/PracticeReviewPhase.tsx` — Phase 2 review
- ✅ `components/practice/PracticeSessionContent.tsx` — Main 3-phase flow
- ✅ `components/practice/PracticeResultsContent.tsx` — Results with mastery

### Gap Detection UI
- [ ] Create `components/practice/GapAlert.tsx` - "Recommended for you" banner
- [ ] Create `components/practice/GapRecommendation.tsx` - lesson suggestion card
- [ ] Add gap alerts to ranked results page

### Category Mastery UI
- [ ] Create `components/practice/CategoryMasteryBadge.tsx` - "Sentence Pro" display
- [ ] Create `components/practice/CategoryProgress.tsx` - "3/5 mastered" bar
- [ ] Create `components/practice/MasteryUnlocked.tsx` - celebration modal

### Dashboard Integration
- [ ] Add practice progress section to dashboard
- [ ] Show category mastery badges
- [ ] Show gap-based recommendations

---

## 📋 Phase 4: Gap Detection Integration (V1)

### Ranked → Practice Flow
- [ ] Hook into ranked results evaluation
- [ ] Map TWR checklist failures to practice lessons
- [ ] Store gaps in user profile
- [ ] Re-open mastered lessons for LP when gap detected

### Gap → Lesson Mapping
- [ ] Define which ranked checkboxes map to which lessons:
  | Ranked Checkbox | Practice Lesson |
  |-----------------|-----------------|
  | "Uses connectors" | Because/But/So |
  | "Uses appositives" | Appositive |
  | "Clear topic sentence" | Topic Sentence |
  | ... | ... |

---

## 📋 Phase 5: Additional Pages (V1)

> ✅ MVP pages complete. See `app/practice/` for pattern.

### Completed in MVP
- ✅ `app/practice/page.tsx` — Landing page
- ✅ `app/practice/[lessonId]/page.tsx` — Lesson entry/start screen
- ✅ `app/practice/[lessonId]/session/page.tsx` — 3-phase session flow
- ✅ `app/practice/[lessonId]/results/page.tsx` — Results with mastery

### Dashboard Updates
- [ ] Update dashboard to show practice progress widget
- [ ] Show category mastery badges
- [ ] Show "Recommended Practice" based on gaps

### Ranked Results Updates
- [ ] Add gap detection alerts to ranked results
- [ ] Add "Practice This Skill" CTAs

---

## 📊 Progress Tracker

| Phase | Status | Completion | Notes |
|-------|--------|------------|-------|
| **MVP** | ✅ Complete | 36/36 items | 2 lessons working |
| Phase 0: Content | 🟡 In Progress | 2/15 lessons | Extract from AlphaWrite |
| Phase 1: Schema (V1) | 🟡 Partial | 5/9 items | MVP done, gap detection pending |
| Phase 2: Services (V1) | 🟡 Partial | 5/13 items | MVP done, gap detection pending |
| Phase 3: UI (V1) | 🟡 Partial | 8/17 items | MVP done, gap/badge UI pending |
| Phase 4: Integration (V1) | 🔴 Not Started | 0/4 items | Ranked → Practice flow |
| Phase 5: Pages (V1) | 🟡 Partial | 4/7 items | MVP done, dashboard updates pending |

---

## 📝 Notes & Decisions

### AlphaWrite Coverage Summary

| Skill Level | Coverage | Strategy |
|-------------|----------|----------|
| **Sentence (Bronze)** | 🟢 Full | Extract grader configs directly |
| **Paragraph (Silver)** | 🟢 Strong | Extract + minor customization |
| **Essay (Gold)** | 🔴 Partial | Custom grader configs likely needed |

### AlphaWrite Source Location

```
_alphawrite/alphawrite-2/packages/edu-core/src/activities/
├── 02-fragment-or-sentence/
├── 11-basic-conjunctions/     ← MVP ✅
├── 13-write-appositives/      ← MVP ✅
├── 14-subordinating-conjunctions/
├── 16-kernel-expansion/
├── 19-identify-topic-sentence/
├── 22-eliminate-irrelevant-sentences/
├── 24-write-cs-from-details/
├── 31-using-transition-words/
├── 34-distinguish-g-s-t/
├── 37-craft-conclusion-from-gst/
├── 38-write-introductory-sentences/
├── 39-write-t-from-topic/
├── 40-match-details-pro-con/
└── 50-pre-transition-outline/
```

### Grading Approach
- **Model:** Claude Sonnet 4 (claude-sonnet-4-20250514)
- **Pattern:** AlphaWrite grader configs → prompt builder → structured output
- **Cost:** ~$0.02-0.06 per practice session
- **Implementation:** `lib/grading/practice-grader.ts`

### Architecture Decisions (from DECISIONS.md)
- **Sessions storage**: Reuse existing `sessions` collection with `mode: 'practice'`
- **Mastery**: Binary system - 90%+ = ★ mastered, <90% = ☆ not mastered
- **LP rewards**: Score-based, but mastered lessons give 0 LP
- **LP re-open**: V1 gap detection re-opens mastered lessons for LP
- **Score tracking**: Best score (can't lose mastery in MVP)
- **Phase 2**: Pre-generated AI examples (from AlphaWrite test data)

### Simplifications from Original Spec
- ~~Tier I/II/III badges~~ → Binary mastery (★/☆)
- ~~Async peer review pool~~ → Pre-generated examples
- ~~Usage count based tiers~~ → Score-based mastery (90%+)
- ~~Build grading from scratch~~ → Extract AlphaWrite grader configs

### MVP → V1 Path
1. ~~**MVP**: 2 lessons, basic mastery, no gap detection~~ ✅ Done
2. **V1 Priority: Gap Detection** ← Do this next! Creates the ranked ↔ practice loop
3. **V1**: Add remaining 13 lessons (extract from AlphaWrite)
4. **V1**: Category mastery badges ("Sentence Pro", etc.)

### V1 → Future Path
- Historical review pool (real student submissions)
- Teacher assignment features
- Grade/difficulty scaling
- Mastery decay (can lose ★ over time)

---

## 📚 References

- [PRACTICE_MODE_MVP_ALPHAWRITE.md](./PRACTICE_MODE_MVP_ALPHAWRITE.md) — MVP implementation details
- [PRACTICE_MODE_DECISIONS.md](./PRACTICE_MODE_DECISIONS.md) — Architecture decisions
- [AlphaWrite Integration Analysis](../implementation-explanation/curriculum/alphawrite/alphawrite-integration-analysis.md) — Coverage mapping
