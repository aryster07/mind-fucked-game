# 🎯 QUICK START - Get Your Game Live in 5 Minutes!

## ✅ Your Firebase Config is Ready!
Your game is already connected to Firebase project: **mindcooked**

## 🚀 What You Need to Do NOW:

### 1️⃣ Enable Firestore Database (2 minutes)

Go to: https://console.firebase.google.com/project/mindcooked/firestore

Click **"Create database"** → Choose **"Start in test mode"** → Click **"Enable"**

**That's it!** The database will be ready in ~30 seconds.

---

### 2️⃣ Run the Game Locally (30 seconds)

```bash
npm run dev
```

Open the URL in your browser (usually http://localhost:5173)

---

### 3️⃣ Test Multiplayer (1 minute)

**Option A: Test on Same Computer**
1. Open TWO browser tabs
2. Tab 1: Click "Multiplayer" → "Create Room" → Note the room code
3. Tab 2: Click "Multiplayer" → "Join Room" → Enter the code
4. Both tabs should show "Waiting for players..."
5. Tab 1: Click "Start Game"
6. You're playing! 🎮

**Option B: Test with a Friend Locally**
1. Check your local IP: `ipconfig` (look for IPv4 Address, e.g., 192.168.1.5)
2. Share: `http://192.168.1.5:5173` with friend on same WiFi
3. You create room, friend joins with code

---

### 4️⃣ Deploy Online (2 minutes) - OPTIONAL

Make it accessible worldwide:

```bash
npm install -g firebase-tools
firebase login
npm run build
firebase deploy
```

You'll get: `https://mindcooked.web.app` ← Share this URL worldwide! 🌍

---

## 🎮 How It Works

1. **Create Room** → Share the 6-letter code (e.g., "XYZ123")
2. **Friends Join** → They enter your code
3. **Start Game** → Play together in real-time!

All moves sync automatically through Firebase! ✨

---

## ⚡ Current Features

✅ Cards no longer stack (shows only top card)  
✅ Faster gameplay (reduced delays)  
✅ **HINT button** - Click for card suggestions  
✅ Online multiplayer ready  
✅ Real-time sync via Firebase  

---

## 🆘 Issues?

### "Can't connect to Firebase"
→ Make sure Firestore is enabled (Step 1)

### "Permission denied"
→ Go to Firebase Console → Firestore → Rules → Make sure test mode is on

### "Friend can't join"
→ Make sure you deployed (Step 4) and shared the live URL, not localhost

---

## 📞 You're Ready!

1. ✅ Enable Firestore → https://console.firebase.google.com/project/mindcooked/firestore
2. ✅ Run: `npm run dev`
3. ✅ Test multiplayer
4. ✅ Deploy: `firebase deploy` (optional)

**Happy Gaming! 🎮🔥**
