# Mind F**ked - Complete Game Specification

**Game Type:** Multiplayer Card Game (2-6 players)  
**Inspired By:** Cabo, Golf Card Game  
**Platform:** Web (React + Firebase)  
**Last Updated:** January 3, 2026

---

## Game Overview

Mind F**ked is a memory-based card game where players try to get the **lowest hand value** by the end of the game. Players start by memorizing their cards, then take turns throwing and drawing cards while trying to remember what they have. Power cards add chaos by letting you spy, swap, or shuffle cards.

**Core Mechanic:** Memory + Risk Management  
**Win Condition:** Have the lowest hand value when someone calls "SHOW"  
**Bust Condition:** Call SHOW with hand value > 10

---

## Card Values

### Standard Cards
- **Ace (A):** 1 point
- **2-6:** Face value (2-6 points)
- **7:** 7 points + **REFRESH** power
- **8:** 8 points
- **9:** 9 points + **BLIND SWAP** power
- **10:** 10 points
- **Jack (J):** 11 points + **CHAOS SHUFFLE** power
- **Queen (Q):** 12 points
- **King (K):** 13 points + **GLOBAL SPY** power

### Power Cards (Activate on THROW)
1. **7 - REFRESH:** Reveal all YOUR cards for 3 seconds
2. **9 - BLIND SWAP:** Swap one of your cards with an opponent's card (both cards hidden during swap)
3. **Jack (11) - CHAOS SHUFFLE:** Shuffle an opponent's entire hand (randomize card positions)
4. **King (13) - GLOBAL SPY:** Reveal one opponent's entire hand to ALL players for 3 seconds

**CRITICAL:** Power-ups activate when you **THROW** the card, NOT when you draw it!

---

## Game Setup

### Deck
- Standard 52-card deck (no jokers)
- Shuffle before each game

### Dealing
- Each player gets **4 cards** face-down
- Remaining cards form the **DRAW PILE**
- Empty **DISCARD PILE** beside draw pile

### Initial Memorization (PRE_GAME Phase)
1. All players' cards flip **FACE UP**
2. **8-second countdown** timer displayed
3. Players memorize their cards
4. After 8 seconds, ALL cards flip **FACE DOWN**
5. Game transitions to **PLAYING** phase

---

## Turn Flow (DETAILED)

### Phase 1: SHOW_OR_THROW
**Duration:** Player's choice (or 15-second turn timer)

Player has TWO options:

#### Option A: CALL SHOW
- Click **"CALL SHOW"** button
- **Win Condition:** Hand value ≤ 10
  - All cards reveal
  - Caller WINS immediately
  - Notification: `[Player] WINS with [X] points!`
- **Bust Condition:** Hand value > 10
  - All cards reveal
  - Caller LOSES (busted)
  - Player with lowest score among others WINS
  - Notification: `[Player] BUSTED with [X] points! [Winner] wins!`
- Game ends, transition to **GAME_OVER** phase

#### Option B: THROW a Card
- Click one of YOUR 4 cards
- Card moves to discard pile (face up)
- That slot becomes **empty** (null)
- Check if thrown card is 7, 9, J, or K → Set power action
- Transition to **REPLACE** phase

**UI Elements:**
- **SHOW Button:** Red gradient, prominent, shows `🎯 CALL SHOW`
- **Your Cards:** Highlight on hover if it's your turn
- **Turn Indicator:** Border around current player's name (purple glow)

---

### Phase 2: REPLACE
**Duration:** Automatic (600ms animation delay)

1. **Draw one card** from draw pile
2. **Place it in the empty slot** (where you threw from)
3. **Reveal the new card** to ONLY you (face up) for **3 seconds**
4. After 3 seconds, card flips **FACE DOWN** automatically
5. If power was triggered → Transition to **POWER_ACTION**
6. If no power → Transition to **END_TURN**

**Implementation Details:**
- New card has `faceUp: true` AND `tempReveal: true` flag
- Only the current player sees cards with `tempReveal`
- Timer: `setTimeout` for 3000ms, then flip card face down
- State: `newCardRevealUntil = Date.now() + 3000`

---

### Phase 3: POWER_ACTION (Only if power card was thrown)

Power activates based on what you **threw** (not drew):

#### 7 - REFRESH
1. Button appears: `✨ View Your Cards`
2. Player clicks button
3. **All YOUR 4 cards** flip face up (only you see them)
4. 3-second timer starts
5. Cards flip back face down
6. Transition to **END_TURN**

#### 9 - BLIND SWAP
1. Instruction: "Select your card then opponent card"
2. Player clicks **one of their own cards** (stores index)
3. Player clicks **one opponent card** (any player, any slot)
4. **Cards swap positions** (both remain face down - "blind")
5. No one sees what was swapped
6. Transition to **END_TURN**

#### J (11) - CHAOS SHUFFLE
1. Instruction: "Select opponent to shuffle"
2. Player clicks **any opponent's card** (or player avatar)
3. **That opponent's 4 cards shuffle** (randomize array positions)
4. Opponent now has same cards but different positions
5. Notification: `[Opponent]'s cards were shuffled!`
6. Transition to **END_TURN**

#### K (13) - GLOBAL SPY
1. Instruction: "Select opponent to reveal"
2. Player clicks **any opponent's card** (or player avatar)
3. **All 4 of that opponent's cards** flip face up
4. **EVERYONE sees them** for 3 seconds
5. Cards flip back face down
6. Notification: `[Opponent]'s cards revealed to everyone!`
7. Transition to **END_TURN**

**UI During Power:**
- Show clear instructions in notification bar
- Highlight valid targets (opponent cards glow yellow for CHAOS/SPY)
- Disable invalid actions (can't target yourself for opponent-only powers)

---

### Phase 4: END_TURN
**Duration:** 1 second (animation delay)

1. Wait 1000ms (give time for animations)
2. Advance `turnIndex` to next player (wrap around with modulo)
3. Reset turn phase to **SHOW_OR_THROW**
4. Set `turnStartTime = Date.now()` (for 15s timer)
5. Clear power-up state (`powerAction = null`)
6. Notification: `[Next Player]'s turn - SHOW or THROW`

---

## Turn Timer (15 seconds)

**Feature:** Each player has 15 seconds to make their move

### Implementation
1. When turn starts → `turnStartTime = Date.now()`
2. Display countdown: `15 - Math.floor((Date.now() - turnStartTime) / 1000)`
3. If countdown reaches 0:
   - **Auto-throw** a random card from player's hand
   - Continue with REPLACE phase normally
4. Timer UI: Show in top-right corner, turns red at 5s remaining

**Note:** Timer pauses during REPLACE and POWER_ACTION phases (only counts during SHOW_OR_THROW)

---

## Multiplayer - Firebase Real-Time Sync

### Room Structure
```javascript
{
  roomCode: "ABC123",
  host: "user-abc",
  status: "waiting" | "playing" | "finished",
  players: [
    { uid: "user-abc", name: "Alice", ready: true },
    { uid: "user-xyz", name: "Bob", ready: true }
  ],
  gameState: {
    status: "PRE_GAME" | "PLAYING" | "GAME_OVER",
    players: [
      {
        id: "user-abc",
        name: "Alice",
        hand: [
          { rank: "A", suit: "♠", value: 1, faceUp: false },
          { rank: "7", suit: "♥", value: 7, faceUp: false },
          null, // empty slot
          { rank: "K", suit: "♣", value: 13, faceUp: false }
        ],
        isYou: true // Client-side only flag
      }
    ],
    deck: [...cards], // Array of remaining cards
    discardPile: [...cards],
    turnIndex: 0,
    turnPhase: "SHOW_OR_THROW",
    notification: "Alice's turn - SHOW or THROW",
    preGameEndsAt: 1735948264000, // Timestamp for countdown sync
    turnStartTime: 1735948272000,
    powerAction: null,
    winner: null
  },
  chat: [
    { player: "Alice", message: "Good luck!", timestamp: 1735948264000 }
  ],
  createdAt: 1735948264000,
  updatedAt: 1735948272000
}
```

### Sync Rules
1. **Host Only:**
   - Creates initial game state (deals cards, shuffles deck)
   - Pushes PRE_GAME state to Firebase
   - Starts countdown timer
   - Transitions PRE_GAME → PLAYING when countdown ends

2. **Current Turn Player Only:**
   - Pushes state changes during their turn
   - THROW_CARD, DRAW_CARD, EXECUTE_POWER, END_TURN
   - Uses 100ms debounce to prevent spam

3. **All Players:**
   - Listen to `onSnapshot` on room document
   - Apply remote state via `APPLY_REMOTE_STATE` action
   - Set `fromRemote: true` flag to prevent re-syncing

4. **Preventing Infinite Loops:**
   ```javascript
   if (state.fromRemote) {
     // Don't sync back to Firebase
     return;
   }
   ```

### Countdown Synchronization
**Problem:** Each device has different clock times
**Solution:** Use shared timestamp

```javascript
// Host sets
preGameEndsAt: Date.now() + 8000

// All clients calculate
const remainingMs = state.preGameEndsAt - Date.now();
const countdown = Math.max(0, Math.ceil(remainingMs / 1000));
```

This ensures all players see the same countdown regardless of latency.

---

## Game State Machine

```
MENU
  ↓ (Start Solo / Create Room / Join Room)
LOBBY (Multiplayer only)
  ↓ (Host clicks START)
PRE_GAME (8s countdown, cards face up)
  ↓ (Countdown ends)
PLAYING
  ├─ SHOW_OR_THROW → CALL SHOW → GAME_OVER
  └─ SHOW_OR_THROW → THROW → REPLACE → [POWER_ACTION] → END_TURN → (next turn)
GAME_OVER
  ↓ (Click Play Again)
MENU
```

---

## React State Architecture

### GameContext Reducer

#### State Shape
```javascript
{
  status: 'MENU' | 'LOBBY' | 'PRE_GAME' | 'PLAYING' | 'GAME_OVER',
  players: [
    {
      id: 'user-abc',
      name: 'Alice',
      hand: [Card, Card, null, Card], // 4 slots, can have nulls
      isBot: false,
      isYou: true,
      score: 0, // Only set in GAME_OVER
      busted: false // Only set in GAME_OVER
    }
  ],
  deck: [Card, Card, ...],
  discardPile: [Card, Card, ...],
  turnIndex: 0,
  turnPhase: 'SHOW_OR_THROW' | 'REPLACE' | 'POWER_ACTION' | 'END_TURN',
  notification: 'Your turn - SHOW or THROW',
  
  // Power-up state
  powerAction: null | 'REFRESH' | 'BLIND_SWAP' | 'CHAOS_SHUFFLE' | 'GLOBAL_SPY',
  swapSourceIndex: null, // For BLIND_SWAP: which of your cards you selected
  
  // Timing
  preGameEndsAt: null | timestamp,
  turnStartTime: null | timestamp,
  newCardRevealUntil: null | timestamp,
  
  // Multiplayer
  roomCode: null | 'ABC123',
  currentUserId: 'user-abc',
  isHost: false,
  fromRemote: false,
  
  // Other
  winner: null | 'user-abc',
  thrownSlotIndex: null // Which slot was emptied (for REPLACE phase)
}
```

#### Actions
1. **START_SOLO** - Deal cards, start PRE_GAME countdown
2. **START_GAME_PLAY** - Flip cards face down, begin PLAYING
3. **CALL_SHOW** - End game, determine winner
4. **THROW_CARD** - Move card to discard, check for power
5. **DRAW_CARD** - Draw replacement, show for 3s
6. **HIDE_NEW_CARD** - Flip tempReveal card face down
7. **EXECUTE_POWER** - Run power-up logic (REFRESH, BLIND_SWAP, etc.)
8. **END_TURN** - Advance to next player
9. **HOST_START_ONLINE_GAME** - Host deals cards for multiplayer
10. **APPLY_REMOTE_STATE** - Sync from Firebase
11. **UPDATE_STATE** - Generic state update

---

## UI Components

### MainMenu
- **Solo Play** button
- **Create Room** button
- **Join Room** input + button
- **How to Play** button

### Lobby (Multiplayer)
- Room code display (copy button)
- Player list (ready status)
- **START GAME** button (host only, requires 2+ players)
- **Leave Room** button

### GameBoard (Main Game Screen)

#### Top Bar
- Notification message (left)
- **CALL SHOW** button (right, only during SHOW_OR_THROW phase on your turn)
- Power action instructions (during POWER_ACTION phase)
- Winner announcement (GAME_OVER)

#### Player Positions (2-6 players)
```
        [Top-Left]  [Top]  [Top-Right]
[Left]          DECK  DISCARD          [Right]
            [Bottom - YOU]
```

#### Card Display Rules
- **Your Cards:**
  - PRE_GAME: All face up (memorization)
  - PLAYING: Face down, except `tempReveal` cards (3s peek)
  - GAME_OVER: All face up with score
- **Opponent Cards:**
  - PRE_GAME: Face up (visible to everyone)
  - PLAYING: Face down, except during GLOBAL_SPY (3s reveal)
  - GAME_OVER: All face up with scores
- **Empty Slots:** Dashed border, "Empty" text
- **Deck:** Back of card, shows count (e.g., "32")
- **Discard:** Top card face up

#### Interactions
- **Your Turn + SHOW_OR_THROW:** Cards glow/scale on hover
- **Power Action:** Valid targets glow yellow
- **Turn Indicator:** Purple ring around current player's name

### PowerupGuide (Left Sidebar)
- Collapsible panel (slides in/out)
- Shows all 4 power cards:
  - 7 - Refresh
  - 9 - Blind Swap
  - J - Chaos Shuffle
  - K - Global Spy
- Icon, name, and description for each

### GameLog (Right Sidebar)
- Chat messages
- Game events (throws, power-ups, turn changes)
- Input field to send messages

### HowToPlay (Modal)
- Game rules
- Turn flow diagram
- Power-up explanations
- Open from `?` button in corner

---

## Technical Stack

### Frontend
- **React 18** with Hooks (useState, useReducer, useEffect, useContext)
- **Vite** for build tool
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **clsx** for conditional classes
- **lucide-react** for icons

### Backend
- **Firebase Authentication** (Anonymous auth)
  - Each player gets auto-generated UID
  - Stored in localStorage: `userId`, `username`
- **Firebase Firestore** (Real-time database)
  - Collection: `rooms`
  - Document per room: `/rooms/{roomCode}`
  - Real-time listeners: `onSnapshot`
- **Firebase Hosting** (Static site deployment)

### Services Layer
```
src/
  services/
    firebase/
      room.service.js      # createRoom, joinRoom, updateGameState, subscribeToRoom
    game/
      deck.service.js      # createDeck, shuffleDeck, calculateScore
      player.service.js    # dealCards
```

---

## Critical Implementation Details

### 1. Card Slot Persistence
**Problem:** When you throw a card, the slot must stay empty so the new card goes in the same position.

**Solution:**
```javascript
// Throw
const newHand = [...player.hand];
newHand[cardIndex] = null; // Don't remove, set to null

// Draw
newHand[thrownSlotIndex] = newCard; // Put in same slot
```

### 2. Face Up/Down Logic
```javascript
// Card object
{
  rank: "A",
  suit: "♠",
  value: 1,
  faceUp: false,     // Permanent visibility state
  tempReveal: false  // Temporary 3s reveal
}

// Rendering
const showCard = card.faceUp || (isMyCard && card.tempReveal);
```

### 3. Power-Up Timing
```javascript
case 'THROW_CARD':
  const cardValue = cardToThrow.value;
  let powerAction = null;
  
  if (cardValue === 7) powerAction = 'REFRESH';
  else if (cardValue === 9) powerAction = 'BLIND_SWAP';
  else if (cardValue === 11) powerAction = 'CHAOS_SHUFFLE';
  else if (cardValue === 13) powerAction = 'GLOBAL_SPY';
  
  return { ...state, powerAction };
```

### 4. Auto-Hide Timer
```javascript
useEffect(() => {
  if (state.newCardRevealUntil && Date.now() < state.newCardRevealUntil) {
    const delay = state.newCardRevealUntil - Date.now();
    const timer = setTimeout(() => {
      dispatch({ type: 'HIDE_NEW_CARD', payload: { playerIndex, cardIndex } });
    }, delay);
    return () => clearTimeout(timer);
  }
}, [state.newCardRevealUntil]);
```

### 5. Firebase Sync Debouncing
```javascript
useEffect(() => {
  if (state.fromRemote) return; // Don't sync remote changes back
  if (!isMyTurn) return; // Only current player syncs
  
  const timeout = setTimeout(async () => {
    await updateGameState(roomCode, state);
  }, 100); // 100ms debounce
  
  return () => clearTimeout(timeout);
}, [state.turnIndex, state.turnPhase, state.players]);
```

---

## Common Bugs & Solutions

### Bug 1: Infinite Firebase Loop
**Symptom:** `onSnapshot` triggers every 100ms, thousands of writes
**Cause:** Remote state triggers re-sync
**Fix:** Use `fromRemote` flag
```javascript
if (state.fromRemote) {
  dispatch({ type: 'UPDATE_STATE', payload: { fromRemote: false } });
  return; // Don't sync
}
```

### Bug 2: Countdown Desync
**Symptom:** Each player sees different countdown
**Cause:** Using `Date.now()` locally on each device
**Fix:** Use shared timestamp
```javascript
// Host sets
preGameEndsAt: Date.now() + 8000

// All clients
const remaining = state.preGameEndsAt - Date.now();
```

### Bug 3: Cards Visible to Opponents
**Symptom:** Everyone sees everyone's cards
**Cause:** Not checking `isYou` flag
**Fix:**
```javascript
const showCard = (isYou && card.faceUp) || 
                 (!isYou && card.faceUp && status !== 'PRE_GAME');
```

### Bug 4: Power Activates on Draw
**Symptom:** Power triggers when drawing card
**Cause:** Checking value of drawn card
**Fix:** Check value of **thrown** card in THROW_CARD action

---

## Testing Checklist

### Solo Mode
- [ ] Cards deal correctly (4 per player)
- [ ] 8-second countdown works
- [ ] Cards flip face down after countdown
- [ ] Can throw card on my turn
- [ ] Can see new card for 3 seconds
- [ ] Card hides after 3 seconds
- [ ] CALL SHOW wins if ≤10
- [ ] CALL SHOW busts if >10
- [ ] Power 7 (REFRESH) shows my cards for 3s
- [ ] Power 9 (BLIND SWAP) swaps cards
- [ ] Power J (CHAOS SHUFFLE) shuffles opponent
- [ ] Power K (GLOBAL SPY) reveals opponent for 3s
- [ ] Turn advances to next player
- [ ] Game Over shows winner and scores

### Multiplayer
- [ ] Can create room
- [ ] Can join room with code
- [ ] Room code displays and copies
- [ ] Player list shows all players
- [ ] Host can START game (others can't)
- [ ] Countdown syncs on all devices
- [ ] Cards sync in real-time
- [ ] Current player indicator shows correctly
- [ ] Only current player can interact
- [ ] Chat messages work
- [ ] Game log shows events
- [ ] Power-ups sync across devices
- [ ] CALL SHOW ends game for everyone
- [ ] Winner shows correctly on all devices
- [ ] Room cleans up after game

### Edge Cases
- [ ] What if draw pile empties? (Reshuffle discard)
- [ ] What if player disconnects? (Room continues)
- [ ] What if two players CALL SHOW? (First one wins)
- [ ] What if all cards are face up? (Rare, but possible)
- [ ] What if countdown finishes while offline? (Sync on reconnect)

---

## Future Enhancements

1. **Turn Timer:** 15-second countdown with auto-throw
2. **Sound Effects:** Card flip, power activation, win/lose
3. **Animations:** Card movement, power-up visual effects
4. **Mobile:** Responsive design, touch-friendly
5. **Leaderboard:** Track wins/losses, ranking
6. **Cosmetics:** Card backs, table themes, avatars
7. **Private Rooms:** Password protection
8. **Spectator Mode:** Watch games in progress
9. **Replay System:** Review past games
10. **AI Bots:** Fill empty slots in multiplayer

---

## File Structure

```
src/
  context/
    GameContext.jsx         # Main game state, reducer, actions
  components/
    MainMenu.jsx            # Start screen
    Lobby.jsx               # Multiplayer lobby
    GameBoard.jsx           # Main game UI
    Card.jsx                # Single card component
    GameLog.jsx             # Chat + event log
    PowerupGuide.jsx        # Power-up reference
    HowToPlay.jsx           # Rules modal
  services/
    firebase/
      room.service.js       # Firebase operations
    game/
      deck.service.js       # Deck/card utilities
      player.service.js     # Player/dealing utilities
  utils/
    constants.js            # Game constants
  App.jsx                   # Main app component
  main.jsx                  # Entry point
  firebase.js               # Firebase config
```

---

## Deployment

### Firebase Setup
1. Create Firebase project
2. Enable **Anonymous Authentication**
3. Create **Firestore database** (test mode for development)
4. Enable **Hosting**
5. Get config keys

### Firestore Rules (Development)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read, write: if true; // Open for testing
    }
  }
}
```

### Build & Deploy
```bash
npm install
npm run build
firebase deploy --only hosting
```

---

## Key Differences from Original Cabo/Golf

1. **SHOW Mechanic:** Must have ≤10 to win (not just lowest)
2. **Power Cards:** Specific to 7/9/J/K (not 7/8/9/10)
3. **Memory Phase:** 8 seconds at start (not throughout)
4. **Blind Swap:** Can't see opponent card before swapping
5. **Global Spy:** Everyone sees the cards (not just you)
6. **Turn Timer:** 15 seconds max (optional enforcement)

---

## Summary for New Project

**What to Build:**
A real-time multiplayer card game where 2-6 players compete to have the lowest hand value. Players memorize their cards at the start, then take turns throwing and drawing cards. Power cards (7, 9, J, K) add strategic chaos. First player to call SHOW with hand ≤10 wins; if >10, they bust and lowest other player wins.

**Core Loop:**
1. Memorize cards (8s)
2. On your turn: CALL SHOW or THROW a card
3. If you throw: Draw replacement, see it for 3s, then it hides
4. If power card: Execute power (spy, swap, shuffle, refresh)
5. Next player's turn

**Technical Approach:**
- React + Firebase for real-time sync
- useReducer for complex game state
- Shared timestamps for countdown sync
- Current turn player pushes updates
- All players listen for updates
- Clean separation: Context → Services → Firebase

**Success Criteria:**
- 2 players can join a room and play a complete game
- Countdown syncs perfectly
- Cards reveal/hide at correct times
- Power-ups work correctly
- CALL SHOW determines winner accurately
- No infinite loops or sync issues

---

**End of Specification**
