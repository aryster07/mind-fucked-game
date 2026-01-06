// ============ GAME OVER MODAL COMPONENT ============
import React from 'react';
import clsx from 'clsx';

const GameOverModal = ({ notification, players, winnerId, onPlayAgain }) => {
  return (
    <div className="absolute inset-0 bg-black/80 z-40 flex items-center justify-center">
      <div className="text-center text-white max-w-lg">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-4xl font-black mb-4">Game Over!</h2>
        <p className="text-xl mb-6">{notification}</p>
        <div className="flex flex-col gap-2 mb-6">
          {players.map((p) => (
            <div
              key={p.id}
              className={clsx(
                'px-6 py-3 rounded-lg flex justify-between items-center',
                p.id === winnerId
                  ? 'bg-green-600'
                  : p.busted
                    ? 'bg-red-600'
                    : 'bg-slate-700'
              )}
            >
              <span className="font-bold">{p.name}</span>
              <span>
                {p.score} pts {p.id === winnerId && '👑'}
                {p.busted && '💀'}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={onPlayAgain}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold shadow-lg transition-all"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
