/**
 * Game Constants
 * Core game rules and configurations
 */

export const GAME_CONFIG = {
  MAX_PLAYERS: 6,
  CARDS_PER_PLAYER: 4,
  MEMORIZATION_TIME: 8000, // 8 seconds
  REVEAL_DELAY: 1000, // 1 second
  BOT_THROW_DELAY: 500,
  BOT_DRAW_DELAY: 600,
  CALL_SHOW_MAX_SCORE: 10,
};

export const CARD_SUITS = ['♠', '♥', '♣', '♦'];

export const CARD_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const CARD_VALUES = {
  A: 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
};

export const POWER_CARDS = {
  SEVEN: {
    value: 7,
    name: 'Rearrange & Peek',
    action: 'PEARRANGE_SELF',
  },
  NINE: {
    value: 9,
    name: 'Swap with Opponent',
    action: 'SWAP_SELF',
  },
  JACK: {
    value: 11,
    name: 'Shuffle Opponent',
    action: 'SHUFFLE_OPP',
  },
  KING: {
    value: 13,
    name: 'Spy on Opponent',
    action: 'SPY',
  },
};

export const GAME_STATUS = {
  MENU: 'MENU',
  LOBBY: 'LOBBY',
  PRE_GAME: 'PRE_GAME',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER',
};

export const TURN_PHASE = {
  THROW: 'THROW',
  RECEIVE: 'RECEIVE',
  REVEAL: 'REVEAL',
  POWER_ACTION: 'POWER_ACTION',
};

export const PLAYER_POSITIONS = {
  BOTTOM: 'bottom',
  TOP: 'top',
  LEFT: 'left',
  RIGHT: 'right',
};
