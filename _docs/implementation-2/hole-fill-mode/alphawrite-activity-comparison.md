# AlphaWrite Activities: Imported vs Not Imported

## ✅ Already Imported (22 activities)

| # | AlphaWrite Activity | Our Lesson |
|---|---------------------|------------|
| 02 | fragment-or-sentence | `fragment-or-sentence` |
| 11 | basic-conjunctions | `basic-conjunctions` |
| 13 | write-appositives | `write-appositives` |
| 14 | subordinating-conjunctions | `subordinating-conjunctions` |
| 16 | kernel-expansion | `kernel-expansion` |
| 19 | identify-topic-sentence | `identify-topic-sentence` |
| 22 | eliminate-irrelevant-sentences | `eliminate-irrelevant-sentences` |
| 23 | write-ts-from-details | `write-ts-from-details` |
| 24 | write-cs-from-details | `write-cs-from-details` |
| 25 | make-topic-sentences | `make-topic-sentences` |
| 28 | writing-spos | `writing-spos` |
| 30 | elaborate-paragraphs | `elaborate-paragraphs` |
| 31 | using-transition-words | `using-transition-words` |
| 32 | finishing-transition-words | `finishing-transition-words` |
| 34 | distinguish-g-s-t | `distinguish-g-s-t` |
| 35 | write-s-from-g-t | `write-s-from-g-t` |
| 36 | write-g-s-from-t | `write-g-s-from-t` |
| 37 | craft-conclusion-from-gst | `craft-conclusion-from-gst` |
| 38 | write-introductory-sentences | `write-introductory-sentences` |
| 39 | write-t-from-topic | `write-t-from-topic` |
| 40 | match-details-pro-con | `match-details-pro-con` |
| 50 | pre-transition-outline | `pre-transition-outline` |

---

## ❌ Not Yet Imported (21 activities)

### Sentence Level (Tier 1)

| # | Activity | Description |
|---|----------|-------------|
| 04 | unscramble-sentences | Put scrambled words in correct order |
| 05 | identify-sentence-type | Identify declarative/interrogative/etc. |
| 06 | change-sentence-type | Convert between sentence types |
| 07 | write-sentence-type | Write a specific sentence type |
| 08 | write-sentence-about-picture | Describe an image |
| 09 | expository-writing-terms | Learn writing vocabulary |
| 10 | vivid-vocabulary | Replace bland words with vivid ones |
| 12 | identify-appositives | Find appositives in sentences |
| 13A | brainstorm-appositives | Generate appositive ideas |
| 15 | combine-sentences | Join two sentences into one |
| 17 | kernel-expansion-scaffolds | Guided sentence expansion |

### Paragraph Level (Tier 2)

| # | Activity | Description |
|---|----------|-------------|
| 20 | topic-brainstorm | Generate ideas for a topic |
| 21 | topic-sentence-matching | Match topic sentences to paragraphs |
| 21C | identify-ts-and-sequence-details | Find TS and order details |
| 26 | use-three-strategies | Improve topic sentences with strategies |
| 27 | turn-paragraph-into-spo | Extract outline from paragraph |
| 29 | turn-outline-into-draft | Convert outline to paragraph |
| 33 | write-freeform-paragraph | Write a complete paragraph freely |

### Essay Level (Tier 3)

✅ All essay activities are now imported!

### Note-Taking Skills

| # | Activity | Description |
|---|----------|-------------|
| 120 | identify-keywords | Find key words in text |
| 121 | convert-sentence-to-notes | Turn sentences into notes |
| 122 | convert-notes-to-sentence | Turn notes into sentences |

---

## High-Value Missing Activities

**Most useful to add:**

1. **26-use-three-strategies** - Revising weak sentences (related to revision goals)
2. **29-turn-outline-into-draft** - Key paragraph skill
3. **27-turn-paragraph-into-spo** - Reverse of above
4. **50-pre-transition-outline** - Multi-paragraph planning
5. **10-vivid-vocabulary** - Word choice improvement
6. **15-combine-sentences** - Sentence fluency

---

## Missing from Checklists (Not in AlphaWrite)

From `docs/9_Reference_Docs/writing-assessment-checklists.md`, these editing skills are NOT covered by any AlphaWrite activity:

| Skill | Status |
|-------|--------|
| Tense agreement | ❌ Build from scratch |
| Number agreement | ❌ Build from scratch |
| Repetition removal | ❌ Build from scratch |
| Spelling/capitalization | ❌ Build from scratch |
| Run-on sentences | ⚠️ Partial (fragment-or-sentence covers fragments) |

### Proposed New Activities (Not in AlphaWrite)

| New Lesson Slug | Description | Build Effort |
|-----------------|-------------|--------------|
| `fix-agreement-errors` | Fix tense/number agreement in paragraphs | 🔨 Full build |
| `revise-weak-sentences` | Make vague thesis/topic sentences stronger | 🔧 Adapt from 26-use-three-strategies |
| `eliminate-repetition` | Remove redundant phrases/sentences | 🔨 Full build |
| `revise-paragraph` | Fix multiple error types in one paragraph | 🔧 Adapt from 30-elaborate-paragraphs |

---

## AlphaWrite Source Locations

All activities are located at:
```
_alphawrite/alphawrite-2/packages/edu-core/src/activities/{##-activity-slug}/
```

Each activity folder contains:
- `data/seed.json` - Writing prompts
- `evals/test-data.ts` - Quiz examples
- `grader.config.ts` - Grading criteria
- `index.ts` - Activity metadata

