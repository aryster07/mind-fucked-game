// ============ GAME LOG COMPONENT ============
// Shows a log of all game actions - richup.io style

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GameLog = ({ logs = [], currentUserId }) => {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new logs added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogIcon = (type) => {
    switch (type) {
      case 'throw': return '🃏';
      case 'draw': return '📥';
      case 'power': return '⚡';
      case 'show': return '🎯';
      case 'shuffle': return '🔀';
      case 'swap': return '🔄';
      case 'spy': return '👁️';
      case 'turn': return '➡️';
      case 'win': return '🏆';
      case 'lose': return '💀';
      default: return '•';
    }
  };

  const getLogStyle = (type, isMe) => {
    if (type === 'win') return 'bg-amber-500/20 border-l-amber-500';
    if (type === 'lose') return 'bg-red-500/15 border-l-red-500';
    if (type === 'power') return 'bg-purple-500/15 border-l-purple-500';
    if (type === 'show') return 'bg-green-500/15 border-l-green-500';
    if (type === 'turn') return 'bg-slate-700/30 border-l-slate-500';
    if (isMe) return 'bg-indigo-500/15 border-l-indigo-500';
    return 'bg-slate-800/50 border-l-slate-600';
  };

  const getTextColor = (type, isMe) => {
    if (type === 'win') return 'text-amber-300';
    if (type === 'lose') return 'text-red-400';
    if (type === 'power') return 'text-purple-300';
    if (type === 'show') return 'text-green-300';
    if (type === 'turn') return 'text-slate-400';
    if (isMe) return 'text-indigo-200';
    return 'text-slate-300';
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/60 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-slate-700/60 bg-slate-800/70">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span className="text-base">📜</span>
          <span>Game Log</span>
          <span className="ml-auto text-slate-500 font-normal">{logs.length}</span>
        </h3>
      </div>

      {/* Log entries */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {logs.length === 0 ? (
            <div className="text-slate-600 text-center py-8 px-4 text-xs">
              <div className="text-2xl mb-2">🎴</div>
              <div>Game actions will appear here...</div>
            </div>
          ) : (
            <div className="py-1">
              {logs.map((log, index) => {
                const isMe = log.playerId === currentUserId;
                return (
                  <motion.div
                    key={log.id || index}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`border-l-2 mx-1 my-0.5 ${getLogStyle(log.type, isMe)}`}
                  >
                    <div className="flex items-start gap-2 py-1.5 px-2">
                      <span className="flex-shrink-0 text-sm">{getLogIcon(log.type)}</span>
                      <div className={`text-xs leading-relaxed ${getTextColor(log.type, isMe)}`}>
                        <span className="font-semibold">
                          {isMe ? 'You' : log.playerName}
                        </span>
                        <span className="text-slate-400"> {log.action}</span>
                        {log.card && (
                          <span className={`font-mono font-bold ml-1 px-1 py-0.5 rounded text-xs ${
                            log.card.includes('♥') || log.card.includes('♦') 
                              ? 'text-red-400 bg-red-500/20' 
                              : 'text-slate-200 bg-slate-600/50'
                          }`}>
                            {log.card}
                          </span>
                        )}
                        {log.power && (
                          <span className="text-purple-400 ml-1 text-xs">
                            ⚡{log.power}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer with turn indicator */}
      <div className="px-3 py-2 border-t border-slate-700/60 bg-slate-800/50">
        <div className="text-xs text-slate-500 text-center">
          {logs.length > 0 ? `${logs.length} actions` : 'Waiting...'}
        </div>
      </div>
    </div>
  );
};

export default GameLog;
