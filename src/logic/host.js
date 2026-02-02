/**
 * Host Logic Module
 * Game initialization and host-specific control operations
 */

import { createDeck, dealHands } from './board';
import { createPlayersFromRoom } from './players';
import { updateGameState } from './firebase';
import { TIMING } from './gameplay';

// ============================================================================
// GAME INITIALIZATION
// ============================================================================

/**
 * Initializes a new multiplayer game as host
 * @param {Array} roomPlayers - Players from the room
 * @param {string} roomCode - Room identifier
 * @param {string} currentUserId - Host's user ID
 * @returns {Promise<Object>} Initial game state
 */
export async function initializeGame(roomPlayers, roomCode, currentUserId) {
  const deck = createDeck();
  const numberOfPlayers = roomPlayers.length;

  // Rearrange players with current user first
  const currentUserIndex = roomPlayers.findIndex((p) => p.uid === currentUserId);
  const orderedPlayers =
    currentUserIndex <= 0
      ? roomPlayers
      : [roomPlayers[currentUserIndex], ...roomPlayers.filter((_, i) => i !== currentUserIndex)];

  // Deal hands
  const { hands, deck: remainingDeck } = dealHands(deck, numberOfPlayers, 4);

  // Create game players
  const gamePlayers = createPlayersFromRoom(orderedPlayers, hands, currentUserId);

  // Create initial game state
  const gameState = {
    status: 'PRE_GAME',
    players: gamePlayers,
    deck: remainingDeck,
    discardPile: [],
    turnIndex: 0,
    turnPhase: 'SHOW_OR_THROW',
    notification: 'Memorize your cards!',
    preGameEndsAt: Date.now() + TIMING.PRE_GAME,
    version: 1,
  };

  // Sync to Firebase
  await updateGameState(roomCode, gameState);

  return gameState;
}

/**
 * Initializes a solo game with bots
 * @param {string} currentUserId - Player's user ID
 * @returns {Object} Initial solo game state
 */
export function initializeSoloGame(currentUserId) {
  const fullDeck = createDeck();
  
  // Use dealHands to properly distribute cards and keep remaining deck
  const { hands, deck } = dealHands(fullDeck, 4, 4);

  const players = [
    { id: currentUserId, name: 'You', hand: hands[0], isYou: true },
    { id: 'bot1', name: 'Bot 1', hand: hands[1], isYou: false },
    { id: 'bot2', name: 'Bot 2', hand: hands[2], isYou: false },
    { id: 'bot3', name: 'Bot 3', hand: hands[3], isYou: false },
  ];

  return {
    status: 'PRE_GAME',
    currentUserId,
    isHost: true,
    preGameEndsAt: Date.now() + TIMING.PRE_GAME,
    notification: 'Memorize your cards!',
    deck,
    players,
    discardPile: [],
    turnIndex: 0,
    turnPhase: 'SHOW_OR_THROW',
    winner: null,
    powerAction: null,
    version: 1,
  };
}

// ============================================================================
// GAME PHASE TRANSITIONS
// ============================================================================

/**
 * Transitions game from pre-game to playing phase
 * @param {string|null} roomCode - Room code for multiplayer, null for solo
 * @param {Object} gameState - Current game state
 * @returns {Promise<Object>} Updated game state
 */
export async function startPlaying(roomCode = null, gameState = null) {
  const updatedState = {
    ...gameState,
    status: 'PLAYING',
    preGameEndsAt: null,
    notification: `${gameState.players[0]?.name}'s turn`,
    version: (gameState.version || 0) + 1,
  };

  if (roomCode) {
    await updateGameState(roomCode, updatedState);
  }

  return updatedState;
}

// ============================================================================
// HOST VALIDATION
// ============================================================================

/**
 * Checks if user is the room host
 * @param {Object} roomData - Room data from Firebase
 * @param {string} userId - User ID to check
 * @returns {boolean} True if user is host
 */
export function isUserHost(roomData, userId) {
  return roomData?.host === userId;
}

/**
 * Validates that game can be started
 * @param {Object} roomData - Room data from Firebase
 * @param {number} minPlayers - Minimum players required (default 1)
 * @returns {boolean} True if game can start
 */
export function canStartGame(roomData, minPlayers = 1) {
  if (!roomData || !roomData.players) return false;
  return roomData.players.length >= minPlayers;
}
