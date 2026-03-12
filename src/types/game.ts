export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export interface Card {
  value: number; // 1 (Ace) through 13 (King)
  suit: Suit;
}

export interface PositionedCard extends Card {
  position: number; // 0-3
}

export type GameStatus = 'waiting' | 'viewing' | 'playing' | 'show_called' | 'finished';

export type GamePhase =
  | 'idle'
  | 'discard'    // player's turn: select a card to throw away
  | 'draw'       // after discarding: click deck to draw a replacement
  | 'power_up_7'
  | 'power_up_9'
  | 'power_up_11'
  | 'power_up_13'
  | 'show';

export interface GameState {
  status: GameStatus;
  phase: GamePhase;
  currentTurn: string; // playerId
  turnOrder: string[];
  turnIndex: number;
  roundNumber: number;
  deckRemaining: number;
  discardTop: Card | null;
  hostId: string;
  roomCode: string;
  createdAt: number;
  showCallerId: string | null;
  showCallerSum: number | null;
  winnerId: string | null;
  discardedPosition: number | null; // position emptied by discard, waiting for draw
  activePowerUp: {
    type: 7 | 9 | 11 | 13;
    playerId: string; // who activated it
    targetId?: string; // target player (for 9, 11, 13)
    revealedCards?: PositionedCard[]; // for power-up 7 and 13
  } | null;
}

export interface PlayerPublic {
  name: string;
  connected: boolean;
  cardCount: number;
  seatIndex: number;
  actedThisRound: boolean;
}

export interface PlayerHand {
  cards: PositionedCard[];
  drawnCard: Card | null;
}

export interface GameRoom {
  gameId: string;
  roomCode: string;
  hostId: string;
  playerCount: number;
}

export function getCardLabel(value: number): string {
  switch (value) {
    case 1: return 'A';
    case 11: return 'J';
    case 12: return 'Q';
    case 13: return 'K';
    default: return String(value);
  }
}

export function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case 'hearts': return '\u2665';
    case 'diamonds': return '\u2666';
    case 'clubs': return '\u2663';
    case 'spades': return '\u2660';
  }
}

export function getSuitColor(suit: Suit): 'red' | 'black' {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

export const POWER_UP_VALUES = [7, 9, 11, 13] as const;

export function isPowerUp(value: number): value is 7 | 9 | 11 | 13 {
  return POWER_UP_VALUES.includes(value as typeof POWER_UP_VALUES[number]);
}

export function getPowerUpName(value: 7 | 9 | 11 | 13): string {
  switch (value) {
    case 7: return 'View & Rearrange';
    case 9: return 'Swap';
    case 11: return 'Shuffle';
    case 13: return 'Peek';
  }
}
