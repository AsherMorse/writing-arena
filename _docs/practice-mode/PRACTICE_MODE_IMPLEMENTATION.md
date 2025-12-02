# Practice Mode Implementation Checklist (Full Version)

**Version**: 1.1  
**Started**: November 30, 2024  
**Status**: Planning

---

## ⚡ Start with MVP First!

**See [PRACTICE_MODE_MVP.md](./PRACTICE_MODE_MVP.md) for the fast-track version.**

MVP gets you demo-ready with 2 lessons in 1-2 days. The MVP architecture scales directly to this full version—no refactoring needed, just add more lessons and features.

**Recommended path:**
1. Complete MVP (2 lessons, ~36 items)
2. **Gap detection (V1 priority!)** — Creates the ranked ↔ practice feedback loop
3. Add remaining lessons (this doc, Phase 0)
4. Add category mastery badges

---

## 📋 Phase 0: Content & Lesson Design

> **Note:** Because/But/So and Appositive lessons are covered in MVP.  
> This section covers the remaining 13 lessons.
> 
> **Per lesson:** 3 prompts + annotated example + evaluation criteria + 2-3 Phase 2 examples

### Sentence Lessons (Bronze Skills) - 5 lessons

#### Because/But/So Lesson ✅ (MVP)
> Covered in [PRACTICE_MODE_MVP.md](./PRACTICE_MODE_MVP.md)

#### Appositive Lesson ✅ (MVP)
> Covered in [PRACTICE_MODE_MVP.md](./PRACTICE_MODE_MVP.md)

#### Sentence Expansion Lesson
- [ ] Write 3 prompt variations
- [ ] Create annotated example
- [ ] Write evaluation criteria (90%+ = mastery)
- [ ] Create 2-3 Phase 2 review examples

#### Subordinating Conjunction Lesson
- [ ] Write 3 prompt variations
- [ ] Create annotated example
- [ ] Write evaluation criteria
- [ ] Create 2-3 Phase 2 review examples

#### Fragment/Run-on Lesson
- [ ] Write 3 prompt variations
- [ ] Create annotated example
- [ ] Write evaluation criteria
- [ ] Create 2-3 Phase 2 review examples

---

### Paragraph Lessons (Silver Skills) - 5 lessons

#### Topic Sentence Lesson
- [ ] Write 3 prompt variations
- [ ] Create annotated example
- [ ] Write evaluation criteria
- [ ] Create 2-3 Phase 2 review examples

#### Supporting Details Lesson
- [ ] Write 3 prompt variations
- [ ] Create annotated example
- [ ] Write evaluation criteria
- [ ] Create 2-3 Phase 2 review examples

#### Concluding Sentence Lesson
- [ ] Write 3 prompt variations
- [ ] Create annotated example
- [ ] Write evaluation criteria
- [ ] Create 2-3 Phase 2 review examples

#### Internal Transitions Lesson
- [ ] Write 3 prompt variations
- [ ] Create annotated example
- [ ] Write evaluation criteria
- [ ] Create 2-3 Phase 2 review examples

#### Paragraph Coherence Lesson
- [ ] Write 3 prompt variations
- [ ] Create annotated example
- [ ] Write evaluation criteria
- [ ] Create 2-3 Phase 2 review examples

---

### Essay Lessons (Gold Skills) - 5 lessons

#### Thesis Development Lesson
- [ ] Write 3 prompt variations
- [ ] Create annotated example
- [ ] Write evaluation criteria
- [ ] Create 2-3 Phase 2 review examples

#### Paragraph Transitions Lesson
- [ ] Write 3 prompt variations
- [ ] Create annotated example
- [ ] Write evaluation criteria
- [ ] Create 2-3 Phase 2 review examples

#### Introduction Structure Lesson
- [ ] Write 3 prompt variations
- [ ] Create annotated example
- [ ] Write evaluation criteria
- [ ] Create 2-3 Phase 2 review examples

#### Conclusion Structure Lesson
- [ ] Write 3 prompt variations
- [ ] Create annotated example
- [ ] Write evaluation criteria
- [ ] Create 2-3 Phase 2 review examples

#### Multi-Idea Development Lesson
- [ ] Write 3 prompt variations
- [ ] Create annotated example
- [ ] Write evaluation criteria
- [ ] Create 2-3 Phase 2 review examples

---

## 📋 Phase 1: Data Schema & Constants (V1)

> MVP covers basic schema. This section adds V1 features.

### Additional Firestore Schema
- [ ] Add `skillGaps` field to user profile (for gap detection)
- [ ] Design gap → lesson mapping

### Additional Constants
- [ ] Expand `PRACTICE_LESSONS` with all 15 lessons
- [ ] Add `GAP_TO_LESSON_MAP` for gap detection routing

---

## 📋 Phase 2: Services & Hooks (V1)

> MVP covers basic mastery service. This section adds V1 features.

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

> MVP covers basic components. This section adds V1 features.

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
| **MVP** | 🔴 Not Started | 0/36 items | See MVP doc |
| Phase 0: Content | 🔴 Not Started | 0/52 items | 13 lessons × 4 items |
| Phase 1: Schema (V1) | 🔴 Not Started | 0/2 items | Gap detection schema |
| Phase 2: Services (V1) | 🔴 Not Started | 0/8 items | Gap + category mastery |
| Phase 3: UI (V1) | 🔴 Not Started | 0/7 items | Gap alerts, mastery badges |
| Phase 4: Integration (V1) | 🔴 Not Started | 0/4 items | Ranked → Practice flow |
| Phase 5: Pages (V1) | 🔴 Not Started | 0/3 items | Dashboard updates |

---

## 📝 Notes & Decisions

### Architecture Decisions (from DECISIONS.md)
- **Sessions storage**: Reuse existing `sessions` collection with `mode: 'practice'`
- **Mastery**: Binary system - 90%+ = ★ mastered, <90% = ☆ not mastered
- **LP rewards**: Score-based, but mastered lessons give 0 LP
- **LP re-open**: V1 gap detection re-opens mastered lessons for LP
- **Score tracking**: Best score (can't lose mastery in MVP)
- **Phase 2**: Pre-generated AI examples (not historical pool)

### Simplifications from Original Spec
- ~~Tier I/II/III badges~~ → Binary mastery (★/☆)
- ~~Async peer review pool~~ → Pre-generated examples
- ~~Usage count based tiers~~ → Score-based mastery (90%+)

### MVP → V1 Path
1. **MVP**: 2 lessons, basic mastery, no gap detection
2. **V1 Priority: Gap Detection** ← Do this first! Creates the ranked ↔ practice loop
3. **V1**: Add remaining 13 lessons
4. **V1**: Category mastery badges ("Sentence Pro", etc.)

### V1 → Future Path
- Historical review pool (real student submissions)
- Teacher assignment features
- Grade/difficulty scaling
- Mastery decay (can lose ★ over time)
