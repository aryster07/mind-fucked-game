# Mind F**ked - Multiplayer Card Game

A real-time multiplayer memory card game built with React, Firebase, and Vite. Players compete to achieve the lowest hand value while using power-ups and memory skills.

## 🎮 Game Overview

- **Players:** 2-6
- **Objective:** Have the lowest hand value when someone calls SHOW (≤10 to win)
- **Mechanics:** Memory-based card management with power-ups

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

2. Enable **Anonymous Authentication**:
   - Go to Authentication → Sign-in method
   - Enable Anonymous

3. Create **Firestore Database**:
   - Go to Firestore Database → Create database
   - Start in test mode (for development)

4. Enable **Hosting**:
   - Go to Hosting → Get started
   - Install Firebase CLI: `npm install -g firebase-tools`

5. Update `src/firebase.js` with your config:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ... rest of config
};
```

6. Deploy:
```bash
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 📋 Game Rules

### Setup
- Each player gets 4 cards face-down
- 8-second memorization phase (cards visible)
- Cards flip face-down, game begins

### Your Turn

**Option 1: CALL SHOW**
- End the game immediately
- Win if hand ≤ 10 points
- Bust if hand > 10 (lowest other player wins)

**Option 2: THROW a Card**
- Discard one card, draw replacement
- New card visible for 3 seconds (only to you)
- Power cards (7/9/J/K) activate special abilities

### Power Cards

| Card | Name | Effect |
|------|------|--------|
| **7** | REFRESH | See all your cards for 3s |
| **9** | BLIND SWAP | Swap one card with opponent (blind) |
| **J** | CHAOS SHUFFLE | Shuffle opponent's entire hand |
| **K** | GLOBAL SPY | Reveal opponent's hand to everyone for 3s |

### Card Values
- Ace = 1 point
- 2-10 = Face value
- Jack = 11 points
- Queen = 12 points  
- King = 13 points

## 🎯 Features

- ✅ Real-time multiplayer sync via Firebase
- ✅ 2-6 player support
- ✅ Anonymous authentication
- ✅ Live chat during games
- ✅ Power-up abilities
- ✅ Responsive design
- ✅ Smooth animations (Framer Motion)

## 📁 Project Structure

```
src/
├── components/
│   ├── GameBoard.jsx      # Main game UI
│   ├── Card.jsx           # Card component
│   ├── MainMenu.jsx       # Start screen
│   ├── Lobby.jsx          # Multiplayer lobby
│   ├── GameLog.jsx        # Chat & event log
│   ├── PowerupGuide.jsx   # Power-up reference
│   └── HowToPlay.jsx      # Rules modal
├── context/
│   └── GameContext.jsx    # Game state management
├── services/
│   ├── firebase/
│   │   └── room.service.js # Firebase operations
│   └── game/
│       ├── deck.service.js # Deck utilities
│       └── player.service.js # Player utilities
├── App.jsx
├── main.jsx
└── firebase.js
```

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite
- **Styling:** TailwindCSS
- **Animations:** Framer Motion
- **Backend:** Firebase (Firestore, Auth, Hosting)
- **Icons:** Lucide React

## 🎨 Key Implementation Details

### State Management
- React Context + useReducer for global state
- Turn-based state machine
- Real-time Firebase sync with debouncing

### Multiplayer Sync
- Current turn player pushes state updates
- All players listen via Firestore `onSnapshot`
- Shared timestamps for countdown sync
- Automatic room cleanup on game end

### Turn Flow
1. **SHOW_OR_THROW** → Call SHOW or throw card
2. **REPLACE** → Draw replacement (3s reveal)
3. **POWER_ACTION** → Execute power if triggered
4. **END_TURN** → Advance to next player

## 📝 Firebase Firestore Rules (Production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🐛 Troubleshooting

**Infinite Firebase Loop**
- Check `fromRemote` flag in GameContext
- Ensure only current player syncs state

**Countdown Desync**
- Use shared timestamp (`preGameEndsAt`)
- Calculate remaining time client-side

**Cards Not Visible**
- Check `faceUp` and `tempReveal` flags
- Verify `isYou` player flag

## 📜 License

MIT License - Feel free to use for learning and fun!

## 🎲 Credits

Inspired by Cabo and Golf card games. Built fresh from the [COMPLETE_GAME_SPECIFICATION.md](COMPLETE_GAME_SPECIFICATION.md).

---

**Have fun and may the best memory win!** 🧠🃏
