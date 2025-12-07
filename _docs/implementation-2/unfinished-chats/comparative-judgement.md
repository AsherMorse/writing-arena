# No More Marking's Comparative Judgement Model

## Overview

Comparative Judgement (CJ) is an assessment methodology developed and offered by **No More Marking**, a British education organization. Instead of scoring student writing against a rubric or checklist, it works on a fundamentally different principle.

## The Core Mechanism

1. **Pairwise Comparisons**: Judges (teachers/assessors) are shown **two pieces of student writing** at a time and asked a single question: *"Which one is better?"*

2. **Aggregated Judgments**: Many such "gut-level" comparisons are collected from multiple judges across many pairs. The system uses statistical models (typically the Bradley-Terry model or similar) to compute a rank order for all submissions.

3. **High Reliability**: Research shows that when many such quick, holistic comparisons are aggregated, the resulting rankings are **highly consistent and reliable** — often more so than traditional rubric-based scoring.

## Why It's Effective

From TWR research:

> *"The method...is both more efficient and more reliable than standard methods."*

Key benefits:
- **Faster**: Teachers make quick intuitive judgments rather than scoring against multiple rubric criteria
- **More reliable**: Reduces subjective variance between graders
- **Anonymous**: Student names are hidden; judging is blind
- **Broader perspective**: Teachers see more student work across a grade level, informing instruction

## Traditional Grading vs. CJ

| Traditional Rubric | Comparative Judgement |
|--------------------|----------------------|
| Score against criteria | Compare two pieces |
| Absolute scores | Relative rankings |
| Time-intensive | Fast per judgment |
| Rubric interpretation varies | Holistic "better/worse" is intuitive |
| Single grader per paper | Many comparisons aggregate |

## Application in Our Product

Based on design discussions, we plan to use CJ for:

1. **Ranked matches**: Students write → revise → final work gets compared via CJ
2. **Daily ranking**: Students' work on the same daily prompt is compared
3. **AI-augmented judging**: The AI selects which writing is "better" (not students choosing)
4. **Leaderboard positioning**: Relative rank comes from CJ comparisons, not raw scores

Key decisions:
- *"scores should give you points… relative rank comes from CJ"*
- *"students do not choose the best writing, AI does"*
- CJ comparisons use the same daily prompt to ensure fair comparison

## Why CJ Works for Writing Assessment

The model is particularly powerful for **open-ended writing** where quality is hard to capture in a checkbox rubric — it leverages human judgment's natural ability to recognize "better" writing holistically.

Traditional rubrics can:
- Miss nuanced qualities of good writing
- Lead to "rubric gaming" where students hit checkboxes without real quality
- Create inconsistency between graders interpreting criteria differently

CJ sidesteps these issues by asking the simpler, more intuitive question: "Which is better?"

## References

- No More Marking: https://www.nomoremarking.com/
- The Writing Revolution 2.0 research materials (see `_alphawrite/alphawrite-2/packages/edu-datasets/research/twr/`)

