# WritingArena

Daily writing battles with AI feedback and leaderboards. No multiple choice—just actual writing.

## The Core Loop

1. Student sees "Daily Challenge" button
2. Gets a prompt (same as everyone else at their rank)
3. Writes paragraph in 7 minutes
4. Gets instant AI feedback with score breakdown
5. Revises in 2 minutes
6. Sees final score + leaderboard position
7. Option to continue with next prompt OR done for the day

## Key Design Decisions

### "Daily" But Unlimited
- Framed as daily challenge (feels like 1 and done)
- But students can continue through more prompts if motivated
- Each prompt has its own leaderboard
- Later prompts = fewer players = easier to rank #1

### Same Prompts, Same Order
- All paragraph-rank players do Prompt 1, then 2, then 3...
- All essay-rank players do their own sequence
- Direct comparison because everyone does same prompts
- Next day picks up where you left off

### Practice is the Playground
- Daily Challenge = competitive, ranked, same prompts
- Practice = write about whatever you want, get feedback
- No leaderboard in practice, just improvement

## Ranking System

### Three Ranks (No Subranks)
| Rank | Mode | Progression |
|------|------|-------------|
| **Scribe** | Paragraphs only | Starting rank |
| **Scholar** | Unlocks essays | 1-2 weeks |
| **Lorekeeper** | Essays with passages | 1-2 weeks |

- No deranking — only moves up
- Mastery threshold: 90% to advance
- Medieval-themed screen names

## Grading

### Score Breakdown (each 0-5)
- **Topic Sentence** — Clear main idea
- **Detail Sentences** — Specific support with transitions
- **Concluding Sentence** — Wraps up meaningfully
- **Conventions** — Grammar, spelling, punctuation

### Feedback Types
- **Errors** — Must fix (red)
- **Nits** — Should note (yellow)
- Each remark has: problem description + call to action + quote from text

## Current Implementation

### Done
- `/fantasy` — Landing page
- `/fantasy/practice` — Full practice flow
  - Custom topic input
  - 7-min writing with timer
  - AI grading with score breakdown + remarks
  - 2-min revision with feedback sidebar
  - Score comparison on completion

### To Build
- `/fantasy/dashboard` — Home with rank badge + mode buttons
- `/fantasy/daily/*` — Full daily challenge flow
- Prompt storage + sequential system
- Leaderboards + percentile calculation
- Favorites picking
- User profiles with rank + XP
- Hole-fill mode (remedial routing)

## Timers

| Phase | Paragraph | Essay |
|-------|-----------|-------|
| Write | 7 min | 15 min |
| Revise | 2 min | 2 min |

Auto-submit when timer ends. Early submit allowed.

## Success Metric

> "4 hours to move a student from 10/20 to 16/20 on paragraph writing"

## Why It Works

| Problem | WritingArena Solution |
|---------|----------------------|
| Alphawrite doesn't make kids write | Daily writing production |
| WeWillWrite is fun but doesn't teach | Learning science: retrieval + feedback + mastery gating |
| WeWillWrite needs live players | Async — same prompts, compare anytime |
| Writing practice is boring | Leaderboards, ranks, seeing peer work |
