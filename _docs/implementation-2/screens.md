# WritingArena: Screen Specifications

> **For**: Developers (Asher, Roger, Tom)  
> **Last Updated**: December 6, 2025

---

## MVP Screens (3-Day Build)

| # | Screen | Route | Status | Description |
|---|--------|-------|--------|-------------|
| 1 | **Home** | `/dashboard` | 🔄 Rewire | 3 buttons (Daily Challenge, Practice, Hole-Fill) + profile sidebar with rank/stats |
| 2 | **Write** | `/daily/write` | 🆕 New | Prompt at top + timer (7 min paragraph / 15 min essay) + editor + word count |
| 3 | **Feedback** | `/daily/feedback` | 🆕 New | AI feedback displayed + original submission shown + "Continue to Revise" button |
| 4 | **Revise** | `/daily/revise` | 🆕 New | 2 min timer + editor (pre-filled with draft) + feedback visible in sidebar |
| 5 | **Results** | `/daily/results` | 🔄 Enhance | Score breakdown, draft→revised comparison, in-depth analysis, gap recommendations |
| 6 | **Leaderboard** | `/daily/leaderboard` | 🆕 New | Your rank position + top 3 submissions visible + ability to read peer essays |
| 7 | **Practice** | `/improve/activities` | ✅ Exists | Pick topic, unlimited attempts, no leaderboard |
| 8 | **Hole-Fill** | `/improve` | ✅ Exists | AI-recommended lessons based on detected gaps |
| 9 | **Auth** | `/auth` | ✅ Exists | Sign up / sign in |
| 10 | **Landing** | `/` | ✅ Exists | Marketing page for new users |

**Total new screens to build: 4**  
**Total screens to modify: 2**  
**Total existing screens: 4**

---

## MVP Screen Details

### 1. Home (Rewire)

| Element | Description |
|---------|-------------|
| **Daily Challenge button** | Primary CTA, shows "Today's Challenge" or "Completed ✓" if done |
| **Practice button** | Secondary, "Pick a topic and practice" |
| **Hole-Fill button** | Tertiary, highlighted if gaps detected, "Recommended for you" badge |
| **Profile sidebar** | Rank badge, total challenges completed, current streak |
| **Already completed state** | If daily done, show score + "Come back tomorrow" message |

### 2. Write

| Element | Description |
|---------|-------------|
| **Prompt card** | Full prompt text, type badge (paragraph/essay) |
| **Timer** | Countdown, color changes at 2 min, 1 min, 30 sec |
| **Editor** | Clean textarea, paste-disabled, auto-focus |
| **Word count** | Live count, minimum indicator if needed |
| **Submit button** | Manual submit, or auto-submit when timer ends |

### 3. Feedback

| Element | Description |
|---------|-------------|
| **Original submission** | Student's draft displayed read-only |
| **AI feedback** | Structured remarks with severity (error/warning/tip) |
| **Score preview** | Draft score shown (e.g., "14/20") |
| **Continue button** | "Revise Your Response →" |

### 4. Revise

| Element | Description |
|---------|-------------|
| **Timer** | 2 minutes, prominent display |
| **Editor** | Pre-filled with original draft, editable |
| **Feedback sidebar** | AI remarks visible for reference |
| **Submit button** | Manual or auto-submit at timer end |

### 5. Results (Enhance)

| Element | Description |
|---------|-------------|
| **Score hero** | Final score large, with change indicator (+2 points) |
| **Draft vs Revised** | Side-by-side or stacked comparison |
| **Criterion breakdown** | Each criterion with Yes/Developing/No status |
| **Gap recommendations** | "Practice these skills" with top 3 lesson links |
| **View Leaderboard button** | Navigate to leaderboard |

### 6. Leaderboard

| Element | Description |
|---------|-------------|
| **Your rank** | Position highlighted (e.g., "You placed #12") |
| **Top 3 essays** | Expandable cards showing top submissions |
| **Full leaderboard** | Scrollable list with screen names + scores |
| **Back to Home** | Return to dashboard |

---

## Full Version Screens (Post-MVP)

| # | Screen | Route | Priority | Description |
|---|--------|-------|----------|-------------|
| 1 | **Full Profile** | `/profile` | P2 | Detailed stats, rank history, all-time best scores, achievements |
| 2 | **Rank Progression** | `/profile/rank` | P2 | Visual rank ladder, mastery gates, unlock requirements |
| 3 | **Match History** | `/profile/history` | P2 | All past daily challenges, filterable, re-readable |
| 4 | **Essay Reader** | `/essay/[id]` | P2 | Full-page view of any essay (yours or peer's from leaderboard) |
| 5 | **Settings** | `/settings` | P3 | Screen name change, notifications, preferences |
| 6 | **Onboarding** | `/onboarding` | P3 | First-time tutorial explaining game mechanics |
| 7 | **Achievements** | `/achievements` | P3 | Badges, streaks, milestones display |
| 8 | **Weekly Recap** | `/recap` | P3 | Weekly summary email/screen with progress highlights |
| 9 | **Class View** | `/class` | P3 | Teacher view of student leaderboards (if classroom mode) |
| 10 | **Prompt Archive** | `/prompts` | P3 | Browse past prompts, see winning essays |

---

## Full Version Screen Details

### Full Profile (`/profile`)

| Element | Description |
|---------|-------------|
| **Rank badge** | Large display with tier (Scribe I, Scholar II, etc.) |
| **Stats grid** | Total challenges, win rate, avg score, best score, streak |
| **Rank progress bar** | Visual progress to next tier |
| **Recent activity** | Last 5 daily challenges with scores |
| **Achievements section** | Earned badges displayed |

### Rank Progression (`/profile/rank`)

| Element | Description |
|---------|-------------|
| **Rank ladder** | Visual ladder: Scribe → Scholar → Lorekeeper |
| **Current position** | Highlighted on ladder with progress % |
| **Mastery gates** | "90% to unlock Essays" requirement shown |
| **Tier breakdown** | Scribe I/II/III requirements explained |

### Match History (`/profile/history`)

| Element | Description |
|---------|-------------|
| **Filter controls** | By date, by score, by prompt type |
| **Challenge cards** | Date, prompt title, score, rank achieved |
| **Expand to read** | Click to see full submission + feedback |

### Essay Reader (`/essay/[id]`)

| Element | Description |
|---------|-------------|
| **Full essay** | Complete text, nicely formatted |
| **Metadata** | Author screen name, date, prompt, score |
| **Annotation mode** | (Future) Teacher can leave comments |

### Onboarding (`/onboarding`)

| Element | Description |
|---------|-------------|
| **Step 1** | "Every day, you get one prompt" |
| **Step 2** | "Write your best response in 7 minutes" |
| **Step 3** | "Get AI feedback and revise" |
| **Step 4** | "See where you rank against peers" |
| **Skip button** | For returning users |

---

## Screen Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         LANDING                             │
│                      (new users)                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                          AUTH                               │
│                   (sign up / sign in)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                          HOME                               │
│     ┌──────────────┬──────────────┬──────────────┐         │
│     │    Daily     │   Practice   │   Hole-Fill  │         │
│     │  Challenge   │              │              │         │
│     └──────┬───────┴──────┬───────┴──────┬───────┘         │
└────────────┼──────────────┼──────────────┼──────────────────┘
             │              │              │
             ▼              │              │
┌────────────────────┐      │              │
│       WRITE        │      │              │
│  (prompt + timer)  │      │              │
└─────────┬──────────┘      │              │
          │                 │              │
          ▼                 │              │
┌────────────────────┐      │              │
│     FEEDBACK       │      │              │
│   (AI response)    │      │              │
└─────────┬──────────┘      │              │
          │                 │              │
          ▼                 │              │
┌────────────────────┐      │              │
│      REVISE        │      │              │
│    (2 min edit)    │      │              │
└─────────┬──────────┘      │              │
          │                 │              │
          ▼                 │              │
┌────────────────────┐      │              │
│      RESULTS       │      │              │
│  (score + gaps)    │      │              │
└─────────┬──────────┘      │              │
          │                 │              │
          ▼                 │              │
┌────────────────────┐      │              │
│    LEADERBOARD     │      │              │
│  (rank + peers)    │      │              │
└─────────┬──────────┘      │              │
          │                 ▼              ▼
          │         ┌──────────────┐ ┌──────────────┐
          │         │   PRACTICE   │ │  HOLE-FILL   │
          │         │   (exists)   │ │   (exists)   │
          │         └──────────────┘ └──────────────┘
          │
          ▼
    Back to HOME
```

---

## Technical Notes

### Route Structure (MVP)

```
/dashboard          → Home (rewired)
/daily/write        → Write phase
/daily/feedback     → Feedback display
/daily/revise       → Revision phase
/daily/results      → Results + analysis
/daily/leaderboard  → Rankings + top essays
/improve            → Hole-Fill (exists)
/improve/activities → Practice (exists)
```

### State Management

| Data | Storage | Notes |
|------|---------|-------|
| Current daily prompt | Firestore `dailyPrompts/{date}` | Same for all users |
| User submission | Firestore `dailyChallenges/{date}/submissions/{userId}` | Draft + revised |
| Leaderboard | Firestore query on submissions | Ordered by score |
| User profile | Firestore `users/{userId}` | Rank, streak, stats |
| Session state | URL params or sessionStorage | Phase navigation |

### API Endpoints Needed

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/daily/prompt` | GET | Get today's prompt |
| `/api/daily/submit` | POST | Submit draft or revision |
| `/api/daily/feedback` | POST | Get AI feedback on submission |
| `/api/daily/leaderboard` | GET | Get today's leaderboard |
| `/api/daily/check` | GET | Check if user already completed today |

