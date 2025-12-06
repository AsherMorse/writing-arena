# WritingArena: Project Overview

> **For**: Developers (Asher, Roger, Tom)  
> **Last Updated**: December 6, 2025

---

## What Is It?

**WritingArena** is a daily writing game where students compete by writing paragraphs and essays.

Every day, every student gets the same prompt. They write, get instant AI feedback, revise once, and see where they rank on a leaderboard. Top submissions are visible so kids can read other kids' writing.

**One-liner**: Daily writing battles with AI feedback and leaderboards—no multiple choice, just actual writing.

---

## Why It Exists

| Problem | WritingArena Solution |
|---------|----------------------|
| **Alphawrite** (current curriculum) doesn't make kids write | Daily writing production, every single day |
| **WeWillWrite** is fun but doesn't teach | Learning science: retrieval practice, elaborated feedback, mastery gating |
| **WeWillWrite** needs live players | Async—same daily prompt, compare anytime |
| Writing practice is boring | Leaderboards, ranks, seeing peer work |

---

## How It Works

See: [`core-flow.md`](./core-flow.md) for detailed flow.

### Quick Summary

```
Home → Daily Challenge → Write (7-15 min) → AI Feedback → Revise (2 min) → Score + Leaderboard
```

**Three modes from home screen:**
1. **Daily Challenge** — Ranked, same prompt for everyone, 1 attempt/day
2. **Practice** — Unlimited, pick topics you like
3. **Hole-Fill** — AI-recommended lessons to fix skill gaps

---

## Progression System

### Prompt Types by Level

| Level | Mode | Prompt Type |
|-------|------|-------------|
| **Paragraphs** | Paragraph battles | Fun prompts (no passage) |
| **Essays (early)** | Essay battles | Fun prompts (no passage) |
| **Essays (advanced)** | Essay battles | Text-dependent with reading passage (matches G8 test) |

### Mastery Gates

```
Paragraphs → 90% (18/20) → Essays (fun) → 90% → Essays (with passage) → 90% → Full Mastery
```

Students cannot skip ahead. Must prove competence at each level before unlocking the next.

### Rank System (TBD)

Medieval-themed ranks with subranks:
- **Scribe** (Tiers 1-3) — Paragraph mode
- **Scholar** (Tiers 1-3) — Essay mode (fun prompts)
- **Lorekeeper** (Tiers 1-3) — Essay mode (with passages)

Screen names are also medieval-themed.

---

## Success Metrics

### Primary Metric
> **"4 hours to move a student from 10/20 to 16/20 on paragraph writing"**

### Pilot Success Criteria

| Metric | Target |
|--------|--------|
| Students | 10 grade-6 students (can pass Sentences I.3) |
| Duration | 8 weeks |
| Improvement | Average score improves by **4+ points** |
| Mastery | Students can pass Alpha Standardized Writing G8 at 90% |

### Assessment

- **Pre-test**: Student writes a paragraph (~10 min), graded by AI
- **Post-test**: Alpha Standardized Writing G8 (essay with document review)
- **Mastery threshold**: 90% (18/20)

---

## Key Features

| Feature | Why It Matters |
|---------|----------------|
| **Same daily prompt for everyone** | Enables fair comparison, async play |
| **AI grading + feedback** | Instant, specific, actionable |
| **Built-in revision loop** | Immediate error correction |
| **Leaderboard + top essays visible** | Kids see what "good" looks like from peers |
| **Mastery gating** | Can't skip ahead until skills are proven |
| **Gap detection → hole-fill** | AI identifies weaknesses, routes to remedial content |
| **No session limits** | Kids can practice as much as they want |

---

## Tech Stack (Existing)

- **Frontend**: Next.js + React + Tailwind
- **Backend**: Next.js API routes
- **Database**: Firebase/Firestore
- **AI Grading**: OpenAI (via existing grading system)
- **Remedial Content**: Alphawrite lessons/activities (integration planned)

---

## Related Docs

| Doc | Description |
|-----|-------------|
| [`new_game_proposal.md`](./new_game_proposal.md) | Full proposal with all sections filled |
| [`core-flow.md`](./core-flow.md) | Detailed daily challenge flow |
| [`essay-criterion-lesson-mapping.md`](../_docs/practice-mode/grader-info/essay-criterion-lesson-mapping.md) | How gaps map to remedial lessons |

---

## Open Questions / TBD

- [ ] Exact rank names and tier thresholds
- [ ] Practice mode UX (topic selection)
- [ ] Hole-fill integration with Alphawrite
- [ ] Prompt generation pipeline (30 prompts at launch)
- [ ] Leaderboard reset cadence (daily? weekly?)

