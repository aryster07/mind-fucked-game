// ============ LOBBY COMPONENT ============
import React, { useState } from 'react';

const MIN_PLAYERS = 1;
const MAX_PLAYERS = 4;

// Tutorial Modal Component
const TutorialModal = ({ onClose }) => {
  const [page, setPage] = useState(0);

  const pages = [
    {
      title: "🎯 Goal",
      content: (
        <div className="space-y-3">
          <p className="text-lg">Get the <span className="text-green-400 font-bold">lowest score</span> possible!</p>
          <p>Each player has <span className="text-purple-400 font-bold">4 cards</span> face-down.</p>
          <p>Call <span className="text-yellow-400 font-bold">"SHOW"</span> when you think your total is <span className="text-green-400 font-bold">10 or less</span> to win!</p>
          <div className="bg-slate-700/50 p-3 rounded-lg mt-4">
            <p className="text-sm text-slate-300">⚠️ If your total is more than 10, you lose instantly!</p>
          </div>
        </div>
      )
    },
    {
      title: "🃏 Card Values",
      content: (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-slate-700/50 p-2 rounded">A = 1</div>
            <div className="bg-slate-700/50 p-2 rounded">2-10 = Face Value</div>
            <div className="bg-purple-700/50 p-2 rounded border border-purple-500">7 = 7 + Power</div>
            <div className="bg-purple-700/50 p-2 rounded border border-purple-500">9 = 9 + Power</div>
            <div className="bg-purple-700/50 p-2 rounded border border-purple-500">J = 11 + Power</div>
            <div className="bg-purple-700/50 p-2 rounded border border-purple-500">K = 13 + Power</div>
            <div className="bg-slate-700/50 p-2 rounded">Q = 12</div>
            <div className="bg-slate-700/50 p-2 rounded">Joker = 0</div>
          </div>
        </div>
      )
    },
    {
      title: "🔄 Your Turn",
      content: (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">1️⃣</span>
            <div>
              <p className="font-bold text-purple-400">Throw a Card</p>
              <p className="text-sm text-slate-300">Click one of your cards to discard it</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">2️⃣</span>
            <div>
              <p className="font-bold text-purple-400">Get a New Card</p>
              <p className="text-sm text-slate-300">You see it for 3 seconds - memorize it!</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">3️⃣</span>
            <div>
              <p className="font-bold text-purple-400">Power Activates</p>
              <p className="text-sm text-slate-300">If you threw a power card (7,9,J,K)</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "⚡ Power Cards",
      content: (
        <div className="space-y-2 text-sm">
          <div className="bg-blue-900/40 p-3 rounded-lg border border-blue-500/50">
            <p className="font-bold text-blue-400">7 - Refresh 🔄</p>
            <p className="text-slate-300">See ALL your cards for 3 seconds & rearrange them!</p>
          </div>
          <div className="bg-green-900/40 p-3 rounded-lg border border-green-500/50">
            <p className="font-bold text-green-400">9 - Blind Swap 🔀</p>
            <p className="text-slate-300">Swap one of your cards with another player's card (blind!)</p>
          </div>
          <div className="bg-orange-900/40 p-3 rounded-lg border border-orange-500/50">
            <p className="font-bold text-orange-400">J (11) - Chaos Shuffle 🌀</p>
            <p className="text-slate-300">Shuffle all of another player's cards!</p>
          </div>
          <div className="bg-pink-900/40 p-3 rounded-lg border border-pink-500/50">
            <p className="font-bold text-pink-400">K (13) - Global Spy 👁️</p>
            <p className="text-slate-300">See ALL of another player's cards!</p>
          </div>
        </div>
      )
    },
    {
      title: "🏆 Winning",
      content: (
        <div className="space-y-3">
          <p>At the <span className="text-yellow-400 font-bold">start of your turn</span>, you can call <span className="text-yellow-400 font-bold">"SHOW"</span>!</p>
          <div className="bg-green-900/40 p-3 rounded-lg border border-green-500/50">
            <p className="font-bold text-green-400">✅ If total ≤ 10</p>
            <p className="text-sm text-slate-300">You WIN instantly!</p>
          </div>
          <div className="bg-red-900/40 p-3 rounded-lg border border-red-500/50">
            <p className="font-bold text-red-400">❌ If total &gt; 10</p>
            <p className="text-sm text-slate-300">You LOSE instantly! Lowest remaining score wins.</p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-lg mt-2">
            <p className="text-sm text-slate-300">💡 Tip: Track what cards you throw and receive!</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full border-2 border-purple-500/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">📖 {pages[page].title}</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-white min-h-[280px]">
          {pages[page].content}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 0}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white font-bold"
          >
            ← Back
          </button>
          
          <div className="flex gap-1">
            {pages.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full ${i === page ? 'bg-purple-500' : 'bg-slate-600'}`}
              />
            ))}
          </div>

          {page < pages.length - 1 ? (
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-bold"
            >
              Got it! ✓
            </button>
          )}
        </div>
      </div>
    </div>
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

  if (isJoining) {
    return <div className="text-white text-xl">Joining...</div>;
  }

  const isHost = roomData?.host === currentUserId;
  const count = roomData?.players?.length || 0;

  return (
    <div className="w-full max-w-lg bg-slate-800/95 rounded-2xl shadow-2xl p-6 border-2 border-purple-500/30">
      <h2 className="text-3xl font-black text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Lobby
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={handleEditCode}
            className="px-2 py-1 bg-red-600 rounded text-white text-xs"
          >
            Edit
          </button>
        </div>
      )}

      {editingCode ? (
        <div className="mb-4 flex gap-2">
          <input
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white text-xl font-bold uppercase"
          />
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-purple-600 rounded-lg text-white font-bold"
          >
            Join
          </button>
        </div>
      ) : (
        <div className="mb-4 flex items-center justify-between bg-slate-900/50 p-4 rounded-lg">
          <div>
            <div className="text-slate-400 text-xs">Room Code</div>
            <div className="text-white text-2xl font-bold tracking-wider">{roomCode}</div>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(roomCode)}
            className="p-2 bg-purple-600 rounded-lg text-white text-sm font-bold"
          >
            Copy
          </button>
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">👥</span>
          <span className="text-white font-bold">
            Players ({count}/{MAX_PLAYERS})
          </span>
        </div>
        <div className="space-y-1">
          {roomData?.players?.map((p) => (
            <div
              key={p.uid}
              className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${p.ready ? 'bg-green-500' : 'bg-slate-600'}`} />
                <span className="text-white">{p.name}</span>
                {p.uid === currentUserId && <span className="text-purple-400 text-xs">(You)</span>}
              </div>
              {p.uid === roomData.host && <span className="text-yellow-400 text-lg">👑</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {isHost && (
          <button
            onClick={onStart}
            disabled={count < MIN_PLAYERS}
            className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 rounded-lg text-white font-bold"
          >
            🚀 Start
          </button>
        )}
        <button
          onClick={onLeave}
          className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
        >
          Leave
        </button>
      </div>

      {/* How to Play Button */}
      <button
        onClick={() => setShowTutorial(true)}
        className="w-full mt-3 py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 rounded-lg text-purple-300 font-medium flex items-center justify-center gap-2"
      >
        <span>📖</span> How to Play
      </button>

      {/* Tutorial Modal */}
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
    </div>
  );
};

export default Lobby;
