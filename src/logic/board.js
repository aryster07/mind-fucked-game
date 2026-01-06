/**
 * Board Logic Module
 * Handles deck management, card operations, and hand manipulation
 */

// ============================================================================
// DECK OPERATIONS
// ============================================================================

/**
 * Fisher-Yates shuffle algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} New shuffled array
 */
export function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Creates a standard 52-card deck
 * @returns {Array<{suit: string, value: number, rank: string}>} Shuffled deck
 */
export function createDeck() {
  const suits = [
    { name: 'hearts', symbol: '♥' },
    { name: 'diamonds', symbol: '♦' },
    { name: 'clubs', symbol: '♣' },
    { name: 'spades', symbol: '♠' },
  ];
  const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]; // A-K
  const rankMap = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
  
  const deck = [];
  for (const { name, symbol } of suits) {
    for (const value of values) {
      deck.push({ 
        suit: symbol, 
        suitName: name,
        value, 
        rank: rankMap[value] || String(value)
      });
    }
  }
  
  return shuffle(deck);
}

/**
 * Draws a card from the deck
 * @param {Array} deck - Current deck
 * @returns {{card: Object|null, deck: Array}} Drawn card and updated deck
 */
export function drawCard(deck) {
  if (!deck || deck.length === 0) {
    return { card: null, deck: [] };
  }
  
  const newDeck = [...deck];
  const card = newDeck.pop();
  return { card, deck: newDeck };
}

/**
 * Adds a card to the discard pile
 * @param {Array} discardPile - Current discard pile
 * @param {Object} card - Card to discard
 * @returns {Array} Updated discard pile
 */
export function discardCard(discardPile, card) {
  if (!card) return discardPile;
  return [...discardPile, card];
}

/**
 * Reshuffles the discard pile into the deck when deck is empty
 * @param {Array} deck - Current deck
 * @param {Array} discardPile - Current discard pile
 * @returns {{deck: Array, discardPile: Array}} New deck and empty discard pile
 */
export function reshuffleDeck(deck, discardPile) {
  if (deck.length > 0 || discardPile.length === 0) {
    return { deck, discardPile };
  }
  
  // Keep the top card of discard pile visible
  const topCard = discardPile[discardPile.length - 1];
  const cardsToShuffle = discardPile.slice(0, -1);
  
  return {
    deck: shuffle(cardsToShuffle),
    discardPile: [topCard]
  };
}

// ============================================================================
// CARD ACTIONS
// ============================================================================

/**
 * Throws a card from hand and draws from deck
 * @param {Array} hand - Player's current hand
 * @param {number} slotIndex - Index of card to throw
 * @param {Object} drawnCard - Card drawn from deck
 * @returns {{hand: Array, thrownCard: Object|null}} Updated hand and thrown card
 */
export function throwAndDraw(hand, slotIndex, drawnCard) {
  if (slotIndex < 0 || slotIndex >= hand.length || !drawnCard) {
    return { hand, thrownCard: null };
  }
  
  const newHand = [...hand];
  const thrownCard = newHand[slotIndex];
  newHand[slotIndex] = drawnCard;
  
  return { hand: newHand, thrownCard };
}

/**
 * Rearranges cards in a player's hand (drag and drop)
 * @param {Array} hand - Player's current hand
 * @param {number} fromIndex - Source slot index
 * @param {number} toIndex - Destination slot index
 * @returns {Array} Rearranged hand
 */
export function rearrangeHand(hand, fromIndex, toIndex) {
  if (fromIndex === toIndex) return hand;
  if (fromIndex < 0 || fromIndex >= hand.length) return hand;
  if (toIndex < 0 || toIndex >= hand.length) return hand;
  
  const newHand = [...hand];
  [newHand[fromIndex], newHand[toIndex]] = [newHand[toIndex], newHand[fromIndex]];
  
  return newHand;
}

/**
 * Shuffles a player's hand randomly
 * @param {Array} hand - Player's current hand
 * @returns {Array} Shuffled hand
 */
export function shuffleHand(hand) {
  return shuffle(hand);
}

// ============================================================================
// GAME SETUP
// ============================================================================

/**
 * Deals initial hands to all players
 * @param {Array} deck - Starting deck
 * @param {number} playerCount - Number of players
 * @param {number} cardsPerHand - Cards per player (default 4)
 * @returns {{hands: Array<Array>, deck: Array}} Dealt hands and remaining deck
 */
export function dealHands(deck, playerCount, cardsPerHand = 4) {
  let remainingDeck = [...deck];
  const hands = [];
  
  for (let i = 0; i < playerCount; i++) {
    const hand = [];
    for (let j = 0; j < cardsPerHand; j++) {
      if (remainingDeck.length > 0) {
        hand.push(remainingDeck.pop());
      }
    }
    hands.push(hand);
  }
  
  return { hands, deck: remainingDeck };
}
