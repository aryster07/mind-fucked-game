// ============ GAME OVER MODAL COMPONENT - MODERN UI ============
import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const GameOverModal = ({ notification, players, winnerId, onPlayAgain, onBackToMenu }) => {
  // Sort players by score (lowest first)
  const sortedPlayers = [...players].sort((a, b) => (a.score || 99) - (b.score || 99));
  const winner = players.find(p => p.id === winnerId);

  return (
    <motion.div 
      className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="glass-dark rounded-3xl p-8 max-w-md w-full border border-purple-500/20 shadow-2xl"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
      >
        {/* Trophy with animation */}
        <motion.div 
          className="text-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
        >
          <motion.div 
            className="text-7xl mb-4 inline-block"
            animate={{ 
              rotate: [-5, 5, -5],
              y: [0, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🏆
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
            Game Over!
          </h2>
          
          {winner && (
            <motion.div 
              className="mt-2 text-lg text-purple-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {winner.name} wins! 👑
            </motion.div>
          )}
        </motion.div>

        {/* Notification message */}
        <motion.p 
          className="text-center text-slate-300 mb-6 text-sm md:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {notification}
        </motion.p>

        {/* Player scores */}
        <div className="space-y-2 mb-8">
          {sortedPlayers.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={clsx(
                'px-4 py-3 rounded-xl flex justify-between items-center transition-all',
                p.id === winnerId
                  ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30'
                  : p.busted
                    ? 'bg-red-500/10 border border-red-500/20'
                    : 'bg-slate-700/30 border border-slate-600/20'
              )}
            >
              <div className="flex items-center gap-3">
                {/* Rank badge */}
                <div className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                  index === 0 ? 'bg-amber-500 text-black' :
                  index === 1 ? 'bg-slate-400 text-black' :
                  index === 2 ? 'bg-amber-700 text-white' :
                  'bg-slate-600 text-white'
                )}>
                  {index + 1}
                </div>
                
                <span className={clsx(
                  'font-semibold',
                  p.id === winnerId ? 'text-amber-300' : 'text-white'
                )}>
                  {p.name}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={clsx(
                  'font-bold text-lg',
                  p.id === winnerId ? 'text-amber-300' : 
                  p.busted ? 'text-red-400' : 'text-white'
                )}>
                  {p.score || 0}
                </span>
                <span className="text-slate-400 text-sm">pts</span>
                {p.id === winnerId && <span className="text-xl">👑</span>}
                {p.busted && <span className="text-lg">💀</span>}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {/* Play again button */}
          <motion.button
            onClick={onPlayAgain}
            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(139,92,246,0.5)' }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-xl transition-all relative overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)'
            }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            
            <span className="relative flex items-center justify-center gap-2">
              <span>🎮</span>
              <span>Play Again</span>
            </span>
          </motion.button>

          {/* Back to menu button */}
          {onBackToMenu && (
            <motion.button
              onClick={onBackToMenu}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-medium text-slate-300 border border-slate-600 hover:bg-slate-700/50 transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <span>🏠</span>
                <span>Back to Menu</span>
              </span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GameOverModal;
