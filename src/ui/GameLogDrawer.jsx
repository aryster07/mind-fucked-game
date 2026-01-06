// ============ GAME LOG DRAWER COMPONENT ============
// Bottom slide-up drawer for game logs - always accessible

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GameLogDrawer = ({ logs = [], currentUserId, isOpen, onToggle }) => {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new logs added
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

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

  // Get last few logs for the collapsed preview
  const recentLogs = logs.slice(-3);

  return (
    <div className="fixed bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-40 w-[90vw] max-w-md">
      {/* Toggle Button + Preview */}
      <motion.div
        className="relative"
        initial={false}
      >
        {/* Collapsed state - shows last action and toggle button */}
        <motion.button
          onClick={onToggle}
          className="w-full bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-xl px-4 py-3 flex items-center justify-between shadow-xl hover:bg-slate-800/95 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">📜</span>
            <div className="text-left">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Game Log</div>
              {logs.length > 0 ? (
                <div className="text-sm text-slate-300 truncate max-w-[200px]">
                  {logs[logs.length - 1]?.playerName}: {logs[logs.length - 1]?.action}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No actions yet</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
              {logs.length}
            </span>
            <motion.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-slate-400"
            >
              ▲
            </motion.span>
          </div>
        </motion.button>

        {/* Expanded drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden"
            >
              <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl overflow-hidden">
                {/* Log entries */}
                <div 
                  ref={scrollRef}
                  className="max-h-[40vh] overflow-y-auto overflow-x-hidden custom-scrollbar"
                >
                  {logs.length === 0 ? (
                    <div className="text-slate-600 text-center py-8 px-4 text-sm">
                      <div className="text-2xl mb-2">🎴</div>
                      <div>Game actions will appear here...</div>
                    </div>
                  ) : (
                    <div className="py-2">
                      {logs.map((log, index) => {
                        const isMe = log.playerId === currentUserId;
                        return (
                          <motion.div
                            key={log.id || index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.02 }}
                            className={`border-l-2 mx-2 my-1 ${getLogStyle(log.type, isMe)}`}
                          >
                            <div className="flex items-start gap-2 py-2 px-3">
                              <span className="flex-shrink-0 text-base">{getLogIcon(log.type)}</span>
                              <div className={`text-sm leading-relaxed ${getTextColor(log.type, isMe)}`}>
                                <span className="font-semibold">
                                  {isMe ? 'You' : log.playerName}
                                </span>
                                <span className="text-slate-400"> {log.action}</span>
                                {log.card && (
                                  <span className={`font-mono font-bold ml-1 px-1.5 py-0.5 rounded ${
                                    log.card.includes('♥') || log.card.includes('♦') 
                                      ? 'text-red-400 bg-red-500/20' 
                                      : 'text-slate-200 bg-slate-600/50'
                                  }`}>
                                    {log.card}
                                  </span>
                                )}
                                {log.power && (
                                  <span className="text-purple-400 ml-1">
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
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default GameLogDrawer;
