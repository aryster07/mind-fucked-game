# 🎮 How to Play with Friends - Multiplayer Guide

## Quick Start (3 Steps)

### Step 1: Host Creates Room
1. Click **"Play Online"** from the main menu
2. Click **"Create Room"**
3. You'll get a **6-character room code** (e.g., `ABC123`)
4. **Copy and share this code** with your friends via Discord, WhatsApp, etc.

### Step 2: Friends Join
1. Your friends open the game
2. Click **"Play Online"** from the main menu
3. Click **"Join Room"**
4. Enter the **room code** you shared
5. Click **"Join"**

### Step 3: Start Playing
1. Wait for all friends to join (2-4 players supported)
2. The **host** clicks **"Start Game"**
3. Game begins! 🎉

---

## 🌐 Playing Over the Internet

### Option 1: Local Testing (Same Network)
- **Works if:** You and friends are on the same WiFi
- **How:** Just share the room code as above
- **Limitation:** Won't work across different networks

### Option 2: Firebase Setup (Internet Play)
To play with friends anywhere in the world, you need to configure Firebase:

#### A. Create Firebase Project (Free)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name it (e.g., "MindFucked")
4. Disable Google Analytics (optional)
5. Click **"Create Project"**

#### B. Enable Firestore Database
1. In your Firebase project, click **"Firestore Database"**
2. Click **"Create Database"**
3. Choose **"Start in test mode"** (for development)
4. Select a location (closest to you)
5. Click **"Enable"**

#### C. Get Your Credentials
1. Click ⚙️ (Settings) → **"Project Settings"**
2. Scroll to **"Your apps"** section
3. Click the **Web icon** `</>`
4. Register app (name: "MindFucked Web")
5. Copy the `firebaseConfig` object

#### D. Update Your Game
1. Open `d:\Projects\Mindfuck\src\firebase.js`
2. Replace the config with your credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. Save and restart the dev server

#### E. Deploy for Friends
**Option 1: Share Local Dev Server**
- Use [ngrok](https://ngrok.com/) to expose localhost:
  ```bash
  npx ngrok http 5174
  ```
- Share the ngrok URL with friends

**Option 2: Deploy to Web (Recommended)**
- Deploy to [Vercel](https://vercel.com/) (free):
  ```bash
  npm run build
  npx vercel
  ```
- Friends can access the live URL

---

## 💬 Features During Gameplay

### Chat/Logs Sidebar
- **Expand/Collapse:** Click the arrow on the right side
- **Send Messages:** Type and press Enter
- **Game Events:** Automatically logged (turns, power-ups, etc.)

### Powerup Guide
- **View:** Sidebar on the left shows all power-ups
- **Expand:** Click the arrow to see full details
- **Reference:** Keep open if you forget what cards do

### Player List
- Shows all connected players
- Green dot = online
- "HOST" badge = room creator
- "YOU" badge = your player

---

## 🎯 Game Rules Reminder

1. **Goal:** Get the LOWEST score
2. **Turn:** Throw a card → Draw new card → Place it
3. **Power-ups:** 7, 9, Jack, King have special abilities
4. **Win:** Call SHOW when score ≤ 10 (if correct, you win!)

---

## 🐛 Troubleshooting

**Room code not working?**
- Make sure all players have the latest version
- Check Firebase is configured (for online play)
- Try creating a new room

**Can't see friends?**
- Refresh the page
- Check internet connection
- Verify room code is correct (case-sensitive)

**Game not syncing?**
- Firebase must be configured for real-time sync
- LocalStorage mode only works for testing

**Tutorial won't stop showing?**
- Open browser console (F12)
- Type: `localStorage.setItem('hasSeenTutorial', 'true')`
- Press Enter, refresh page

---

## 🚀 Next Steps

1. **Invite 2-4 friends** (optimal player count)
2. **Test locally first** (same WiFi)
3. **Set up Firebase** for internet play
4. **Deploy** to Vercel for permanent access
5. **Share the link** and dominate! 🏆

Enjoy Mind F**ked with your friends! 🎴✨
