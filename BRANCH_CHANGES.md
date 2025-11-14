# Branch Change Log – `asher/ui+tweaks`

## Overview
- Rebuilt every surface in a cohesive charcoal + mint palette with layered glassmorphism panels.
- Dashboard v2 (Match Prep) is now the only dashboard; legacy variant routes were removed.
- All competitive flows (ranked, quick match, practice) were redesigned so each phase looks and behaves differently while reusing existing data + logic.
- Shared components and API routes were tightened to keep UI feedback responsive even without backend credentials.

## Global Foundation
- `app/globals.css`: Forces the dark background + mint foreground and switches the stack to Inter/SF for visual consistency across pages.
- Layout + typography updates cascade through every page because App Router inherits these globals.

## Entry, Auth, and Match Prep
- `app/page.tsx`: Landing hero rebuilt with a storytelling banner, onboarding timeline, and lane cards for each mode. Buttons now mirror the new CTA system.
- `app/auth/page.tsx`: Auth screen now uses the same theming, introduces clearer state transitions, refreshed Google/demo buttons, and fixes the “Return home” link.
- `app/dashboard/page.tsx`: V2 “Match Prep” experience became default—highlights readiness status, warmups, upcoming lobbies, trait deltas, and warm-up prompts. Legacy auto-profile creation logic was removed in favor of the existing “Profile unavailable” fallback.
- Removed directories `app/dashboard/v2`, `app/dashboard/v3`, and `app/dashboard/v4` so there is only one dashboard route.

## Ranked Flow
- `app/ranked/page.tsx`: Mission dossier layout with banner, accordion prep phases, trait chips, and LP/XP analytics cards.
- `app/ranked/matchmaking/page.tsx`: Terminal-style command center with instrumentation bar, live console, slot list, AI fill telemetry, and countdown redesign.
- `app/ranked/session/page.tsx`: Writing cockpit showing prompt briefing, editor, squad status, telemetry, and sticky timer controls.
- `app/ranked/peer-feedback/page.tsx`: Two-column reviewer workspace with prompt context, annotated peer draft, and guided response cards.
- `app/ranked/revision/page.tsx`: Split command deck showing AI + peer critique console beside original vs revision panes, plus action footer.
- `app/ranked/phase-rankings/page.tsx`: Dossier-style recap with standings, countdown, and coaching sidebar.
- `app/ranked/results/page.tsx`: Results hub with CTA buttons at the top, placement stats, LP/XP/points cards, toggleable phase breakdown, coaching insights, leaderboard stack, and draft comparison.
- `components/WaitingForPlayers.tsx`: Mission-control waiting room with readiness tracker, status feed, and prep tips.

## Quick Match Flow
- `app/quick-match/page.tsx`: Lobby briefing view with sprint overview, trait selector, and launch card.
- `app/quick-match/matchmaking/page.tsx`: Queue dashboard covering slot map, telemetry, chat-style feed, and countdown re-theme.
- `app/quick-match/session/page.tsx`: Streamlined drafting surface pairing prompt, editor, focus meters, and momentum sidebar.
- `app/quick-match/results/page.tsx`: CTA buttons moved to the top; scoreboard cards, next-move guidance, and draft snapshot adopt the new palette.

## Practice Flow
- `app/practice/page.tsx`: Three-step setup wizard (trait → prompt type → launch) with progress indicators.
- `app/practice/session/page.tsx`: Solo editor with prompt capsule, objective checklist, live counters, and tactic reminders.
- `app/practice/results/page.tsx`: CTA buttons moved to the top; phase feedback, radar-style trait scores, next-step cards, and draft recap redesigned.

## Shared Overlays
- `components/WritingTipsModal.tsx`: Rebuilt as a dark tiered modal with tactic cards and mint highlights for better readability.

## API Hardening
- `app/api/analyze-writing/route.ts`, `app/api/evaluate-peer-feedback/route.ts`, `app/api/evaluate-revision/route.ts`: Each handler now parses `request.json()` once, caches the payload, and uses that data in both success and error paths, preventing “body already used” crashes when falling back to mock responses.

## CTA Consistency
- Ranked, quick-match, and practice results screens now present their “continue/back” CTAs at the top of the page so users can act quickly before reading the detail breakdowns.


