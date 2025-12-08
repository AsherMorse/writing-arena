# AlphaWrite Grading Methods Analysis

## Overview
This document analyzes which grading method each AlphaWrite activity uses, to ensure we implement the correct approach for each lesson.

---

## Grading Methods in AlphaWrite

### Method 1: Cardinal Rubric (`runCardinalAssessment`)
- **Returns**: Per-section scores (0-5 each) + overall percentage
- **Used for**: Full paragraph/outline writing activities
- **Model**: o3-mini with structured output
- **Structured Schema**: Zod schema defines exact scorecard structure

### Method 2: Adaptive Grader (`runAdaptiveGrader`)
- **Returns**: `isCorrect` boolean + `remarks[]` array
- **Used for**: Sentence-level skills, identification tasks, specific TWR exercises
- **Model**: Claude Sonnet 4 with structured output
- **Config**: Uses activity-specific `grader.config.ts` file

---

## Activities Using **Cardinal Rubric** (Per-Section Scoring)

### 1. **28-writing-spos** (Single Paragraph Outlines)
**Rubric**: `single-paragraph-outline-rubric` (20 points total)

**Sections**:
- Topic Sentence (T.S.): 0-5
- Supporting Details & Organization: 0-5
- Concluding Sentence (C.S.): 0-5
- Conventions: 0-5

**Status in Our Codebase**: ✅ Have grader-config, need to add per-section scoring

---

### 2. **30-elaborate-paragraphs** (Revise Unelaborated Paragraphs)
**Rubric**: `elaborated-paragraph-rubric` (10 points total)

**Sections**:
- Improvements to Paragraph: 0-5
- Conventions: 0-5

**Status in Our Codebase**: ✅ Have grader-config, need to add per-section scoring

---

## Activities Using **Adaptive Grader** (No Per-Section Scoring)

All of these return `{ isCorrect, remarks[] }` only. No section-by-section breakdown.

| # | Activity | Our Lesson ID | Has grader.config.ts? |
|---|----------|---------------|----------------------|
| 02 | fragment-or-sentence | `fragment-or-sentence` | ✅ Yes |
| 11 | basic-conjunctions | `basic-conjunctions` | ✅ Yes |
| 13 | write-appositives | `write-appositives` | ✅ Yes |
| 14 | subordinating-conjunctions | `subordinating-conjunctions` | ✅ Yes |
| 16 | kernel-expansion | `kernel-expansion` | ✅ Yes |
| 19 | identify-topic-sentence | `identify-topic-sentence` | ✅ Yes |
| 22 | eliminate-irrelevant-sentences | `eliminate-irrelevant-sentences` | ✅ Yes |
| 23 | write-ts-from-details | `write-ts-from-details` | ✅ Yes |
| 24 | write-cs-from-details | `write-cs-from-details` | ✅ Yes |
| 25 | make-topic-sentences | `make-topic-sentences` | ✅ Yes |
| 31 | using-transition-words | `using-transition-words` | ✅ Yes |
| 32 | finishing-transition-words | `finishing-transition-words` | ✅ Yes |
| 34 | distinguish-g-s-t | `distinguish-g-s-t` | ✅ Yes |
| 35 | write-s-from-g-t | `write-s-from-g-t` | ✅ Yes |
| 36 | write-g-s-from-t | `write-g-s-from-t` | ✅ Yes |
| 37 | craft-conclusion-from-gst | `craft-conclusion-from-gst` | ✅ Yes |
| 38 | write-introductory-sentences | `write-introductory-sentences` | ✅ Yes |
| 39 | write-t-from-topic | `write-t-from-topic` | ✅ Yes |
| 40 | match-details-pro-con | `match-details-pro-con` | ✅ Yes |
| 50 | pre-transition-outline | `pre-transition-outline` | ✅ Yes |

---

## Not-Yet-Imported Activities That Use Cardinal Rubric

### **33-write-freeform-paragraph** (Write a Complete Paragraph)
**Rubric**: `single-paragraph-rubric` (20 points total)

**Sections**:
- Topic Sentence (T.S.): 0-5
- Supporting Details & Organization: 0-5
- Concluding Sentence (C.S.): 0-5
- Conventions: 0-5

**Note**: Same sections as SPO rubric, but for freeform paragraph writing instead of outlines.

**Status**: ❌ Not imported yet

---

## Summary

### Cardinal Rubric Activities (Need Per-Section Scoring)
1. ✅ `writing-spos` (4 sections)
2. ✅ `elaborate-paragraphs` (2 sections)
3. ❌ `write-freeform-paragraph` (4 sections) - not imported

### Adaptive Grader Activities (Current Implementation OK)
- All 20 other imported activities
- Return `{ isCorrect, remarks[] }`
- Use activity-specific `grader.config.ts`
- Already have blocking + retry logic

---

## Implementation Plan

### For Cardinal Rubric Activities (SPO & Elaborate)

**Option A: Hybrid Approach (Recommended)**
```typescript
// Update practice-grader.ts to support per-section scoring
interface GradingResult {
  isCorrect: boolean;
  score: number;
  remarks: GradingRemark[];
  solution: string;
  // ADD: Per-section scores (only for cardinal activities)
  sectionScores?: {
    topicSentence?: number;        // 0-5
    supportingDetails?: number;    // 0-5
    concludingSentence?: number;   // 0-5
    conventions?: number;          // 0-5
    improvements?: number;         // 0-5 (for elaborate-paragraphs)
  };
}
```

**Flow**:
1. Keep using activity-specific `grader-configs/*.ts` for TWR criteria
2. Add scoring request to tool schema for cardinal activities
3. Claude returns both remarks AND section scores
4. Display scores in a sidebar like AlphaWrite

### For Adaptive Grader Activities

**No Changes Needed**:
- ✅ Already using `grader-configs/*.ts`
- ✅ Already have blocking + retry
- ✅ Already return `{ isCorrect, remarks[] }`
- ✅ Match AlphaWrite's behavior

---

## AlphaWrite Source References

**Cardinal Rubric Implementation**:
- `_alphawrite/.../grading/cardinal-rubric/assessment.ts`
- `_alphawrite/.../grading/cardinal-rubric/rubrics/`

**Adaptive Grader Implementation**:
- `_alphawrite/.../grading/adaptive-grader/main.ts`
- `_alphawrite/.../grading/adaptive-grader/create-metadata.ts`

**Activity Service Examples**:
- Cardinal: `_alphawrite/.../activities/28-writing-spos/service.ts`
- Adaptive: `_alphawrite/.../activities/50-pre-transition-outline/service.ts`
