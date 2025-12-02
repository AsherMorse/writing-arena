# AlphaWrite Integration Analysis

> Analysis of how external apps can interface with AlphaWrite for skill gap remediation ("hole-filling").

## Overview

This document compares AlphaWrite's activity library against a target lesson curriculum to assess integration viability.

---

## Integration Methods

### 1. Deep-Linking (Recommended)

Send students directly to specific activities via URL:

```
https://alphawrite.alpha.school/practice/{grade}/{difficulty}/{activity-slug}
```

**Parameters:**
- `grade`: 3, 4, 5, or 6
- `difficulty`: Always `2` (Easy) — all new content uses Easy difficulty
- `activity-slug`: URL-friendly identifier (e.g., `fragment-or-sentence`)

**Example:**
```
/practice/3/2/fragment-or-sentence  → Grade 3, Fragment or Sentence
/practice/4/2/basic-conjunctions    → Grade 4, Because/But/So
```

### 2. REST API

Available at `/api/rest/`:

| Endpoint | Description |
|----------|-------------|
| `GET /activity/manifest` | List all activities with slugs, IDs, metadata |
| `GET /level/roadmap` | List all levels in curriculum order |
| `GET /level/assigned` | Get assigned activities for a student (INTEGRATION POINT) |
| `GET /users/{userId}/sessions` | Query student session/result history |

### 3. Assessment Result Sync

TimeBack/OneRoster integration exists for syncing:
- Session progress
- Correct/incorrect counts
- Mastery status
- Score progression

---

## Curriculum Mapping

### Target Lesson Structure

```
## Sentence Lessons (Bronze Skills) — 5 lessons
1. Because/But/So ✅ (MVP)
2. Appositive ✅ (MVP)
3. Sentence Expansion
4. Subordinating Conjunction
5. Fragment/Run-on

## Paragraph Lessons (Silver Skills) — 5 lessons
1. Topic Sentence
2. Supporting Details
3. Concluding Sentence
4. Internal Transitions
5. Paragraph Coherence

## Essay Lessons (Gold Skills) — 5 lessons
1. Thesis Development
2. Paragraph Transitions
3. Introduction Structure
4. Conclusion Structure
5. Multi-Idea Development
```

---

## Sentence Level (Bronze) — Mapping

| Target Lesson | AlphaWrite Activity | Slug | Status |
|---------------|---------------------|------|--------|
| **Because/But/So** | `BASIC_CONJUNCTIONS` | `basic-conjunctions` | ✅ Direct match |
| **Appositive** | `IDENTIFY_APPOSITIVES` | `identify-appositives` | ✅ Direct match |
| **Appositive** | `WRITE_APPOSITIVES` | `write-appositives` | ✅ Direct match |
| **Sentence Expansion** | `KERNEL_EXPANSION` | `kernel-expansion` | ✅ Direct match |
| **Sentence Expansion** | `COMBINE_SENTENCES` | `combine-sentences` | ✅ Direct match |
| **Subordinating Conjunction** | `SUBORDINATING_CONJUNCTIONS` | `subordinating-conjunctions` | ✅ Direct match |
| **Fragment/Run-on** | `FRAGMENT_OR_SENTENCE` | `fragment-or-sentence` | ⚠️ Partial — fragments only, no run-on detection |

### Additional AlphaWrite Sentence Activities (not in target curriculum)

| Activity | Slug | Description |
|----------|------|-------------|
| `UNSCRAMBLE_SENTENCES` | `unscramble-sentences` | Word order practice |
| `IDENTIFY_SENTENCE_TYPE` | `identify-sentence-type` | Declarative/interrogative/etc |
| `CHANGE_SENTENCE_TYPE` | `change-sentence-type` | Convert between types |
| `USE_SENTENCE_TYPES` | `use-sentence-types` | Write specific types |
| `WRITE_SENTENCE_ABOUT_PICTURE` | `write-sentence-about-picture` | Generative from prompts |

---

## Paragraph Level (Silver) — Mapping

| Target Lesson | AlphaWrite Activity | Slug | Status |
|---------------|---------------------|------|--------|
| **Topic Sentence** | `IDENTIFY_TOPIC_SENTENCE` | `identify-topic-sentence` | ✅ Direct match |
| **Topic Sentence** | `MAKE_TOPIC_SENTENCES` | `make-topic-sentences` | ✅ Direct match |
| **Topic Sentence** | `TOPIC_BRAINSTORM` | `topic-brainstorm` | ✅ Direct match |
| **Supporting Details** | `IDENTIFY_TOPIC_SENTENCE_AND_SEQUENCE_DETAILS` | `identify-ts-and-sequence-details` | ✅ Covered |
| **Supporting Details** | `ELIMINATE_IRRELEVANT_SENTENCES` | `eliminate-irrelevant-sentences` | ✅ Covered |
| **Supporting Details** | `WRITING_SPOS` | `writing-spos` | ✅ Covered |
| **Concluding Sentence** | `WRITE_CS_FROM_DETAILS` | `write-cs-from-details` | ⚠️ Exists but not in main list |
| **Internal Transitions** | `USING_TRANSITION_WORDS` | `using-transition-words` | ✅ Direct match |
| **Internal Transitions** | `FINISHING_TRANSITION_WORDS` | `finishing-transition-words` | ✅ Direct match |
| **Paragraph Coherence** | `ELIMINATE_IRRELEVANT_SENTENCES` | `eliminate-irrelevant-sentences` | ⚠️ Implicit coverage |
| **Paragraph Coherence** | `ELABORATE_PARAGRAPHS` | `elaborate-paragraphs` | ⚠️ Implicit coverage |

### Additional AlphaWrite Paragraph Activities

| Activity | Slug | Description |
|----------|------|-------------|
| `TURN_PARAGRAPH_INTO_SPO` | `turn-paragraph-into-spo` | Reverse-engineering outlines |
| `TURN_OUTLINE_INTO_DRAFT` | `turn-outline-into-draft` | Forward drafting |
| `WRITE_FREEFORM_PARAGRAPH` | `write-freeform-paragraph` | Open-ended writing |

---

## Essay Level (Gold) — Mapping

| Target Lesson | AlphaWrite Activity | Slug | Status |
|---------------|---------------------|------|--------|
| **Thesis Development** | `WRITE_T_FROM_TOPIC` | `write-t-from-topic` | ⚠️ Partial |
| **Thesis Development** | `DISTINGUISH_GST` | `distinguish-g-s-t` | ⚠️ Partial |
| **Introduction Structure** | `WRITE_INTRODUCTORY_SENTENCES` | `write-introductory-sentences` | ⚠️ Partial |
| **Introduction Structure** | `WRITE_G_S_FROM_T` | `write-g-s-from-t` | ⚠️ Partial |
| **Conclusion Structure** | `CRAFT_CONCLUSION_FROM_GST` | `craft-conclusion-from-gst` | ⚠️ Partial |
| **Paragraph Transitions** | `PRE_TRANSITION_OUTLINE` | `pre-transition-outline` | ⚠️ In progress |
| **Multi-Idea Development** | `MATCH_DETAILS_PRO_CON` | `match-details-pro-con` | ⚠️ Limited |

> **Note:** AlphaWrite's product overview states: *"We don't yet help students write entire essays."*

---

## Coverage Summary

| Skill Level | Target Lessons | AlphaWrite Activities | Gap Assessment |
|-------------|----------------|----------------------|----------------|
| **Sentence (Bronze)** | 5 | 12 | 🟢 Full coverage + extras |
| **Paragraph (Silver)** | 5 | 12 | 🟢 Strong coverage, minor gaps |
| **Essay (Gold)** | 5 | ~6 | 🔴 Early-stage only |

---

## Integration Recommendations

### ✅ Strong Candidates for AlphaWrite Deep-Linking

**Sentence Level (all):**
- Because/But/So → `/practice/{grade}/2/basic-conjunctions`
- Appositive → `/practice/{grade}/2/identify-appositives` + `/practice/{grade}/2/write-appositives`
- Sentence Expansion → `/practice/{grade}/2/kernel-expansion`
- Subordinating Conjunction → `/practice/{grade}/2/subordinating-conjunctions`
- Fragment → `/practice/{grade}/2/fragment-or-sentence`

**Paragraph Level (most):**
- Topic Sentence → `/practice/{grade}/2/identify-topic-sentence`
- Supporting Details → `/practice/{grade}/2/eliminate-irrelevant-sentences`
- Internal Transitions → `/practice/{grade}/2/using-transition-words`

### ⚠️ Requires Own Implementation

- **Run-on sentence detection** (not in AlphaWrite)
- **Explicit paragraph coherence** (only implicit coverage)
- **Full Essay lessons** (AlphaWrite coverage is incomplete)

---

## Why Link vs. Rip Content

| Factor | Rip Content | Link + Sync |
|--------|-------------|-------------|
| Implementation effort | Very high | Low |
| Grading quality | Must rebuild AI grading | Full AlphaWrite quality |
| Feedback quality | Basic or none | Rich, age-appropriate |
| Maintenance burden | High | None |
| Content updates | Manual | Automatic |
| LLM costs | You pay | AlphaWrite pays |

**Recommendation:** Link + Sync for all Bronze/Silver lessons where coverage exists.

---

## Complete Activity Reference

All AlphaWrite activities with their slugs for deep-linking.

### Sentence Activities

| Index | Activity ID | Slug | Display Name | Grades |
|-------|-------------|------|--------------|--------|
| 02 | `FRAGMENT_OR_SENTENCE` | `fragment-or-sentence` | Fragment or Sentence? | 3-5 |
| 04 | `UNSCRAMBLE_SENTENCES` | `unscramble-sentences` | Unscramble Sentences | 3-5 |
| 05 | `IDENTIFY_SENTENCE_TYPE` | `identify-sentence-type` | Identify the Sentence Type | 3-5 |
| 06 | `CHANGE_SENTENCE_TYPE` | `change-sentence-type` | Change the Sentence Type | 3-5 |
| 07 | `USE_SENTENCE_TYPES` | `write-sentence-type` | Write the Sentence Type | 3-5 |
| 08 | `WRITE_SENTENCE_ABOUT_PICTURE` | `write-sentence-about-picture` | Write Questions About a Picture | 3-5 |
| 09 | `EXPOSITORY_WRITING_TERMS` | `expository-writing-terms` | Practice Expository Writing Terms | 3-5 |
| 10 | `VIVID_VOCABULARY` | `vivid-vocabulary` | Choosing Vivid, Varied, and Precise Words | 3-5 |
| 11 | `BASIC_CONJUNCTIONS` | `basic-conjunctions` | Because, But, So | 3-5 |
| 12 | `IDENTIFY_APPOSITIVES` | `identify-appositives` | Identify Appositives | 3-5 |
| 13 | `WRITE_APPOSITIVES` | `write-appositives` | Write Appositives | 3-5 |
| 13A | `BRAINSTORM_APPOSITIVES` | `brainstorm-appositives` | Brainstorm Appositives | 3-5 |
| 14 | `SUBORDINATING_CONJUNCTIONS` | `subordinating-conjunctions` | Complete Subordinating Conjunctions | 3-5 |
| 15 | `COMBINE_SENTENCES` | `combine-sentences` | Combine Sentences | 3-5 |
| 16 | `KERNEL_EXPANSION` | `kernel-expansion` | Kernel Expansion | 3-5 |
| 17 | `KERNEL_EXPANSION_SCAFFOLDS` | `kernel-expansion-scaffolds` | Kernel Expansion Scaffolds | 3-5 |

### Note-Taking Activities

| Index | Activity ID | Slug | Display Name | Grades |
|-------|-------------|------|--------------|--------|
| 120 | `IDENTIFY_KEYWORDS` | `identify-keywords` | Identify Keywords | 3-5 |
| 121 | `CONVERT_SENTENCE_TO_NOTES` | `convert-sentence-to-notes` | Convert Sentence to Notes | 3-5 |
| 122 | `CONVERT_NOTES_TO_SENTENCE` | `convert-notes-to-sentence` | Convert Notes to Sentence | 3-5 |

### Paragraph Activities

| Index | Activity ID | Slug | Display Name | Grades |
|-------|-------------|------|--------------|--------|
| 19 | `IDENTIFY_TOPIC_SENTENCE` | `identify-topic-sentence` | Identify Topic Sentences | 3-5 |
| 20 | `TOPIC_BRAINSTORM` | `topic-brainstorm` | Topic Brainstorm | 3-5 |
| 21 | `TOPIC_SENTENCE_MATCHING` | `topic-sentence-matching` | Topic Sentence Matching | 3-5 |
| 21C | `IDENTIFY_TOPIC_SENTENCE_AND_SEQUENCE_DETAILS` | `identify-ts-and-sequence-details` | Identify Topic Sentence and Sequence Details | 3-5 |
| 22 | `ELIMINATE_IRRELEVANT_SENTENCES` | `eliminate-irrelevant-sentences` | Eliminate Irrelevant Sentences | 3-5 |
| 23 | `WRITE_TS_FROM_DETAILS` | `write-ts-from-details` | Write Topic Sentences from Details | 3-5 |
| 24 | `WRITE_CS_FROM_DETAILS` | `write-cs-from-details` | Write Concluding Sentences from Details | 3-5 |
| 25 | `MAKE_TOPIC_SENTENCES` | `make-topic-sentences` | Make Topic Sentences | 3-5 |
| 26 | `USE_THREE_STRATEGIES` | `use-three-strategies` | Use Three Strategies | 3-5 |
| 27 | `TURN_PARAGRAPH_INTO_SPO` | `turn-paragraph-into-spo` | Turn Paragraph into Single Paragraph Outline | 3-5 |
| 28 | `WRITING_SPOS` | `writing-spos` | Writing Single Paragraph Outlines | 3-5 |
| 29 | `TURN_OUTLINE_INTO_DRAFT` | `turn-outline-into-draft` | Turn Outline into Draft | 3-5 |
| 30 | `ELABORATE_PARAGRAPHS` | `elaborate-paragraphs` | Elaborate on Paragraphs | 3-5 |
| 31 | `USING_TRANSITION_WORDS` | `using-transition-words` | Using Transition Words | 3-5 |
| 32 | `FINISHING_TRANSITION_WORDS` | `finishing-transition-words` | Finishing Transition Words | 3-5 |
| 33 | `WRITE_FREEFORM_PARAGRAPH` | `write-freeform-paragraph` | Write a Free-Form Paragraph | 3-5 |

### Essay Activities (Early-Stage)

| Index | Activity ID | Slug | Display Name | Grades |
|-------|-------------|------|--------------|--------|
| 34 | `DISTINGUISH_GST` | `distinguish-g-s-t` | Distinguish GST Statements | 3-5 |
| 35 | `WRITE_S_FROM_G_T` | `write-s-from-g-t` | Write Specific Statement | 3-5 |
| 36 | `WRITE_G_S_FROM_T` | `write-g-s-from-t` | Write General and Specific Statements | 3-5 |
| 37 | `CRAFT_CONCLUSION_FROM_GST` | `craft-conclusion-from-gst` | Write Conclusion Paragraphs | 3-5 |
| 38 | `WRITE_INTRODUCTORY_SENTENCES` | `write-introductory-sentences` | Add Sentences to an Introductory Paragraph | 3-5 |
| 39 | `WRITE_T_FROM_TOPIC` | `write-t-from-topic` | Write a Thesis Statement from Topic | 3-5 |
| 40 | `MATCH_DETAILS_PRO_CON` | `match-details-pro-con` | Match Details with Pro/Con Topic Sentences | 3-5 |
| 50 | `PRE_TRANSITION_OUTLINE` | `pre-transition-outline` | Write a Pre-Transition Outline | 3-5 |

### Deep-Link URL Template

```
https://alphawrite.alpha.school/practice/{grade}/2/{slug}
```

**Examples:**
```bash
# Sentence activities
/practice/3/2/fragment-or-sentence
/practice/4/2/basic-conjunctions
/practice/5/2/kernel-expansion

# Paragraph activities
/practice/4/2/identify-topic-sentence
/practice/5/2/writing-spos
/practice/5/2/using-transition-words

# Essay activities
/practice/5/2/distinguish-g-s-t
/practice/6/2/write-introductory-sentences
```

---

## References

- AlphaWrite Product Overview: `.cursor/rules/product-overview.mdc`
- Activity Manifest: `packages/edu-core/src/activities/manifest.ts`
- Grader Configs: `packages/edu-core/src/grading/adaptive-grader/activities-with-grader-config.md`
- TimeBack Integration: `packages/scribe-api/src/integrations/timeback.ts`
- REST API: `apps/scribe/pages/api/rest/[...trpc].ts`

