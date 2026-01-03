import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { DAILY_REWARDS } from '../utils/economy';
import { Gift, Coins, Zap, X, Calendar } from 'lucide-react';
import clsx from 'clsx';

const DailyRewards = () => {
  const { userData, claimDaily } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimedReward, setClaimedReward] = useState(null);

  // Check if daily reward is available
  const isDailyAvailable = () => {
    if (!userData?.lastDailyReward) return true;
    
    const lastReward = new Date(userData.lastDailyReward);
    const now = new Date();
    const hoursSince = (now - lastReward) / (1000 * 60 * 60);
    
    return hoursSince >= 24;
  };

  // Auto-show modal if reward available
  useEffect(() => {
    if (userData && isDailyAvailable()) {
      // Delay showing to avoid interrupting game start
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [userData]);

  const handleClaim = async () => {
    setClaiming(true);
    const result = await claimDaily();
    
    if (result.success) {
      setClaimedReward(result.reward);
      setTimeout(() => {
        setClaimedReward(null);
        setShowModal(false);
      }, 3000);
    }
    
    setClaiming(false);
  };

  const currentDay = userData?.dailyRewardDay || 0;
  const nextDay = (currentDay % 7) + 1;

  if (!showModal) {
    // Floating button to open modal
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setShowModal(true)}
        className={clsx(
          "fixed top-20 right-4 p-4 rounded-full shadow-lg transition-all z-40",
          isDailyAvailable() 
            ? "bg-gradient-to-r from-yellow-500 to-amber-600 animate-pulse" 
            : "bg-slate-700"
        )}
      >
        <Gift size={24} className="text-white" />
        {isDailyAvailable() && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
        )}
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border-2 border-gold/30 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-yellow-600/20 to-amber-900/20 border-b border-gold/30 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gold/20 rounded-lg">
                  <Calendar className="text-gold" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gold">DAILY REWARDS</h2>
                  <p className="text-slate-400 text-sm">Log in every day for amazing prizes!</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="text-white" size={24} />
              </button>
            </div>
          </div>

          {/* Rewards Calendar */}
          <div className="p-6">
            {/* Current Streak Info */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 bg-slate-800 px-6 py-3 rounded-full border border-slate-700">
                <span className="text-slate-400">Current Streak:</span>
                <span className="text-2xl font-black text-gold">{currentDay} Days</span>
              </div>
            </div>

            {/* 7-Day Grid */}
            <div className="grid grid-cols-7 gap-3 mb-6">
              {DAILY_REWARDS.map((reward, index) => {
                const day = index + 1;
                const isClaimed = day < nextDay || (currentDay === 7 && day === 7);
                const isToday = day === nextDay;
                const isLocked = day > nextDay;

                return (
                  <motion.div
                    key={day}
                    whileHover={isToday ? { scale: 1.1 } : {}}
                    className={clsx(
                      "relative aspect-square rounded-lg border-2 p-2 flex flex-col items-center justify-center transition-all",
                      isClaimed && "bg-green-600/20 border-green-500/30",
                      isToday && "bg-gold/20 border-gold shadow-gold/50 shadow-lg",
                      isLocked && "bg-slate-800/50 border-slate-700 opacity-50"
                    )}
                  >
                    {/* Day Number */}
                    <div className={clsx(
                      "text-xs font-bold mb-1",
                      isClaimed && "text-green-400",
                      isToday && "text-gold",
                      isLocked && "text-slate-500"
                    )}>
                      Day {day}
                    </div>

                    {/* Rewards */}
                    <div className="text-center">
                      {reward.coins > 0 && (
                        <div className="flex items-center justify-center gap-1 text-xs">
                          <Coins size={12} className="text-yellow-500" />
                          <span className="text-white font-bold">{reward.coins}</span>
                        </div>
                      )}
                      {reward.tokens > 0 && (
                        <div className="flex items-center justify-center gap-1 text-xs mt-1">
                          <Zap size={12} className="text-purple-400" />
                          <span className="text-white font-bold">{reward.tokens}</span>
                        </div>
                      )}
                    </div>

                    {/* Claimed Checkmark */}
                    {isClaimed && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-600/30 rounded-lg">
                        <div className="text-2xl">✓</div>
                      </div>
                    )}

                    {/* Special Day 7 Badge */}
                    {day === 7 && (
                      <div className="absolute -top-2 -right-2 bg-gold text-black text-xs font-bold px-1 py-0.5 rounded">
                        MEGA
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Claim Button */}
            {isDailyAvailable() ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClaim}
                disabled={claiming}
                className={clsx(
                  "w-full py-4 rounded-lg font-black text-xl transition-all flex items-center justify-center gap-3",
                  claiming
                    ? "bg-slate-700 text-slate-400"
                    : "bg-gradient-to-r from-gold to-amber-600 text-black hover:from-yellow-400 hover:to-amber-500 shadow-lg shadow-gold/50"
                )}
              >
                <Gift size={24} />
                {claiming ? 'CLAIMING...' : `CLAIM DAY ${nextDay} REWARD`}
              </motion.button>
            ) : (
              <div className="w-full py-4 rounded-lg bg-slate-800 text-center">
                <p className="text-slate-400 font-bold">Come back tomorrow for your next reward!</p>
                <p className="text-sm text-slate-500 mt-1">
                  {(() => {
                    const lastReward = new Date(userData.lastDailyReward);
                    const nextReward = new Date(lastReward.getTime() + 24 * 60 * 60 * 1000);
                    const hoursLeft = Math.ceil((nextReward - new Date()) / (1000 * 60 * 60));
                    return `Available in ${hoursLeft} hours`;
                  })()}
                </p>
              </div>
            )}
          </div>

          {/* Claimed Reward Animation */}
          <AnimatePresence>
            {claimedReward && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 bg-black/90 flex items-center justify-center"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 360]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-8xl mb-4"
                  >
                    🎁
                  </motion.div>
                  
                  <h3 className="text-3xl font-black text-gold mb-4">REWARD CLAIMED!</h3>
                  
                  <div className="flex flex-col gap-3">
                    {claimedReward.coins > 0 && (
                      <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center justify-center gap-3 text-2xl font-bold text-white"
                      >
                        <Coins size={32} className="text-yellow-500" />
                        +{claimedReward.coins} Coins
                      </motion.div>
                    )}
                    
                    {claimedReward.tokens > 0 && (
                      <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-center gap-3 text-2xl font-bold text-white"
                      >
                        <Zap size={32} className="text-purple-400" />
                        +{claimedReward.tokens} Tokens
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DailyRewards;
