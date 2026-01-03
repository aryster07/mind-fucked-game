# Firebase Setup for Online Multiplayer

## Steps to Enable Online Play

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "Mindfuck-Game")
4. Follow the setup wizard

### 2. Enable Firestore Database
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" (we'll add security rules later)
4. Select a location closest to your players

### 3. Get Your Firebase Config
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the `firebaseConfig` object

### 4. Update src/firebase.js
Replace the placeholder values in `src/firebase.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
};
```

### 5. Install Firebase Package (if not already installed)
```bash
npm install firebase
```

### 6. Security Rules (Optional but Recommended)
Go to Firestore Database > Rules and update:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomCode} {
      allow read, write: if true; // For testing
      // Later, add proper authentication rules
    }
  }
}
```

### 7. Test Online Multiplayer
1. One player creates a room (gets a room code)
2. Share the room code with friends
3. Friends join using the room code
4. Host starts the game
5. Play from different locations!

## Changes Made to Fix Issues

### ✅ Fixed Card Stacking
- Cards in the discard pile no longer stack on top of each other
- Only the top card is now displayed

### ✅ Reduced Delays
- Reveal phase: 3s → 1s
- Bot throw delay: 1s → 500ms
- Bot draw delay: 1s → 600ms
- Much faster gameplay now!

### ✅ Added Hints System
- Click the purple "HINT" button during your turn
- Get smart suggestions on which card to throw
- Hints show for 5 seconds then auto-dismiss
- Strategy: Suggests throwing your highest value card

### ✅ Firebase for Online Play
- Changed from Realtime Database to Firestore
- Better support for online multiplayer from different houses
- More reliable and scalable
