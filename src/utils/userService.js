/**
 * @deprecated This file is deprecated. Use services/firebase/* instead
 * Kept for backwards compatibility during migration
 */

import { getDatabase } from '../services/firebase/firebase.service';
import { getAuthInstance } from '../services/firebase/user.service';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

// Re-export from centralized services
export const db = getDatabase();
export const auth = getAuthInstance();

// User Data Structure
export const createUserProfile = async (userId, displayName) => {
  const userRef = doc(db, 'users', userId);
  const userData = {
    displayName,
    coins: 1000,
    tokens: 50,
    xp: 0,
    level: 1,
    gamesPlayed: 0,
    gamesWon: 0,
    winStreak: 0,
    bestStreak: 0,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    dailyRewardDay: 0,
    lastDailyReward: null,
    vipExpiry: null,
    ownedCosmetics: ['default_card_back'],
    equippedCosmetics: {
      cardBack: 'default_card_back',
      tableTheme: 'default_table',
      avatar: 'default_avatar'
    },
    achievements: [],
    stats: {
      perfectMemoryWins: 0,
      callShowWins: 0,
      powerUpsUsed: 0,
      totalCardsPlayed: 0
    }
  };
  
  await setDoc(userRef, userData);
  return userData;
};

// Get User Data
export const getUserData = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
};

// Update Currency
export const updateCurrency = async (userId, currencyType, amount) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    [currencyType]: increment(amount)
  });
};

// Add XP and check for level up
export const addXP = async (userId, xpAmount) => {
  const userRef = doc(db, 'users', userId);
  const userData = await getUserData(userId);
  
  const newXP = userData.xp + xpAmount;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > userData.level;
  
  await updateDoc(userRef, {
    xp: newXP,
    level: newLevel
  });
  
  return { leveledUp, newLevel, newXP };
};

// Calculate level from XP (exponential curve)
export const calculateLevel = (xp) => {
  // Level formula: level = floor(sqrt(xp / 100)) + 1
  // Level 1: 0-99 XP
  // Level 2: 100-399 XP
  // Level 3: 400-899 XP
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

// Calculate XP needed for next level
export const xpForNextLevel = (currentLevel) => {
  return (currentLevel * currentLevel) * 100;
};

// Update Game Stats
export const updateGameStats = async (userId, won, statsUpdate = {}) => {
  const userRef = doc(db, 'users', userId);
  const userData = await getUserData(userId);
  
  const newWinStreak = won ? (userData.winStreak || 0) + 1 : 0;
  const newBestStreak = Math.max(newWinStreak, userData.bestStreak || 0);
  
  const updates = {
    gamesPlayed: increment(1),
    winStreak: newWinStreak,
    bestStreak: newBestStreak
  };
  
  if (won) {
    updates.gamesWon = increment(1);
  }
  
  // Update nested stats
  if (Object.keys(statsUpdate).length > 0) {
    for (const [key, value] of Object.entries(statsUpdate)) {
      updates[`stats.${key}`] = increment(value);
    }
  }
  
  await updateDoc(userRef, updates);
  
  return { newWinStreak, newBestStreak };
};

// Claim Daily Reward
export const claimDailyReward = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userData = await getUserData(userId);
  
  const now = new Date();
  const lastReward = userData.lastDailyReward ? new Date(userData.lastDailyReward) : null;
  
  // Check if 24 hours have passed
  if (lastReward) {
    const hoursSinceLastReward = (now - lastReward) / (1000 * 60 * 60);
    if (hoursSinceLastReward < 24) {
      return { success: false, error: 'Already claimed today' };
    }
  }
  
  // Calculate reward day (cycles 1-7)
  let nextDay = (userData.dailyRewardDay % 7) + 1;
  
  // Reset streak if more than 48 hours
  if (lastReward) {
    const hoursSinceLastReward = (now - lastReward) / (1000 * 60 * 60);
    if (hoursSinceLastReward > 48) {
      nextDay = 1;
    }
  }
  
  const reward = DAILY_REWARDS[nextDay - 1];
  
  await updateDoc(userRef, {
    coins: increment(reward.coins),
    tokens: increment(reward.tokens),
    dailyRewardDay: nextDay,
    lastDailyReward: now.toISOString()
  });
  
  return { success: true, reward, day: nextDay };
};

// Purchase Item
export const purchaseItem = async (userId, itemId, cost, currencyType) => {
  const userRef = doc(db, 'users', userId);
  const userData = await getUserData(userId);
  
  // Check if user has enough currency
  if (userData[currencyType] < cost) {
    return { success: false, error: 'Insufficient funds' };
  }
  
  // Check if already owned
  if (userData.ownedCosmetics.includes(itemId)) {
    return { success: false, error: 'Already owned' };
  }
  
  // Deduct currency and add item
  await updateDoc(userRef, {
    [currencyType]: increment(-cost),
    ownedCosmetics: [...userData.ownedCosmetics, itemId]
  });
  
  return { success: true };
};

// Equip Cosmetic
export const equipCosmetic = async (userId, cosmeticType, cosmeticId) => {
  const userRef = doc(db, 'users', userId);
  const userData = await getUserData(userId);
  
  // Check if owned
  if (!userData.ownedCosmetics.includes(cosmeticId)) {
    return { success: false, error: 'Not owned' };
  }
  
  await updateDoc(userRef, {
    [`equippedCosmetics.${cosmeticType}`]: cosmeticId
  });
  
  return { success: true };
};

// Import economy constants
import { DAILY_REWARDS } from './economy';
