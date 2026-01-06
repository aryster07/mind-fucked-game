/**
 * @fileoverview Powers Module - Power card definitions and execution logic
 * @description Handles all power card mechanics including detection, validation, and execution
 */

import { shuffleHand } from './board';
import { updatePlayer, swapPlayerCards, getPlayerIndexById } from './players';

// ============================================================================
// POWER DEFINITIONS
// ============================================================================

/**
 * Power card configurations
 * @constant {Object}
 */
export const POWERS = {
  REFRESH: {
    value: 7,
    name: 'REFRESH',
    icon: '✨',
    description: 'See and rearrange your cards!',
    instruction: 'REFRESH: Drag to rearrange, then click Done!',
    requiresTarget: false,
    requiresOwnCard: false,
  },
  BLIND_SWAP: {
    value: 9,
    name: 'BLIND SWAP',
    icon: '🔄',
    description: 'Swap a card with an opponent!',
    instruction: 'BLIND SWAP: Click YOUR card, then opponent\'s card',
    requiresTarget: true,
    requiresOwnCard: true,
  },
  CHAOS_SHUFFLE: {
    value: 11,
    name: 'CHAOS SHUFFLE',
    icon: '🌀',
    description: 'Shuffle an opponent\'s hand!',
    instruction: 'CHAOS SHUFFLE: Click any opponent!',
    requiresTarget: true,
    requiresOwnCard: false,
  },
  GLOBAL_SPY: {
    value: 13,
    name: 'GLOBAL SPY',
    icon: '👁️',
    description: 'See an opponent\'s cards!',
    instruction: 'SPY: Click any opponent to reveal their hand!',
    requiresTarget: true,
    requiresOwnCard: false,
  },
};

/**
 * Maps card values to power names
 * @constant {Object.<number, string>}
 */
export const VALUE_TO_POWER = {
  7: 'REFRESH',
  9: 'BLIND_SWAP',
  11: 'CHAOS_SHUFFLE',
  13: 'GLOBAL_SPY',
};

// ============================================================================
// POWER DETECTION
// ============================================================================

/**
 * Determines if a card triggers a power and returns the power name
 * @param {Object} card - Card object with value property
 * @returns {string|null} Power name or null if no power
 */
export const getPowerFromCard = (card) => {
  if (!card || typeof card.value !== 'number') return null;
  return VALUE_TO_POWER[card.value] || null;
};

/**
 * Checks if a card has an associated power
 * @param {Object} card - Card object
 * @returns {boolean} True if card has a power
 */
export const cardHasPower = (card) => !!getPowerFromCard(card);

/**
 * Retrieves power configuration by name
 * @param {string} powerName - Name of the power
 * @returns {Object|null} Power configuration or null
 */
export const getPowerInfo = (powerName) => POWERS[powerName] || null;

/**
 * Gets the instruction message for a power
 * @param {string} powerName - Name of the power
 * @returns {string|null} Instruction text or null
 */
export const getPowerInstruction = (powerName) => {
  const power = POWERS[powerName];
  return power ? power.instruction : null;
};

// ============================================================================
// POWER EXECUTION
// ============================================================================

/**
 * Executes REFRESH power - enables card visibility and rearrangement
 * @returns {Object} State updates for REFRESH mode
 */
const executeRefresh = () => ({
  success: true,
  refreshMode: true,
});

/**
 * Executes BLIND_SWAP power - swaps cards between two players
 * @param {Array} players - Current players array
 * @param {string} currentPlayerId - ID of the current player
 * @param {number} sourceCardIndex - Index of current player's card
 * @param {string} targetPlayerId - ID of target player
 * @param {number} targetCardIndex - Index of target player's card
 * @returns {Object} Result with success status, updated players, and notification
 */
const executeBlindSwap = (players, currentPlayerId, sourceCardIndex, targetPlayerId, targetCardIndex) => {
  if (sourceCardIndex === null || sourceCardIndex === undefined) {
    return { success: false, error: 'No source card selected' };
  }

  if (!targetPlayerId || targetPlayerId === currentPlayerId) {
    return { success: false, error: 'Invalid target player' };
  }

  const currentPlayerIndex = getPlayerIndexById(players, currentPlayerId);
  const targetPlayerIndex = getPlayerIndexById(players, targetPlayerId);

  if (currentPlayerIndex < 0 || targetPlayerIndex < 0) {
    return { success: false, error: 'Invalid player indices' };
  }

  const currentPlayer = players[currentPlayerIndex];
  const targetPlayer = players[targetPlayerIndex];

  const newPlayers = swapPlayerCards(
    players,
    currentPlayerId,
    sourceCardIndex,
    targetPlayerId,
    targetCardIndex
  );

  return {
    success: true,
    players: newPlayers,
    notification: `${currentPlayer.name} swapped with ${targetPlayer.name}!`,
  };
};

/**
 * Executes CHAOS_SHUFFLE power - randomizes target player's hand order
 * @param {Array} players - Current players array
 * @param {string} currentPlayerId - ID of the current player
 * @param {string} targetPlayerId - ID of target player
 * @returns {Object} Result with success status, updated players, and effects
 */
const executeChaosShuffle = (players, currentPlayerId, targetPlayerId) => {
  if (!targetPlayerId || targetPlayerId === currentPlayerId) {
    return { success: false, error: 'Invalid target player' };
  }

  const currentPlayerIndex = getPlayerIndexById(players, currentPlayerId);
  const targetPlayerIndex = getPlayerIndexById(players, targetPlayerId);

  if (targetPlayerIndex < 0) {
    return { success: false, error: 'Invalid target player' };
  }

  const currentPlayer = players[currentPlayerIndex];
  const targetPlayer = players[targetPlayerIndex];

  const shuffledHand = shuffleHand(targetPlayer.hand);
  const newPlayers = updatePlayer(players, targetPlayerId, { hand: shuffledHand });

  return {
    success: true,
    players: newPlayers,
    notification: `${currentPlayer.name} shuffled ${targetPlayer.name}'s cards!`,
    shuffledPlayerId: targetPlayerId,
  };
};

/**
 * Executes GLOBAL_SPY power - reveals target player's cards to current player
 * @param {Array} players - Current players array
 * @param {string} currentPlayerId - ID of the current player (spy)
 * @param {string} targetPlayerId - ID of target player to spy on
 * @returns {Object} Result with success status and spy state
 */
const executeGlobalSpy = (players, currentPlayerId, targetPlayerId) => {
  if (!targetPlayerId || targetPlayerId === currentPlayerId) {
    return { success: false, error: 'Invalid target player' };
  }

  const currentPlayerIndex = getPlayerIndexById(players, currentPlayerId);
  const targetPlayerIndex = getPlayerIndexById(players, targetPlayerId);

  if (targetPlayerIndex < 0) {
    return { success: false, error: 'Invalid target player' };
  }

  const currentPlayer = players[currentPlayerIndex];
  const targetPlayer = players[targetPlayerIndex];

  return {
    success: true,
    notification: `${currentPlayer.name} is spying on ${targetPlayer.name}...`,
    spyingPlayerId: targetPlayerId,
    spyingByPlayerId: currentPlayerId,
  };
};

/**
 * Main power execution dispatcher
 * @param {string} powerName - Name of the power to execute
 * @param {Object} params - Execution parameters
 * @param {Array} params.players - Current players array
 * @param {string} params.currentPlayerId - ID of current player
 * @param {number} [params.sourceCardIndex] - Index of source card (for BLIND_SWAP)
 * @param {string} [params.targetPlayerId] - ID of target player
 * @param {number} [params.targetCardIndex] - Index of target card
 * @returns {Object} Execution result with success status and state updates
 */
export const executePower = (powerName, params) => {
  switch (powerName) {
    case 'REFRESH':
      return executeRefresh();

    case 'BLIND_SWAP':
      return executeBlindSwap(
        params.players,
        params.currentPlayerId,
        params.sourceCardIndex,
        params.targetPlayerId,
        params.targetCardIndex
      );

    case 'CHAOS_SHUFFLE':
      return executeChaosShuffle(
        params.players,
        params.currentPlayerId,
        params.targetPlayerId
      );

    case 'GLOBAL_SPY':
      return executeGlobalSpy(
        params.players,
        params.currentPlayerId,
        params.targetPlayerId
      );

    default:
      return { success: false, error: `Unknown power: ${powerName}` };
  }
};
