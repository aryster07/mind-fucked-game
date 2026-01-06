// ============ MAIN MENU COMPONENT ============
import React, { useState } from 'react';

const MainMenu = ({ onStartSolo, onCreateRoom, onJoinRoom }) => {
  const [showJoin, setShowJoin] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState(localStorage.getItem('username') || '');

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    localStorage.setItem('username', playerName);
    onCreateRoom(playerName);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) {
      alert('Please enter your name and room code');
      return;
    }
    localStorage.setItem('username', playerName);
    onJoinRoom(roomCode.toUpperCase(), playerName);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-purple-500/30">
        <h1 className="text-5xl font-black text-center mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Mind F**ked
        </h1>
        <p className="text-center text-slate-400 mb-8 text-sm">The Ultimate Memory Card Game</p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border-2 border-slate-700 text-white focus:border-purple-500 focus:outline-none"
          />

          <button
            onClick={onStartSolo}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg text-white font-bold text-lg shadow-lg transition-all transform hover:scale-105"
          >
            🎮 Solo Play
          </button>

          <button
            onClick={handleCreateRoom}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg text-white font-bold text-lg shadow-lg transition-all transform hover:scale-105"
          >
            🌐 Create Room
          </button>

          {!showJoin ? (
            <button
              onClick={() => setShowJoin(true)}
              className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold transition-all"
            >
              🚪 Join Room
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border-2 border-slate-700 text-white focus:border-blue-500 focus:outline-none uppercase"
                maxLength={6}
              />
              <button
                onClick={handleJoinRoom}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-lg text-white font-bold shadow-lg transition-all"
              >
                Join Game
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
