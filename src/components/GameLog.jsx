import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, ChevronRight, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';

const GameLog = ({ logs = [], onSendMessage, roomCode, players = [] }) => {
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage?.(message.trim());
      setMessage('');
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'game': return 'text-blue-400';
      case 'player': return 'text-green-400';
      case 'system': return 'text-yellow-400';
      case 'chat': return 'text-white';
      case 'error': return 'text-red-400';
      default: return 'text-slate-300';
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'game': return '🎮';
      case 'player': return '👤';
      case 'system': return '⚙️';
      case 'chat': return '💬';
      case 'error': return '❌';
      default: return '•';
    }
  };

  return (
    <div className={clsx(
      "fixed top-0 right-0 h-screen bg-slate-900/95 backdrop-blur-md border-l border-slate-700 shadow-2xl transition-all duration-300 z-50 flex flex-col",
      isExpanded ? "w-80" : "w-12"
    )}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -left-10 top-1/2 -translate-y-1/2 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-l-lg border-l border-t border-b border-slate-600 transition-colors"
      >
        {isExpanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {isExpanded && (
        <>
          {/* Header */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-purple-400" size={20} />
                <h3 className="font-bold text-white">Game Info</h3>
              </div>
            </div>
            {roomCode && (
              <div className="text-xs text-slate-400">
                Room: <span className="font-mono text-purple-400">{roomCode}</span>
              </div>
            )}
          </div>

          {/* Players Section */}
          {players.length > 0 && (
            <div className="p-4 border-b border-slate-700">
              <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                Players ({players.length}/6)
              </h4>
              <div className="space-y-2">
                {players.map((player, idx) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm">
                      {player.name?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {player.name}
                        {player.isHost && <span className="ml-1 text-xs text-yellow-400">👑</span>}
                        {player.isYou && <span className="ml-1 text-xs text-purple-400">(You)</span>}
                      </div>
                      {player.score !== undefined && (
                        <div className="text-xs text-slate-400">Score: {player.score}</div>
                      )}
                    </div>
                    <div className={clsx(
                      "w-2 h-2 rounded-full",
                      player.isOnline ? "bg-green-400" : "bg-slate-600"
                    )} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Logs */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <AnimatePresence initial={false}>
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-sm"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg leading-none">{getLogIcon(log.type)}</span>
                    <div className="flex-1">
                      {log.player && (
                        <span className="font-bold text-blue-300">{log.player}: </span>
                      )}
                      <span className={getLogColor(log.type)}>{log.message}</span>
                      {log.timestamp && (
                        <span className="text-xs text-slate-500 ml-2">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={logEndRef} />
          </div>

          {/* Chat Input */}
          {onSendMessage && (
            <div className="p-3 border-t border-slate-700 bg-slate-800/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-900 text-white px-3 py-2 rounded border border-slate-700 focus:border-blue-500 focus:outline-none text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed px-3 py-2 rounded transition-colors"
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GameLog;
