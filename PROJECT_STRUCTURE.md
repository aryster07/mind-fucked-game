# Project Structure

## Overview
This project has been refactored into a clean, modular architecture with clear separation of concerns.

## Directory Structure

```
src/
├── logic/              # Business logic modules (pure functions)
│   ├── gameplay.js     # Game rules, scoring, powers, state management
│   ├── board.js        # Deck creation, shuffling, card operations
│   ├── firebase.js     # Firebase/Firestore integration
│   ├── players.js      # Player management and operations
│   ├── host.js         # Host-specific game control
│   └── index.js        # Module exports
│
├── ui/                 # Reusable UI components
│   ├── Card.jsx
│   ├── PlayerHand.jsx
│   ├── DeckDisplay.jsx
│   ├── NotificationBar.jsx
│   ├── PowerToast.jsx
│   ├── Countdown.jsx
│   ├── ShuffleAlert.jsx
│   ├── GameOverModal.jsx
│   ├── ActionButtons.jsx
│   ├── MainMenu.jsx
│   ├── Lobby.jsx
│   └── index.js        # Component exports
│
├── pages/              # Page components (compose UI components)
│   ├── GameBoard.jsx   # Main game board page
│   ├── Lobby.jsx       # Lobby page with logic
│   └── MainMenu.jsx    # Main menu page with logic
│
├── context/            # React context providers
│   └── GameContext.jsx # Game state management
│
├── App.jsx             # Root component
├── main.jsx            # Entry point
└── firebase.js         # Firebase configuration

```

## Module Descriptions

### Logic Modules (`src/logic/`)
Pure JavaScript modules containing business logic - no React dependencies.

- **gameplay.js**: Core game mechanics including scoring, power handling, winner determination
- **board.js**: Deck and card operations like shuffling, dealing, drawing
- **firebase.js**: All Firebase operations (CRUD for rooms, subscriptions)
- **players.js**: Player data management and transformations
- **host.js**: Host-specific functions like game initialization

### UI Components (`src/ui/`)
Pure presentational React components - receive props, render UI.

- **Card.jsx**: Individual card display
- **PlayerHand.jsx**: Player's hand with drag/drop support
- **DeckDisplay.jsx**: Deck and discard pile visualization
- **NotificationBar.jsx**: Top notification area
- **PowerToast.jsx**: Power activation notifications
- **Countdown.jsx**: Pre-game countdown timer
- **ShuffleAlert.jsx**: Alert when cards are shuffled
- **GameOverModal.jsx**: End game modal
- **ActionButtons.jsx**: Call Show / Done buttons
- **MainMenu.jsx**: Main menu UI
- **Lobby.jsx**: Lobby UI

### Pages (`src/pages/`)
Smart components that combine UI components with logic and state.

- **GameBoard.jsx**: Main game interface, handles game flow
- **Lobby.jsx**: Multiplayer lobby with Firebase integration
- **MainMenu.jsx**: Entry point for game modes

### Context (`src/context/`)
- **GameContext.jsx**: Centralized game state using React Context + useReducer

## Design Principles

1. **Separation of Concerns**: Logic is separate from UI
2. **Modularity**: Each module has a single responsibility
3. **Reusability**: UI components are pure and composable
4. **Testability**: Pure functions in logic modules are easily testable
5. **Maintainability**: Clear structure makes changes easier

## Import Examples

```javascript
// Import logic functions
import { getScore, getPower } from '../logic/gameplay';
import { createDeck, shuffle } from '../logic/board';
import { createRoom, joinRoom } from '../logic/firebase';

// Import UI components
import { Card, PlayerHand, DeckDisplay } from '../ui';
// or
import Card from '../ui/Card';

// Import pages
import GameBoard from '../pages/GameBoard';
```

## Benefits of This Structure

- **Easy to find**: Know exactly where to look for specific functionality
- **Easy to test**: Pure functions can be tested in isolation
- **Easy to maintain**: Changes in one module don't affect others
- **Easy to extend**: Add new features without touching existing code
- **Clear dependencies**: UI depends on logic, never the other way around
