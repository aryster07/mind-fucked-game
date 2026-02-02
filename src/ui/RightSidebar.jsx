// ============ RIGHT SIDEBAR - PLAYERS & POWER GUIDE ============
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Power card info - Correct abilities matching powers.js
const POWER_CARDS = {
  '7': { name: 'Refresh', icon: '✨', desc: 'See & rearrange your cards' },
  '9': { name: 'Blind Swap', icon: '🔄', desc: 'Swap your card with opponent' },
  'J': { name: 'Chaos Shuffle', icon: '🌀', desc: "Shuffle an opponent's cards" },
  'K': { name: 'Global Spy', icon: '👁️', desc: "See an opponent's cards" },
};

const RightSidebar = ({ 
  players = [], 
  currentUserId, 
  turnIndex, 
  onLeaveGame, 
  status,
  activePower = null, // Current power being used
  drawnPowerCard = null, // Card just drawn if it's a power
}) => {
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    return 0;
  });

  const getPlayerScore = (player) => {
    if (!player.hand) return null;
    return player.hand.reduce((sum, card) => sum + (card?.value || 0), 0);
  };

  // Determine which power info to show
  const powerToShow = drawnPowerCard ? POWER_CARDS[drawnPowerCard.rank] : null;

  return (
    <div className="hidden lg:flex flex-col w-64 h-full bg-slate-900/95 border-l border-slate-700/50 flex-shrink-0 z-30">
      {/* Players Section */}
      <div className="p-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">👥</span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Players</span>
          </div>
          <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full">
            {players.length}/4
          </span>
        </div>

        <div className="space-y-1.5">
          {sortedPlayers.map((player, idx) => {
            const isMe = player.id === currentUserId;
            const playerIdx = players.findIndex(p => p.id === player.id);
            const isTurn = playerIdx === turnIndex;
            
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${
                  isTurn 
                    ? 'bg-amber-500/20 border border-amber-500/40' 
                    : 'bg-slate-800/40'
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  isMe ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {player.name?.charAt(0).toUpperCase() || '?'}
                </div>
                
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-medium truncate ${isMe ? 'text-indigo-300' : 'text-slate-300'}`}>
                      {isMe ? 'You' : player.name}
                    </span>
                    {isMe && (
                      <span className="text-amber-400 text-xs">👑</span>
                    )}
                  </div>
                </div>

                {/* Turn indicator */}
                {isTurn && (
                  <span className="text-amber-400 text-xs animate-pulse">🎯</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Power Card Guide - Shows when power card drawn */}
      <div className="flex-1 p-3 overflow-hidden">
        <AnimatePresence mode="wait">
          {powerToShow ? (
            <motion.div
              key="power-active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">⚡</span>
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Power Card!</span>
              </div>
              
              <div className="bg-purple-500/20 border border-purple-500/40 rounded-xl p-4">
                <div className="text-3xl text-center mb-2">{powerToShow.icon}</div>
                <div className="text-sm font-bold text-purple-300 text-center mb-1">
                  {powerToShow.name}
                </div>
                <div className="text-xs text-slate-400 text-center">
                  {powerToShow.desc}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="power-guide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">📖</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Power Cards</span>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                  <span className="text-base">✨</span>
                  <div>
                    <div className="text-slate-300 font-medium">7 - Refresh</div>
                    <div className="text-slate-500 text-[10px]">See & rearrange your cards</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                  <span className="text-base">🔀</span>
                  <div>
                    <div className="text-slate-300 font-medium">9 - Blind Swap</div>
                    <div className="text-slate-500 text-[10px]">Swap card with opponent</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                  <span className="text-base">🌀</span>
                  <div>
                    <div className="text-slate-300 font-medium">J (11) - Shuffle</div>
                    <div className="text-slate-500 text-[10px]">Shuffle opponent's cards</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                  <span className="text-base">👁️</span>
                  <div>
                    <div className="text-slate-300 font-medium">K (13) - Spy</div>
                    <div className="text-slate-500 text-[10px]">See opponent's card</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Leave Game Button */}
      <div className="p-3 border-t border-slate-700/50">
        <button
          onClick={onLeaveGame}
          className="w-full py-2.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 hover:border-red-500/60 rounded-lg text-red-400 hover:text-red-300 font-medium text-xs transition-all flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          <span>Leave Game</span>
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;
