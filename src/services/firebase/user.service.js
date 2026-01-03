/**
 * User Service
 * Handles user authentication and data management
 */

import { getAuth as getFirebaseAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase, getDatabase } from './firebase.service';
import { FIRESTORE_COLLECTIONS } from '../../config/firebase.config';
import { STARTING_BALANCE, XP_PER_LEVEL } from '../../constants/economy.constants';

let auth = null;

/**
 * Get Firebase Auth instance
 * @returns {Auth|null} Firebase Auth instance or null
 */
export const getAuthInstance = () => {
  if (!auth) {
    try {
      const app = initializeFirebase();
      auth = getFirebaseAuth(app);
    } catch (error) {
      console.error('Failed to initialize Firebase Auth:', error);
      return null;
    }
  }
  return auth;
};

/**
 * Create new user profile
 * @param {string} uid - User ID
 * @param {string} displayName - User display name
 * @returns {Promise<Object>} User data
 */
export const createUserProfile = async (uid, displayName) => {
  try {
    const db = getDatabase();
    
    if (!db) {
      // Local fallback
      const userData = {
        displayName: displayName || `Player${Math.floor(Math.random() * 9999)}`,
        ...STARTING_BALANCE,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
      };
      localStorage.setItem(`user_${uid}`, JSON.stringify(userData));
      return userData;
    }

    const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, uid);
    const userData = {
      displayName: displayName || `Player${Math.floor(Math.random() * 9999)}`,
      ...STARTING_BALANCE,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
    };

    await setDoc(userRef, userData);
    return userData;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error(`Failed to create user profile: ${error.message}`);
  }
};

/**
 * Get user data
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} User data or null
 */
export const getUserData = async (uid) => {
  try {
    const db = getDatabase();

    if (!db) {
      // Local fallback
      const userData = localStorage.getItem(`user_${uid}`);
      return userData ? JSON.parse(userData) : null;
    }

    const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    }

    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Update user currency
 * @param {string} uid - User ID
 * @param {Object} changes - Currency changes (e.g., { coins: 100, tokens: 5 })
 * @returns {Promise<void>}
 */
export const updateCurrency = async (uid, changes) => {
  const db = getDatabase();

  if (!db) {
    // Local fallback
    const userData = JSON.parse(localStorage.getItem(`user_${uid}`) || '{}');
    Object.keys(changes).forEach(key => {
      userData[key] = (userData[key] || 0) + changes[key];
    });
    localStorage.setItem(`user_${uid}`, JSON.stringify(userData));
    return;
  }

  const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, uid);
  await updateDoc(userRef, changes);
};

/**
 * Add XP and handle level up
 * @param {string} uid - User ID
 * @param {number} xpAmount - XP to add
 * @returns {Promise<Object>} Updated user data with level info
 */
export const addXP = async (uid, xpAmount) => {
  const userData = await getUserData(uid);
  if (!userData) return null;

  const newXP = (userData.xp || 0) + xpAmount;
  const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
  const leveledUp = newLevel > (userData.level || 1);

  const updates = {
    xp: newXP,
    level: newLevel,
  };

  await updateCurrency(uid, updates);

  return {
    leveledUp,
    newLevel,
    newXP,
  };
};

/**
 * Calculate level from XP
 * @param {number} xp - Total XP
 * @returns {number} Current level
 */
export const calculateLevel = (xp) => {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
};

/**
 * Calculate XP needed for next level
 * @param {number} currentXP - Current XP
 * @returns {number} XP needed for next level
 */
export const xpForNextLevel = (currentXP) => {
  const currentLevel = calculateLevel(currentXP);
  const xpForNextLevel = currentLevel * XP_PER_LEVEL;
  return xpForNextLevel - currentXP;
};

/**
 * Update game statistics
 * @param {string} uid - User ID
 * @param {boolean} won - Whether the game was won
 * @param {Object} stats - Additional stats to update
 * @returns {Promise<Object>} Updated stats info
 */
export const updateGameStats = async (uid, won, stats = {}) => {
  const db = getDatabase();
  
  if (!db) {
    // Local fallback
    const userData = JSON.parse(localStorage.getItem(`user_${uid}`) || '{}');
    userData.gamesPlayed = (userData.gamesPlayed || 0) + 1;
    if (won) {
      userData.gamesWon = (userData.gamesWon || 0) + 1;
      userData.winStreak = (userData.winStreak || 0) + 1;
      userData.bestStreak = Math.max(userData.winStreak, userData.bestStreak || 0);
    } else {
      userData.winStreak = 0;
    }
    
    // Update nested stats
    if (!userData.stats) userData.stats = {};
    Object.keys(stats).forEach(key => {
      userData.stats[key] = (userData.stats[key] || 0) + (stats[key] || 0);
    });
    
    localStorage.setItem(`user_${uid}`, JSON.stringify(userData));
    return { winStreak: userData.winStreak, bestStreak: userData.bestStreak };
  }

  const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, uid);
  const userData = await getUserData(uid);
  
  const newWinStreak = won ? (userData.winStreak || 0) + 1 : 0;
  const newBestStreak = Math.max(newWinStreak, userData.bestStreak || 0);
  
  const updates = {
    gamesPlayed: (userData.gamesPlayed || 0) + 1,
    winStreak: newWinStreak,
    bestStreak: newBestStreak,
  };
  
  if (won) {
    updates.gamesWon = (userData.gamesWon || 0) + 1;
  }
  
  // Update nested stats
  if (stats && Object.keys(stats).length > 0) {
    if (!userData.stats) userData.stats = {};
    Object.keys(stats).forEach(key => {
      updates[`stats.${key}`] = (userData.stats[key] || 0) + (stats[key] || 0);
    });
  }
  
  await updateDoc(userRef, updates);
  return { winStreak: newWinStreak, bestStreak: newBestStreak };
};

/**
 * Claim daily login reward
 * @param {string} uid - User ID
 * @returns {Promise<Object>} Result with success status and reward
 */
export const claimDailyReward = async (uid) => {
  const db = getDatabase();
  const DAILY_REWARDS = [
    { day: 1, coins: 100, tokens: 0 },
    { day: 2, coins: 150, tokens: 0 },
    { day: 3, coins: 200, tokens: 5 },
    { day: 4, coins: 250, tokens: 0 },
    { day: 5, coins: 300, tokens: 10 },
    { day: 6, coins: 400, tokens: 0 },
    { day: 7, coins: 500, tokens: 25 },
  ];
  
  if (!db) {
    // Local fallback
    const userData = JSON.parse(localStorage.getItem(`user_${uid}`) || '{}');
    const now = new Date();
    const lastReward = userData.lastDailyReward ? new Date(userData.lastDailyReward) : null;
    
    if (lastReward) {
      const hoursSinceLastReward = (now - lastReward) / (1000 * 60 * 60);
      if (hoursSinceLastReward < 24) {
        return { success: false, error: 'Already claimed today' };
      }
    }
    
    let nextDay = (userData.dailyRewardDay % 7) + 1;
    if (lastReward) {
      const hoursSinceLastReward = (now - lastReward) / (1000 * 60 * 60);
      if (hoursSinceLastReward > 48) {
        nextDay = 1;
      }
    }
    
    const reward = DAILY_REWARDS[nextDay - 1];
    userData.coins = (userData.coins || 0) + reward.coins;
    userData.tokens = (userData.tokens || 0) + reward.tokens;
    userData.dailyRewardDay = nextDay;
    userData.lastDailyReward = now.toISOString();
    
    localStorage.setItem(`user_${uid}`, JSON.stringify(userData));
    return { success: true, reward, day: nextDay };
  }

  const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, uid);
  const userData = await getUserData(uid);
  const now = new Date();
  const lastReward = userData.lastDailyReward ? new Date(userData.lastDailyReward) : null;
  
  if (lastReward) {
    const hoursSinceLastReward = (now - lastReward) / (1000 * 60 * 60);
    if (hoursSinceLastReward < 24) {
      return { success: false, error: 'Already claimed today' };
    }
  }
  
  let nextDay = (userData.dailyRewardDay % 7) + 1;
  if (lastReward) {
    const hoursSinceLastReward = (now - lastReward) / (1000 * 60 * 60);
    if (hoursSinceLastReward > 48) {
      nextDay = 1;
    }
  }
  
  const reward = DAILY_REWARDS[nextDay - 1];
  const currencyChanges = {};
  if (reward.coins) currencyChanges.coins = reward.coins;
  if (reward.tokens) currencyChanges.tokens = reward.tokens;
  
  await updateDoc(userRef, {
    ...Object.keys(currencyChanges).reduce((acc, key) => {
      acc[key] = (userData[key] || 0) + currencyChanges[key];
      return acc;
    }, {}),
    dailyRewardDay: nextDay,
    lastDailyReward: serverTimestamp(),
  });
  
  return { success: true, reward, day: nextDay };
};

/**
 * Purchase an item from the shop
 * @param {string} uid - User ID
 * @param {string} itemId - Item ID to purchase
 * @param {number} price - Price of the item
 * @param {string} currencyType - Type of currency (coins/tokens)
 * @returns {Promise<Object>} Result with success status
 */
export const purchaseItem = async (uid, itemId, price, currencyType = 'coins') => {
  const db = getDatabase();
  
  if (!db) {
    // Local fallback
    const userData = JSON.parse(localStorage.getItem(`user_${uid}`) || '{}');
    
    if ((userData[currencyType] || 0) < price) {
      return { success: false, error: 'Insufficient funds' };
    }
    
    if (!userData.ownedCosmetics) userData.ownedCosmetics = [];
    if (userData.ownedCosmetics.includes(itemId)) {
      return { success: false, error: 'Already owned' };
    }
    
    userData[currencyType] -= price;
    userData.ownedCosmetics.push(itemId);
    localStorage.setItem(`user_${uid}`, JSON.stringify(userData));
    return { success: true };
  }

  const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, uid);
  const userData = await getUserData(uid);
  
  if ((userData[currencyType] || 0) < price) {
    return { success: false, error: 'Insufficient funds' };
  }
  
  if (!userData.ownedCosmetics) userData.ownedCosmetics = [];
  if (userData.ownedCosmetics.includes(itemId)) {
    return { success: false, error: 'Already owned' };
  }
  
  await updateDoc(userRef, {
    [currencyType]: (userData[currencyType] || 0) - price,
    ownedCosmetics: [...userData.ownedCosmetics, itemId],
  });
  
  return { success: true };
};

/**
 * Equip a cosmetic item
 * @param {string} uid - User ID
 * @param {string} cosmeticType - Type of cosmetic (cardBack, tableTheme, avatar)
 * @param {string} cosmeticId - Cosmetic ID to equip
 * @returns {Promise<Object>} Result with success status
 */
export const equipCosmetic = async (uid, cosmeticType, cosmeticId) => {
  const db = getDatabase();
  
  if (!db) {
    // Local fallback
    const userData = JSON.parse(localStorage.getItem(`user_${uid}`) || '{}');
    
    if (!userData.ownedCosmetics) userData.ownedCosmetics = [];
    if (!userData.ownedCosmetics.includes(cosmeticId)) {
      return { success: false, error: 'Not owned' };
    }
    
    if (!userData.equippedCosmetics) userData.equippedCosmetics = {};
    userData.equippedCosmetics[cosmeticType] = cosmeticId;
    localStorage.setItem(`user_${uid}`, JSON.stringify(userData));
    return { success: true };
  }

  const userRef = doc(db, FIRESTORE_COLLECTIONS.USERS, uid);
  const userData = await getUserData(uid);
  
  if (!userData.ownedCosmetics || !userData.ownedCosmetics.includes(cosmeticId)) {
    return { success: false, error: 'Not owned' };
  }
  
  await updateDoc(userRef, {
    [`equippedCosmetics.${cosmeticType}`]: cosmeticId,
  });
  
  return { success: true };
};

/**
 * Export auth instance - lazy initialized
 */
export { auth, getAuthInstance as getAuth };
