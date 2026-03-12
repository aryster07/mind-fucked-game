import { Card, Suit, PositionedCard } from './types';

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

export function dealCards(
  deck: Card[],
  numPlayers: number,
  cardsPerPlayer: number
): { hands: PositionedCard[][]; remaining: Card[] } {
  const remaining = [...deck];
  const hands: PositionedCard[][] = [];

  for (let p = 0; p < numPlayers; p++) {
    const hand: PositionedCard[] = [];
    for (let c = 0; c < cardsPerPlayer; c++) {
      const card = remaining.shift();
      if (!card) throw new Error('Not enough cards in deck');
      hand.push({ ...card, position: c });
    }
    hands.push(hand);
  }

  return { hands, remaining };
}

export function shufflePositions(cards: PositionedCard[]): PositionedCard[] {
  const positions = cards.map((c) => c.position);
  // Fisher-Yates on positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  return cards.map((card, idx) => ({ ...card, position: positions[idx] }));
}
