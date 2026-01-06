// ============ LEFT SIDEBAR - GAME LOG (richup.io style) ============
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const LeftSidebar = ({ logs = [], currentUserId, roomCode }) => {
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
    if (type === 'win') return 'border-l-amber-500 bg-amber-500/10';
    if (type === 'lose') return 'border-l-red-500 bg-red-500/10';
    if (type === 'power') return 'border-l-purple-500 bg-purple-500/10';
    if (type === 'show') return 'border-l-green-500 bg-green-500/10';
    if (type === 'turn') return 'border-l-slate-500 bg-slate-700/20';
    if (isMe) return 'border-l-indigo-500 bg-indigo-500/10';
    return 'border-l-slate-600 bg-slate-800/30';
  };

  return (
    <div className="hidden lg:flex flex-col w-64 h-full bg-slate-900/95 border-r border-slate-700/50 flex-shrink-0 z-30">
      {/* Share Game Section */}
      <div className="p-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
          <span>🔗</span>
          <span>Share this game</span>
        </div>
        {roomCode ? (
          <button 
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}?room=${roomCode}`)}
            className="w-full px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 rounded-lg text-xs font-medium text-indigo-300 transition-colors flex items-center justify-center gap-2"
          >
            <span>📋</span>
            <span>Copy Room Link</span>
          </button>
        ) : (
          <div className="text-xs text-slate-500">Solo mode - no room code</div>
        )}
      </div>

      {/* Game Log Header */}
      <div className="px-3 py-2 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">📜</span>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Game Log</span>
        </div>
        <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full">
          {logs.length}
        </span>
      </div>

      {/* Log Entries */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-center text-slate-500 text-xs py-8">
            No actions yet
          </div>
        ) : (
          logs.map((log, idx) => {
            const isMe = log.playerId === currentUserId;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`px-2 py-1.5 rounded-lg border-l-2 ${getLogStyle(log.type, isMe)}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{getLogIcon(log.type)}</span>
                  <span className={`font-medium text-xs ${isMe ? 'text-indigo-300' : 'text-slate-300'}`}>
                    {isMe ? 'You' : log.playerName}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 pl-5">{log.action}</p>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
