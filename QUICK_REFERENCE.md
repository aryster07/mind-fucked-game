# 🚀 Quick Reference - New Structure

## 📦 Import Cheat Sheet

### Game Logic
```javascript
import { 
  createDeck, 
  shuffleDeck, 
  calculateScore 
} from './services/game/deck.service';

import { 
  dealCards, 
  getPlayerById, 
  getPlayerIndex 
} from './services/game/player.service';

import { 
  getBotMove, 
  getHint, 
  shouldBotCallShow 
} from './services/game/ai.service';
```

### Firebase / Multiplayer
```javascript
import { 
  initializeFirebase, 
  getDatabase, 
  isFirebaseAvailable 
} from './services/firebase/firebase.service';

import { 
  generateRoomCode,
  createRoom, 
  joinRoom, 
  subscribeToRoom,
  updateGameState,
  startGame,
  leaveRoom,
  sendChatMessage
} from './services/firebase/room.service';
```

### Constants
```javascript
import { 
  GAME_CONFIG,
  CARD_SUITS,
  CARD_RANKS,
  CARD_VALUES,
  POWER_CARDS,
  GAME_STATUS,
  TURN_PHASE,
  PLAYER_POSITIONS
} from './constants/game.constants';

import { 
  CURRENCY_TYPES,
  STARTING_BALANCE,
  GAME_REWARDS,
  DAILY_REWARDS,
  LEVEL_REWARDS,
  XP_PER_LEVEL,
  SHOP_PRICES
} from './constants/economy.constants';

import { 
  FIREBASE_CONFIG,
  FIRESTORE_COLLECTIONS
} from './config/firebase.config';
```

## 🎯 Common Tasks

### Task 1: Create a Deck
```javascript
import { createDeck, shuffleDeck } from './services/game';

const newDeck = shuffleDeck(createDeck());
```

### Task 2: Deal Cards
```javascript
import { dealCards } from './services/game';

const { players, drawPile } = dealCards(deck, 4);
```

### Task 3: Calculate Score
```javascript
import { calculateScore } from './services/game';

const score = calculateScore(player.hand);
```

### Task 4: Get Hint
```javascript
import { getHint } from './services/game';

const hint = getHint(player.hand);
console.log(hint.reason); // "Throw your highest card..."
```

### Task 5: Create Multiplayer Room
```javascript
import { createRoom } from './services/firebase';

const roomCode = await createRoom({
  uid: 'user123',
  name: 'Player1'
});
```

### Task 6: Join Room
```javascript
import { joinRoom } from './services/firebase';

const room = await joinRoom('ABC123', {
  uid: 'user456',
  name: 'Player2'
});
```

### Task 7: Subscribe to Room Updates
```javascript
import { subscribeToRoom } from './services/firebase';

const unsubscribe = subscribeToRoom('ABC123', (roomData) => {
  console.log('Room updated:', roomData);
});

// Later: unsubscribe();
```

### Task 8: Use Constants
```javascript
import { GAME_CONFIG, GAME_STATUS } from './constants';

// No magic numbers!
if (score <= GAME_CONFIG.CALL_SHOW_MAX_SCORE) {
  console.log('Can call show!');
}

if (status === GAME_STATUS.PLAYING) {
  console.log('Game is active');
}
```

## 🔧 File Naming Rules

| Type | Pattern | Example |
|------|---------|---------|
| Service | `name.service.js` | `deck.service.js` |
| Component | `PascalCase.jsx` | `GameBoard.jsx` |
| Constants | `name.constants.js` | `game.constants.js` |
| Config | `name.config.js` | `firebase.config.js` |
| Hook | `useName.js` | `useGame.js` |

## 📁 Where to Add New Code

| Feature | Location | File |
|---------|----------|------|
| New game rule | `constants/` | `game.constants.js` |
| New card operation | `services/game/` | `deck.service.js` |
| New AI behavior | `services/game/` | `ai.service.js` |
| New multiplayer feature | `services/firebase/` | `room.service.js` |
| New UI component | `components/ui/` | `NewComponent.jsx` |
| New game component | `components/game/` | `NewGameElement.jsx` |

## ⚡ Quick Commands

```bash
# Development
npm run dev                 # Start dev server

# Build
npm run build              # Build for production
npm run preview            # Preview build locally

# Deploy
firebase deploy            # Deploy to Firebase
vercel --prod             # Deploy to Vercel

# Clean
rm -rf dist node_modules/.vite  # Clean build artifacts
```

## ✅ Quality Checklist

Before committing code:
- [ ] No console.log statements
- [ ] No magic numbers (use constants)
- [ ] Functions have JSDoc
- [ ] File in correct folder
- [ ] Imports are clean
- [ ] Build works (`npm run build`)
- [ ] No unused variables/imports

---

**Updated**: January 3, 2026
