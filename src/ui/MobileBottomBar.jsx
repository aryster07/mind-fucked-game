// ============ MOBILE BOTTOM BAR - For smaller screens ============
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MobileBottomBar = ({ logs = [], currentUserId, roomCode, onLeaveGame }) => {
  const [showLogs, setShowLogs] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current && showLogs) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, showLogs]);

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
    if (type === 'win') return 'border-l-amber-500 bg-amber-500/10';
    if (type === 'lose') return 'border-l-red-500 bg-red-500/10';
    if (type === 'power') return 'border-l-purple-500 bg-purple-500/10';
    if (isMe) return 'border-l-indigo-500 bg-indigo-500/10';
    return 'border-l-slate-600 bg-slate-800/30';
  };

  const lastLog = logs[logs.length - 1];

  return (
    <>
      {/* Fixed bottom bar - only on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/98 backdrop-blur-lg border-t border-slate-700/50 safe-bottom">
        <div className="flex items-center justify-between px-3 py-2">
          {/* Last action preview - tappable to expand */}
          <button 
            onClick={() => setShowLogs(!showLogs)}
            className="flex-1 flex items-center gap-2 text-left mr-2"
          >
            <span className="text-lg">📜</span>
            <div className="flex-1 min-w-0">
              {lastLog ? (
                <div className="text-xs text-slate-400 truncate">
                  <span className="text-slate-300 font-medium">
                    {lastLog.playerId === currentUserId ? 'You' : lastLog.playerName}:
                  </span>{' '}
                  {lastLog.action}
                </div>
              ) : (
                <div className="text-xs text-slate-500">No actions yet</div>
              )}
            </div>
            <motion.span
              animate={{ rotate: showLogs ? 180 : 0 }}
              className="text-slate-400 text-sm"
            >
              ▲
            </motion.span>
          </button>

          {/* Leave button - always visible on mobile */}
          <button
            onClick={onLeaveGame}
            className="px-3 py-2 bg-red-600/30 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium flex items-center gap-1.5"
          >
            <span>🚪</span>
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* Expanded log drawer */}
      <AnimatePresence>
        {showLogs && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="lg:hidden fixed bottom-14 left-0 right-0 z-40 max-h-[50vh] bg-slate-900/98 backdrop-blur-lg border-t border-slate-700/50 rounded-t-2xl overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-slate-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 py-2 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📜</span>
                <span className="text-sm font-semibold text-slate-300">Game Log</span>
              </div>
              <span className="text-xs text-slate-500">{logs.length} actions</span>
            </div>

            {/* Logs */}
            <div ref={scrollRef} className="overflow-y-auto max-h-[40vh] p-3 space-y-1.5">
              {logs.length === 0 ? (
                <div className="text-center text-slate-500 text-sm py-4">No actions yet</div>
              ) : (
                logs.map((log, idx) => {
                  const isMe = log.playerId === currentUserId;
                  return (
                    <div
                      key={idx}
                      className={`px-3 py-2 rounded-lg border-l-2 ${getLogStyle(log.type, isMe)}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getLogIcon(log.type)}</span>
                        <span className={`font-medium text-sm ${isMe ? 'text-indigo-300' : 'text-slate-300'}`}>
                          {isMe ? 'You' : log.playerName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 pl-6">{log.action}</p>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileBottomBar;
