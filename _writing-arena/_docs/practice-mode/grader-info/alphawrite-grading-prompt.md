# AlphaWrite Single Paragraph Grading Prompt

> Source: `_alphawrite/alphawrite-2/packages/edu-core/src/grading/binary-rubric/criteria/paragraphs/`

## Overview

AlphaWrite's paragraph grading prompt is remarkably simple compared to our approach. It has three key characteristics:

1. **Minimal system instructions** - Just one sentence establishing the grader role
2. **Feedback-focused guidance** - Emphasizes examples and reasoning, not methodology jargon
3. **Clean separation** - Rubric, submission, and output format are clearly delineated

## The Prompt Template

```
You are a grader of activities from The Writing Revolution. Grade the following {submissionTypeName} submission that a student submitted using the provided rubric. Make sure you give examples of where students can improve and the reasoning for why your suggested improvement helps. Use examples in your explanations if it makes sense, and keep the feedback detailed and specific. Please adhere to the following output format, where you provide the title, description, categories, and grades for the rubric:

\`\`\`output_format
{
  "title": "{submissionTypeName}",
  "gradedCategories": [
    {
      "title": "<category_title>",
      "description": "<category_description>",
      "criteria": {
        "score": 0,
        "commentsAndFeedback": "<comments_and_feedback>"
      }
    }
  ]
}
\`\`\`

\`\`\`rubric
{rubricJSON}
\`\`\`

Student submission:
\`\`\`submission
{studentText}
\`\`\`
```

## Revision Prompt (for subsequent attempts)

```
The student just revised their submission. Grade the revised submission using the same rubric. Make note of where the student's submission has improved and give examples of where students can further improve and the reasoning for why your suggested improvement helps and might be different than the previous attempt. When you leave feedback, keep a slightly friendly tone. Use examples in your explanations if it makes sense, and keep the feedback detailed and specific. Keep the same output format as before.

\`\`\`submission
{revisedStudentText}
\`\`\`
```

## The Expository Rubric (JSON)

```json
{
  "title": "Single Paragraph Rubric (Expository)",
  "categories": [
    {
      "title": "Topic Sentence",
      "criteria": [
        { "score": 5, "description": "Topic Sentence (T.S.) expresses a clear main idea and accurately addresses the prompt using a sentence type (e.g., appositive or subordinating conjunction). Word choice is precise, sophisticated, and powerful." },
        { "score": 4, "description": "T.S. expresses a clear idea and accurately addresses the prompt using a sentence type. Word choice is precise and appropriate." },
        { "score": 3, "description": "T.S. is a general statement that introduces the topic and addresses the prompt. Word choice is functional." },
        { "score": 2, "description": "T.S. lacks clarity or does not address the prompt fully or accurately. Word choice is simple." },
        { "score": 1, "description": "T.S. lacks clarity or relevance and does not address the prompt. Word choice is simple, repetitive, and inaccurate." },
        { "score": 0, "description": "T.S. is absent or incomplete." }
      ]
    },
    {
      "title": "Detail Sentences",
      "criteria": [
        { "score": 5, "description": "Details clearly support the T.S. and are insightful and fully developed. Written in a variety of sentence structures (e.g., compound, complex) with logical order and frequent transitions. Word choice is precise, sophisticated, and powerful." },
        { "score": 4, "description": "Details support the T.S. and are developed. Written in varied sentence structures and logical order, incorporating transitions. Word choice is precise and appropriate." },
        { "score": 3, "description": "Details support the T.S. but lack full development. Includes some variety in sentence structures but lacks transitions. Word choice is functional." },
        { "score": 2, "description": "Details do not clearly support the T.S. and may lack focus, accuracy, or development. Limited sentence structure variety; not sequenced logically or lacking transitions. Word choice is simple." },
        { "score": 1, "description": "Details do not support the T.S.; they lack clarity, focus, or development. No logical order or transitions. Word choice is simple, repetitive, and inaccurate." },
        { "score": 0, "description": "There are no details to support the T.S." }
      ]
    },
    {
      "title": "Concluding Sentence",
      "criteria": [
        { "score": 5, "description": "Concluding Sentence (C.S.) summarizes or concludes the paragraph using a sentence type (e.g., appositive, subordinating conjunction, or transition). Word choice is precise and sophisticated." },
        { "score": 4, "description": "C.S. summarizes or concludes the paragraph appropriately. Word choice is precise." },
        { "score": 3, "description": "C.S. summarizes the paragraph, but most word choice is functional." },
        { "score": 2, "description": "C.S. is too similar to the T.S. or does not summarize or conclude effectively. Word choice is simple." },
        { "score": 1, "description": "C.S. does not summarize or conclude the paragraph. Word choice is simple, repetitive, and inaccurate." },
        { "score": 0, "description": "C.S. is absent or incomplete." }
      ]
    },
    {
      "title": "Conventions",
      "criteria": [
        { "score": 5, "description": "Paragraph demonstrates control of conventions with no errors." },
        { "score": 4, "description": "Paragraph demonstrates control of conventions with few errors." },
        { "score": 3, "description": "Paragraph demonstrates some control of conventions; occasional errors do not hinder comprehension." },
        { "score": 2, "description": "Errors hinder comprehension." },
        { "score": 1, "description": "Frequent errors make comprehension difficult." },
        { "score": 0, "description": "Lack of knowledge of conventions is evident." }
      ]
    }
  ]
}
```

## Key Differences from Our Approach

| Aspect | AlphaWrite | Our Approach |
|--------|------------|--------------|
| **System instruction** | 1 sentence | Multiple paragraphs with calibration |
| **Grade level** | Not mentioned | Explicit calibration per grade |
| **Methodology branding** | Mentions TWR once | We removed TWR from feedback |
| **Feedback guidance** | "give examples and reasoning" | More structured rules |
| **Output format** | Simple `commentsAndFeedback` string | Structured `examplesOfGreatResults` / `examplesOfWhereToImprove` arrays |
| **Writing techniques** | Listed in rubric only | Separate section in prompt |

## Takeaways

1. **Simplicity works** - AlphaWrite trusts the rubric to do the heavy lifting
2. **No grade calibration** - They don't adjust expectations per grade level in the prompt
3. **Feedback is freeform** - Just a string, not structured arrays of examples
4. **Revision context** - They have a separate prompt for re-grading revised work that notes improvements

