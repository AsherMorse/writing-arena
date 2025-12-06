# WritingArena

Daily writing battles with AI feedback and leaderboards. No multiple choice—just actual writing.

## What It Is

Students write paragraphs (and eventually essays) under time pressure, receive instant AI feedback, revise once, and see where they rank.

## Current Implementation

### Practice Mode (`/fantasy/practice`)
- User enters custom topic
- 7-minute writing phase
- AI grades with detailed feedback (score breakdown + actionable remarks)
- 2-minute revision phase with feedback sidebar
- Score comparison on completion

## Planned Features

### Three Modes from Home
| Mode | Description |
|------|-------------|
| **Daily Challenge** | Ranked, same prompt for everyone, 1 attempt/day |
| **Practice** | Unlimited, pick your topics ✓ Implemented |
| **Hole-Fill** | AI-recommended lessons to fix skill gaps |

### Daily Challenge Flow
```
Dashboard → Write (7/15 min) → Feedback → Revise (2 min) → Results → Leaderboard
```

## Grading System

### Score Categories (each 0-5)
- **Topic Sentence** — Clear main idea addressing prompt
- **Detail Sentences** — Specific supporting details with transitions
- **Concluding Sentence** — Wraps up without just repeating
- **Conventions** — Grammar, spelling, punctuation

### Feedback Types
- **Errors** — Major issues affecting meaning/structure
- **Nits** — Minor improvements, doesn't fail the paragraph

## Ranking System (Planned)

### Main Ranks (1-2 weeks each)
1. **Scribe** — Paragraph mode
2. **Scholar** — Unlocks Essay mode
3. **Lorekeeper** — Advanced

### Subranks
- Tiers I, II, III under each main rank
- Progress every 1-2 days
- No deranking

## Technical Stack

- Next.js App Router
- Claude API for grading (TWR methodology)
- Firebase (Auth, Firestore)
- Fantasy/medieval theming

## Success Metric

> "4 hours to move a student from 10/20 to 16/20 on paragraph writing"
