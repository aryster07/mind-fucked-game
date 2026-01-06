/**
 * @fileoverview Gameplay Module - Core game rules and scoring
 * @description Handles timing constants, scoring calculations, and game outcome determination
 */

// ============================================================================
// TIMING CONSTANTS
// ============================================================================

/**
 * Game timing configuration in milliseconds
 * @constant {Object}
 */
export const TIMING = {
  /** Duration of pre-game card memorization phase */
  PRE_GAME: 8000,
  /** Duration cards are revealed during power effects */
  POWER_REVEAL: 3000,
  /** Delay before turn automatically ends */
  END_TURN: 1500,
};

// ============================================================================
// SCORING
// ============================================================================

/**
 * Maximum score allowed for a valid "SHOW" call
 * @constant {number}
 */
export const MAX_SHOW_SCORE = 10;

/**
 * Calculates the total score of a hand
 * @param {Array<Object>} hand - Array of card objects
 * @returns {number} Total score of all cards
 */
export const getScore = (hand) => {
  if (!Array.isArray(hand)) return 0;
  return hand.reduce((sum, card) => sum + (card?.value || 0), 0);
};

/**
 * Validates if a score qualifies for a winning "SHOW" call
 * @param {number} score - The caller's hand score
 * @returns {boolean} True if score is valid (≤ MAX_SHOW_SCORE)
 */
export const validateShow = (score) => score <= MAX_SHOW_SCORE;

// ============================================================================
// GAME OUTCOME
// ============================================================================

/**
 * Determines the winner after a "SHOW" call
 * @param {Array<Object>} players - Array of player objects
 * @param {number} callerIndex - Index of the player who called SHOW
 * @param {number} callerScore - Score of the calling player
 * @returns {Object} Winner information { winnerId, winnerName, busted }
 */
export const findWinner = (players, callerIndex, callerScore) => {
  // Validate inputs
  if (!Array.isArray(players) || players.length === 0) {
    return { winnerId: null, winnerName: 'Unknown', busted: false };
  }

  if (callerIndex < 0 || callerIndex >= players.length) {
    return { winnerId: null, winnerName: 'Unknown', busted: false };
  }

  const caller = players[callerIndex];
  const isValid = validateShow(callerScore);

  // Valid SHOW - caller wins
  if (isValid) {
    return { 
      winnerId: caller.id, 
      winnerName: caller.name, 
      busted: false 
    };
  }

  // Invalid SHOW (busted) - find lowest score among other players
  let lowestScore = Infinity;
  let winnerId = null;

  players.forEach((player, index) => {
    if (index !== callerIndex) {
      const score = getScore(player.hand);
      if (score < lowestScore) {
        lowestScore = score;
        winnerId = player.id;
      }
    }
  });

  const winner = players.find(p => p.id === winnerId);
  return { 
    winnerId, 
    winnerName: winner?.name || 'Unknown', 
    busted: true 
  };
};

// ============================================================================
// TURN MANAGEMENT
// ============================================================================

/**
 * Calculates the next player's turn index
 * @param {number} currentIndex - Current player's index
 * @param {number} totalPlayers - Total number of players
 * @returns {number} Next player's index
 */
export const getNextTurnIndex = (currentIndex, totalPlayers) => {
  return (currentIndex + 1) % totalPlayers;
};
