/**
 * AI Service
 * Bot decision-making logic
 */

/**
 * Get bot's next move
 * @param {Array<Card>} hand - Bot's current hand
 * @param {Card} discardTop - Top card of discard pile
 * @returns {Object|null} Move object or null
 */
export const getBotMove = (hand) => {
  if (!hand) return null;

  const validIndices = hand
    .map((card, index) => (card ? index : -1))
    .filter(index => index !== -1);

  if (validIndices.length === 0) return null;

  const cardIndex = validIndices[Math.floor(Math.random() * validIndices.length)];

  return {
    action: 'THROW',
    cardIndex,
  };
};

/**
 * Get hint for player's best move
 * @param {Array<Card>} hand - Player's hand
 * @returns {Object|null} Hint object with card index and reason
 */
export const getHint = (hand) => {
  if (!hand || hand.length === 0) return null;

  const validCards = hand
    .map((card, index) => ({ card, index }))
    .filter(item => item.card !== null);

  if (validCards.length === 0) return null;

  // Find highest value card
  let highestIndex = 0;
  let highestValue = -1;

  validCards.forEach(({ card, index }) => {
    if (card.value > highestValue) {
      highestValue = card.value;
      highestIndex = index;
    }
  });

  const card = validCards[highestIndex].card;

  return {
    cardIndex: highestIndex,
    reason: `Throw your highest card (${card.rank}${card.suit}, value: ${card.value}) to lower your score.`,
  };
};

/**
 * Should bot call show?
 * @param {Array<Card>} hand - Bot's hand
 * @param {number} turnCount - Current turn number
 * @returns {boolean} True if bot should call show
 */
export const shouldBotCallShow = (hand, turnCount) => {
  const score = hand.reduce((sum, card) => sum + (card ? card.value : 0), 0);
  
  // Call show if score is very low and enough turns have passed
  return score <= 8 && turnCount >= 6;
};
