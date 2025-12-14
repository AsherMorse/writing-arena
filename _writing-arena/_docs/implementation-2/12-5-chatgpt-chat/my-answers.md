# WritingArena MVP – Finalized Decisions Summary

## Idea
WritingArena builds real writing skill through quick daily paragraph and essay battles, combining instant AI feedback with competitive leaderboards kids love.

## Authentication
- Google OAuth (existing system)
- Screen name + avatar chosen at account creation, not changeable afterward

## Game Modes
### Paragraph Battle
- 7-minute writing timer
- 2-minute revision timer
- One ranked attempt per day
- Different daily prompt
- Minimum length scales by rank (3–6+ sentences)
- Revised version is the official submission

### Essay Battle
- 15-minute writing timer
- 2-minute revision timer
- One ranked attempt per day
- Different daily prompt
- Unlocks at Main Rank: **Scholar**
- Enforced paragraph separation in UI
- Minimum paragraphs scale by rank (2–4+)
- Extra XP compared to paragraph mode
- Revised version is the official submission

## Ranking System
### Main Ranks (slow progression)
1. Scribe  
2. Scholar (unlocks Essay mode)  
3. Lorekeeper  
- Moves only upward, no deranking
- Progress takes 1–2 weeks per rank

### Subranks (fast progression)
- Levels: I, II, III under each main rank
- Moves upward every 1–2 days
- No deranking

### XP Sources
- AI score converted to XP
- Percentile rank bonus via AI comparative ranking
- Extra XP for Essay mode
- XP from “favorite pick” action
- No negative XP

## Scoring & Ranking Pipeline
- AI gives final 0–20 score after revision
- AI provides feedback (friendly tutor tone)
- AI performs comparative ranking using all of today’s submissions + calibration samples
- Hourly cron job recalculates percentiles and updates XP/ranks
- Both original and revised submissions stored

## Prompts
- Paragraph and essay prompts are different
- Daily, random genre
- Difficulty does not scale during the week
- Prompts stored permanently so kids can view history

## Leaderboards
### Daily Leaderboard (mode-specific)
- Shows top 10
- Shows user slice (your rank ±2)
- Displays percentile (e.g., “top 23% today”)
- Internal only (behind login)

### Weekly Leaderboard
- Sum of daily performance
- No rank reset

### Student Favorites Leaderboard
- After submission, kid sees 2 curated peer submissions
- Kid picks one favorite + gives a short reason
- Screen names visible
- Used for “Most Admired Today” leaderboard

## Identity & Theming
- Screen name + avatar
- Light medieval theming (scrolls, shields, etc.)
- No cosmetic unlocks in MVP
- No houses/factions in MVP

## Moderation
- AI moderation on all submissions (profanity, hate, sexual content)
- Submissions failing moderation remain ranked but hidden from public display
- Top entries and favorites view filtered through moderation
- No comments in MVP

## Storage
- Store both original and revised submissions
- Store prompts, scores, percentile, favorites, XP
- Permanent archive for kid viewing + calibration

## Technical Choices
- Firebase backend (Auth, Firestore, Cloud Functions, Storage)
- Hourly cron job for ranking updates
- Internal-only leaderboards
- Autosave optional (not yet defined)
- Write limit: 1 ranked attempt/day per mode
- No streak mechanic for MVP

## UI Flow
1. Home screen → “Daily Challenge” button + rank badge
2. Choose mode (Paragraph or Essay; Essay locked until Scholar)
3. Writing phase (timer)
4. Revision phase (2 minutes; early submit allowed)
5. Submission stored
6. Favorites pick (2 curated pieces; kid picks 1 + reason)
7. Leaderboard view (score + percentile + rankings)
8. Option to read top entries

