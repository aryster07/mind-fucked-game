// ============ MAIN MENU COMPONENT - MODERN UI ============
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MainMenu = ({ onStartSolo, onCreateRoom, onJoinRoom }) => {
  const [showJoin, setShowJoin] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState(localStorage.getItem('username') || '');
  const [isLoading, setIsLoading] = useState(false);

  // Floating cards animation
  const floatingCards = ['♠', '♥', '♦', '♣'];

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      return;
    }
    setIsLoading(true);
    localStorage.setItem('username', playerName);
    setTimeout(() => onCreateRoom(playerName), 300);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) {
      return;
    }
    setIsLoading(true);
    localStorage.setItem('username', playerName);
    setTimeout(() => onJoinRoom(roomCode.toUpperCase(), playerName), 300);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-900/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-700/15 rounded-full blur-3xl" />
        
        {/* Floating Cards - more subtle */}
        {floatingCards.map((suit, i) => (
          <motion.div
            key={suit}
            className="absolute text-5xl opacity-5 select-none text-slate-400"
            initial={{ 
              x: `${20 + i * 20}vw`, 
              y: '110vh',
              rotate: Math.random() * 30 - 15
            }}
            animate={{
              y: '-10vh',
              rotate: Math.random() * 30 - 15,
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 4,
              ease: 'linear'
            }}
          >
            {suit}
          </motion.div>
        ))}
      </div>

      {/* Main Content Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="glass rounded-3xl p-8 md:p-10 max-w-md w-full relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <motion.div 
            className="inline-block mb-3"
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-6xl">🃏</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Mind Trick
          </h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base">
            The Ultimate Memory Card Game
          </p>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-slate-400 text-sm mb-2 font-medium">
            Your Name
          </label>
          <input
            type="text"
            placeholder="Enter your name..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl bg-slate-900/80 border-2 border-slate-700/50 text-white text-lg
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none
                     transition-all duration-200 placeholder:text-slate-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Solo Play Button */}
          <motion.button
            onClick={onStartSolo}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl font-bold text-lg relative overflow-hidden group
                     bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-xl">🎮</span>
              Solo Play vs Bots
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
            <span className="text-slate-500 text-sm">or play online</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
          </div>

          {/* Create Room Button */}
          <motion.button
            onClick={handleCreateRoom}
            disabled={!playerName.trim() || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl font-bold text-lg relative overflow-hidden group
                     bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-xl">🌐</span>
              Create Room
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          {/* Join Room Section */}
          <AnimatePresence mode="wait">
            {!showJoin ? (
              <motion.button
                key="join-btn"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                onClick={() => setShowJoin(true)}
                className="w-full py-4 rounded-xl font-semibold text-lg
                         bg-slate-800/80 hover:bg-slate-700/80 text-white
                         border border-slate-700/50 hover:border-slate-600
                         transition-all duration-200"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-xl">🚪</span>
                  Join Room
                </span>
              </motion.button>
            ) : (
              <motion.div
                key="join-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter room code..."
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-900/80 border-2 border-slate-700/50 
                             text-white text-xl text-center font-mono tracking-widest uppercase
                             focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none
                             transition-all duration-200 placeholder:text-slate-500 placeholder:text-base placeholder:tracking-normal"
                  />
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => setShowJoin(false)}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 rounded-xl font-semibold bg-slate-700/80 hover:bg-slate-600/80 text-white transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleJoinRoom}
                    disabled={!playerName.trim() || !roomCode.trim() || isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 
                             hover:from-green-500 hover:to-emerald-500 text-white shadow-lg
                             disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Join Game
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs">
            🧠 Remember cards, use powers, get lowest score!
          </p>
        </div>
      </motion.div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainMenu;
