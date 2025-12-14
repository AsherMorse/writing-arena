# Essay Criterion → Lesson Mapping

> Edit this file to finalize mappings. Once done, we'll update `lib/grading/essay-gap-detection.ts`.

---

## Available AlphaWrite Activities (Reference)

### Sentence Activities
| Slug | Name | Best For |
|------|------|----------|
| `basic-conjunctions` | Because/But/So | Sentence expansion, reasoning |
| `write-appositives` | Write Appositives | Adding descriptive detail |
| `identify-appositives` | Identify Appositives | Recognizing appositives |
| `subordinating-conjunctions` | Subordinating Conjunctions | Complex sentences, relationships |
| `kernel-expansion` | Kernel Expansion | Expanding simple sentences |
| `combine-sentences` | Combine Sentences | Sentence variety |
| `fragment-or-sentence` | Fragment or Sentence? | Grammar/mechanics |

### Paragraph Activities
| Slug | Name | Best For |
|------|------|----------|
| `identify-topic-sentence` | Identify Topic Sentences | Recognizing main ideas |
| `make-topic-sentences` | Make Topic Sentences | Writing main ideas |
| `topic-brainstorm` | Topic Brainstorm | Generating ideas |
| `writing-spos` | Writing Single Paragraph Outlines | Structuring paragraphs with evidence |
| `eliminate-irrelevant-sentences` | Eliminate Irrelevant Sentences | Relevance, coherence |
| `elaborate-paragraphs` | Elaborate on Paragraphs | Developing details |
| `using-transition-words` | Using Transition Words | Internal transitions |
| `finishing-transition-words` | Finishing Transition Words | Completing transitions |
| `write-cs-from-details` | Write Concluding Sentences | Concluding sentences |
| `write-ts-from-details` | Write Topic Sentences from Details | Inferring main ideas |

### Essay Activities
| Slug | Name | Best For |
|------|------|----------|
| `distinguish-g-s-t` | Distinguish GST Statements | Introduction structure |
| `write-g-s-from-t` | Write G & S from Thesis | Building introductions |
| `write-introductory-sentences` | Add Intro Sentences | Introduction writing |
| `craft-conclusion-from-gst` | Write Conclusion Paragraphs | Conclusion structure |
| `write-t-from-topic` | Write Thesis from Topic | Thesis development |
| `match-details-pro-con` | Match Details Pro/Con | Balanced arguments |

### Note-Taking Activities
| Slug | Name | Best For |
|------|------|----------|
| `identify-keywords` | Identify Keywords | Finding key info |
| `convert-notes-to-sentence` | Convert Notes to Sentence | Using evidence |

---

## Criterion Mappings

### Format
```
CRITERION_NAME:
  - lesson-slug-1
  - lesson-slug-2
```

---

### 1. Each body paragraph has a topic sentence

**Current:** `topic-sentence`, `basic-conjunctions`

**Proposed:**
- `make-topic-sentences`
- `identify-topic-sentence`
- `basic-conjunctions`

---

### 2. Supporting details support topic sentence

**Current:** `transition-words`, `kernel-expansion`, `subordinating-conjunctions`

**Proposed:**
- `writing-spos`
- `eliminate-irrelevant-sentences`
- `elaborate-paragraphs`

---

### 3. Developed thesis statement

**Current:** `topic-sentence`

**Proposed:**
- `write-t-from-topic`
- `distinguish-g-s-t`
- `make-topic-sentences`

---

### 4. Each body paragraph supports thesis

**Current:** `topic-sentence`, `transition-words`

**Proposed:**
- `eliminate-irrelevant-sentences`
- `writing-spos`
- `using-transition-words`

---

### 5. Used sentence strategies

**Current:** `basic-conjunctions`, `write-appositives`, `subordinating-conjunctions`, `kernel-expansion`

**Proposed:** ✅ Keep as-is (these are the TWR sentence strategies)
- `basic-conjunctions`
- `write-appositives`
- `subordinating-conjunctions`
- `kernel-expansion`

---

### 6. Used transitions correctly

**Current:** `transition-words`

**Proposed:**
- `using-transition-words`
- `finishing-transition-words`

---

### 7. Composed effective introduction

**Current:** `topic-sentence`

**Proposed:**
- `distinguish-g-s-t`
- `write-g-s-from-t`
- `write-introductory-sentences`

---

### 8. Composed effective conclusion

**Current:** `topic-sentence`

**Proposed:**
- `craft-conclusion-from-gst`
- `distinguish-g-s-t`

---

### 9. Edited for grammar and mechanics

**Current:** `fragment-or-sentence`

**Proposed:** ✅ Keep as-is (limited options for grammar)
- `fragment-or-sentence`

> Note: AlphaWrite doesn't have run-on sentence detection

---

### 10. Addressed opposing view/counterclaim

**Current:** `subordinating-conjunctions`

**Proposed:**
- `match-details-pro-con`
- `subordinating-conjunctions`

---

### 11. Composed effective concluding sentence (Grade 6)

**Current:** `topic-sentence`

**Proposed:**
- `write-cs-from-details`
- `make-topic-sentences`

---

### 12. Used credible and relevant evidence

**Current:** `transition-words`, `kernel-expansion` ❌ (weak mapping)

**Proposed:**
- `writing-spos`
- `eliminate-irrelevant-sentences`
- `elaborate-paragraphs`

---

### 13. Presented both sides fairly

**Current:** `transition-words`

**Proposed:**
- `match-details-pro-con`
- `using-transition-words`
- `writing-spos`

---

### 14. Minimum paragraph count

**Current:** `[]` (empty - structural)

**Proposed:** ✅ Keep empty
- (no lesson - this is structural feedback only)

---

### 15. Clear reasoning from evidence to claim

**Current:** `subordinating-conjunctions`, `kernel-expansion`

**Proposed:**
- `subordinating-conjunctions`
- `elaborate-paragraphs`
- `writing-spos`

---

## Summary of Changes

| Criterion | Old Lessons | New Lessons | Change |
|-----------|-------------|-------------|--------|
| Topic sentence | `topic-sentence`, `basic-conjunctions` | `identify-topic-sentence`, `make-topic-sentences`, `basic-conjunctions` | 🔄 Better match |
| Supporting details | `transition-words`, `kernel-expansion`, `subordinating-conjunctions` | `writing-spos`, `eliminate-irrelevant-sentences`, `elaborate-paragraphs` | 🔄 Better match |
| Thesis | `topic-sentence` | `write-t-from-topic`, `distinguish-g-s-t`, `make-topic-sentences` | 🔄 Better match |
| Body supports thesis | `topic-sentence`, `transition-words` | `eliminate-irrelevant-sentences`, `writing-spos`, `using-transition-words` | 🔄 Better match |
| Sentence strategies | (4 lessons) | (same 4 lessons) | ✅ Keep |
| Transitions | `transition-words` | `using-transition-words`, `finishing-transition-words` | 🔄 Better match |
| Introduction | `topic-sentence` | `distinguish-g-s-t`, `write-g-s-from-t`, `write-introductory-sentences` | 🔄 Better match |
| Conclusion | `topic-sentence` | `craft-conclusion-from-gst`, `distinguish-g-s-t` | 🔄 Better match |
| Grammar | `fragment-or-sentence` | `fragment-or-sentence` | ✅ Keep |
| Counterclaim | `subordinating-conjunctions` | `match-details-pro-con`, `subordinating-conjunctions` | 🔄 Better match |
| Concluding sentence | `topic-sentence` | `write-cs-from-details`, `make-topic-sentences` | 🔄 Better match |
| Credible evidence | `transition-words`, `kernel-expansion` | `writing-spos`, `eliminate-irrelevant-sentences`, `elaborate-paragraphs` | 🔄 **Major fix** |
| Both sides fairly | `transition-words` | `match-details-pro-con`, `using-transition-words`, `writing-spos` | 🔄 Better match |
| Paragraph count | `[]` | `[]` | ✅ Keep |
| Clear reasoning | `subordinating-conjunctions`, `kernel-expansion` | `subordinating-conjunctions`, `elaborate-paragraphs`, `writing-spos` | 🔄 Better match |

---

## Lesson Prioritization Logic

When displaying "Practice These Skills" recommendations, lessons are prioritized as follows:

### Sort Order

1. **Severity first** - Fix what's most broken
   - `No` gaps (high severity) come before `Developing` gaps (medium severity)

2. **TWR tier second (within same severity)** - Bottom-up skill building
   - Sentence-level lessons (Tier 1): `basic-conjunctions`, `write-appositives`, `subordinating-conjunctions`, `kernel-expansion`, `fragment-or-sentence`
   - Paragraph-level lessons (Tier 2): `make-topic-sentences`, `identify-topic-sentence`, `writing-spos`, `eliminate-irrelevant-sentences`, `elaborate-paragraphs`, `using-transition-words`, `finishing-transition-words`, `write-cs-from-details`
   - Essay-level lessons (Tier 3): `distinguish-g-s-t`, `write-g-s-from-t`, `write-introductory-sentences`, `craft-conclusion-from-gst`, `write-t-from-topic`, `match-details-pro-con`

### Rationale

- **Severity first**: Urgent issues ("No" scores) need attention before refinement ("Developing" scores)
- **TWR tier second**: Within same severity, foundational skills (sentence-level) must be solid before building paragraph and essay skills

### Example

| Criterion | Score | Tier | Priority |
|-----------|-------|------|----------|
| Composed effective introduction | No | Essay (3) | 2nd |
| Used transitions correctly | No | Paragraph (2) | 1st |
| Used sentence strategies | Developing | Sentence (1) | 3rd |
| Supporting details | Developing | Paragraph (2) | 4th |

**Top 3 lessons shown:** Transitions (No+P), Introduction (No+E), Sentence strategies (Dev+S)

> Implementation: See `lib/grading/essay-gap-detection.ts` → `detectGapsFromEssayScorecard()`

---

## Instructions

1. Review each mapping above
2. Edit the "Proposed" sections as needed
3. When ready, let me know and I'll update `lib/grading/essay-gap-detection.ts`

