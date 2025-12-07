# WritingArena Technical Spec

## Core Concept
Daily writing competition with AI grading, revision loop, and leaderboards. Students at the same rank level all get the same prompts in the same order, enabling direct comparison.

## Game Modes

### Daily Challenge
- **Not limited to 1/day** — Students can continue through multiple prompts
- **Presented as "daily challenge"** — Feels like 1 and done, but option to continue
- All paragraph-rank players do Prompt 1, then Prompt 2, etc. in order
- Essay-rank players get different prompts but same sequential system
- Comparison is against others who completed the same prompt number
- Fewer players at higher prompt numbers = higher chance of #1

### Practice Mode
- Playground for writing about whatever you want
- No leaderboard, no ranking impact
- Get AI feedback and improve
- Custom topic input

### Hole-Fill (Future)
- AI-detected skill gaps route to targeted lessons
- Remedial content from Alphawrite

## Routes

### Currently Implemented
```
/fantasy                    # Landing page
/fantasy/practice           # Single-page wizard with custom topic
```

### Daily Challenge (To Build)
```
/fantasy/dashboard          # Home: rank badge, Daily Challenge button, Practice, Hole-Fill
/fantasy/daily/write        # Writing phase (7 min paragraph, 15 min essay)
/fantasy/daily/feedback     # AI feedback + original submission shown
/fantasy/daily/revise       # Side-by-side: editor + feedback sidebar (2 min)
/fantasy/daily/results      # Score breakdown, draft→revised comparison, gap analysis
/fantasy/daily/leaderboard  # Your position + top 3 visible + ability to read peer essays
```

## Ranking System

### Main Ranks (No Subranks)
| Rank | Unlocks | Time to Progress |
|------|---------|------------------|
| **Scribe** | Paragraph mode | Starting rank |
| **Scholar** | Essay mode | 1-2 weeks of play |
| **Lorekeeper** | Advanced essays | 1-2 weeks of play |

- No deranking — only moves up
- Progression based on consistent performance + mastery threshold (90%)
- Medieval-themed screen names

### XP Sources
- AI score (0-20) converted to XP
- Percentile bonus from comparative ranking
- Essay mode earns more XP than paragraph
- "Favorite pick" action

## Prompt System

### Sequential Prompts Per Rank
- Prompt pool for each rank level (paragraph vs essay)
- Everyone at a rank level does prompts in same order
- Prompt 1 today, Prompt 2 if they continue, etc.
- Daily reset: next day starts with next unseen prompt
- Prompts stored permanently for history

### Prompt Types by Level
| Level | Prompt Type |
|-------|-------------|
| Scribe (paragraph) | Fun prompts, no passage |
| Scholar (essay) | Fun prompts, no passage |
| Lorekeeper (essay) | Text-dependent with reading passage |

## Grading System

### Adaptive Paragraph Grader
Located in `app/fantasy/_lib/`:
- `grader-config.ts` — TWR-based rubric configuration
- `adaptive-paragraph-grader.ts` — Claude API integration
- `grading.ts` — Public API wrapper

### Score Categories (each 0-5, total 20)
| Category | What It Measures |
|----------|------------------|
| Topic Sentence | Clear main idea addressing prompt |
| Detail Sentences | Specific support with transitions |
| Concluding Sentence | Wraps up without repeating |
| Conventions | Grammar, spelling, punctuation |

### Remarks
```typescript
{
  severity: 'error' | 'nit',
  category: string,
  concreteProblem: string,      // 50-85 chars, friendly
  callToAction: string,          // 70-150 chars, encouraging
  substringOfInterest?: string   // Exact quote from student
}
```

- **error**: Major issues, paragraph not successful without fixing
- **nit**: Minor improvements, student gets credit but should note

### Gap Detection
- Score 0-2: high severity gap
- Score 3: low severity gap (developing)
- Score 4-5: no gap

## Leaderboards

### Daily Leaderboard (per prompt)
- Shows top 10 for that prompt
- Shows your position ± 2 neighbors
- Displays percentile ("top 23% today")
- Internal only (behind login)
- Can read top submissions

### Comparison Logic
- Only compare against others who did same prompt number
- Later prompts have fewer players = easier to rank high
- Hourly cron recalculates percentiles

### Student Favorites
- After submitting, see 2 curated peer submissions
- Pick one favorite + give short reason
- Feeds into "Most Admired" display

## Flow: Daily Challenge

```
1. Dashboard → See rank, "Daily Challenge" button
2. Click → See today's prompt (or next in sequence)
3. Write (7 min paragraph / 15 min essay) → Auto-submit or early
4. Feedback → Score + original shown + detailed remarks
5. Revise (2 min) → Editor + feedback sidebar
6. Results → Final score, comparison to draft, gap recommendations
7. Leaderboard → Your rank, top 3 visible, read peer essays
8. Option: "Continue to next prompt" OR "Done for today"
```

## Components

Located in `app/fantasy/_components/`:

| Component | Purpose |
|-----------|---------|
| `Timer.tsx` | Countdown with auto-callback, red warning <60s |
| `WritingEditor.tsx` | Textarea, word count, 20-word min, 5000-char max |
| `PromptCard.tsx` | Display prompt in styled card |
| `FeedbackDisplay.tsx` | Score bars + remark cards |
| `FeedbackSidebar.tsx` | Compact feedback for revision phase |
| `ScoreDisplay.tsx` | Big percentage score |
| `LoadingOverlay.tsx` | Full-screen loading state |

## API Routes

### POST /fantasy/api/grade
```typescript
// Request
{ content: string, prompt: string, type: 'paragraph' | 'essay', gradeLevel?: number }

// Response  
{ result: GraderResult, gaps: SkillGap[], hasSevereGap: boolean }
```

## Data Models (To Build)

### User Profile Extensions
```typescript
{
  screenName: string,           // Medieval themed, immutable
  avatar: string,
  mainRank: 'scribe' | 'scholar' | 'lorekeeper',
  totalXP: number,
  currentPromptIndex: number,   // Which prompt they're on
}
```

### DailyPrompt
```typescript
{
  id: string,
  index: number,                // Sequential order
  rankLevel: 'paragraph' | 'essay',
  prompt: string,
  passage?: string,             // For Lorekeeper level
}
```

### Submission
```typescript
{
  oderId,
  odayId,
  promptId,
  promptIndex: number,
  originalText: string,
  revisedText: string,
  originalScore: GraderResult,
  revisedScore: GraderResult,
  percentile?: number,
  xpEarned: number,
  createdAt, revisedAt
}
```

### FavoritePick
```typescript
{
  oderId,
  odayId,
  promptIndex: number,
  chosenSubmissionId: string,
  reason: string
}
```

## Moderation
- AI checks all submissions for profanity, hate, sexual content
- Flagged submissions: still ranked, hidden from public display
- Top entries and favorites filtered through moderation

## Success Metrics

### Primary
> "4 hours to move a student from 10/20 to 16/20 on paragraph writing"

### Pilot
- 10 grade-6 students, 8 weeks
- Target: +4 points average improvement
- Pass Alpha Standardized Writing G8 at 90%

## Tech Stack
- Next.js App Router
- Claude API (Anthropic) for grading
- Firebase (Auth, Firestore, Cloud Functions)
- Hourly cron for percentile recalculation
- Fantasy/medieval Tailwind theming
