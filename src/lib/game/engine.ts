import { Card, Suit, PositionedCard, GameState, PlayerPublic, PlayerHand, GamePhase } from '@/types/game';

// ─── Deck ────────────────────────────────────────────────────────────────────

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let value = 1; value <= 13; value++) {
      deck.push({ value, suit });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function shufflePositions(cards: PositionedCard[]): PositionedCard[] {
  const positions = cards.map((c) => c.position);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  return cards.map((card, idx) => ({ ...card, position: positions[idx] }));
}

// ─── Game State Management ───────────────────────────────────────────────────

export interface LocalGameState {
  gameState: GameState;
  players: Record<string, PlayerPublic>;
  hands: Record<string, PlayerHand>;
  deck: Card[];
  discard: Card[];
}

export function createLocalGame(
  playerName: string,
  botCount: number
): LocalGameState {
  const playerId = 'player';
  const playerIds = [playerId];
  const players: Record<string, PlayerPublic> = {
    [playerId]: {
      name: playerName,
      connected: true,
      cardCount: 4,
      seatIndex: 0,
      actedThisRound: false,
    },
  };

  const botNames = ['Bot Alpha', 'Bot Beta', 'Bot Gamma', 'Bot Delta', 'Bot Epsilon'];
  for (let i = 0; i < botCount; i++) {
    const botId = `bot_${i}`;
    playerIds.push(botId);
    players[botId] = {
      name: botNames[i],
      connected: true,
      cardCount: 4,
      seatIndex: i + 1,
      actedThisRound: false,
    };
  }

  // Shuffle and deal
  const deck = shuffleDeck(createDeck());
  const hands: Record<string, PlayerHand> = {};

  for (const pid of playerIds) {
    const cards: PositionedCard[] = [];
    for (let c = 0; c < 4; c++) {
      const card = deck.shift()!;
      cards.push({ ...card, position: c });
    }
    hands[pid] = { cards, drawnCard: null };
  }

  const turnOrder = [...playerIds];
  const gameState: GameState = {
    status: 'viewing',
    phase: 'idle',
    currentTurn: turnOrder[0],
    turnOrder,
    turnIndex: 0,
    roundNumber: 1,
    deckRemaining: deck.length,
    discardTop: null,
    hostId: playerId,
    roomCode: 'SOLO',
    createdAt: Date.now(),
    showCallerId: null,
    showCallerSum: null,
    winnerId: null,
    activePowerUp: null,
  };

  return { gameState, players, hands, deck, discard: [] };
}

export function endViewingPhase(state: LocalGameState): LocalGameState {
  return {
    ...state,
    gameState: {
      ...state.gameState,
      status: 'playing',
      phase: 'draw',
    },
  };
}

export function rearrangeCards(
  state: LocalGameState,
  playerId: string,
  newOrder: number[]
): LocalGameState {
  const hand = state.hands[playerId];
  const reordered = hand.cards.map((card, idx) => ({
    ...card,
    position: newOrder[idx],
  }));
  return {
    ...state,
    hands: {
      ...state.hands,
      [playerId]: { ...hand, cards: reordered },
    },
  };
}

function isPowerUp(value: number): boolean {
  return value === 7 || value === 9 || value === 11 || value === 13;
}

function advanceTurn(gs: GameState, players: Record<string, PlayerPublic>): {
  gameState: Partial<GameState>;
  players: Record<string, PlayerPublic>;
} {
  const nextIndex = (gs.turnIndex + 1) % gs.turnOrder.length;
  const isNewRound = nextIndex === 0;

  let updatedPlayers = players;
  if (isNewRound) {
    updatedPlayers = { ...players };
    for (const pid of Object.keys(updatedPlayers)) {
      updatedPlayers[pid] = { ...updatedPlayers[pid], actedThisRound: false };
    }
  }

  return {
    gameState: {
      turnIndex: nextIndex,
      currentTurn: gs.turnOrder[nextIndex],
      roundNumber: isNewRound ? gs.roundNumber + 1 : gs.roundNumber,
      phase: 'draw' as GamePhase,
      activePowerUp: null,
    },
    players: updatedPlayers,
  };
}

/**
 * playTurn: The main turn action (new reversed flow).
 * Player clicks a hand card → that card is discarded → a new card is drawn
 * from the deck and placed at that same position.
 *
 * If the discarded card is a power-up, the power-up activates and the turn
 * does NOT advance yet (power-up resolver will advance it).
 */
export function playTurn(
  state: LocalGameState,
  playerId: string,
  position: number
): LocalGameState {
  const gs = state.gameState;
  if (gs.currentTurn !== playerId || gs.phase !== 'draw') {
    return state;
  }

  const hand = state.hands[playerId];
  const cardIndex = hand.cards.findIndex((c) => c.position === position);
  if (cardIndex === -1) return state;

  // 1. Remove card from hand (discard it)
  const discardedCard = hand.cards[cardIndex];

  // 2. Draw new card from deck
  let deck = [...state.deck];
  let discard = [...state.discard, { value: discardedCard.value, suit: discardedCard.suit }];

  if (deck.length === 0) {
    if (discard.length === 0) return state;
    deck = shuffleDeck(discard);
    discard = [];
  }

  const drawn = deck.shift()!;

  // 3. Place drawn card at the same position
  const newCard: PositionedCard = { ...drawn, position };
  const newCards = [...hand.cards];
  newCards[cardIndex] = newCard;

  const newHands = {
    ...state.hands,
    [playerId]: {
      cards: newCards,
      drawnCard: drawn, // store for UI reveal (shown briefly face-up)
    },
  };

  const updatedPlayers = {
    ...state.players,
    [playerId]: { ...state.players[playerId], actedThisRound: true },
  };

  // 4. Check if discarded card triggers a power-up
  if (isPowerUp(discardedCard.value)) {
    const puType = discardedCard.value as 7 | 9 | 11 | 13;
    return {
      ...state,
      deck,
      discard,
      hands: newHands,
      players: updatedPlayers,
      gameState: {
        ...gs,
        deckRemaining: deck.length,
        discardTop: { value: discardedCard.value, suit: discardedCard.suit },
        phase: `power_up_${puType}` as GamePhase,
        activePowerUp: {
          type: puType,
          playerId,
          revealedCards: puType === 7 ? newCards : undefined,
        },
      },
    };
  }

  // 5. No power-up — advance turn
  const { gameState: turnUpdate, players: turnPlayers } = advanceTurn(gs, updatedPlayers);

  return {
    ...state,
    deck,
    discard,
    hands: newHands,
    players: turnPlayers,
    gameState: {
      ...gs,
      ...turnUpdate,
      deckRemaining: deck.length,
      discardTop: { value: discardedCard.value, suit: discardedCard.suit },
    },
  };
}

// ─── Power-up Resolvers ──────────────────────────────────────────────────────

export function resolvePowerUp7(
  state: LocalGameState,
  playerId: string,
  newOrder: number[]
): LocalGameState {
  const hand = state.hands[playerId];
  const reordered = hand.cards.map((card, idx) => ({
    ...card,
    position: newOrder[idx],
  }));

  const { gameState: turnUpdate, players: updatedPlayers } = advanceTurn(
    state.gameState,
    state.players
  );

  return {
    ...state,
    hands: { ...state.hands, [playerId]: { ...hand, cards: reordered } },
    players: updatedPlayers,
    gameState: { ...state.gameState, ...turnUpdate },
  };
}

export function resolvePowerUp9(
  state: LocalGameState,
  playerId: string,
  targetId: string,
  myPosition: number,
  targetPosition: number
): LocalGameState {
  const myHand = state.hands[playerId];
  const targetHand = state.hands[targetId];

  const myIdx = myHand.cards.findIndex((c) => c.position === myPosition);
  const targetIdx = targetHand.cards.findIndex((c) => c.position === targetPosition);
  if (myIdx === -1 || targetIdx === -1) return state;

  const myCard = myHand.cards[myIdx];
  const targetCard = targetHand.cards[targetIdx];

  const newMyCards = [...myHand.cards];
  newMyCards[myIdx] = { ...targetCard, position: myPosition };

  const newTargetCards = [...targetHand.cards];
  newTargetCards[targetIdx] = { ...myCard, position: targetPosition };

  const { gameState: turnUpdate, players: updatedPlayers } = advanceTurn(
    state.gameState,
    state.players
  );

  return {
    ...state,
    hands: {
      ...state.hands,
      [playerId]: { cards: newMyCards, drawnCard: null },
      [targetId]: { cards: newTargetCards, drawnCard: null },
    },
    players: updatedPlayers,
    gameState: { ...state.gameState, ...turnUpdate },
  };
}

export function resolvePowerUp11(
  state: LocalGameState,
  targetId: string
): LocalGameState {
  const targetHand = state.hands[targetId];
  const shuffled = shufflePositions(targetHand.cards);

  const { gameState: turnUpdate, players: updatedPlayers } = advanceTurn(
    state.gameState,
    state.players
  );

  return {
    ...state,
    hands: {
      ...state.hands,
      [targetId]: { ...targetHand, cards: shuffled },
    },
    players: updatedPlayers,
    gameState: { ...state.gameState, ...turnUpdate },
  };
}

export function resolvePowerUp13(
  state: LocalGameState
): LocalGameState {
  // Just advance turn; the peeked cards are shown in UI separately
  const { gameState: turnUpdate, players: updatedPlayers } = advanceTurn(
    state.gameState,
    state.players
  );

  return {
    ...state,
    players: updatedPlayers,
    gameState: { ...state.gameState, ...turnUpdate },
  };
}

export function skipPowerUp(state: LocalGameState): LocalGameState {
  const { gameState: turnUpdate, players: updatedPlayers } = advanceTurn(
    state.gameState,
    state.players
  );

  return {
    ...state,
    players: updatedPlayers,
    gameState: { ...state.gameState, ...turnUpdate },
  };
}

// ─── Call Show ───────────────────────────────────────────────────────────────

export function callShow(
  state: LocalGameState,
  playerId: string
): LocalGameState {
  const player = state.players[playerId];
  const hand = state.hands[playerId];
  const sum = hand.cards.reduce((s, c) => s + c.value, 0);

  if (player.actedThisRound) return state;
  if (sum > 10) return state;

  return {
    ...state,
    gameState: {
      ...state.gameState,
      status: 'finished',
      phase: 'show',
      showCallerId: playerId,
      showCallerSum: sum,
      winnerId: playerId,
      activePowerUp: null,
    },
  };
}
