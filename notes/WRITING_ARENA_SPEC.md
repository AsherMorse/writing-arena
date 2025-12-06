# WritingArena Technical Spec

## Core Concept
Daily async writing competition with AI grading, revision loop, and leaderboards.

## Routes

### Practice Mode (Implemented)
```
/fantasy/practice           # Single-page wizard with custom topic input
```

### Daily Challenge (Planned)
```
/fantasy/dashboard          # Home (Daily Challenge, Practice, Hole-Fill buttons)
/fantasy/daily/write        # Writing phase (7 min paragraph, 15 min essay)
/fantasy/daily/feedback     # AI feedback + original submission
/fantasy/daily/revise       # Editor + feedback sidebar
/fantasy/daily/results      # Score comparison, gap recommendations
/fantasy/daily/leaderboard  # Rank position + top submissions
```

## Grading System

### Adaptive Paragraph Grader
Located in `app/fantasy/_lib/`:
- `grader-config.ts` - TWR-based rubric configuration
- `adaptive-paragraph-grader.ts` - Claude API integration
- `grading.ts` - Public API wrapper

### Score Structure
```typescript
scores: {
  topicSentence: 0-5,
  detailSentences: 0-5,
  concludingSentence: 0-5,
  conventions: 0-5,
  total: 0-20,
  percentage: 0-100
}
```

### Remarks Structure
```typescript
remarks: [{
  type: 'issue',
  severity: 'error' | 'nit',
  category: string,
  concreteProblem: string,      // 50-85 chars
  callToAction: string,          // 70-150 chars
  substringOfInterest?: string   // Exact quote from student text
}]
```

### Gap Detection
- Score ≤ 2: high severity
- Score = 3: low severity
- Score ≥ 4: no gap

## Components

Located in `app/fantasy/_components/`:

| Component | Purpose |
|-----------|---------|
| `Timer.tsx` | Countdown timer with auto-callback |
| `WritingEditor.tsx` | Textarea with word count, min/max validation |
| `PromptCard.tsx` | Display prompt text |
| `FeedbackDisplay.tsx` | Score bars + remark cards |
| `FeedbackSidebar.tsx` | Compact feedback for revision sidebar |
| `ScoreDisplay.tsx` | Percentage score display |
| `LoadingOverlay.tsx` | Full-screen loading state |

## API Routes

### POST /fantasy/api/grade
```typescript
// Request
{ content: string, prompt: string, type: 'paragraph' | 'essay', gradeLevel?: number }

// Response
{ result: GraderResult, gaps: SkillGap[], hasSevereGap: boolean }
```

## Practice Flow

1. **Prompt Phase**: User enters custom topic
2. **Write Phase**: 7-min timer, 20-word minimum, 5000-char max
3. **Feedback Phase**: Score + original writing + detailed feedback
4. **Revise Phase**: Side-by-side editor + feedback sidebar, 2-min timer
5. **Results Phase**: Final score with comparison to original

## Data Models (Planned)

### User Extensions
- screenName, avatar, mainRank, subRank, totalXP

### DailyPrompt
- id, date, type, prompt, passage?

### Submission
- userId, date, mode, promptId
- originalText, revisedText
- originalScore, revisedScore
- remarks, gaps

## Existing Systems to Reuse
- AuthContext (Google OAuth)
- Firebase config
- Tailwind + fantasy theming

## New Systems Needed
- Daily prompt generation/storage
- Submission persistence
- XP/rank calculation
- Leaderboard queries
- Hourly cron for percentiles
