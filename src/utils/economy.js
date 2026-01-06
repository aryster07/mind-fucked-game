// Currency & Economy Constants

export const CURRENCY = {
  COINS: 'coins',
  TOKENS: 'tokens'
};

export const STARTING_CURRENCY = {
  coins: 1000,
  tokens: 50
};

// Rewards per game
export const GAME_REWARDS = {
  WIN: {
    coins: 100,
    xp: 100
  },
  LOSS: {
    coins: 50,
    xp: 50
  },
  PERFECT_MEMORY: { // Win without using peek powers
    coins: 200,
    xp: 150
  },
  CALL_SHOW_WIN: { // Successfully call show
    coins: 150,
    xp: 125
  }
};

// Daily rewards (7-day cycle)
export const DAILY_REWARDS = [
  { day: 1, coins: 100, tokens: 0 },
  { day: 2, coins: 150, tokens: 0 },
  { day: 3, coins: 200, tokens: 5 },
  { day: 4, coins: 250, tokens: 0 },
  { day: 5, coins: 300, tokens: 10 },
  { day: 6, coins: 400, tokens: 0 },
  { day: 7, coins: 500, tokens: 25 } // Jackpot day
];

// Shop item prices
export const SHOP_PRICES = {
  CARD_BACK_COMMON: 200,
  CARD_BACK_RARE: 500,
  CARD_BACK_EPIC: 800,
  CARD_BACK_LEGENDARY: 1500,
  TABLE_THEME: 1000,
  AVATAR: 300,
  EMOTE: 150,
  BATTLE_PASS: 950 // $9.99 worth
};

// Token purchase bundles (real money)
export const TOKEN_BUNDLES = [
  { id: 'starter', tokens: 100, price: 0.99, bonus: 0 },
  { id: 'small', tokens: 525, price: 4.99, bonus: 5 },
  { id: 'medium', tokens: 1200, price: 9.99, bonus: 20 },
  { id: 'large', tokens: 2600, price: 19.99, bonus: 30 },
  { id: 'mega', tokens: 5500, price: 49.99, bonus: 50 }
];

// Level rewards
export const LEVEL_REWARDS = {
  5: { coins: 500, tokens: 10 },
  10: { coins: 1000, tokens: 25 },
  15: { coins: 1500, tokens: 50 },
  20: { coins: 2000, tokens: 75 },
  25: { coins: 2500, tokens: 100 },
  30: { coins: 3000, tokens: 150 },
  50: { coins: 5000, tokens: 250 },
  75: { coins: 7500, tokens: 400 },
  100: { coins: 10000, tokens: 500 }
};

// Quest rewards
export const QUEST_REWARDS = {
  DAILY: {
    coins: 200,
    xp: 50
  },
  WEEKLY: {
    coins: 1000,
    tokens: 50,
    xp: 250
  }
};

// VIP Subscription benefits
export const VIP_BENEFITS = {
  DAILY_TOKENS: 50,
  XP_MULTIPLIER: 2,
  COIN_MULTIPLIER: 2,
  AD_FREE: true,
  PRICE_PER_MONTH: 4.99
};
