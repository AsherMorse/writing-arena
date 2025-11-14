# AI Writing Generation & Batch Ranking System

## 🎯 Overview

This system generates **actual AI-written content** for AI players at appropriate skill levels, then evaluates all writings together in a batch for fair, competitive rankings.

---

## 🏗️ Architecture

### New API Endpoints Created

1. **`/api/generate-ai-writing`** - Generate AI writing for Phase 1
2. **`/api/batch-rank-writings`** - Rank all Phase 1 writings together
3. **`/api/generate-ai-feedback`** - Generate AI peer feedback for Phase 2
4. **`/api/batch-rank-feedback`** - Rank all Phase 2 feedback (to create)
5. **`/api/generate-ai-revision`** - Generate AI revisions for Phase 3
6. **`/api/batch-rank-revisions`** - Rank all Phase 3 revisions (to create)

---

## 📊 Flow: Phase 1 (Writing)

### Current Flow:
```
Student writes → Student submits → AI evaluates student → Random AI scores → Rankings
```

### New Flow:
```
Match starts → Generate 4 AI writings (at rank level)
     ↓
Student writes (4 minutes)
     ↓
Student submits → Collect all 5 writings
     ↓
Send ALL 5 to LLM for batch ranking
     ↓
Receive ranked scores & feedback for all
     ↓
Display rankings (real competition!)
```

### Implementation Steps:

#### Step 1: Generate AI Writings When Match Starts

**File**: `/app/ranked/session/page.tsx`

**Where**: In `useEffect` after match initialization

```typescript
useEffect(() => {
  const generateAIWritings = async () => {
    if (!matchInitialized || aiWritingsGenerated.current) return;
    aiWritingsGenerated.current = true;
    
    console.log('🤖 SESSION - Generating AI writings...');
    
    // Get AI players from match state
    const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
    if (!matchDoc.exists()) return;
    
    const matchState = matchDoc.data();
    const aiPlayers = matchState.players.filter(p => p.isAI);
    
    // Generate writing for each AI player
    const aiWritingPromises = aiPlayers.map(async (aiPlayer) => {
      const response = await fetch('/api/generate-ai-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.prompt,
          promptType: prompt.type,
          rank: aiPlayer.rank,
          playerName: aiPlayer.displayName,
        }),
      });
      
      const data = await response.json();
      return {
        playerId: aiPlayer.userId,
        playerName: aiPlayer.displayName,
        content: data.content,
        wordCount: data.wordCount,
        isAI: true,
      };
    });
    
    const aiWritings = await Promise.all(aiWritingPromises);
    
    // Store AI writings in Firestore
    const matchRef = doc(db, 'matchStates', matchId);
    await updateDoc(matchRef, {
      [`aiWritings.phase1`]: aiWritings,
    });
    
    console.log('✅ SESSION - AI writings generated and stored');
  };
  
  generateAIWritings();
}, [matchInitialized, matchId, prompt]);
```

#### Step 2: Batch Rank All Writings on Submit

**File**: `/app/ranked/session/page.tsx`

**Where**: In `handleSubmit()`, replace individual AI evaluation

```typescript
const handleSubmit = async () => {
  if (hasSubmitted || !user) return;
  console.log('📤 SESSION - Submitting for batch ranking...');
  setHasSubmitted(true);
  
  try {
    // Get AI writings from Firestore
    const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
    const matchState = matchDoc.data();
    const aiWritings = matchState?.aiWritings?.phase1 || [];
    
    // Prepare all writings for batch ranking
    const allWritings = [
      {
        playerId: user.uid,
        playerName: userName,
        content: writingContent,
        wordCount: wordCount,
        isAI: false,
      },
      ...aiWritings
    ];
    
    // Call batch ranking API
    const response = await fetch('/api/batch-rank-writings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        writings: allWritings,
        prompt: prompt.prompt,
        promptType: prompt.type,
        trait: trait || 'all',
      }),
    });
    
    const data = await response.json();
    const rankings = data.rankings; // Array of all 5 ranked with scores & feedback
    
    // Find your ranking
    const yourRanking = rankings.find(r => r.playerId === user.uid);
    const yourScore = yourRanking.score;
    
    console.log('✅ SESSION - Batch ranking complete:', {
      yourScore,
      yourRank: yourRanking.rank,
      totalPlayers: rankings.length,
    });
    
    // Store ALL rankings in Firestore
    const matchRef = doc(db, 'matchStates', matchId);
    await updateDoc(matchRef, {
      [`rankings.phase1`]: rankings,
    });
    
    // Save your score and feedback
    sessionStorage.setItem(`${matchId}-phase1-score`, yourScore.toString());
    sessionStorage.setItem(`${matchId}-phase1-feedback`, JSON.stringify(yourRanking));
    
    // Submit to match state
    await submitPhase(matchId, user.uid, 1, Math.round(yourScore), {
      strengths: yourRanking.strengths,
      improvements: yourRanking.improvements,
      traitFeedback: yourRanking.traitFeedback,
    });
    
    // Check if ready to proceed
    // ... rest of existing logic
    
  } catch (error) {
    console.error('❌ SESSION - Batch ranking failed:', error);
    // Fallback to old method
  }
};
```

#### Step 3: Display Real Rankings

**File**: `/app/ranked/phase-rankings/page.tsx`

**Where**: Replace `generatePhaseRankings()` with Firestore retrieval

```typescript
// Replace useMemo rankings generation with Firestore fetch
useEffect(() => {
  const fetchRankings = async () => {
    if (!matchId) return;
    
    const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
    if (!matchDoc.exists()) return;
    
    const matchState = matchDoc.data();
    const phase1Rankings = matchState?.rankings?.phase1 || [];
    
    if (phase1Rankings.length > 0) {
      // Use real rankings from batch evaluation
      setRealRankings(phase1Rankings);
    }
  };
  
  fetchRankings();
}, [matchId]);
```

---

## 📊 Flow: Phase 2 (Peer Feedback)

### New Flow:
```
Phase 2 starts → Assign peer writings
     ↓
Generate AI feedback responses (4 AI players)
     ↓
Student evaluates peer writing
     ↓
Student submits → Collect all 5 feedback sets
     ↓
Send ALL 5 to LLM for batch ranking
     ↓
Receive ranked scores for feedback quality
     ↓
Display rankings
```

### Key Changes:

1. **Assign Real Peer Writings**:
   - Round-robin: Player 1 reviews Player 2's work, Player 2 reviews Player 3's, etc.
   - Retrieve assigned peer's Phase 1 writing from Firestore

2. **Generate AI Peer Feedback**:
   - Each AI player generates feedback on their assigned peer
   - Store in Firestore

3. **Batch Rank Feedback**:
   - Similar to Phase 1 but ranking feedback quality instead

---

## 📊 Flow: Phase 3 (Revision)

### New Flow:
```
Phase 3 starts → Generate AI feedback for all
     ↓
Generate AI revisions (4 AI players)
     ↓
Student revises based on feedback
     ↓
Student submits → Collect all 5 revisions
     ↓
Send ALL 5 to LLM for batch ranking
     ↓
Receive ranked scores for revision quality
     ↓
Display final rankings
```

---

## 🎨 Skill Level System

AI writing quality is determined by rank:

| Rank Tier | Skill Level | Characteristics |
|-----------|-------------|-----------------|
| Bronze | Beginner | Simple sentences, basic vocab, minor errors |
| Silver | Intermediate | Mixed sentences, varied vocab, mostly correct |
| Gold | Proficient | Complex sentences, strong vocab, error-free |
| Platinum | Advanced | Sophisticated syntax, advanced vocab, polished |
| Diamond | Expert | Masterful writing, rich language, insightful |
| Master/Grand | Master | Exceptional quality, distinctive voice |

### Example Output by Level:

**Bronze (Beginner)**:
> "The lighthouse was old and scary. I went inside because I was curious. There was a chest inside that was glowing."

**Silver (Intermediate)**:
> "The old lighthouse stood on the cliff overlooking the ocean. I had walked past it many times before, but today something was different. The door was open, and I could see a golden light coming from inside."

**Gold (Proficient)**:
> "The weathered lighthouse had always intrigued me, standing sentinel on the rocky cliff like a forgotten guardian. For years, its rusty door remained locked, keeping its secrets safe. But today, as I walked my usual path, I noticed something different—the door stood ajar, and a mysterious golden light spilled onto the stones."

---

## 💾 Firestore Schema Updates

### matchStates Collection:

```typescript
{
  matchId: string,
  players: [...],
  
  // NEW: AI-generated content
  aiWritings: {
    phase1: [
      { playerId, playerName, content, wordCount, isAI: true },
      ...
    ],
    phase2: [  // AI feedback responses
      { playerId, playerName, responses: {...}, isAI: true },
      ...
    ],
    phase3: [  // AI revisions
      { playerId, playerName, content, wordCount, isAI: true },
      ...
    ]
  },
  
  // NEW: Batch rankings
  rankings: {
    phase1: [
      { playerId, playerName, score, rank, strengths, improvements, traitFeedback },
      ...
    ],
    phase2: [...],
    phase3: [...]
  },
  
  // Existing fields...
  submissions: {...},
  scores: {...},
}
```

---

## 🔧 Implementation Checklist

### Phase 1 Implementation:
- [x] Create `/api/generate-ai-writing` endpoint
- [x] Create `/api/batch-rank-writings` endpoint
- [ ] Update session page to generate AI writings on start
- [ ] Update session page to batch rank on submit
- [ ] Update phase-rankings to use real rankings
- [ ] Store AI writings in Firestore
- [ ] Store batch rankings in Firestore

### Phase 2 Implementation:
- [x] Create `/api/generate-ai-feedback` endpoint
- [ ] Create `/api/batch-rank-feedback` endpoint  
- [ ] Implement peer assignment logic (round-robin)
- [ ] Update peer-feedback page to show real peer writing
- [ ] Generate AI feedback for AI players
- [ ] Batch rank all feedback on submit

### Phase 3 Implementation:
- [x] Create `/api/generate-ai-revision` endpoint
- [ ] Create `/api/batch-rank-revisions` endpoint
- [ ] Generate AI revisions for AI players
- [ ] Batch rank all revisions on submit
- [ ] Update results page to use batch rankings

---

## 💰 Cost Considerations

### API Usage Per Match:

**Phase 1**:
- 4 AI writing generations: ~1,000 tokens each = 4,000 tokens
- 1 batch ranking (5 writings): ~5,000 tokens
- **Total**: ~9,000 tokens per match

**Phase 2**:
- 4 AI feedback generations: ~500 tokens each = 2,000 tokens
- 1 batch feedback ranking: ~3,000 tokens
- **Total**: ~5,000 tokens per match

**Phase 3**:
- 4 AI revisions: ~1,000 tokens each = 4,000 tokens
- 1 batch revision ranking: ~5,000 tokens
- **Total**: ~9,000 tokens per match

**Grand Total**: ~23,000 tokens per complete match

**Cost with Claude Sonnet 4** (~$3 per million input tokens):
- Per match: **~$0.07**
- Per 100 matches: **~$7**
- Per 1,000 matches: **~$70**

### Optimization Strategies:

1. **Pre-generate AI Essays**: Create library of 500+ AI essays at each rank level
   - One-time cost to generate
   - Reuse in matches (students won't notice)
   - Reduces cost to ~$0.03 per match

2. **Batch More Efficiently**: Combine evaluations where possible

3. **Cache Results**: Store AI content and reuse for similar prompts

---

## 🎯 Benefits of This System

✅ **Real Competition**: AI opponents actually write at appropriate skill levels  
✅ **Fair Rankings**: All writings evaluated together by same criteria  
✅ **Authentic Feedback**: Students receive specific, relevant feedback  
✅ **Skill-Appropriate**: AI difficulty scales with student rank  
✅ **Educational**: Students see writing at various levels  
✅ **Scalable**: Works with any number of players  

---

## 🚀 Next Steps

1. **Review** this design and API endpoints
2. **Implement** Phase 1 integration first (lowest risk)
3. **Test** with real students to validate AI writing quality
4. **Iterate** on skill level prompts based on feedback
5. **Roll out** Phase 2 and 3 once Phase 1 proven

---

## 📝 Notes

- AI writing generation happens **async** while student writes (no delay)
- Batch ranking is **fast** (~3-5 seconds for 5 writings)
- System **gracefully degrades** to mock data if API unavailable
- All AI content is **deterministic** for given inputs (no randomness)
- Rankings are **objective** and based on actual writing quality

This system transforms the ranked mode from simulated competition to **authentic, skill-matched writing battles**! 🎮✨

