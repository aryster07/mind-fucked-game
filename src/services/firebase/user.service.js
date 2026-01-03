/**
 * User Service
 * Handles user authentication and data management
 */

import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase, getDatabase } from './firebase.service';
import { FIRESTORE_COLLECTIONS } from '../../config/firebase.config';
import { STARTING_BALANCE, XP_PER_LEVEL } from '../../constants/economy.constants';

let auth = null;

/**
 * Get Firebase Auth instance
 * @returns {Auth|null} Firebase Auth instance or null
 */
export const getAuth = () => {
  if (!auth) {
    try {
      initializeFirebase();
      auth = getAuth();
    } catch (error) {
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
};

/**
 * Get user data
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} User data or null
 */
export const getUserData = async (uid) => {
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

export { auth };
