/**
 * Deck Service
 * Handles card deck creation and manipulation
 */

import { CARD_SUITS, CARD_RANKS, CARD_VALUES } from '../../constants/game.constants';

/**
 * Create a new 52-card deck
 * @returns {Array<Card>} Array of card objects
 */
export const createDeck = () => {
  const deck = [];
  let id = 0;

  CARD_SUITS.forEach((suit) => {
    CARD_RANKS.forEach((rank) => {
      deck.push({
        id: `card-${id++}`,
        suit,
        rank,
        value: CARD_VALUES[rank],
        isRed: suit === '♥' || suit === '♦',
      });
    });
  });

  return deck;
};

/**
 * Shuffle a deck using Fisher-Yates algorithm
 * @param {Array<Card>} deck - Deck to shuffle
 * @returns {Array<Card>} Shuffled deck
 */
export const shuffleDeck = (deck) => {
  const newDeck = [...deck];
  
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  
  return newDeck;
};

/**
 * Calculate total score of a hand
 * @param {Array<Card>} hand - Player's hand
 * @returns {number} Total score
 */
export const calculateScore = (hand) => {
  return hand.reduce((sum, card) => sum + (card ? card.value : 0), 0);
};
