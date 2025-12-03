# Paragraph Category → Lesson Mapping

> Edit this file to finalize mappings. Once done, we'll update `lib/grading/paragraph-gap-detection.ts`.

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
| `writing-spos` | Writing Single Paragraph Outlines | Structuring paragraphs |
| `eliminate-irrelevant-sentences` | Eliminate Irrelevant Sentences | Relevance, coherence |
| `elaborate-paragraphs` | Elaborate on Paragraphs | Developing details |
| `using-transition-words` | Using Transition Words | Internal transitions |
| `finishing-transition-words` | Finishing Transition Words | Completing transitions |
| `write-cs-from-details` | Write Concluding Sentences | Concluding sentences |
| `write-ts-from-details` | Write Topic Sentences from Details | Inferring main ideas |

---

## Category Mappings

### Format
```
CATEGORY_NAME:
  - lesson-slug-1
  - lesson-slug-2
```

---

## Topic Sentence Variations

### 1. Topic Sentence (Expository)

**Current:** `topic-sentence`, `basic-conjunctions`, `write-appositives`

**Proposed:**
- `make-topic-sentences`
- `identify-topic-sentence`
- `basic-conjunctions`
- `write-appositives`

---

### 2. Claim (Topic Sentence) - Argumentative

**Current:** `topic-sentence`, `basic-conjunctions`

**Proposed:**
- `make-topic-sentences`
- `identify-topic-sentence`
- `basic-conjunctions`

---

### 3. Topic Sentence (Opinion Statement) - Opinion

**Current:** `topic-sentence`, `basic-conjunctions`

**Proposed:**
- `make-topic-sentences`
- `identify-topic-sentence`
- `basic-conjunctions`

---

### 4. Topic Sentence (Introduction) - Pro/Con

**Current:** `topic-sentence`, `basic-conjunctions`

**Proposed:**
- `make-topic-sentences`
- `identify-topic-sentence`
- `basic-conjunctions`

---

## Detail Sentences Variations

### 5. Detail Sentences (Expository)

**Current:** `transition-words`, `subordinating-conjunctions`, `kernel-expansion`

**Proposed:**
- `writing-spos`
- `eliminate-irrelevant-sentences`
- `elaborate-paragraphs`
- `using-transition-words`

---

### 6. Evidence and Reasoning (Detail Sentences) - Argumentative

**Current:** `transition-words`, `subordinating-conjunctions`, `kernel-expansion`

**Proposed:**
- `writing-spos`
- `eliminate-irrelevant-sentences`
- `elaborate-paragraphs`
- `subordinating-conjunctions`

---

### 7. Supporting Details (Facts and Evidence) - Opinion

**Current:** `transition-words`, `kernel-expansion`

**Proposed:**
- `writing-spos`
- `eliminate-irrelevant-sentences`
- `elaborate-paragraphs`

---

### 8. Supporting Details (Pro or Con) - Pro/Con

**Current:** `transition-words`, `subordinating-conjunctions`

**Proposed:**
- `writing-spos`
- `eliminate-irrelevant-sentences`
- `using-transition-words`

---

## Concluding Sentence

### 9. Concluding Sentence (all rubrics)

**Current:** `topic-sentence`, `write-appositives`

**Proposed:**
- `write-cs-from-details`
- `make-topic-sentences`
- `write-appositives`

---

## Conventions

### 10. Conventions (all rubrics)

**Current:** `fragment-or-sentence`

**Proposed:** ✅ Keep as-is (limited options for grammar)
- `fragment-or-sentence`

> Note: AlphaWrite doesn't have run-on sentence detection

---

## Summary of Changes

| Category | Old Lessons | New Lessons | Change |
|----------|-------------|-------------|--------|
| Topic Sentence | `topic-sentence`, `basic-conjunctions`, `write-appositives` | `make-topic-sentences`, `identify-topic-sentence`, `basic-conjunctions`, `write-appositives` | 🔄 Use actual AlphaWrite slugs |
| Claim (Topic Sentence) | `topic-sentence`, `basic-conjunctions` | `make-topic-sentences`, `identify-topic-sentence`, `basic-conjunctions` | 🔄 Use actual slugs |
| Topic Sentence (Opinion) | `topic-sentence`, `basic-conjunctions` | `make-topic-sentences`, `identify-topic-sentence`, `basic-conjunctions` | 🔄 Use actual slugs |
| Topic Sentence (Intro) | `topic-sentence`, `basic-conjunctions` | `make-topic-sentences`, `identify-topic-sentence`, `basic-conjunctions` | 🔄 Use actual slugs |
| Detail Sentences | `transition-words`, `subordinating-conjunctions`, `kernel-expansion` | `writing-spos`, `eliminate-irrelevant-sentences`, `elaborate-paragraphs`, `using-transition-words` | 🔄 Better match |
| Evidence & Reasoning | `transition-words`, `subordinating-conjunctions`, `kernel-expansion` | `writing-spos`, `eliminate-irrelevant-sentences`, `elaborate-paragraphs`, `subordinating-conjunctions` | 🔄 Better match |
| Supporting Details (Opinion) | `transition-words`, `kernel-expansion` | `writing-spos`, `eliminate-irrelevant-sentences`, `elaborate-paragraphs` | 🔄 Better match |
| Supporting Details (Pro/Con) | `transition-words`, `subordinating-conjunctions` | `writing-spos`, `eliminate-irrelevant-sentences`, `using-transition-words` | 🔄 Better match |
| Concluding Sentence | `topic-sentence`, `write-appositives` | `write-cs-from-details`, `make-topic-sentences`, `write-appositives` | 🔄 Better match |
| Conventions | `fragment-or-sentence` | `fragment-or-sentence` | ✅ Keep |

---

## Key Issue Fixed

**Before:** Used `topic-sentence` and `transition-words` which aren't actual AlphaWrite activity slugs

**After:** Uses actual AlphaWrite slugs like:
- `make-topic-sentences` (actual activity)
- `identify-topic-sentence` (actual activity)
- `using-transition-words` (actual activity)
- `writing-spos` (actual activity)

---

## Instructions

1. Review each mapping above
2. Edit the "Proposed" sections as needed
3. When ready, let me know and I'll update `lib/grading/paragraph-gap-detection.ts`

