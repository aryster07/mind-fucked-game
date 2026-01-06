# 🔧 Firebase Quick Reference - Post-Fix

## ✅ What Was Fixed

### Critical Bugs (8 Total)
1. **Duplicate Firebase Init** → Unified to single source
2. **Function Name Collision** → `getAuth` renamed to `getAuthInstance`
3. **Auth Not Initialized** → Properly calls `getFirebaseAuth(app)`
4. **Missing UserContext** → Added to App.jsx wrapper
5. **Inconsistent Imports** → All use `services/firebase/*`
6. **Hardcoded Firestore Expiry** → Removed time limits
7. **ArrayUnion Bug** → Manual array spreading for player objects
8. **No Error Handling** → Added try-catch everywhere

## 🎯 How to Use Firebase Services

### Import Pattern
```javascript
// ✅ CORRECT - Use centralized services
import { getDatabase } from '../services/firebase/firebase.service';
import { getAuthInstance, getUserData } from '../services/firebase/user.service';
import { createRoom, joinRoom } from '../services/firebase/room.service';

// ❌ WRONG - Don't use deprecated utils
import { db, auth } from '../utils/userService';
```

### User Operations
```javascript
// Get auth instance
const auth = getAuthInstance();

// Create user profile
const userData = await createUserProfile(userId, 'PlayerName');

// Get user data
const data = await getUserData(userId);

// Update currency
await updateCurrency(userId, { coins: 100, tokens: 5 });

// Add XP
const result = await addXP(userId, 50);
if (result.leveledUp) {
  console.log(`Level up to ${result.newLevel}!`);
}

// Claim daily reward
const reward = await claimDailyReward(userId);
```

### Room Operations
```javascript
// Create a room
const roomCode = await createRoom({
  uid: 'user123',
  name: 'Player1',
  online: true
});

// Join a room
const room = await joinRoom('ABC123', {
  uid: 'user456',
  name: 'Player2',
  online: true
});

// Subscribe to room updates
const unsubscribe = subscribeToRoom(roomCode, (roomData) => {
  console.log('Room updated:', roomData);
});

// Update game state
await updateGameState(roomCode, gameState, 'Turn completed');

// Leave room
await leaveRoom(roomCode, userId);
```

## 🔐 Environment Setup

### .env File (Required)
```bash
VITE_FIREBASE_API_KEY=AIzaSyBOueJo2hsy0ehLZiPR1quwTJ-JOiogvYY
VITE_FIREBASE_AUTH_DOMAIN=mindcooked.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mindcooked
VITE_FIREBASE_STORAGE_BUCKET=mindcooked.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=629083725038
VITE_FIREBASE_APP_ID=1:629083725038:web:157cfad58fa149eab6e7ff
VITE_FIREBASE_MEASUREMENT_ID=G-0XBGY76DMX
```

## 🛡️ Firestore Rules (Updated)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomCode} {
      allow read: if true;
      allow create: if request.resource.data.host != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 📦 Component Integration

### Using UserContext
```javascript
import { useUser } from '../context/UserContext';

function MyComponent() {
  const { 
    user, 
    userData, 
    awardCoins, 
    recordGameResult 
  } = useUser();
  
  const handleWin = async () => {
    const result = await recordGameResult(true, 'normal', {
      perfectMemory: true
    });
    console.log(`Earned ${result.coinReward} coins!`);
  };
}
```

### Local Storage Fallback
All operations automatically fallback to localStorage when:
- Firebase not configured
- Offline
- Network error

User will see: "Using local storage for user data"

## 🔍 Debugging

### Check Firebase Status
```javascript
import { isFirebaseAvailable } from './services/firebase/firebase.service';

if (isFirebaseAvailable()) {
  console.log('✅ Firebase connected');
} else {
  console.log('⚠️ Using local storage');
}
```

### Error Logs
All errors now logged with:
- `console.error('Error creating room:', error)`
- Descriptive error messages
- Stack traces preserved

## 🚀 Deployment Checklist

- [ ] Deploy Firestore rules to Firebase Console
- [ ] Set environment variables in hosting platform
- [ ] Enable Anonymous Authentication in Firebase
- [ ] Test multiplayer with 2+ users
- [ ] Verify offline mode works
- [ ] Check error tracking dashboard

## 📊 Testing Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## ⚡ Performance Tips

1. **Batch Updates** - Use multi-field updates instead of multiple calls
2. **Local First** - Update local state immediately, sync async
3. **Debounce** - Don't sync game state every frame
4. **Error Recovery** - Non-blocking errors for game updates
5. **Cleanup** - Always unsubscribe from listeners

## 🎯 Common Patterns

### Creating a User Session
```javascript
const auth = getAuthInstance();
const result = await signInAnonymously(auth);
const userData = await createUserProfile(
  result.user.uid,
  'PlayerName'
);
```

### Multiplayer Flow
```javascript
// Host creates room
const roomCode = await createRoom(hostPlayer);

// Guest joins
await joinRoom(roomCode, guestPlayer);

// Both subscribe
subscribeToRoom(roomCode, handleUpdate);

// Host starts game
await startGame(roomCode, hostId);
```

### Economy Update
```javascript
// Award game rewards
await updateCurrency(userId, { 
  coins: 100, 
  tokens: 5 
});

// Track stats
await updateGameStats(userId, true, {
  perfectMemoryWins: 1
});

// Level up
const xpResult = await addXP(userId, 150);
```

---

**Last Updated:** January 3, 2026  
**Status:** All systems operational ✅
