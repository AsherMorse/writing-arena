# Phase Transition Fix

## Issue
Components were not navigating to the next phase when the session phase changed in Firestore.

## Root Cause
The `usePhaseTransition` hook was monitoring for phase transitions, but components weren't listening to session phase changes to navigate. The SessionManager emits `onPhaseTransition` events, but components weren't using them to navigate.

## Solution

### 1. Added Navigation Callbacks to `usePhaseTransition`
- Added `onTransition` callback to `usePhaseTransition` hook calls
- Components now navigate when phase transitions are detected

### 2. Added `useEffect` Listeners for Session Phase Changes
- Added `useEffect` hooks that watch `session.config.phase` changes
- Navigate immediately when phase changes, even if `onTransition` callback doesn't fire

### 3. Updated Navigation Paths
- Changed from dynamic route segments (`/ranked/peer-feedback/[sessionId]`) to query params (`/ranked/peer-feedback?sessionId=...`)
- Updated components to read `sessionId` from both URL params and query params for compatibility

## Changes Made

### WritingSessionContent.tsx
- Added `onTransition` callback to navigate to Phase 2
- Added `useEffect` to watch for phase 2 transition
- Navigates to `/ranked/peer-feedback?sessionId=...`

### PeerFeedbackContent.tsx
- Added `useSearchParams` import
- Updated to read `sessionId` from query params
- Added `onTransition` callback to navigate to Phase 3
- Added `useEffect` to watch for phase 3 transition
- Navigates to `/ranked/revision?sessionId=...`

### RevisionContent.tsx
- Added `useSearchParams` import
- Updated to read `sessionId` from query params
- Added `onTransition` callback to navigate to Results
- Added `useEffect` to watch for session completion
- Navigates to `/ranked/results?sessionId=...`

## How It Works

1. **Cloud Function Trigger**: When all players submit, `session-orchestrator.ts` Cloud Function updates `session.config.phase` in Firestore

2. **SessionManager Detection**: `SessionManager.listenToSession()` detects the phase change via Firestore `onSnapshot` listener

3. **Event Emission**: SessionManager emits `onPhaseTransition` event

4. **Component Response**: Components respond in two ways:
   - Via `onTransition` callback in `usePhaseTransition` hook
   - Via `useEffect` watching `session.config.phase` directly

5. **Navigation**: Router navigates to the next phase page with `sessionId` in query params

## Testing

To test phase transitions:
1. Start a ranked match
2. Submit Phase 1 writing
3. Verify navigation to Phase 2 (peer feedback) when all players submit
4. Submit Phase 2 feedback
5. Verify navigation to Phase 3 (revision) when all players submit
6. Submit Phase 3 revision
7. Verify navigation to Results when session completes

## Fallback Behavior

If Cloud Functions don't respond within 10 seconds, `usePhaseTransition` hook has a fallback that transitions client-side. This ensures phase transitions work even if Cloud Functions are slow or unavailable.

