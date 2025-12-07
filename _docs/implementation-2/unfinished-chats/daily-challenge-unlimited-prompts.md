# Daily Challenge: Unlimited Prompts Model

> **Status**: Design decision made, not yet implemented  
> **Date**: December 6, 2025

---

## Problem Statement

Original design had Daily Challenge as 1 prompt/day. Issues:
- "You gotta stop" feeling when kids want to keep writing
- Practice mode (pick your topic) doesn't allow peer comparison

---

## Solution: Unlimited Sequential Prompts

Instead of 1 daily prompt, generate **30 prompts per rank per day** (90 total).

| Decision | Choice |
|----------|--------|
| **Prompts per rank** | 30/day (90 total across 3 ranks) |
| **Ordering** | Sequential (must complete #1 before #2) |
| **Reset** | Daily (fresh 30 each morning) |
| **Leaderboard** | Per-prompt + daily aggregate |
| **Friend comparison** | Show shared prompts + head-to-head scores |

### Why Sequential?

All players at same rank go through prompts in same order:
- Player A's Prompt #5 = Player B's Prompt #5
- Guarantees comparison overlap ("everyone who's done 5 has done the *same* 5")
- Enables async head-to-head without coordination

### Why Daily Reset?

- Matches "daily challenge" framing
- Fresh start every day feels good
- Yesterday's leaderboards get archived

---

## Updated Screen Requirements

### Home Screen

| Element | Change |
|---------|--------|
| **Progress indicator** | "5/30 challenges completed today" (not binary done/not done) |
| **Next prompt button** | "Challenge #6 →" shows next available prompt |
| **Daily aggregate score** | Total points earned today across all prompts |

### Leaderboard Screen

| Element | Description |
|---------|-------------|
| **Prompt leaderboard** | Rankings for current prompt (e.g., "Prompt #4 Leaderboard") |
| **Daily aggregate leaderboard** | Rankings by total score across all prompts done today |
| **Toggle** | Switch between prompt-specific and daily aggregate views |

### Friend Comparison (new feature)

| Element | Description |
|---------|-------------|
| **Shared prompts** | List prompts both you and friend completed |
| **Head-to-head scores** | Your score vs friend's score per prompt |
| **Win/loss indicator** | ✓/✗ per prompt, overall record (e.g., "3-2") |

---

## Data Model Updates

### Firestore Structure

```
dailyPrompts/
  {date}/
    scribe/      → Array of 30 prompts
    scholar/     → Array of 30 prompts
    lorekeeper/  → Array of 30 prompts

dailyChallenges/
  {date}/
    {userId}/
      rank: "scribe"
      submissions: [
        { promptNum: 1, draftScore: 14, revisedScore: 16, ... },
        { promptNum: 2, draftScore: 15, revisedScore: 17, ... },
        ...
      ]
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/daily/prompt` | GET | Get next prompt (based on user progress) |
| `/api/daily/progress` | GET | Get user's completion count + scores for today |
| `/api/daily/leaderboard/[promptNum]` | GET | Leaderboard for specific prompt |
| `/api/daily/leaderboard/aggregate` | GET | Daily aggregate leaderboard |
| `/api/daily/compare/[friendId]` | GET | Head-to-head with specific friend |

---

## Practice Mode (Unchanged)

Practice mode remains separate:
- Pick your own topic
- Unlimited attempts
- Personal progress only (no peer comparison)
- For when kids want to write about what they care about

---

## Open Questions

- [ ] Prompt generation: How do we create 90 quality prompts per day?
- [ ] What happens if a kid actually does all 30? ("Come back tomorrow" is fine)
- [ ] Friend discovery: How do kids find/add friends to compare with?
- [ ] Leaderboard display: Show both views on same screen or separate tabs?

---

## Next Steps

1. Update `screens.md` with new Home/Leaderboard specs
2. Design friend comparison UI
3. Update Firestore schema
4. Build prompt generation pipeline (or manual seed 30×3 for pilot)

