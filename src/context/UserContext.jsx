import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthInstance } from '../services/firebase/user.service';
import { signInAnonymously } from 'firebase/auth';
import { 
  getUserData, 
  createUserProfile, 
  updateCurrency, 
  addXP, 
  updateGameStats,
  claimDailyReward,
  purchaseItem,
  equipCosmetic,
  calculateLevel,
  xpForNextLevel
} from '../services/firebase/user.service';
import { STARTING_BALANCE, GAME_REWARDS, LEVEL_REWARDS } from '../constants/economy.constants';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user authentication
  useEffect(() => {
    const auth = getAuthInstance();
    
    // If Firebase not configured, use local storage fallback
    if (!auth) {
      console.log('Using local storage for user data');
      const localUser = localStorage.getItem('localUser');
      if (localUser) {
        const parsedUser = JSON.parse(localUser);
        setUser({ uid: 'local-user' });
        setUserData(parsedUser);
      } else {
        // Create local user with STARTING_BALANCE
        const newUserData = {
          displayName: `Player${Math.floor(Math.random() * 10000)}`,
          ...STARTING_BALANCE,
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
        setUser({ uid: 'local-user' });
        setUserData(newUserData);
        localStorage.setItem('localUser', JSON.stringify(newUserData));
      }
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadUserData(firebaseUser.uid);
      } else {
        // Sign in anonymously
        try {
          const result = await signInAnonymously(auth);
          setUser(result.user);
          
          // Create new user profile
          const newUserData = await createUserProfile(
            result.user.uid, 
            `Player${Math.floor(Math.random() * 10000)}`
          );
          setUserData(newUserData);
        } catch (error) {
          console.error('Anonymous sign-in error:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load user data from Firestore
  const loadUserData = async (userId) => {
    try {
      const data = await getUserData(userId);
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (!user) return;
    
    // Local storage fallback
    if (user.uid === 'local-user') {
      const localUser = localStorage.getItem('localUser');
      if (localUser) {
        setUserData(JSON.parse(localUser));
      }
      return;
    }
    
    await loadUserData(user.uid);
  };

  // Save to local storage helper
  const saveToLocalStorage = (updates) => {
    if (user?.uid === 'local-user') {
      const updated = { ...userData, ...updates };
      setUserData(updated);
      localStorage.setItem('localUser', JSON.stringify(updated));
      return true;
    }
    return false;
  };

  // Award coins
  const awardCoins = async (amount) => {
    if (!user) return;
    if (saveToLocalStorage({ coins: userData.coins + amount })) return;
    await updateCurrency(user.uid, { coins: amount });
    await refreshUserData();
  };

  // Award tokens
  const awardTokens = async (amount) => {
    if (!user) return;
    if (saveToLocalStorage({ tokens: userData.tokens + amount })) return;
    await updateCurrency(user.uid, { tokens: amount });
    await refreshUserData();
  };

  // Award XP and handle level ups
  const awardXP = async (amount) => {
    if (!user) return;
    
    const result = await addXP(user.uid, amount);
    await refreshUserData();
    
    // Check for level rewards
    if (result.leveledUp && LEVEL_REWARDS[result.newLevel]) {
      const reward = LEVEL_REWARDS[result.newLevel];
      await updateCurrency(user.uid, { coins: reward.coins, tokens: reward.tokens });
      await refreshUserData();
      
      return {
        ...result,
        levelReward: reward
      };
    }
    
    return result;
  };

  // Record game result
  const recordGameResult = async (won, gameType = 'normal', stats = {}) => {
    if (!user) return;
    
    // Calculate rewards
    let coinReward = won ? GAME_REWARDS.WIN.coins : GAME_REWARDS.LOSS.coins;
    let xpReward = won ? GAME_REWARDS.WIN.xp : GAME_REWARDS.LOSS.xp;
    
    // Bonus for special achievements in this game
    if (stats.perfectMemory && won) {
      coinReward = GAME_REWARDS.PERFECT_MEMORY.coins;
      xpReward = GAME_REWARDS.PERFECT_MEMORY.xp;
    } else if (stats.callShow && won) {
      coinReward = GAME_REWARDS.CALL_SHOW_WIN.coins;
      xpReward = GAME_REWARDS.CALL_SHOW_WIN.xp;
    }
    
    // Apply VIP multiplier if active
    if (userData?.vipExpiry && new Date(userData.vipExpiry) > new Date()) {
      coinReward *= 2;
      xpReward *= 2;
    }
    
    // Update stats and currency
    await updateGameStats(user.uid, won, stats);
    await updateCurrency(user.uid, { coins: coinReward });
    const levelUpResult = await awardXP(xpReward);
    
    await refreshUserData();
    
    return {
      coinReward,
      xpReward,
      levelUp: levelUpResult.leveledUp ? levelUpResult : null
    };
  };

  // Claim daily login reward
  const claimDaily = async () => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    const result = await claimDailyReward(user.uid);
    if (result.success) {
      await refreshUserData();
    }
    return result;
  };

  // Buy item from shop
  const buyItem = async (itemId, price, currencyType = 'coins') => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    const result = await purchaseItem(user.uid, itemId, price, currencyType);
    if (result.success) {
      await refreshUserData();
    }
    return result;
  };

  // Equip cosmetic item
  const equipItem = async (cosmeticType, cosmeticId) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    const result = await equipCosmetic(user.uid, cosmeticType, cosmeticId);
    if (result.success) {
      await refreshUserData();
    }
    return result;
  };

  // Helper to check if user can afford something
  const canAfford = (price, currencyType = 'coins') => {
    if (!userData) return false;
    return userData[currencyType] >= price;
  };

  // Get progress to next level
  const getLevelProgress = () => {
    if (!userData) return { current: 0, needed: 100, percentage: 0 };
    
    const currentLevel = userData.level;
    const currentXP = userData.xp;
    const xpForCurrent = (currentLevel - 1) * (currentLevel - 1) * 100;
    const xpForNext = xpForNextLevel(currentLevel);
    
    const xpInCurrentLevel = currentXP - xpForCurrent;
    const xpNeededForLevel = xpForNext - xpForCurrent;
    const percentage = (xpInCurrentLevel / xpNeededForLevel) * 100;
    
    return {
      current: xpInCurrentLevel,
      needed: xpNeededForLevel,
      percentage: Math.min(100, Math.max(0, percentage))
    };
  };

  const value = {
    user,
    userData,
    loading,
    refreshUserData,
    awardCoins,
    awardTokens,
    awardXP,
    recordGameResult,
    claimDaily,
    buyItem,
    equipItem,
    canAfford,
    getLevelProgress
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
