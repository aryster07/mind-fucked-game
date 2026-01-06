/**
 * Player Service
 * Handles player creation and management
 */

import { GAME_CONFIG } from '../../constants/game.constants';

/**
 * Create players for a new game
 * @param {Array<Card>} deck - Shuffled deck
 * @param {number} numPlayers - Number of players (default: 4)
 * @param {Array<Object>} playerData - Optional custom player data for multiplayer
 * @returns {Object} Object containing players and remaining draw pile
 */
export const dealCards = (deck, numPlayers = GAME_CONFIG.MAX_PLAYERS, playerData = null) => {
  const players = [];
  const cardsPerPlayer = GAME_CONFIG.CARDS_PER_PLAYER;
  let currentCardIndex = 0;

  for (let i = 0; i < numPlayers; i++) {
    const hand = deck
      .slice(currentCardIndex, currentCardIndex + cardsPerPlayer)
      .map(card => ({
        ...card,
        faceUp: false,
        knownByOwner: false,
      }));

    currentCardIndex += cardsPerPlayer;

    // Use custom player data if provided (for multiplayer)
    if (playerData && playerData[i]) {
      players.push({
        ...playerData[i],
        hand,
        score: 0,
      });
    } else {
      // Default player setup for solo mode
      players.push({
        id: i === 0 ? 'user' : `bot-${i}`,
        name: i === 0 ? 'You' : `Bot ${i}`,
        isBot: i !== 0,
        hand,
        score: 0,
      });
    }
  }

  const drawPile = deck.slice(currentCardIndex);

  return { players, drawPile };
};

/**
 * Get player by ID
 * @param {Array<Player>} players - Array of players
 * @param {string} playerId - Player ID to find
 * @returns {Player|null} Player object or null
 */
export const getPlayerById = (players, playerId) => {
  return players.find(p => p.id === playerId) || null;
};

/**
 * Get player index by ID
 * @param {Array<Player>} players - Array of players
 * @param {string} playerId - Player ID to find
 * @returns {number} Player index or -1
 */
export const getPlayerIndex = (players, playerId) => {
  return players.findIndex(p => p.id === playerId);
};
