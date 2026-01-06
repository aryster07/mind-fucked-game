// ============ SHUFFLE ALERT COMPONENT ============
import React from 'react';

const ShuffleAlert = ({ show }) => {
  if (!show) return null;

  return (
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-red-600 to-orange-600 px-8 py-6 rounded-2xl border-4 border-red-400 animate-pulse">
      <div className="text-center text-white">
        <div className="text-5xl mb-2">🔀</div>
        <div className="font-black text-xl">YOUR CARDS WERE SHUFFLED!</div>
      </div>
    </div>
  );
};

export default ShuffleAlert;
