/**
 * Economy & Currency Constants
 * All monetary values and rewards
 */

export const CURRENCY_TYPES = {
  COINS: 'coins',
  TOKENS: 'tokens',
  XP: 'xp',
};

export const STARTING_BALANCE = {
  coins: 1000,
  tokens: 50,
  xp: 0,
  level: 1,
};

export const GAME_REWARDS = {
  WIN: {
    coins: 100,
    xp: 100,
  },
  LOSS: {
    coins: 50,
    xp: 50,
  },
  PERFECT_MEMORY: {
    coins: 200,
    xp: 150,
  },
  CALL_SHOW_WIN: {
    coins: 150,
    xp: 125,
  },
};

export const DAILY_REWARDS = [
  { day: 1, coins: 100, tokens: 0 },
  { day: 2, coins: 150, tokens: 0 },
  { day: 3, coins: 200, tokens: 5 },
  { day: 4, coins: 250, tokens: 0 },
  { day: 5, coins: 300, tokens: 10 },
  { day: 6, coins: 400, tokens: 0 },
  { day: 7, coins: 500, tokens: 25 },
];

export const LEVEL_REWARDS = {
  5: { coins: 500, tokens: 10 },
  10: { coins: 1000, tokens: 25 },
  15: { coins: 1500, tokens: 50 },
  20: { coins: 2000, tokens: 75 },
  25: { coins: 2500, tokens: 100 },
  30: { coins: 3000, tokens: 150 },
  50: { coins: 5000, tokens: 250 },
  75: { coins: 7500, tokens: 400 },
  100: { coins: 10000, tokens: 500 },
};

export const XP_PER_LEVEL = 500;

export const SHOP_PRICES = {
  CARD_BACK_COMMON: 200,
  CARD_BACK_RARE: 500,
  CARD_BACK_EPIC: 800,
  CARD_BACK_LEGENDARY: 1500,
  TABLE_THEME: 1000,
  AVATAR: 300,
  EMOTE: 150,
};
