// ============ LOBBY COMPONENT - MODERN UI ============
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const MIN_PLAYERS = 1;
const MAX_PLAYERS = 4;

// Tutorial Modal Component with Modern UI
const TutorialModal = ({ onClose }) => {
  const [page, setPage] = useState(0);

  const pages = [
    {
      title: "🎯 Goal",
      content: (
        <div className="space-y-4">
          <p className="text-lg">Get the <span className="text-green-400 font-bold">lowest score</span> possible!</p>
          <p>Each player has <span className="text-purple-400 font-bold">4 cards</span> face-down.</p>
          <p>Call <span className="text-yellow-400 font-bold">"SHOW"</span> when you think your total is <span className="text-green-400 font-bold">10 or less</span> to win!</p>
          <div className="glass p-4 rounded-xl mt-4 border border-amber-500/20">
            <p className="text-sm text-amber-200">⚠️ If your total is more than 10, you lose instantly!</p>
          </div>
        </div>
      )
    },
    {
      title: "🃏 Card Values",
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="glass p-3 rounded-xl flex items-center gap-2">
              <span className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center font-bold">A</span>
              <span>= 1 point</span>
            </div>
            <div className="glass p-3 rounded-xl flex items-center gap-2">
              <span className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-xs">2-10</span>
              <span>= Face Value</span>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-xl flex items-center gap-2">
              <span className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center font-bold">7</span>
              <span className="text-green-300">+ Power ✨</span>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">9</span>
              <span className="text-blue-300">+ Power 🔄</span>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-xl flex items-center gap-2">
              <span className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold">J</span>
              <span className="text-purple-300">+ Power 🌀</span>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center gap-2">
              <span className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center font-bold">K</span>
              <span className="text-amber-300">+ Power 👁️</span>
            </div>
            <div className="glass p-3 rounded-xl flex items-center gap-2">
              <span className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center font-bold">Q</span>
              <span>= 12 points</span>
            </div>
            <div className="glass p-3 rounded-xl flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-br from-red-600 to-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">🃏</span>
              <span className="text-green-400">= 0 points!</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "🔄 Your Turn",
      content: (
        <div className="space-y-4">
          <motion.div 
            className="glass p-4 rounded-xl flex items-start gap-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-2xl">1️⃣</span>
            <div>
              <p className="font-bold text-purple-400">Throw a Card</p>
              <p className="text-sm text-slate-300">Tap one of your cards to discard it</p>
            </div>
          </motion.div>
          <motion.div 
            className="glass p-4 rounded-xl flex items-start gap-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-2xl">2️⃣</span>
            <div>
              <p className="font-bold text-purple-400">Get a New Card</p>
              <p className="text-sm text-slate-300">You see it for 3 seconds - memorize it!</p>
            </div>
          </motion.div>
          <motion.div 
            className="glass p-4 rounded-xl flex items-start gap-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-2xl">3️⃣</span>
            <div>
              <p className="font-bold text-purple-400">Power Activates</p>
              <p className="text-sm text-slate-300">If you threw a power card (7, 9, J, K)</p>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      title: "⚡ Power Cards",
      content: (
        <div className="space-y-2 text-sm">
          <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/30">
            <p className="font-bold text-green-400 flex items-center gap-2"><span className="text-lg">7</span> Refresh ✨</p>
            <p className="text-slate-300 mt-1">See ALL your cards for 3 seconds & rearrange them!</p>
          </div>
          <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/30">
            <p className="font-bold text-blue-400 flex items-center gap-2"><span className="text-lg">9</span> Blind Swap 🔄</p>
            <p className="text-slate-300 mt-1">Swap your card with opponent's card (blind!)</p>
          </div>
          <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/30">
            <p className="font-bold text-purple-400 flex items-center gap-2"><span className="text-lg">J</span> Chaos Shuffle 🌀</p>
            <p className="text-slate-300 mt-1">Shuffle all of another player's cards!</p>
          </div>
          <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/30">
            <p className="font-bold text-amber-400 flex items-center gap-2"><span className="text-lg">K</span> Global Spy 👁️</p>
            <p className="text-slate-300 mt-1">See ALL of another player's cards!</p>
          </div>
        </div>
      )
    },
    {
      title: "🏆 Winning",
      content: (
        <div className="space-y-4">
          <p>At the <span className="text-yellow-400 font-bold">start of your turn</span>, you can call <span className="text-yellow-400 font-bold">"SHOW"</span>!</p>
          <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/30">
            <p className="font-bold text-green-400 flex items-center gap-2">✅ If total ≤ 10</p>
            <p className="text-sm text-slate-300">You WIN instantly!</p>
          </div>
          <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/30">
            <p className="font-bold text-red-400 flex items-center gap-2">❌ If total &gt; 10</p>
            <p className="text-sm text-slate-300">You LOSE instantly! Lowest remaining score wins.</p>
          </div>
          <div className="glass p-4 rounded-xl mt-2">
            <p className="text-sm text-slate-300">💡 Tip: Track what cards you throw and receive!</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="glass-dark rounded-3xl max-w-md w-full border border-purple-500/30 shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📖</span> 
            <span>{pages[page].title}</span>
          </h2>
          <motion.button 
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
          >
            ✕
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-5 text-white min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {pages[page].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-5 border-t border-slate-700/50 bg-slate-800/30">
          <motion.button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 0}
            whileHover={{ scale: page === 0 ? 1 : 1.05 }}
            whileTap={{ scale: page === 0 ? 1 : 0.95 }}
            className="px-4 py-2 glass rounded-xl text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            ← Back
          </motion.button>
          
          <div className="flex gap-2">
            {pages.map((_, i) => (
              <motion.div 
                key={i} 
                className={clsx(
                  'w-2 h-2 rounded-full transition-colors cursor-pointer',
                  i === page ? 'bg-purple-500' : 'bg-slate-600'
                )}
                whileHover={{ scale: 1.3 }}
                onClick={() => setPage(i)}
              />
            ))}
          </div>

          {page < pages.length - 1 ? (
            <motion.button
              onClick={() => setPage(p => p + 1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-medium flex items-center gap-2"
            >
              Next →
            </motion.button>
          ) : (
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34,197,94,0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl text-white font-medium flex items-center gap-2"
            >
              Got it! ✓
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Lobby = ({ 
  roomCode, 
  roomData, 
  currentUserId, 
  error, 
  onStart, 
  onLeave, 
  onRetryJoin,
  isJoining = false,
}) => {
  const [editingCode, setEditingCode] = useState(false);
  const [inputCode, setInputCode] = useState(roomCode || '');
  const [showTutorial, setShowTutorial] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRetry = () => {
    if (!inputCode.trim()) {
      alert('Enter code');
      return;
    }
    setEditingCode(false);
    onRetryJoin(inputCode.trim());
  };

  const handleEditCode = () => {
    setEditingCode(true);
    setInputCode(roomCode);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isJoining) {
    return (
      <motion.div 
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-white text-xl font-medium">Joining room...</span>
      </motion.div>
    );
  }

  const isHost = roomData?.host === currentUserId;
  const count = roomData?.players?.length || 0;

  return (
    <motion.div 
      className="w-full max-w-lg glass-dark rounded-3xl shadow-2xl p-6 md:p-8 border border-purple-500/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.h2 
        className="text-3xl md:text-4xl font-black text-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          Game Lobby
        </span>
      </motion.h2>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 flex items-center justify-between gap-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <span className="text-sm flex-1">{error}</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEditCode}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-white text-xs font-medium"
            >
              Edit Code
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room Code Section */}
      {editingCode ? (
        <motion.div 
          className="mb-6 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <input
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="ENTER CODE"
            className="flex-1 px-4 py-3 bg-slate-900/80 border border-purple-500/30 rounded-xl text-white text-xl font-bold uppercase tracking-widest text-center focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRetry}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-bold"
          >
            Join
          </motion.button>
        </motion.div>
      ) : (
        <motion.div 
          className="mb-6 glass p-5 rounded-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Room Code</div>
              <div className="text-white text-3xl font-black tracking-[0.2em] font-mono">{roomCode}</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors',
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              )}
            >
              {copied ? (
                <>
                  <span>✓</span>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </motion.button>
          </div>
          <p className="text-slate-400 text-xs mt-3">Share this code with friends to join!</p>
        </motion.div>
      )}

      {/* Players List */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">👥</span>
          <span className="text-white font-bold text-lg">
            Players
          </span>
          <span className="ml-auto text-slate-400 text-sm">
            {count}/{MAX_PLAYERS}
          </span>
        </div>
        
        <div className="space-y-2">
          <AnimatePresence>
            {roomData?.players?.map((p, index) => (
              <motion.div
                key={p.uid}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={clsx(
                  'flex items-center justify-between glass p-3 rounded-xl transition-all',
                  p.uid === currentUserId && 'ring-2 ring-purple-500/50'
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Ready indicator */}
                  <div className={clsx(
                    'w-3 h-3 rounded-full transition-colors',
                    p.ready ? 'bg-green-500 animate-pulse' : 'bg-slate-600'
                  )} />
                  
                  {/* Player name */}
                  <span className="text-white font-medium">{p.name}</span>
                  
                  {/* You badge */}
                  {p.uid === currentUserId && (
                    <span className="px-2 py-0.5 bg-purple-500/30 rounded text-purple-300 text-xs font-medium">
                      You
                    </span>
                  )}
                </div>
                
                {/* Host crown */}
                {p.uid === roomData.host && (
                  <motion.span 
                    className="text-xl"
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    👑
                  </motion.span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Empty slots */}
          {Array.from({ length: MAX_PLAYERS - count }).map((_, i) => (
            <motion.div
              key={`empty-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-700"
            >
              <div className="w-3 h-3 rounded-full bg-slate-700" />
              <span className="text-slate-600 text-sm">Waiting for player...</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        className="flex gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {isHost && (
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34,197,94,0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            disabled={count < MIN_PLAYERS}
            className={clsx(
              'flex-1 py-4 rounded-xl text-white font-bold text-lg shadow-xl transition-all relative overflow-hidden group',
              count >= MIN_PLAYERS 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                : 'bg-slate-700 cursor-not-allowed'
            )}
          >
            {count >= MIN_PLAYERS && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            )}
            <span className="relative flex items-center justify-center gap-2">
              <span>🚀</span>
              <span>Start Game</span>
            </span>
          </motion.button>
        )}
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLeave}
          className="flex-1 py-4 glass hover:bg-slate-700/50 rounded-xl text-white font-medium transition-all"
        >
          Leave Room
        </motion.button>
      </motion.div>

      {/* How to Play Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowTutorial(true)}
        className="w-full mt-4 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 font-medium flex items-center justify-center gap-2 transition-all"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <span>📖</span> 
        <span>How to Play</span>
      </motion.button>

      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default Lobby;
