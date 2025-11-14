# Library Organization

This directory contains all shared utilities, services, types, and configurations for the Writing Arena.

## 📁 Directory Structure

```
lib/
├── config/              # Configuration files
│   └── firebase.ts     # Firebase initialization
│
├── types/               # TypeScript interfaces and types
│   └── index.ts        # All type definitions
│
├── services/            # Business logic and data access
│   ├── ai-students.ts  # AI student management
│   ├── firestore.ts    # User profiles and sessions
│   ├── match-sync.ts   # Match state synchronization
│   └── matchmaking-queue.ts # Queue management
│
├── utils/               # Utility functions
│   └── prompts.ts      # Writing prompt library
│
└── hooks/               # React hooks (future)
    └── (empty - ready for custom hooks)
```

---

## 📚 Module Guide

### config/firebase.ts
**Purpose**: Firebase app initialization  
**Exports**: `app`, `db`, `auth`  
**Used by**: All service files

### types/index.ts
**Purpose**: Central type definitions  
**Exports**:
- `UserProfile` - User account and stats
- `AIStudent` - AI opponent data
- `WritingPrompt` - Prompt structure
- `WritingSession` - Session data
- `QueueEntry` - Matchmaking queue
- `MatchParty` - Match party
- `MatchState` - Real-time match state
- `PlayerSubmission` - Phase submission

**Usage**:
```typescript
import { UserProfile, WritingPrompt } from '@/lib/types';
```

### services/firestore.ts
**Purpose**: User profile and session management  
**Key Functions**:
- `createUserProfile()` - Create new user
- `getUserProfile()` - Get user data
- `updateUserProfile()` - Update profile
- `saveWritingSession()` - Save match history
- `updateUserStatsAfterSession()` - Update stats/LP/XP
- `getUserSessions()` - Get match history

**Usage**:
```typescript
import { getUserProfile, updateUserProfile } from '@/lib/services/firestore';
```

### services/ai-students.ts
**Purpose**: AI student pool management  
**Key Functions**:
- `getRandomAIStudents()` - Select AI opponents
- `updateAIStudentAfterMatch()` - Update AI stats/rank
- `getAIStudent()` - Get AI by ID

**Usage**:
```typescript
import { getRandomAIStudents } from '@/lib/services/ai-students';
```

### services/match-sync.ts
**Purpose**: Real-time match synchronization  
**Key Functions**:
- `createMatchState()` - Initialize match
- `submitPhase()` - Submit phase completion
- `listenToMatchState()` - Real-time updates
- `areAllPlayersReady()` - Check if all submitted
- `simulateAISubmissions()` - AI auto-submit
- `getAIFeedback()` - Retrieve feedback
- `getAssignedPeer()` - Get peer assignment
- `getPeerFeedbackResponses()` - Get peer feedback

**Usage**:
```typescript
import { createMatchState, submitPhase } from '@/lib/services/match-sync';
```

### services/matchmaking-queue.ts
**Purpose**: Matchmaking queue operations  
**Key Functions**:
- `joinQueue()` - Enter matchmaking
- `leaveQueue()` - Exit queue
- `listenToQueue()` - Watch for matches
- `generateAIPlayer()` - Create AI player
- `findOrCreateParty()` - Form parties

**Usage**:
```typescript
import { joinQueue, leaveQueue } from '@/lib/services/matchmaking-queue';
```

### utils/prompts.ts
**Purpose**: Writing prompt library  
**Exports**:
- `PROMPT_LIBRARY` - 20 prompts
- `getPromptById()` - Get specific prompt
- `getRandomPrompt()` - Random prompt

**Usage**:
```typescript
import { getRandomPrompt, getPromptById } from '@/lib/utils/prompts';
```

---

## 🎯 Import Patterns

### For Types:
```typescript
import { UserProfile, WritingPrompt } from '@/lib/types';
```

### For Services:
```typescript
import { getUserProfile } from '@/lib/services/firestore';
import { getRandomAIStudents } from '@/lib/services/ai-students';
```

### For Utils:
```typescript
import { getRandomPrompt } from '@/lib/utils/prompts';
```

### For Config:
```typescript
import { db, auth } from '@/lib/config/firebase';
```

---

## 🔮 Future Organization

### hooks/
Custom React hooks will go here:
- `useMatchmaking.ts` - Matchmaking state management
- `useWritingSession.ts` - Session timer and word count
- `useAIFeedback.ts` - AI feedback loading
- `usePeerAssignment.ts` - Peer matching logic

### utils/
Additional utilities:
- `formatting.ts` - Time, score formatting
- `validation.ts` - Input validation
- `calculations.ts` - Score calculations

### services/
Additional services:
- `analytics.ts` - Usage tracking
- `achievements.ts` - Achievement system
- `leaderboard.ts` - Rankings

---

## ✅ Benefits

### Discoverability
- **Clear naming**: Know where to find each module
- **Logical grouping**: Related code lives together
- **No confusion**: Types vs services vs utils clearly separated

### Maintainability
- **Single responsibility**: Each module has one purpose
- **Easy updates**: Change one module without affecting others
- **Clear dependencies**: Import paths show relationships

### Scalability
- **Room to grow**: Each directory can expand
- **Consistent structure**: New modules follow pattern
- **Easy refactoring**: Move files without breaking imports

### Type Safety
- **Centralized types**: One source of truth
- **Shared definitions**: Same types everywhere
- **Autocomplete**: Better IDE support

---

**Library is now professionally organized!** 📚✨

