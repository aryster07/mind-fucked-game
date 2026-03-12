export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export interface Card {
  value: number;
  suit: Suit;
}

export interface PositionedCard extends Card {
  position: number;
}

export type GameStatus = 'waiting' | 'viewing' | 'playing' | 'show_called' | 'finished';

export type GamePhase =
  | 'idle'
  | 'draw'
  | 'swap'
  | 'power_up_7'
  | 'power_up_9'
  | 'power_up_11'
  | 'power_up_13'
  | 'show';

export interface GameState {
  status: GameStatus;
  phase: GamePhase;
  currentTurn: string;
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
  activePowerUp: {
    type: 7 | 9 | 11 | 13;
    playerId: string;
    targetId?: string;
    revealedCards?: PositionedCard[];
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

export interface DeckDocument {
  cards: Card[];
  discard: Card[];
}
