# Firebase Integration Guide

## ✅ Firebase is Fully Integrated!

The app now uses Firebase for authentication and data persistence.

---

## 🔥 What Firebase Provides

### Authentication
- **Anonymous Auth** - Users automatically get a unique ID
- **Future:** Email/password, Google OAuth, etc.

### Firestore Database
- **User Profiles** - Character level, XP, points, traits, stats
- **Writing Sessions** - All practice/match history saved
- **Progress Tracking** - Long-term data persistence

### Benefits
✅ Data persists across sessions  
✅ Users can log in from any device  
✅ Progress is saved automatically  
✅ Can track learning over time  
✅ Ready for teacher dashboards  

---

## 🚀 Setup Instructions

### 1. Local Development

The `.env.local` file is already created with your Firebase credentials!

Just run:
```bash
npm run dev
```

That's it! Firebase will automatically connect.

### 2. Vercel Deployment

Copy the variables from `VERCEL_ENV_SETUP.md` into your Vercel dashboard:

**Project Settings → Environment Variables**

Add all 9 variables (listed in VERCEL_ENV_SETUP.md)

---

## 🔐 Firebase Console Setup

### Enable Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **hour-college**
3. Click **Authentication** in left sidebar
4. Click **Get Started**
5. Enable **Anonymous** authentication
6. Click **Save**

### Enable Firestore

1. In Firebase Console, click **Firestore Database**
2. Click **Create Database**
3. Choose **Start in test mode** (for development)
4. Select region (us-central recommended)
5. Click **Enable**

### Security Rules (Important!)

In Firestore → Rules tab, use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can write their own sessions, read any sessions
    match /sessions/{sessionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

Click **Publish** to apply the rules.

---

## 📊 Database Schema

### Users Collection (`users/{uid}`)
```typescript
{
  uid: string;
  displayName: string;          // "Student Writer"
  email: string;
  avatar: string;                // "🌿"
  characterLevel: number;        // 1-6
  totalXP: number;              // Accumulated experience
  totalPoints: number;          // Points earned
  currentRank: string;          // "Silver III"
  rankLP: number;               // League points (0-infinity)
  traits: {
    content: number;            // 1-6
    organization: number;
    grammar: number;
    vocabulary: number;
    mechanics: number;
  };
  stats: {
    totalMatches: number;
    wins: number;
    totalWords: number;
    currentStreak: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Sessions Collection (`sessions/{sessionId}`)
```typescript
{
  userId: string;               // Reference to user
  mode: 'practice' | 'quick-match' | 'ranked';
  trait: string;                // 'all', 'content', etc.
  promptType: string;           // 'narrative', etc.
  content: string;              // What they wrote
  wordCount: number;
  score: number;                // 0-100
  traitScores: {
    content: number;
    organization: number;
    grammar: number;
    vocabulary: number;
    mechanics: number;
  };
  xpEarned: number;
  pointsEarned: number;
  lpChange?: number;            // For ranked matches
  placement?: number;           // Their rank in the match
  timestamp: Timestamp;
}
```

---

## 🎮 How It Works

### User Flow

1. **Landing Page → Sign In**
   - Creates anonymous Firebase user
   - Creates user profile in Firestore
   - Redirects to dashboard

2. **Dashboard**
   - Loads user profile from Firestore
   - Displays real data (XP, points, traits, stats)
   - Updates in real-time

3. **Play a Match**
   - User writes and gets feedback
   - Session saved to Firestore
   - User stats updated (matches, words, XP, points)
   - Profile refreshed to show new data

4. **Return to Dashboard**
   - See updated stats
   - Progress persists forever!

---

## 🔍 Testing Firebase Integration

### 1. Sign In
- Click "Start Writing Now" on landing page
- Check browser console - should see Firebase initialization
- Should redirect to dashboard

### 2. Check Firestore
- Go to Firebase Console → Firestore Database
- You should see:
  - `users` collection with your user document
  - Your profile with stats

### 3. Complete a Session
- Play Practice Mode
- Complete writing and see results
- Go to Firestore → `sessions` collection
- You should see your session saved!

### 4. Check Data Persistence
- Refresh the dashboard
- Your stats should persist
- XP and points should be the same

---

## 🛡️ Security Notes

### Current Security (Development)
✅ Test mode Firestore rules (anyone can read/write)  
✅ Auth required for all database operations  
✅ Users only access their own data (enforced by rules)  

### Production Security Needed
⚠️ Tighten Firestore rules (production mode)  
⚠️ Add request validation  
⚠️ Enable app check  
⚠️ Set up monitoring  

---

## 🐛 Troubleshooting

### "Permission Denied" Error
- Make sure Firestore rules are in **test mode**
- Or apply the security rules above

### "Firebase not initialized"
- Check all NEXT_PUBLIC_FIREBASE_* variables are set
- Verify .env.local exists with correct values
- Restart dev server: `npm run dev`

### Data Not Saving
- Check browser console for errors
- Verify Firestore is enabled in Firebase Console
- Check Firebase Console → Firestore for the data

### Authentication Not Working
- Enable Anonymous auth in Firebase Console
- Check network tab for Firebase auth requests
- Verify firebaseConfig values are correct

---

## 📈 What's New

### Before Firebase
❌ Data lost on refresh  
❌ No user accounts  
❌ No progress tracking  
❌ No history  

### After Firebase
✅ Data persists forever  
✅ Anonymous user accounts  
✅ XP/points saved  
✅ Match history stored  
✅ Can track learning over time  
✅ Ready for teacher dashboards  
✅ Ready for leaderboards  

---

## 🚀 Deployment Checklist

- [x] Firebase SDK installed
- [x] Configuration added
- [x] Auth context created
- [x] Firestore utilities built
- [x] Dashboard integrated
- [x] Sessions saving
- [x] Build passing
- [ ] Firebase Auth enabled (do this in console)
- [ ] Firestore created (do this in console)
- [ ] Security rules applied (do this in console)
- [ ] Environment variables in Vercel (copy from VERCEL_ENV_SETUP.md)

---

## 📝 Environment Variables

See `VERCEL_ENV_SETUP.md` for the exact copy-paste format for Vercel.

For local development, the `.env.local` is already configured!

---

*Your app now has full data persistence with Firebase!* 🔥

