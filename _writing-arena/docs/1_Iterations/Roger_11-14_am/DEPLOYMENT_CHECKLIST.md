# Deployment Checklist - Persistent AI Students System

## ✅ Pre-Deployment

### 1. Environment Variables
- [ ] `ANTHROPIC_API_KEY` is set in production environment
- [ ] Firestore is configured and accessible
- [ ] Firebase Auth is configured

### 2. Firestore Rules
Update `firestore.rules` to allow AI student reads/writes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // AI Students - read by anyone, write by system only
    match /aiStudents/{studentId} {
      allow read: if isAuthenticated();
      allow write: if false;  // System writes via admin SDK or seed endpoint
    }
    
    // Match States
    match /matchStates/{matchId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated();
      allow delete: if false;
    }
    
    // Matchmaking Queue
    match /matchmakingQueue/{userId} {
      allow read, write: if isAuthenticated();
    }
    
    // User Profiles
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Sessions
    match /sessions/{sessionId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
    }
  }
}
```

### 3. Database Seeding
- [ ] Run `/api/seed-ai-students` endpoint **once** in production
- [ ] Verify 100 AI students created in Firestore
- [ ] Check distribution: ~10 Bronze, ~30 Silver, ~30 Gold, etc.

---

## 🚀 Deployment Steps

### Step 1: Deploy Code
```bash
git add .
git commit -m "feat: Persistent AI students with real content generation across all phases"
git push origin feature/persistent-ai-students
```

### Step 2: Seed Database
After deployment, run once:
```bash
curl -X POST https://your-domain.vercel.app/api/seed-ai-students

# Or visit in browser:
https://your-domain.vercel.app/api/seed-ai-students
```

Expected response:
```json
{
  "success": true,
  "studentsCreated": 100,
  "total": 100,
  "students": [...]
}
```

### Step 3: Verify Firestore
Check Firebase Console → Firestore Database:
- Collection: `aiStudents` exists
- 100 documents present
- Sample document has all fields (displayName, rank, stats, etc.)

### Step 4: Test End-to-End
1. Start a ranked match
2. Complete all 3 phases
3. Check console for expected logs
4. Verify rankings are realistic
5. Check Firestore - AI student LP should update

---

## 🧪 Testing Checklist

### Matchmaking
- [ ] AI students load from database
- [ ] 4 AI students appear gradually
- [ ] AI students have unique names (not ProWriter99, etc.)
- [ ] Ranks are appropriate (near your rank)

### Phase 1: Writing
- [ ] AI writings generate in background
- [ ] Batch ranking runs on submit
- [ ] Rankings show real scores (not random 60-90)
- [ ] Your rank feels fair based on writing quality
- [ ] Console shows "Using real rankings from Firestore"

### Phase 2: Peer Feedback
- [ ] Real peer writing loads (AI or human)
- [ ] Peer writing matches what was written in Phase 1
- [ ] AI feedback generates in background
- [ ] Batch ranking evaluates feedback quality
- [ ] Rankings show fair feedback scores

### Phase 3: Revision
- [ ] Real peer feedback displays (from Phase 2)
- [ ] Feedback shows actual responses, not mock
- [ ] Attribution shown ("Alex Wordsmith says...")
- [ ] AI revisions generate in background
- [ ] Batch ranking evaluates revision quality

### Results
- [ ] All 3 phase scores are from real rankings
- [ ] Composite score calculated correctly
- [ ] LP change applied to your profile
- [ ] AI students' ranks update in database
- [ ] Next match shows updated AI student ranks

---

## 🐛 Troubleshooting

### Issue: "No AI students found"
**Cause**: Database not seeded  
**Fix**: Run `/api/seed-ai-students`

### Issue: "Using fallback rankings generation"
**Cause**: Batch ranking failed or not stored  
**Check**: 
- API key is set correctly
- Console shows batch ranking errors
- Firestore write permissions correct

### Issue: "No assigned peer found"
**Cause**: Match state not properly initialized  
**Check**:
- matchId is being passed through all phases
- Match state exists in Firestore
- rankings.phase1 has content field

### Issue: AI students not updating ranks
**Cause**: Results page not updating AI profiles  
**Check**:
- Console shows "🤖 RESULTS - Updating AI student ranks..."
- AI student IDs being retrieved correctly
- Firestore write permissions allow AI student updates

---

## 📊 Monitoring

### Key Metrics to Watch:

**API Usage**:
- Average tokens per match: ~25,000
- Cost per match: ~$0.075
- Monthly cost (1000 matches): ~$75

**AI Student Health**:
- Average rank distribution stays balanced
- No students stuck at 0 LP or 100+ LP
- Win rates stay between 40-60%

**Student Experience**:
- Batch ranking completes <10 seconds
- No noticeable delays during match
- Rankings feel fair and competitive

---

## 🔐 Security Notes

### AI Student Writes
- AI students can only be updated via:
  1. Initial seed endpoint
  2. Post-match rank updates (authenticated)
- No direct client writes to `aiStudents` collection

### Match Data
- All writes require authentication
- Players can only submit for their own user ID
- Match states persist for history/review

---

## ✅ Launch Checklist

- [ ] Code deployed to production
- [ ] Environment variables configured
- [ ] Firestore rules updated and deployed
- [ ] AI students database seeded (100 students)
- [ ] End-to-end test completed successfully
- [ ] Console logs verified (batch ranking working)
- [ ] AI student ranks confirmed updating
- [ ] User profiles confirmed updating
- [ ] Real peer writing exchange working
- [ ] Real feedback display working
- [ ] Documentation complete

---

## 🎉 Ready to Launch!

Once all checklist items are complete, the system is **production-ready**!

Students will experience:
- 🏆 Real competitive writing battles
- 🤖 Authentic AI opponents with personalities
- 📊 Fair batch evaluation
- 🌍 Living world that evolves
- 🎓 Educational feedback at all phases

**The Writing Arena is now a fully-functional competitive writing platform!** 🚀✨

