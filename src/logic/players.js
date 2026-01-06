/**
 * Players Logic Module
 * Player management, creation, and operations
 */

import { getScore } from './gameplay';

// ============================================================================
// PLAYER CREATION
// ============================================================================

/**
 * Creates a new player object
 * @param {string} id - Player unique identifier
 * @param {string} name - Player display name
 * @param {Array} hand - Initial hand of cards
 * @param {boolean} isYou - Whether this player is the local user
 * @returns {Object} Player object
 */
export function createPlayer(id, name, hand = [], isYou = false) {
  return {
    id,
    name,
    hand,
    isYou,
    score: 0,
    busted: false,
  };
}

/**
 * Creates players from room data
 * @param {Array} roomPlayers - Players from Firebase room
 * @param {Array<Array>} hands - Dealt hands for each player
 * @param {string} currentUserId - Local user's ID
 * @returns {Array} Array of player objects
 */
export function createPlayersFromRoom(roomPlayers, hands, currentUserId) {
  return roomPlayers.map((roomPlayer, index) => ({
    id: roomPlayer.uid,
    name: roomPlayer.name,
    hand: hands[index] || [],
    isYou: roomPlayer.uid === currentUserId,
    score: 0,
    busted: false,
  }));
}

// ============================================================================
// PLAYER LOOKUPS
// ============================================================================

/**
 * Finds a player by their ID
 * @param {Array} players - Array of players
 * @param {string} playerId - ID to search for
 * @returns {Object|undefined} Found player or undefined
 */
export function getPlayerById(players, playerId) {
  return players.find((p) => p.id === playerId);
}

/**
 * Gets a player's index by their ID
 * @param {Array} players - Array of players
 * @param {string} playerId - ID to search for
 * @returns {number} Player index or -1 if not found
 */
export function getPlayerIndexById(players, playerId) {
  return players.findIndex((p) => p.id === playerId);
}

/**
 * Checks if a player is the current local user
 * @param {Object} player - Player to check
 * @param {string} currentUserId - Local user's ID
 * @returns {boolean} True if player is the current user
 */
export function isCurrentUser(player, currentUserId) {
  return player.id === currentUserId;
}

// ============================================================================
// PLAYER UPDATES
// ============================================================================

/**
 * Updates a player's hand
 * @param {Object} player - Player to update
 * @param {Array} newHand - New hand array
 * @returns {Object} Updated player
 */
export function updatePlayerHand(player, newHand) {
  return { ...player, hand: newHand };
}

/**
 * Updates a specific player in the array
 * @param {Array} players - Array of players
 * @param {string} playerId - ID of player to update
 * @param {Object} updates - Properties to update
 * @returns {Array} Updated players array
 */
export function updatePlayer(players, playerId, updates) {
  return players.map((player) =>
    player.id === playerId ? { ...player, ...updates } : player
  );
}

/**
 * Marks which player is the local user
 * @param {Array} players - Array of players
 * @param {string} currentUserId - Local user's ID
 * @returns {Array} Players with isYou flag set correctly
 */
export function markPlayerAsYou(players, currentUserId) {
  return players.map((player) => ({
    ...player,
    isYou: player.id === currentUserId,
  }));
}

/**
 * Marks a player as busted (over max score after SHOW)
 * @param {Array} players - Array of players
 * @param {string} playerId - ID of player to mark
 * @returns {Array} Updated players array
 */
export function markPlayerBusted(players, playerId) {
  return players.map((player) => ({
    ...player,
    busted: player.id === playerId ? true : player.busted,
  }));
}

/**
 * Calculates and assigns scores to all players
 * @param {Array} players - Array of players
 * @returns {Array} Players with updated scores
 */
export function calculatePlayerScores(players) {
  return players.map((player) => ({
    ...player,
    score: getScore(player.hand),
  }));
}

// ============================================================================
// CARD OPERATIONS
// ============================================================================

/**
 * Swaps cards between two players
 * @param {Array} players - Array of players
 * @param {string} player1Id - First player's ID
 * @param {number} card1Index - Index of first player's card
 * @param {string} player2Id - Second player's ID
 * @param {number} card2Index - Index of second player's card
 * @returns {Array} Updated players array
 */
export function swapPlayerCards(players, player1Id, card1Index, player2Id, card2Index) {
  if (!Array.isArray(players)) return players;
  
  const player1Index = getPlayerIndexById(players, player1Id);
  const player2Index = getPlayerIndexById(players, player2Id);

  if (player1Index < 0 || player2Index < 0) {
    return players;
  }

  const newPlayers = [...players];
  const player1 = { ...newPlayers[player1Index] };
  const player2 = { ...newPlayers[player2Index] };

  const hand1 = [...player1.hand];
  const hand2 = [...player2.hand];

  [hand1[card1Index], hand2[card2Index]] = [hand2[card2Index], hand1[card1Index]];

  newPlayers[player1Index] = { ...player1, hand: hand1 };
  newPlayers[player2Index] = { ...player2, hand: hand2 };

  return newPlayers;
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Arranges players for UI display with current user at a specific position
 * @param {Array} players - Array of players
 * @param {string} currentUserId - Local user's ID
 * @param {number} position - Position for current user (default 0 = first)
 * @returns {Array<{player: Object, originalIndex: number}>} Arranged players with original indices
 */
export function arrangePlayersForDisplay(players, currentUserId, position = 0) {
  const currentUserIndex = getPlayerIndexById(players, currentUserId);
  
  if (currentUserIndex <= 0) {
    return players.map((p, i) => ({ player: p, originalIndex: i }));
  }

  const arranged = players.map((p, i) => ({ player: p, originalIndex: i }));
  const [currentUser] = arranged.splice(currentUserIndex, 1);

  if (position === 0) {
    return [currentUser, ...arranged];
  }

  arranged.splice(position, 0, currentUser);
  return arranged;
}
