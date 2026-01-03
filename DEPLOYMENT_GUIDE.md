# 🚀 Deployment Guide - Make Your Game Live!

Your Firebase config is now connected! Here's what you need to do to play online from different houses:

## ✅ Step 1: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **mindcooked** project
3. In the left menu, click **"Firestore Database"**
4. Click **"Create database"**
5. Choose **"Start in test mode"** (for easy testing)
6. Select your preferred location (e.g., us-central)
7. Click **"Enable"**

### Set Firestore Rules (Important!)

Once Firestore is created, go to the **Rules** tab and paste this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomCode} {
      allow read, write: if request.time < timestamp.date(2026, 2, 1);
    }
    match /users/{userId} {
      allow read, write: if true;
    }
  }
}
```

Click **"Publish"**. This allows anyone to read/write for testing (expires Feb 2026).

---

## ✅ Step 2: Install Dependencies

Make sure all packages are installed:

```bash
npm install
```

If you get any errors, install Firebase specifically:

```bash
npm install firebase
```

---

## ✅ Step 3: Run Locally for Testing

```bash
npm run dev
```

Open the URL (usually `http://localhost:5173`) in your browser.

---

## ✅ Step 4: Test Multiplayer

### From Same Computer (Quick Test):
1. Open two browser tabs
2. Tab 1: Create a room, note the room code
3. Tab 2: Join room with the code
4. Both should sync in real-time!

### From Different Houses (Real Test):
1. **You**: Run `npm run dev`, create a room
2. **Share** the room code with your friend (via WhatsApp, Discord, etc.)
3. **Friend**: Opens your deployed URL or localhost (if port forwarded)
4. **Friend**: Joins with the room code
5. Play together! 🎮

---

## ✅ Step 5: Deploy Online (So Friends Can Access)

### Option A: Deploy to Firebase Hosting (Free & Easy)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init
```
- Select: **Hosting**
- Select your existing project: **mindcooked**
- Public directory: **dist**
- Single-page app: **Yes**
- Overwrite index.html: **No**

4. Build your app:
```bash
npm run build
```

5. Deploy:
```bash
firebase deploy
```

You'll get a live URL like: `https://mindcooked.web.app`

Share this URL with friends worldwide! 🌍

### Option B: Deploy to Vercel (Alternative)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow prompts, get a live URL

### Option C: Deploy to Netlify (Alternative)

1. Go to [netlify.com](https://netlify.com)
2. Drag & drop your `dist` folder (after running `npm run build`)
3. Get instant live URL

---

## ✅ Step 6: Share & Play!

Once deployed:
1. Share the live URL with friends
2. One person creates a room → gets a code
3. Others join with that code
4. Play from anywhere in the world! 🌎

---

## 🔧 Troubleshooting

### "Permission denied" errors
- Check Firestore rules are set correctly
- Make sure database is in **test mode** or rules allow access

### "Firebase app not initialized"
- Check `src/firebase.js` has correct config (✅ already done!)
- Make sure Firebase packages are installed

### Can't connect from different houses
- Make sure you deployed the app (Step 5)
- Don't use `localhost` - use the deployed URL
- Check internet connection

### Room not syncing
- Check Firebase Console → Firestore Database → Data
- You should see a `rooms` collection appear when you create a room
- If not, check browser console for errors

---

## 📝 Quick Commands Reference

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Deploy to Firebase
firebase deploy

# View Firebase logs
firebase functions:log
```

---

## 🎮 How to Play Online

1. **Host** creates a room → gets a 6-character code (e.g., "ABC123")
2. **Host** shares code with friends
3. **Players** join using the code
4. **Host** clicks "Start Game"
5. Everyone plays together in real-time!

All game actions sync automatically through Firebase Firestore! 🔥

---

## Next Steps

1. ✅ Enable Firestore Database (Step 1)
2. ✅ Test locally (Step 3)
3. ✅ Deploy online (Step 5)
4. 🎮 Play with friends!
